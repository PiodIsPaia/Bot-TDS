import { Command } from "#base";
import { settings } from "#settings";
import { hexToRgb } from "@magicyan/discord";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

new Command({
	name: "ping",
	description: "Replies with pong 🏓",
	dmPermission: false,
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {
		const ping = interaction.client.ws.ping;
		await interaction.reply({ ephemeral, content: "pong 🏓" }).then(async () => {

			const success = settings.emojis.success;
			const embed = new EmbedBuilder()
				.setDescription(`${success} API Ping:  \`${ping}ms\``)
				.setColor(hexToRgb(settings.colors.success));

			await interaction.editReply({ content: "", embeds: [embed] });
		});
	}
});