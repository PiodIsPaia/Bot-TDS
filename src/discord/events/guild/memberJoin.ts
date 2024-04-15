import { Event } from "#base";
import { settings } from "#settings";
import { createRow, hexToRgb } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } from "discord.js";
import prismaClient from "prisma/index.js";

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

        channel.send({ content: `<@${member.id}>` ,embeds: [embed], components: [row] });
    },
});
