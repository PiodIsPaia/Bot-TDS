import { Command } from "#base";
import { settings } from "#settings";
import { hexToRgb, createRow } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

new Command({
    name: "painel",
    description: "[ Admin ] Painel de configuração",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const piod = settings.config.piod;
        const andre = settings.config.andre;

        const error = settings.emojis.error;

        if (interaction.user.id != piod && interaction.user.id != andre) {
            await interaction.reply({ ephemeral, content: `${error} Você não tem permissão para executar este comando!` });
            return;
        }

        const { user } = interaction;

        const userName = user.username;
        const avatarUrl = user.avatarURL({ size: 512 });
        const admin = settings.emojis.admin;
        const gear = settings.emojis.gear;

        const embedPanel = new EmbedBuilder()
            .setAuthor({ name: userName, iconURL: avatarUrl ? avatarUrl : user.defaultAvatarURL })
            .setDescription(`__Olá ${userName}, bem-vindo ao seu painel de controle! Aqui você pode configurar várias opções do servidor.__`)
            .setColor(hexToRgb(settings.colors.default))
            .addFields(
                { name: `${admin} Bem-vindo ao Painel de Controle!`, value: "> Este é o lugar onde você pode personalizar as configurações do servidor de acordo com suas preferências." },
                { name: `${gear} Configurações Disponíveis`, value: "> Clique no botão abaixo para acessar as configurações disponíveis." }
            );

        const row = createRow(
            new ButtonBuilder()
                .setCustomId("button/menu/configuration")
                .setLabel("Acessar Configurações")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(settings.emojis.gear),

            new ButtonBuilder()
                .setCustomId("button/menu/view")
                .setLabel("Visualizar configurações")
                .setStyle(ButtonStyle.Primary)
                .setEmoji(settings.emojis.viwe),

            new ButtonBuilder()
                .setCustomId("button/add/admin")
                .setLabel("Admin")
                .setStyle(ButtonStyle.Success)
                .setEmoji(settings.emojis.admin)
        );

        await interaction.reply({ ephemeral: true, embeds: [embedPanel], components: [row] });

        const collector = interaction.channel!!.createMessageComponentCollector({ filter: i => i.customId === "button/back" && i.user.id === interaction.user.id });

        collector.on("collect", async () => {
            await interaction.editReply({ embeds: [embedPanel], components: [row] });
        });
    },
});
