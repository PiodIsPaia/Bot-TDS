import { Event } from "#base";
import { settings } from "#settings";
import { createRow, hexToRgb } from "@magicyan/discord";
import { prismaClient } from "../../../prisma/index.js";
import { ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } from "discord.js";

function removeAccents(str: string) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

new Event({
    name: "Member Join",
    event: "guildMemberAdd",
    async run(member) {
        const guild = member.guild;

        const guildData = await prismaClient.guild.findUnique({
            where: {
                guildId: guild.id
            }
        });

        if (!guildData) {
            console.error("Informações da guilda não encontradas no banco de dados.");
            return;
        }

        const categoryID = guildData.categoryID;

        if (!categoryID) {
            console.error("ID da categoria não encontrado nas informações da guilda.");
            return;
        }

        const category = guild.channels.cache.get(categoryID);

        if (!category) {
            console.error("Categoria não encontrada.");
            return;
        }

        await prismaClient.student.findMany();

        const channel = await guild.channels.create({
            name: `${member.user.username}-${member.user.id}`,
            parent: categoryID,
            type: ChannelType.GuildText,
            permissionOverwrites: [{
                id: guild.roles.everyone,
                deny: ["ViewChannel"]
            },
            {
                id: member.user.id,
                allow: ["ViewChannel", "SendMessages", "AttachFiles"]
            }]
        });

        if (channel.type != ChannelType.GuildText) return;

        const ticket = settings.emojis.ticket;
        const log = settings.emojis.log;
        const error = settings.emojis.error;
        const authorID = member.id;

        await channel.send({
            content: `${ticket} <@${authorID}>, Boas vindas ao seu canal de registro.\n${log} Para começarmos com a verificação, você poderia digitar seu nome completo?`
        });

        const messageCollector = channel.createMessageCollector({
            time: 160_000,
            filter: (msg) => msg.author.id === member.user.id
        });

        let attempts = 0;

        messageCollector.on("collect", async msg => {
            if (msg.author.bot) return;

            const originalName = msg.content.trim();
            const name = removeAccents(originalName.toLowerCase().replace(/\s/g, ""));
            console.log(name);

            const documents = await prismaClient.document.findMany();
            const document = documents.find(doc => doc.content.some(contentName => removeAccents(contentName.toLowerCase().replace(/\s/g, "")) === name));

            if (document) {
                
                await channel.bulkDelete(100);

                const check = settings.emojis.success;
                const avatarUrl = member.user.avatarURL({ size: 512 });
                const embed = new EmbedBuilder()
                    .setAuthor({ name: member.user.username, iconURL: avatarUrl ? avatarUrl : member.user.defaultAvatarURL })
                    .setDescription(`Olá ${member.user.username}, bem-vindo(a) ao nosso servidor! Para nos ajudar a conhecê-lo melhor, vamos fazer algumas perguntas que serão usadas para o seu registro. Quando estiver pronto(a), clique no botão abaixo para começarmos.`)
                    .setColor(hexToRgb(settings.colors.default));

                const button = new ButtonBuilder()
                    .setCustomId("init/register")
                    .setLabel("Iniciar")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(check);

                const row = createRow(button);

                channel.send({ content: `<@${member.id}>`, embeds: [embed], components: [row] });
            } else {
                attempts++;
                if (attempts >= 3) {
                    const andre = settings.config.andre;
                    const user = member.client.users.cache.get(andre)!!;
                    const helpChannelID = settings.config.helpChannelID;

                    const embed = new EmbedBuilder()
                        .setAuthor({ name: user.username, iconURL: user.avatarURL({ size: 512 })!! })
                        .setDescription(`${error} Como você não teve êxito eu recomendo que procure por \`${user.username}\` para um maior suporte!\n💠 Ou você pode ir até o <#${helpChannelID}> e buscar por ajuda.`)
                        .setColor(hexToRgb(settings.colors.danger))
                        .setFooter({ text: "iD dele: " + user.id });

                    await channel.send({ embeds: [embed] }).then(async (msg) => {
                        await msg.channel.send({content: "⏳ Irei excluir este canal em 30 segundos."});
                        setTimeout(async () => {
                            await msg.delete();
                        }, 30_000);
                    }).catch((err) => console.error(err));
                    messageCollector.stop();
                } else {
                    await channel.send({ content: `${error} Não encontrei nenhum usuário correspondente a "${originalName}"!\n💠 Por favor, digite seu nome novamente!` });
                }
            }
        });

    },
});
