import { Component } from "#base";
import { settings } from "#settings";
import { brBuilder, createRow, hexToRgb } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from "discord.js";
import { prismaClient } from "prisma/index.js";

new Component({
    customId: "menu/languages",
    cache: "cached",
    type: ComponentType.StringSelect,
    async run(interaction) {
        const { user } = interaction;

        if (interaction.values && interaction.values.length > 0) {
            try {
                const student = await prismaClient.student.findUnique({
                    where: {
                        discordUserID: user.id
                    }
                });

                if (student) {
                    const existingLanguagesSet = new Set(student.languages);
                    const addLanguages = interaction.values.filter(language => !existingLanguagesSet.has(language));
                    const removeLanguages = interaction.values.filter(language => existingLanguagesSet.has(language));

                    const addFields = addLanguages.map(language => {
                        const emoji = settings.languages[language as keyof typeof settings.languages];
                        const formattedName = language.charAt(0).toUpperCase() + language.slice(1);
                        return `- ${emoji} ${formattedName}`;
                    });

                    const removeFields = removeLanguages.map(language => {
                        const emoji = settings.languages[language as keyof typeof settings.languages];
                        const formattedName = language.charAt(0).toUpperCase() + language.slice(1);
                        return `- ${emoji} ${formattedName}`;
                    });

                    const addLanguagesList = addFields.join("\n");
                    const removeLanguagesList = removeFields.join("\n");

                    const embedConfirm = new EmbedBuilder()
                        .setDescription(brBuilder(addLanguagesList || removeLanguagesList))
                        .setColor(hexToRgb(settings.colors.danger))
                        .setFooter({
                            text: addLanguagesList ? "Deseja adicionar essas linguagens ao seu perfil?" : "Deseja remover essas linguagens do seu perfil?"
                        });

                    const buttonAdd = new ButtonBuilder()
                        .setCustomId("button/add/language")
                        .setLabel("Adicionar")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji(settings.emojis.success);

                    const buttonRemove = new ButtonBuilder()
                        .setCustomId("button/remove/language")
                        .setLabel("Remover")
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji(settings.emojis.error);

                    const buttonRow = createRow(buttonAdd, buttonRemove);

                    await interaction.update({ embeds: [embedConfirm], components: [buttonRow] })
                        .then((msg) => {
                            const collector = msg.createMessageComponentCollector(
                                { filter: (i) => i.user.id === user.id }
                            );

                            collector.on("collect", async (i) => {

                                const success = settings.emojis.success;
                                const error = settings.emojis.error;

                                const customID = i.customId;


                                switch (customID) {
                                    case "button/add/language":
                                        
                                        const newLanguages = addLanguages.filter(language => !existingLanguagesSet.has(language));
                                        if (newLanguages.length > 0) {
                                            await prismaClient.student.update({
                                                where: {
                                                    discordUserID: user.id
                                                },
                                                data: {
                                                    languages: {
                                                        push: newLanguages
                                                    }
                                                }
                                            });
                                            await i.update({
                                                content: `${success} Linguagens adicionadas com sucesso!`,
                                                components: [],
                                                embeds: []
                                            });
                                        } else {
                                            await i.update({
                                                content: `${error} As linguagens selecionadas já estão no seu perfil!`,
                                                components: [],
                                                embeds: []
                                            });
                                        }
                                        break;
                                    case "button/remove/language":
                                        await prismaClient.student.update({
                                            where: {
                                                discordUserID: user.id
                                            },
                                            data: {
                                                languages: {
                                                    set: Array.from(existingLanguagesSet).filter(language => !removeLanguages.includes(language))
                                                }
                                            }
                                        });
                                        await i.update({
                                            content: `${success} Linguagens removidas com sucesso!`,
                                            components: [],
                                            embeds: []
                                        });
                                        break;
                                    default:
                                        break;
                                }
                            });
                        });

                }
            } catch (error) {
                console.error("Erro ao atualizar as linguagens do estudante:", error);
            }
        } else {
            console.log("Nenhuma linguagem selecionada");
        }
    },
});
