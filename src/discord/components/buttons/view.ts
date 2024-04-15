import { Component } from "#base";
import { settings } from "#settings";
import { createRow, hexToRgb } from "@magicyan/discord";
import { prismaClient } from "../../../prisma/index.js";
import { ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from "discord.js";

new Component({
    customId: "button/menu/view",
    type: ComponentType.Button,
    cache: "cached",
    async run(interaction) {
        try {
            const guildId = interaction.guild.id;

            const guildData = await prismaClient.guild.findUnique({
                where: {
                    guildId: guildId,
                },
            });

            if (guildData) {
                const totalMembers = await prismaClient.student.count();

                const server = settings.emojis.server;
                const archive = settings.emojis.archive;
                const role = settings.emojis.role;
                const json = settings.emojis.json;

                const embed = new EmbedBuilder()
                    .setTitle("Configuração atual do servidor")
                    .setColor(hexToRgb(settings.colors.info))
                    .addFields(
                        { name: `${archive} Guild ID`, value: `\`${guildData.guildId}\``, inline: true },
                        { name: `${archive} Categoria ID`, value: `\`\`${guildData.categoryID ?? "N/A"}\`\``, inline: true },
                        { name: `${server} Webhook`, value: `[webhook](${guildData.webhook ?? "N/A"})`, inline: true },
                        { name: `${role} Role ID`, value: `\`${guildData.roleID}\`` ?? "N/A", inline: true },
                        { name: "Total de Membros", value: totalMembers.toString(), inline: true }
                    )
                    .setFooter({
                        text: "Para exportar os dados salvos no banco de dados em formato Json, clique no botão abaixo"
                    });

                const buttonJsonServer = new ButtonBuilder()
                    .setCustomId("export/json/server")
                    .setLabel("Exportar Json do servidor")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(json);

                const buttonJsonUsers = new ButtonBuilder()
                    .setCustomId("export/json/users")
                    .setLabel("Exportar Json dos usuários")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(json);

                const buttonBack = new ButtonBuilder()
                    .setCustomId("button/back")
                    .setLabel("Voltar")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(settings.emojis.back);

                const row = createRow(buttonJsonServer, buttonJsonUsers, buttonBack);
                await interaction.update({ embeds: [embed], components: [row] });
            } else {
                await interaction.reply({ ephemeral, content: "Não foram encontradas informações da guilda" });
            }
        } catch (error) {
            console.error("Erro ao buscar informações da guilda:", error);
            await interaction.reply({ ephemeral, content: "Ocorreu um erro ao buscar informações da guilda" });
        }
    },
});
