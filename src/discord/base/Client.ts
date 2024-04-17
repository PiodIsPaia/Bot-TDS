import { Command, Component, Event, Listener, Modal } from "./index.js";
import { CustomItents, CustomPartials } from "@magicyan/discord";
import { ActivityType, Client, ClientOptions, version } from "discord.js";
import { basename, join } from "node:path";
import { log, onError } from "#settings";
import glob from "fast-glob";
import ck from "chalk";

const foldername = basename(join(getDirname(import.meta), "../../"));

export function createClient(options: Partial<ClientOptions> = {}) {
	const { intents, partials, ...otherOptions } = options;

	const client = new Client(Object.assign({
		intents: intents ?? CustomItents.All,
		partials: partials ?? CustomPartials.All,
		failIfNotExists: false, closeTimeout: 0,
	}, otherOptions));

	client.start = async function (options) {
		this.once("ready", async (client) => {
			process.on("uncaughtException", async (err) => onError(err, client));
			process.on("unhandledRejection", async (err) => onError(err, client));
			console.log();
			log.success(
				`${ck.green("Bot online")} ${ck.blue.underline("discord.js")} 📦 ${ck.yellow(version)} \n`,
				`${ck.greenBright(`➝ Connected as ${ck.underline(client.user.username)}`)}`
			);
			console.log();

			let totalMembers = 0;
			client.guilds.cache.forEach(guild => {
				totalMembers += guild.memberCount;
			});

			const activities = [
				{ name: `Monitorando ${totalMembers} estudantes`, type: ActivityType.Playing },
				{ name: "By: Piod", type: ActivityType.Playing },
				{ name: "Golang é o poder! akakak", type: ActivityType.Playing },
			];

			let currentActivityIndex = 0;

			function updateStatus() {
				activities[0].name = `Monitorando ${totalMembers} estudantes`;

				client.user.setPresence({
					activities: [activities[currentActivityIndex]],
					status: "idle"
				});

				currentActivityIndex = (currentActivityIndex + 1) % activities.length;
			}

			updateStatus();

			setInterval(updateStatus, 60_000);


			await Command.registerCommands(client.application.commands)
				.then(() => log.success(ck.green("Commands registered successfully!")))
				.catch(log.error);

			if (options?.whenReady) options.whenReady(client);
		});
		const patterns = [`./${foldername}/discord/**/*.{ts,js}`, `!./${foldername}/discord/base/*`];
		const paths = await glob(patterns, { absolute: true });

		await Promise.all(paths.map(async path => import(`file://${path}`)));
		Event.register(this); Listener.register(this);

		Command.logs(); Component.logs(); Listener.logs(); Modal.logs(); Event.logs();

		this.login(process.env.BOT_TOKEN);
	};
	client.on("interactionCreate", (interaction) => {
		if (interaction.isCommand()) Command.onCommand(interaction);
		if (interaction.isAutocomplete()) Command.onAutocomplete(interaction);
		if (interaction.isMessageComponent()) Component.onComponent(interaction);
		if (interaction.isModalSubmit()) Modal.onModal(interaction);
	});
	return client;
}