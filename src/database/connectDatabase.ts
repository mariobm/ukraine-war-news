import mongoose from "mongoose";
import { errorHandler } from "../utils/errorHandler.js";
import { log } from "../utils/logHandler.js";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);

    log.info("Database connection successful.");
  } catch (error) {
    errorHandler("database connection", error);
  }
};
