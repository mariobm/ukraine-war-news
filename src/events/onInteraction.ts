import { Interaction } from "discord.js";
import { CommandList } from "../commands/_CommandList.js";
import { errorHandler } from "../utils/errorHandler.js";

export const onInteraction = async (
  interaction: Interaction
): Promise<void> => {
  try {
    if (interaction.isCommand()) {
      for (const Command of CommandList) {
        if (interaction.commandName === Command.data.name) {
          await Command.run(interaction);
          break;
        }
      }
    }
  } catch (err) {
    errorHandler("onInteraction event", err);
  }
};
