import { Colors, CommandInteraction, EmbedBuilder } from "discord.js";
import { CreatePaginationOptions, createPagination } from "./pagination.js";
import { settings } from "#settings";
import { prismaClient } from "../prisma/index.js";

interface Student {
    id: string;
    discordUserID: string;
    discordUsername: string | null;
    fullName: string;
    age: number;
    polo: string;
    createAt: Date;
    updateAt: Date;
    since: Date;
}

export default class StudentViewer {
    async viewStudents(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            const students: Student[] = await prismaClient.student.findMany();

            if (students.length === 0) {
                const error = settings.emojis.error;
                await interaction.editReply(error + " Não há estudantes cadastrados no banco de dados.");
                return;
            }

            const embeds = students.map(student => {
                const user = interaction.client.users.cache.get(student.discordUserID);
                let avatarUrl = user?.avatarURL({ size: 512 });
                if (!avatarUrl) {
                    avatarUrl = "https://i.imgur.com/ORiJO66.png";
                }

                return new EmbedBuilder()
                    .setThumbnail(avatarUrl)
                    .setTitle(`${student.fullName}`)
                    .setDescription(`> ID: \`${student.discordUserID}\`\n> Idade: \`${student.age}\` anos\n> Polo: \`${student.polo}\``)
                    .setColor(Colors.White)
                    .setFooter(
                        { text: `Página ${students.indexOf(student) + 1} de ${students.length}` },
                    );
            });

            const paginationOptions: CreatePaginationOptions = {
                embeds,
                render: async (embeds, components) => interaction.editReply({ embeds, components }),
            };

            await createPagination(paginationOptions);
        } catch (error) {
            console.error("Erro ao obter estudantes:", error);
            await interaction.editReply("Ocorreu um erro ao obter os estudantes do banco de dados.");
        }
    }
}
