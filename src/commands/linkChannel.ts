import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInt } from "../interfaces/CommandInt.js";
import { getChannelData } from "../modules/getChannelData.js";
import { upsertChannelData } from "../modules/insertChannelData.js";
import { errorHandler } from "../utils/errorHandler.js";

export const linkChannel: CommandInt = {
  data: new SlashCommandBuilder()
    .setName("ukrainelink")
    .setDescription("Link current channel to ukraine war news bot.")
    .addChannelOption((channel) => {
      return channel // Add return here
        .setName("destination")
        .setDescription(
          "Channel you want to send the Ukraine war news embed in"
        )
        .setRequired(true);
    })
    .setDefaultPermission(true) as SlashCommandBuilder,
  run: async (interaction) => {
    try {
      await interaction.deferReply();

      if (!interaction.memberPermissions?.has("ADMINISTRATOR")) {
        await interaction.editReply({
          content: "You must have Administrator rights",
        });
        return;
      }

      const channel = interaction.options.getChannel("destination");
      if (!channel?.id) {
        await interaction.editReply({
          content: "Destination channel required",
        });
        return;
      }

      console.log(channel);
      const dbChannel = await getChannelData(channel.id);
      const status = await upsertChannelData(
        channel.id,
        !dbChannel?.subscribed
      );

      if (status) {
        await interaction.editReply({
          content: `The channel ${channel.name} has been successfully ${
            dbChannel?.subscribed ? "linked" : "unlinked"
          }.`,
        });
      }
    } catch (err) {
      errorHandler("ukraineLink command", err);
    }
  },
};
