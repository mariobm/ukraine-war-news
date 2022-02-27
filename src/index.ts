import { Client, TextChannel, ThreadChannel } from "discord.js";
import { IntentOptions } from "./config/IntentOptions.js";
import { connectDatabase } from "./database/connectDatabase.js";
import { onInteraction } from "./events/onInteraction.js";
import { validateEnv } from "./utils/validateEnv.js";
import { log } from "./utils/logHandler.js";

import axios from "axios";
import cheerio from "cheerio";
import cron from "node-cron";
import { getTweetData } from "./modules/getTweetData.js";
import { insertTweetData } from "./modules/InsertTweetData.js";
import { onReady } from "./events/onReady.js";
import { getAllSubscribedChannels } from "./modules/getChannelData.js";
import { SendMessage } from "./interfaces/SendMessage.js";

const sendMessage = async (
  client: Client,
  channelId: string,
  text: string
): Promise<SendMessage> => {
  const channel = (await client.channels.cache.get(channelId)) as TextChannel;
  if (channel) {
    const sentObj = {
      channelId: channel.id,
      channelName: channel.name,
      sent: true,
    };
    try {
      await channel.send({
        content: text,
      });
      return sentObj;
    } catch (e) {
      sentObj.sent = false;
      return sentObj;
    }
  }
  return { channelId, sent: false };
};

const sendMessageToAllSubscribed = async (
  client: Client,
  text: string
): Promise<SendMessage[]> => {
  const allChannels = await getAllSubscribedChannels();
  if (!allChannels) {
    log.warn("No channel linked");
    return [];
  }
  const sendToAll = allChannels.map((channel) => {
    return sendMessage(client, channel.channelId, text);
  });
  return await Promise.all(sendToAll);
};

const scrapeReddit = async (): Promise<string> => {
  return axios
    .get("https://www.reddit.com/live/18hnzysb1elcs")
    .then(({ data }) => {
      const $ = cheerio.load(data); // Initialize cheerio
      const text = $(
        "body > div.content > div.main-content > ol > li:nth-child(1) .md > p > a"
      )
        .html()
        ?.toString();
      return text || "";
    });
};

const isAlreadyInDatabase = async (url: string): Promise<boolean> => {
  return getTweetData(url).then((data) => !!data);
};

const scheduledJob = async (client: Client) => {
  log.info("Starting cron");
  const tweetUrl = await scrapeReddit();
  log.info("Tweet url: ", tweetUrl);
  const tweetInDB = await isAlreadyInDatabase(tweetUrl);
  log.info("Tweet in DB: ", tweetInDB);
  if (!tweetInDB) {
    const isSent = await sendMessageToAllSubscribed(client, tweetUrl);
    const isAll = isSent.every(({ sent }) => sent === true);
    log.info("Tweet sent to ALL discord", isAll);
    if (!isAll)
      log.warn(
        "Tweet not sent to",
        isSent.filter(({ sent }) => sent === false)
      );
    if (isSent.some(({ sent }) => sent === true))
      await insertTweetData(tweetUrl);
  }
};

(async () => {
  validateEnv();
  const BOT = new Client({ intents: IntentOptions });
  BOT.on("ready", async () => await onReady(BOT));
  await connectDatabase();
  await BOT.login(process.env.BOT_TOKEN);
  BOT.on(
    "interactionCreate",
    async (interaction) => await onInteraction(interaction)
  );
  await scheduledJob(BOT);
  cron.schedule("*/5 * * * *", async () => await scheduledJob(BOT));
})();
