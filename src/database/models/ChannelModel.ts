import mongoose from "mongoose";
const { Document, model, Schema } = mongoose;

export interface ChannelInt extends Document {
  channelId: string;
  subscribed: boolean;
  timestamp: Date;
}

export const Channel = new Schema({
  channelId: { type: String, index: true },
  subscribed: { type: Boolean, default: false },
  timestamp: {
    type: Date,
    default: new Date(),
  },
});

export default model<ChannelInt>("Channel", Channel);
