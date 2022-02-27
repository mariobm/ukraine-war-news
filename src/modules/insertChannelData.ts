import ChannelModel from "../database/models/ChannelModel.js";
import { errorHandler } from "../utils/errorHandler.js";

export const upsertChannelData = async (
  channelId: string,
  channelName: string,
  subscribed: boolean
): Promise<boolean> => {
  try {
    await ChannelModel.updateOne(
      { channelId },
      { subscribed, channelName },
      { upsert: true }
    );
    return true;
  } catch (err) {
    errorHandler("insertChannelData module", err);
    return false;
  }
};
