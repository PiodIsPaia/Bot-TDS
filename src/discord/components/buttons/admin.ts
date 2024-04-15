import fs from "fs";
import fetch from "node-fetch";
import { Component } from "#base";
import { ComponentType } from "discord.js";
import { prismaClient } from "../../../prisma/index.js";
import { settings } from "#settings";

new Component({
    customId: "button/admin",
    cache: "cached",
    type: ComponentType.Button,
    async run(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const loading = settings.emojis.update;
            const success = settings.emojis.success;
            const error = settings.emojis.error;

            await interaction.followUp({ ephemeral: true, content: loading + " Envie o arquivo com o nome das pessoas (extensão .txt)" });

            const collector = interaction.channel!!.createMessageCollector({
                time: 160_000,
                max: 1
            });

            collector.on("collect", async message => {
                try {
                    if (message.attachments.size > 0) {
                        const attachment = message.attachments.first();
                        if (!attachment) return;

                        const attachmentName = attachment.name;

                        if (attachmentName.endsWith(".txt")) {
                            const attachmentURL = attachment.url;

                            const response = await fetch(attachmentURL);
                            const buffer = await response.arrayBuffer();

                            fs.writeFileSync(`./archive/${attachmentName}`, Buffer.from(buffer));

                            let content = fs.readFileSync(`./archive/${attachmentName}`, "utf8");

                            content = content.replace(/["',]/g, "");
                            content = content.replace(/^\s*\[|\]\s*$/g, "");

                            const existingDocument = await prismaClient.document.findFirst();
                            if (existingDocument) {
                                await prismaClient.document.update({
                                    where: { id: existingDocument.id },
                                    data: { content: content.split("\n").map(line => line.trim()) }
                                });
                                await interaction.editReply({ content: success + " Documento atualizado" });
                            } else {
                                await prismaClient.document.create({
                                    data: { content: content.split("\n").map(line => line.trim()) }
                                });
                                await interaction.editReply({ content: success + " Documento criado" });
                            }

                            fs.unlinkSync(`./archive/${attachmentName}`);
                            message.delete();
                        } else {
                            await interaction.editReply({ content: error + " Você precisa enviar um arquivo com a extensão .txt" });
                        }
                    } else {
                        await interaction.editReply({ content: error + " Você precisa enviar um arquivo" });
                    }
                } catch (error) {
                    console.error("Erro ao processar mensagem coletada:", error);
                    await interaction.editReply({ content: error + " Ocorreu um erro ao processar o arquivo anexado" });
                }
            });

            collector.on("end", collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: error + " Tempo esgotado. Por favor, use o comando novamente!" });
                }
            });
        } catch (error) {
            console.error("Erro ao executar componente de botão admin:", error);
            await interaction.reply({ content: error + " Ocorreu um erro ao executar o componente de botão admin" });
        }
    },
});
