import mongoose from "mongoose";
const { Document, model, Schema } = mongoose;

export interface TweetInt extends Document {
  tweetUrl: string;
  timestamp: Date;
}

export const Tweet = new Schema({
  tweetUrl: { type: String, index: true },
  timestamp: {
    type: Date,
    default: new Date(),
  },
});

export default model<TweetInt>("Tweet", Tweet);
