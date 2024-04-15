import { Modal } from "#base";
import { prismaClient } from "../../../prisma/index.js";
import { embedError, embedSuccess } from "../../../functions/embeds.js";

new Modal({
    customId: "modal/webhook",
    cache: "cached",
    async run(interaction) {
        const webhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[a-zA-Z0-9_-]+$/;

        const webhookURL = interaction.fields.getTextInputValue("textinput/webhook");

        if (webhookRegex.test(webhookURL)) {
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
                        webhook: webhookURL,
                    },
                });

                const embed = embedSuccess;

                await interaction.reply({ ephemeral: true, embeds: [embed] });
            } else {
                await prisma.guild.create({
                    data: {
                        guildId: guildId,
                        webhook: webhookURL,
                    },
                });

                const embed = embedSuccess;

                await interaction.reply({ ephemeral: true, embeds: [embed] });
            }
        } else {
            const embed = embedError;

            await interaction.reply({ ephemeral: true, embeds: [embed] });
        }
    },
});
