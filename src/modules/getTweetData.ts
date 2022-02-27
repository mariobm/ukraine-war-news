import { errorHandler } from "../utils/errorHandler.js";
import TweetModel, { TweetInt } from "../database/models/TweetModel.js";

export const getTweetData = async (
  url: string
): Promise<TweetInt | undefined> => {
  try {
    const targetTweetData = await TweetModel.findOne({ tweetUrl: url });

    if (targetTweetData) {
      return targetTweetData;
    }
  } catch (error) {
    errorHandler("getTweetData module", error);
    return;
  }
};
