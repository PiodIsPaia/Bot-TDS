import { Command } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";
import { prismaClient } from "../../../prisma/index.js";
import { settings } from "#settings";
import { brBuilder, hexToRgb } from "@magicyan/discord";

new Command({
    name: "registrar",
    description: "Faça seu registro no servidor",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,

    async run(interaction) {
        const { client, member } = interaction;
        const discordUserID = member.user.id;

        await interaction.deferReply({ ephemeral });

        const error = settings.emojis.error;
        const success = settings.emojis.success;
        const ticket = settings.emojis.ticket;

        const existingUser = await prismaClient.student.findUnique({
            where: {
                discordUserID: discordUserID
            }
        });

        if (existingUser) {
            await interaction.editReply({ content: `${error} Você já está registrado(a) no servidor.` });
        } else {
            client.emit("guildMemberAdd", member);

            const embed = new EmbedBuilder()
                .setDescription(brBuilder(
                    `${success} Agora você pode se registrar.`,
                    `${ticket} Siga as instruções do canal que criei.`
                ))
                .setColor(hexToRgb(settings.colors.success));

            await interaction.editReply({ embeds: [embed] });
        }
    }
});
