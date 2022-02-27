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

const sendMessage = async (client: Client, text: string): Promise<boolean> => {
  const channel = (await client.channels.cache.get(
    "947186507217788938"
  )) as ThreadChannel;
  if (channel) {
    if (!channel.joined && channel?.joinable) await channel.join();
    await channel.send({
      content: text,
    });
    return true;
  }
  return false;
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

(async () => {
  validateEnv();
  const BOT = new Client({ intents: IntentOptions });
  BOT.on("ready", () => console.log("Connected to Discord!"));
  await connectDatabase();
  await BOT.login(process.env.BOT_TOKEN);
  BOT.on(
    "interactionCreate",
    async (interaction) => await onInteraction(interaction)
  );
  cron.schedule("*/30 * * * * *", async () => {
    log.info("Starting cron");
    const tweetUrl = await scrapeReddit();
    log.info("Tweet url: ", tweetUrl);
    const tweetInDB = await isAlreadyInDatabase(tweetUrl);
    log.info("Tweet in DB: ", tweetInDB);
    if (!tweetInDB) {
      const isSent = await sendMessage(BOT, tweetUrl);
      log.info("Tweet sent to discord", isSent);
      if (isSent) await insertTweetData(tweetUrl);
    }
  });
})();
