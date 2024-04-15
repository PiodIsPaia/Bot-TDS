import { Command } from "#base";
import { ApplicationCommandType } from "discord.js";

new Command({
	name: "ping",
	description: "Replies with pong 🏓",
	dmPermission: false,
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {
		const ping = interaction.client.ws.ping;
		await interaction.reply({ fetchReply, ephemeral, content: "pong 🏓" }).then(async () => {

			await interaction.editReply({content: `API Ping: ${ping}ms`});
		});
	}
});