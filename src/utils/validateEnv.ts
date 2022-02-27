import { log } from "./logHandler.js";

export const validateEnv = (): void => {
  if (!process.env.BOT_TOKEN) {
    log.warn("Missing Discord bot token.");
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    log.warn("Missing MongoDB connection.");
    process.exit(1);
  }
};
