import { WebhookClient, EmbedBuilder } from "discord.js";

export default class WebhookLogs {
    private webhookClient: WebhookClient;

    constructor(webhookUrl: string) {
        this.webhookClient = new WebhookClient({ url: webhookUrl });
    }

    async sendEmbed(embed: EmbedBuilder, avatar: string) {
        try {
            await this.webhookClient.send({ avatarURL: avatar, username: "TDS Registros", embeds: [embed] });
            console.log("Embed enviada com sucesso via webhook!");
        } catch (error) {
            console.error("Erro ao enviar embed via webhook:", error);
        }
    }
}
