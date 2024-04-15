import { Component } from "#base";
import { settings } from "#settings";
import { prismaClient } from "../../../prisma/index.js";
import { ComponentType, AttachmentBuilder } from "discord.js";


new Component({
    customId: "export/json/server",
    cache: "cached",
    type: ComponentType.Button,
    async run(interaction) {
        try {

            const guildData = await prismaClient.guild.findMany();

            if (guildData.length > 0) {
                const jsonData = JSON.stringify(guildData, null, 2);

                const attachment = new AttachmentBuilder(Buffer.from(jsonData), { name: "guild.json" });

                await interaction.reply({ ephemeral, files: [attachment] });
            } else {
                await interaction.reply({ ephemeral, content: "Não foram encontradas informações da guilda" });
            }
        } catch (error) {
            console.error("Erro ao exportar JSON:", error);
            await interaction.reply({ ephemeral, content: "Ocorreu um erro ao exportar JSON" });
        }
    },
});

new Component({
    customId: "export/json/users",
    cache: "cached",
    type: ComponentType.Button,
    async run(interaction) {
        try {
            const studentData = await prismaClient.student.findMany();

            if (studentData.length > 0) {
                const jsonData = JSON.stringify(studentData, null, 2);

                const attachment = new AttachmentBuilder(Buffer.from(jsonData), { name: "students.json" });

                await interaction.reply({ ephemeral, files: [attachment] });
            } else {
                await interaction.reply({ ephemeral, content: "Não foram encontradas informações de estudantes" });
            }
        } catch (error) {
            console.error("Erro ao exportar JSON de estudantes:", error);
            await interaction.reply({ ephemeral, content: "Ocorreu um erro ao exportar JSON de estudantes" });
        }
    },
});

new Component({
    customId: "export/json/full",
    cache: "cached",
    type: ComponentType.Button,
    async run(interaction) {
        try {
            const documents = await prismaClient.document.findMany();
            const jsonData = documents.map(doc => ({ id: doc.id, content: doc.content }));
            const jsonString = JSON.stringify(jsonData, null, 2);
            const attachment = new AttachmentBuilder(Buffer.from(jsonString), { name: "full.json" });
            await interaction.reply({ ephemeral, files: [attachment] });
        } catch (error) {
            const erro = settings.emojis.error;
            console.error("Erro ao exportar JSON completo:", error);
            await interaction.reply({ ephemeral, content: erro + "Ocorreu um erro ao exportar JSON completo" });
        }
    },
});
