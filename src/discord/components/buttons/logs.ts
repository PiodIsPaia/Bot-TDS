import { Component } from "#base";
import { settings } from "#settings";
import { createRow, hexToRgb } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ComponentType, EmbedBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder } from "discord.js";

new Component({
    customId: "button/menu/configuration",
    cache: "cached",
    type: ComponentType.Button,
    async run(interaction) {
        const server = settings.emojis.server;
        const archive = settings.emojis.archive;
        const role = settings.emojis.role;

        const embed = new EmbedBuilder()
            .setThumbnail(settings.images.archive)
            .setColor(hexToRgb("#149e57"))
            .addFields(
                {
                    name: `${server} Logs via Webhook`,
                    value: "> Escolha uma opção para configurar o sistema de logs via Webhook. Você pode fornecer uma URL de Webhook para receber logs no Discord."
                },
                {
                    name: `${archive} Categoria para o registro dos membros`,
                    value: "> Escolha uma categoria onde os membros serão registrados. Quando um novo membro se juntar ao servidor, um canal será criado automaticamente nessa categoria para registrar informações sobre o membro."
                },
                {
                    name: `${role} Cargo que o membro ganhará quando se registrar`,
                    value: "> Escolha um cargo que será atribuído automaticamente aos membros quando eles se registrarem no servidor."
                }
            );


        const menuWebhook = new StringSelectMenuBuilder()
            .setCustomId("menu/string/webhook")
            .setPlaceholder("🌐 Logs via Webhook")
            .addOptions([
                { label: "Webhook", value: "webhook", description: "Cole a URL da Webhook aqui", emoji: settings.emojis.server },
            ]);

        const menuCagetoryID = new ChannelSelectMenuBuilder()
            .setCustomId("menu/string/category")
            .setPlaceholder("💠 Categoria para o registro dos membros")
            .setMaxValues(1)
            .setChannelTypes(ChannelType.GuildCategory);

        const menuRole = new RoleSelectMenuBuilder()
            .setCustomId("menu/string/role")
            .setPlaceholder("❤ Cargo que o membro ganhará quando se registrar")
            .setMaxValues(1);

        const buttonBack = new ButtonBuilder()
            .setCustomId("button/back")
            .setLabel("Voltar")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(settings.emojis.back);

        const rowWebhook = createRow(menuWebhook);
        const rowCategory = createRow(menuCagetoryID);
        const rowRole = createRow(menuRole);
        const buttonRow = createRow(buttonBack);

        await interaction.update({ embeds: [embed], components: [rowWebhook, rowCategory, rowRole, buttonRow], fetchReply });
    },
});