import TweetModel, { TweetInt } from "../database/models/TweetModel.js";
import { errorHandler } from "../utils/errorHandler.js";

export const insertTweetData = async (
  tweetUrl: string
): Promise<TweetInt | undefined> => {
  try {
    const tweet = new TweetModel({ tweetUrl });
    await tweet.save();
    return tweet;
  } catch (err) {
    errorHandler("insertTweetData module", err);
    return;
  }
};
