import { Component } from "#base";
import { createRow } from "@magicyan/discord";
import { ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { embedError, embedSuccess } from "functions/embeds.js";
import prismaClient from "prisma/index.js";

new Component({
    customId: "menu/string/webhook",
    cache: "cached",
    type: ComponentType.StringSelect,
    async run(interaction) {
        const values = interaction.values;

        for (const value of values) {
            switch (value) {
                case "webhook":
                    const textInput = createRow(
                        new TextInputBuilder()
                            .setCustomId("textinput/webhook")
                            .setLabel("URL da Webhook")
                            .setPlaceholder("Digite a URL da Webhook!")
                            .setRequired(true)
                            .setStyle(TextInputStyle.Short),
                    );

                    const modal = new ModalBuilder()
                        .setCustomId("modal/webhook")
                        .setTitle("Webhook")
                        .addComponents(textInput);

                    await interaction.showModal(modal);
                    break;
                default:
                    break;

            }
        }
    },
});

new Component({
    customId: "menu/string/category",
    cache: "cached",
    type: ComponentType.ChannelSelect,
    async run(interaction) {
        const { values } = interaction;

        if (values && values.length > 0) {
            const categoryID = values[0];

            const prisma = prismaClient;

            const guildId = interaction.guild.id;

            const existingGuild = await prisma.guild.findFirst({
                where: {
                    guildId: guildId,
                },
            });

            if (existingGuild) {
                await prisma.guild.update({
                    where: {
                        id: existingGuild.id,
                    },
                    data: {
                        categoryID: categoryID,
                    },
                });

                const embed = embedSuccess;

                await interaction.reply({ephemeral, embeds: [embed]});
            } else {
                await prisma.guild.create({
                    data: {
                        guildId: guildId,
                        categoryID: categoryID,
                    },
                });
                const embed = embedSuccess;

                await interaction.reply({ephemeral, embeds: [embed]});
            }
        } else {
            console.log("Nenhum canal selecionado.");
            const embed = embedError;
            await interaction.reply({ephemeral, embeds: [embed]});

        }
    },
});

new Component({
    customId: "menu/string/role",
    cache: "cached",
    type: ComponentType.RoleSelect,
    async run(interaction) {
        try {
            const { values } = interaction;

            if (values && values.length > 0) {
                const roleID = values[0];

                const prisma = prismaClient;

                const guildId = interaction.guild.id;

                const existingGuild = await prisma.guild.findFirst({
                    where: {
                        guildId: guildId,
                    },
                });

                if (existingGuild) {
                    // Atualizar o roleID existente
                    await prisma.guild.update({
                        where: {
                            id: existingGuild.id,
                        },
                        data: {
                            roleID: roleID,
                        },
                    });

                    const embed = embedSuccess;

                    await interaction.reply({ ephemeral, embeds: [embed] });
                } else {
                    await prisma.guild.create({
                        data: {
                            guildId: guildId,
                            roleID: roleID,
                        },
                    });
                    const embed = embedSuccess;

                    await interaction.reply({ ephemeral, embeds: [embed] });
                }
            } else {
                console.log("Nenhum papel selecionado.");
                const embed = embedError;
                await interaction.reply({ ephemeral, embeds: [embed] });

            }
        } catch (error) {
            console.error("Erro ao salvar ou atualizar o papel:", error);
            const embed = embedError;
            await interaction.reply({ ephemeral, embeds: [embed] });
        }
    },
});
