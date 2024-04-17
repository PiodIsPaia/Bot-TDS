import { Component } from "#base";
import { createRow, hexToRgb } from "@magicyan/discord";
import { ComponentType, EmbedBuilder, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { prismaClient } from "../../../prisma/index.js";
import { settings } from "#settings";


new Component({
    customId: "button/aboutme/:userId",
    cache: "cached",
    type: ComponentType.Button,
    async run(interaction, { userId }) {

        if (interaction.user.id != userId) {
            const error = settings.emojis.error;
            const embed = new EmbedBuilder()
                .setDescription(`${error} Esta interação não é á para você.`)
                .setColor(hexToRgb(settings.colors.danger));

            await interaction.reply({ ephemeral, embeds: [embed] });
            return;
        }

        try {
            const student = await prismaClient.student.findUnique({
                where: {
                    discordUserID: interaction.user.id
                }
            });

            const aboutMeValue = student ? student.aboutMe || "Amo gatinhos 🐱" : "Amo gatinhos 🐱";
            const githubValue = student ? student.github || "" : "";

            const aboutme = new TextInputBuilder()
                .setCustomId("textinput/aboutme")
                .setLabel("Descreva um pouco sobre você")
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder("Escreva aqui um pouco sobre você")
                .setRequired(true)
                .setMaxLength(100)
                .setValue(aboutMeValue);

            const github = new TextInputBuilder()
                .setCustomId("textinput/github")
                .setLabel("Digite a URL para o seu Github")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Este campo não é obrigpatorio, você pode continua sem por.")
                .setRequired(false)
                .setValue(githubValue)
                .setMaxLength(100);

            const rowModal = createRow(aboutme);
            const rowGithub = createRow(github);

            const modal = new ModalBuilder()
                .setCustomId("modal/aboutme")
                .setTitle("Descreva um pouco sobre você")
                .addComponents(rowModal)
                .addComponents(rowGithub);

            await interaction.showModal(modal);
        } catch (error) {
            console.error("Error occurred while fetching or setting aboutMe value:", error);
        }
    },
});


new Component({
    customId: "button/languages/:userId",
    cache: "cached",
    type: ComponentType.Button,
    async run(interaction, { userId }) {
        
        if (interaction.user.id != userId) {
            const error = settings.emojis.error;
            const embed = new EmbedBuilder()
                .setDescription(`${error} Esta interação não é á para você.`)
                .setColor(hexToRgb(settings.colors.danger));

            await interaction.reply({ephemeral, embeds: [embed]});
            return;
        }

        const success = settings.emojis.success;

        const embed = new EmbedBuilder()
            .setDescription(`${success} Escolha sua/suas linguagens favoritas`)
            .setColor(hexToRgb(settings.colors.default));

        const menu = new StringSelectMenuBuilder()
            .setCustomId("menu/languages")
            .setMaxValues(10)
            .setMinValues(1)
            .setPlaceholder("Escolha a/as linguagens de sua prefência")
            .setOptions(
                {
                    label: "Golang",
                    value: "golang",
                    emoji: settings.languages.golang,
                },
                {
                    label: "JavaScript",
                    value: "javascript",
                    emoji: settings.languages.javascript,
                },
                {
                    label: "TypeScript",
                    value: "typescript",
                    emoji: settings.languages.typescript,
                },
                {
                    label: "Java",
                    value: "java",
                    emoji: settings.languages.java,
                },
                {
                    label: "PHP",
                    value: "php",
                    emoji: settings.languages.php,
                },
                {
                    label: "C#",
                    value: "csharp",
                    emoji: settings.languages.csharp,
                },
                {
                    label: "Python",
                    value: "python",
                    emoji: settings.languages.python,
                },
                {
                    label: "Rust",
                    value: "rust",
                    emoji: settings.languages.rust,
                },
                {
                    label: "C++",
                    value: "cpp",
                    emoji: settings.languages.cpp,
                },
                {
                    label: "C",
                    value: "c",
                    emoji: settings.languages.c,
                }
            );

        const row = createRow(menu);

        await interaction.reply({ ephemeral, embeds: [embed], components: [row] });
    },
});
