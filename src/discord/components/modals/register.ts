import { Modal } from "#base";
import { settings } from "#settings";
import { createRow, hexToRgb } from "@magicyan/discord";
import { prismaClient } from "../../../prisma/index.js";
import { ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionCollector } from "discord.js";
import WebhookLogs from "../../../functions/webhook.js";


new Modal({
    customId: "modal/register",
    cache: "cached",
    async run(interaction) {
        const { fields } = interaction;

        const fullName = fields.getTextInputValue("name");
        const polo = fields.getTextInputValue("polo");
        const age = fields.getTextInputValue("age");

        const people = settings.emojis.people;
        const ticket = settings.emojis.ticket;
        const star = settings.emojis.star;

        const embed = new EmbedBuilder()
            .setThumbnail(settings.images.badge)
            .setDescription("Você tem certeza de que digitou tudo corretamente?")
            .setColor(hexToRgb(settings.colors.default))
            .addFields(
                { name: `${people} Nome`, value: `\`${fullName}\`` },
                { name: `${ticket} Polo`, value: `\`${polo}\`` },
                { name: `${star} Idade`, value: `\`${age}\`` }
            );

        const buttonConfirm = new ButtonBuilder()
            .setCustomId("confirm")
            .setLabel("Confirmar")
            .setStyle(ButtonStyle.Success)
            .setEmoji(settings.emojis.success);

        const buttonEdit = new ButtonBuilder()
            .setCustomId("edit")
            .setLabel("Editar")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(settings.emojis.archive);

        const row = createRow(buttonConfirm, buttonEdit);

        await interaction.reply({ ephemeral: true, embeds: [embed], components: [row] });

        const collector = new InteractionCollector(interaction.client, {
            filter: i => i.customId === "confirm",
        });

        collector.on("collect", async i => {
            if (i.customId === "confirm") {
                try {
                    const guild = await prismaClient.guild.findUnique({
                        where: {
                            guildId: interaction.guild.id,
                        },
                    });

                    if (!guild || !guild.webhook || !guild.roleID) {
                        throw new Error("Webhook ou roleID não encontrado no banco de dados.");
                    }

                    const webhook = new WebhookLogs(guild.webhook);
                    const avatarURL = interaction.user.avatarURL({ size: 512 }) ? interaction.user.avatarURL({ size: 512 }) : interaction.user.defaultAvatarURL;
                    const webhookEmbed = new EmbedBuilder()
                        .setThumbnail(avatarURL)
                        .setDescription("Novo registro feito com sucesso!")
                        .setColor(hexToRgb(settings.colors.default))
                        .addFields(
                            { name: `${people} Nome`, value: `\`${fullName}\`` },
                            { name: `${ticket} Polo`, value: `\`${polo}\`` },
                            { name: `${star} Idade`, value: `\`${age}\`` }
                        );

                    await webhook.sendEmbed(webhookEmbed, i.client.user.avatarURL({ size: 512 })!!);

                    const existingStudent = await prismaClient.student.findUnique({
                        where: {
                            discordUserID: interaction.user.id,
                        },
                    });

                    if (existingStudent) {
                        await prismaClient.student.update({
                            where: {
                                id: existingStudent.id,
                            },
                            data: {
                                fullName: fullName,
                                age: parseInt(age),
                                polo: polo,
                                updateAt: new Date(),
                            },
                        });
                    } else {
                        await prismaClient.student.create({
                            data: {
                                discordUserID: interaction.user.id,
                                discordUsername: interaction.user.username,
                                fullName: fullName,
                                age: parseInt(age),
                                polo: polo,
                                createAt: new Date(),
                                updateAt: new Date(),
                                since: new Date(),
                            },
                        });
                    }

                    await interaction.member.roles.add(guild.roleID);

                    const check = settings.emojis.success;
                    try {
                        const match = fullName.match(/(\S+)\s+(\S+)/);
                        if (match == null) return;
                        const firstName = match[1];
                        const secondName = match[2];

                        await interaction.member.setNickname(`${firstName} ${secondName}`);
                        await i.reply({ ephemeral: true, content: `${check} As informações foram salvas com sucesso!\n⏳ Deletarei este canal em 10 segundos.` });
                    } catch (nicknameError) {
                        console.error("Erro ao definir o nickname:", nicknameError);
                        await i.reply({ ephemeral: true, content: "Houve um problema ao tentar definir seu nickname. Suas informações foram salvas, mas seu nickname não pôde ser alterado." });
                    }

                    setTimeout(() => {
                        i.channel?.delete();
                    }, 10_000);
                } catch (error) {
                    console.error("Erro ao salvar as informações:", error);
                    await i.reply({ ephemeral: true, content: "Ocorreu um erro ao salvar as informações." });
                }
            }
        });
    },
});
