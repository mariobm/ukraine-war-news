import { errorHandler } from "../utils/errorHandler.js";
import ChannelModel, { ChannelInt } from "../database/models/ChannelModel.js";

export const getChannelData = async (
  channelId: string
): Promise<ChannelInt | undefined> => {
  try {
    const targetChannelData = await ChannelModel.findOne({ channelId });

    if (targetChannelData) {
      return targetChannelData;
    }
  } catch (error) {
    errorHandler("getChannelData module", error);
    return;
  }
};

export const getAllSubscribedChannels = async (): Promise<
  ChannelInt[] | undefined
> => {
  try {
    const targetChannelData = await ChannelModel.find({
      subscribed: true,
    }).exec();
    if (targetChannelData) {
      return targetChannelData;
    }
  } catch (error) {
    errorHandler("getChannelData module", error);
    return;
  }
};
