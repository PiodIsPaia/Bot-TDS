import { Modal } from "#base";
import { settings } from "#settings";
import { hexToRgb } from "@magicyan/discord";
import { EmbedBuilder } from "discord.js";
import { prismaClient } from "../../../prisma/index.js";
import { checkGithubUserExists } from "../../../functions/github.js";

new Modal({
    customId: "modal/aboutme",
    cache: "cached",
    async run(interaction) {
        const { fields, user } = interaction;

        await interaction.deferReply({ ephemeral: true });

        const success = settings.emojis.success;;

        const embed = new EmbedBuilder()
            .setDescription(`${success} Salvei suas informações.`)
            .setColor(hexToRgb(settings.colors.success));

        try {
            const aboutMeValue = fields.getTextInputValue("textinput/aboutme");
            const sinceCourse = fields.getTextInputValue("textinput/since");
            let githubValue = fields.getTextInputValue("textinput/github");

            if (sinceCourse !== "23" && sinceCourse !== "24") {
                const error = settings.emojis.error;
                const embed = new EmbedBuilder()
                    .setDescription(`${error} O valor para o ano que você engressou no curso deve ser '23' ou '24'.`)
                    .setColor(hexToRgb(settings.colors.danger));
            
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            if (!githubValue) {
                githubValue = "";
            } else {
                const githubRegex = /^https?:\/\/(www\.)?github\.com\/\S+$/;
                const isValidGithubUrl = githubRegex.test(githubValue);

                if (!isValidGithubUrl) {
                    const error = settings.emojis.error;
                    const embed = new EmbedBuilder()
                        .setDescription(`${error}, a URL para o GitHub é inválida!`)
                        .setColor(hexToRgb(settings.colors.danger));

                    await interaction.editReply({ embeds: [embed] });
                    return;
                }

                const githubUsername = githubValue.replace(/^https?:\/\/(www\.)?github\.com\//, "");
                const githubUserExists = await checkGithubUserExists(githubUsername);

                if (!githubUserExists) {
                    const error = settings.emojis.error;
                    const embed = new EmbedBuilder()
                        .setDescription(`${error} a conta do GitHub não existe!`)
                        .setColor(hexToRgb(settings.colors.danger));

                    await interaction.editReply({ embeds: [embed] });
                    return;
                }
            }

            const existingStudent = await prismaClient.student.findUnique({
                where: {
                    discordUserID: user.id
                }
            });

            if (existingStudent) {
                await prismaClient.student.update({
                    where: {
                        discordUserID: user.id
                    },
                    data: {
                        aboutMe: aboutMeValue,
                        github: githubValue,
                        since: sinceCourse,
                    }
                });

                await interaction.editReply({ embeds: [embed] });
                return;
            }
        } catch (error) {
            console.error("Ocorreu um erro:", error);
            await interaction.editReply({ content: "Ocorreu um erro ao salvar suas informações." });
            return;
        }
    },
});
