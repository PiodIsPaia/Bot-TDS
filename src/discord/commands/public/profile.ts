import { Command } from "#base";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder, codeBlock } from "discord.js";
import { prismaClient } from "../../../prisma/index.js";
import { brBuilder, createRow, hexToRgb } from "@magicyan/discord";
import { settings } from "#settings";


new Command({
    name: "perfil",
    description: "[ Utilidade ] Veja como está seu perfil",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    async run(interaction) {
        const { user } = interaction;
    

        const error = settings.emojis.error;

        await interaction.deferReply({ ephemeral: false });

        const student = await prismaClient.student.findUnique({
            where: {
                discordUserID: user.id
            }
        });

        if (!student) {
            const error = settings.emojis.error;
            await interaction.editReply(`${error} Não encontrei nenhum perfil associado à sua conta do Discord`);
            return;
        }


        const buttonAboutMe = new ButtonBuilder()
            .setCustomId(`button/aboutme/${user.id}`)
            .setLabel("Sobre mim")
            .setEmoji(settings.emojis.star)
            .setStyle(ButtonStyle.Secondary);

        const buttonLanguages = new ButtonBuilder()
            .setCustomId(`button/languages/${user.id}`)
            .setLabel("Linguagens")
            .setEmoji(settings.languages.golang)
            .setStyle(ButtonStyle.Secondary);

        const githubButton = new ButtonBuilder()
            .setLabel("Github")
            .setEmoji(settings.emojis.github)
            .setStyle(ButtonStyle.Link)
            .setURL(student.github ? student.github : "https://discord.gg/4S7mGCZmyt")
            .setDisabled(!student.github);

        const buttonUpdate = new ButtonBuilder()
            .setCustomId("button/update")
            .setLabel("Atualizar")
            .setEmoji(settings.emojis.update)
            .setStyle(ButtonStyle.Secondary);

        const row = createRow(buttonAboutMe, buttonLanguages);
        const row2 = createRow(buttonUpdate, githubButton);

        const match = settings.emojis.profile.match(/<:perfil:(\d+)>/);
        const profileEmojiId = match ? match[1] : null;

        const firstName = student.fullName.split(" ")[0];
        const secondName = student.fullName.split(" ")[1];

        const gear = settings.emojis.gear;
        const star = settings.emojis.star;
        const profileUrl = `https://cdn.discordapp.com/emojis/${profileEmojiId}.png`;

        const name = `${firstName} ${secondName}`;
        const avatarUrl = user.avatarURL({ size: 512 }) || settings.images.cat;

        const archive = settings.emojis.archive;
        const aboutMeEmoji = settings.emojis.aboutme;
        const aboutMeContent = student.aboutMe ? codeBlock(`${student.aboutMe}`) : codeBlock("Amo gatinhos 🐱");
        const aboutMeSection = brBuilder(
            `### ${aboutMeEmoji} Sobre mim`,
            aboutMeContent
        );

        const languagesList = student.languages.length > 0 ? student.languages.map(language => `\`${language.toUpperCase()}\``).join(", ") : "`Não informado`";

        const embed = new EmbedBuilder()
            .setThumbnail(avatarUrl)
            .setAuthor({ name: name, iconURL: profileUrl })
            .setDescription(aboutMeSection)
            .addFields(
                { name: `${star} **Idade**`, value: `- \`${student.age} anos\``, inline: false },
                { name: `${archive} **Polo**`, value: `- \`${student.polo}\``, inline: false },
                { name: `${gear} Linguagens`, value: `- ${languagesList}`, inline: false }
            )
            .setColor(hexToRgb(settings.colors.azoxo));

        await interaction.editReply({ embeds: [embed], components: [row, row2] });

        const collector = interaction.channel!!.createMessageComponentCollector(
            { filter: (i) => i.user.id === user.id }
        );

        collector.on("collect", async i => {
            if (i.customId === "button/update") {
                const updatedStudent = await prismaClient.student.findUnique({
                    where: {
                        discordUserID: user.id
                    }
                });

                if (updatedStudent) {
                    let updated = false;

                    if (student.aboutMe !== updatedStudent.aboutMe || student.github !== updatedStudent.github) {
                        updated = true;
                    }

                    if (JSON.stringify(student.languages) !== JSON.stringify(updatedStudent.languages)) {
                        updated = true;
                    }

                    if (updated) {
                        const updatedLanguagesList = updatedStudent.languages.length > 0 ? updatedStudent.languages.map(language => `\`${language.toUpperCase()}\``).join(", ") : "`Não informado`";

                        embed.spliceFields(0, 3);
                        embed.addFields(
                            { name: `${star} **Idade**`, value: `- \`${updatedStudent.age} anos\``, inline: false },
                            { name: `${archive} **Polo**`, value: `- \`${updatedStudent.polo}\``, inline: false },
                            { name: `${gear} Linguagens`, value: `- ${updatedLanguagesList}`, inline: false }
                        );

                        if (student.aboutMe !== updatedStudent.aboutMe || student.github !== updatedStudent.github) {
                            const updatedAboutMeContent = updatedStudent.aboutMe ? codeBlock(`${updatedStudent.aboutMe}`) : codeBlock("Amo gatinhos 🐱");
                            const updatedAboutMeSection = brBuilder(
                                `### ${aboutMeEmoji} Sobre mim`,
                                updatedAboutMeContent
                            );

                            embed.setDescription(updatedAboutMeSection);

                            githubButton.setURL(updatedStudent.github ? updatedStudent.github : "https://discord.gg/4S7mGCZmyt");
                            githubButton.setDisabled(!updatedStudent.github);
                        }

                        await i.update({ embeds: [embed], components: [row, row2] });
                    } else {

                        const embedError = new EmbedBuilder()
                            .setDescription(`${error} Não houve alterações no seu perfil.`)
                            .setColor(hexToRgb(settings.colors.danger));

                        await i.reply({ ephemeral, embeds: [embedError] });
                    }
                } else {
                    const embedError = new EmbedBuilder()
                        .setDescription(`${error} Não foi possível encontrar suas informações no banco de dados.`)
                        .setColor(hexToRgb(settings.colors.danger));

                    await i.reply({ ephemeral, embeds: [embedError] });

                }
            }
        });
    },
});
