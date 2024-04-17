import { Event } from "#base";
import { settings } from "#settings";
import { brBuilder, createRow, hexToRgb } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, EmbedBuilder, version } from "discord.js";

new Event({
    name: "Bot mention",
    event: "messageCreate",
    async run(message) {
        const { client, author, content } = message;

        const botID = client.user.id;
        const clientAvatarURL = client.user.avatarURL({ size: 512 }) || client.user.defaultAvatarURL;
        const authorID = author.id;

        const success = settings.emojis.success;
        const archive = settings.emojis.archive;
        const error = settings.emojis.error;
        const piodID = settings.config.piod;
        const piod = client.users.cache.get(piodID)!!;

        switch (content) {
            case `<@${botID}>`:
                const embed = new EmbedBuilder()
                    .setAuthor({ name: client.user.username, iconURL: clientAvatarURL })
                    .setDescription(brBuilder(
                        `${success} Estou aqui para automatizar diversas tarefas dentro da comunidade`,
                        `${archive} Quer saber mais sobre mim? Clique no botão abaixo.`
                    ))
                    .setColor(hexToRgb(settings.colors.default));

                const buttonCuriosity = new ButtonBuilder()
                    .setCustomId("button/curiosity")
                    .setLabel("Curiosidades")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("❔");

                const buttonDelete = new ButtonBuilder()
                    .setCustomId("button/delete")
                    .setLabel("Apagar")
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(error);

                const row = createRow(buttonCuriosity, buttonDelete);

                await message.channel.send({
                    content: `<@${authorID}>`,
                    embeds: [embed],
                    components: [row]
                }).then((msg) => {
                    const collector = message.channel.createMessageComponentCollector({
                        filter: (i) => i.user.id === authorID,
                    });

                    collector.on("collect", async (i) => {
                        const customID = i.customId;
                        switch (customID) {
                            case "button/curiosity":
                                const devEmoji = settings.emojis.dev;
                                const discordJSEmoji = settings.emojis.discordjs;
                                const discordJSVersion = version;
                                const nodeEmoji = settings.emojis.node;
                                const nodeVersion = process.version;
                                const network = settings.emojis.network;
                                const typescript = settings.languages.typescript;

                                const apiPing = i.client.ws.ping;

                                const message = brBuilder(
                                    `- ${devEmoji} Desenvolvedor: \`${piod.username}\`(\`${piod.id}\`)`,
                                    `- ${typescript} Linguagem utilizada: \`TypeScript\``,
                                    `- ${nodeEmoji} Versão do NodeJS: \`${nodeVersion}\``,
                                    `- ${discordJSEmoji} Versão do Discord.js: \`${discordJSVersion}\``,
                                    `- ${network} API Ping: \`${apiPing}ms\``
                                );

                                const embed = new EmbedBuilder()
                                    .setDescription(message)
                                    .setColor(hexToRgb(settings.colors.success));

                                await i.reply({ ephemeral, embeds: [embed] });

                                break;
                            case "button/delete":
                                await msg.delete();
                                break;

                            default:
                                break;
                        }
                    });
                });
                break;

            default:
                break;
        }
    },
});
