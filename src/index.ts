import { Client } from "discord.js";
import { IntentOptions } from "./config/IntentOptions.js";

(async () => {
  const BOT = new Client({ intents: IntentOptions });
  BOT.on("ready", () => console.log("Connected to Discord!"));
  await BOT.login(process.env.BOT_TOKEN);
})();
