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

const sendMessage = async (
  client: Client,
  channelId: string,
  text: string
): Promise<boolean> => {
  const channel = (await client.channels.cache.get(channelId)) as TextChannel;
  if (channel) {
    await channel.send({
      content: text,
    });
    return true;
  }
  return false;
};

const sendMessageToAllSubscribed = async (
  client: Client,
  text: string
): Promise<boolean[]> => {
  const allChannels = await getAllSubscribedChannels();
  if (!allChannels) {
    log.warn("No channel linked");
    return [false];
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
    log.info(
      "Tweet sent to ALL subscribed discord channels",
      isSent.every((val) => val === true)
    );
    if (isSent.some((res) => !!res)) await insertTweetData(tweetUrl);
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
  cron.schedule("*/10 * * * *", async () => await scheduledJob(BOT));
})();
