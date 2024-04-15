import { settings } from "#settings";
import { hexToRgb } from "@magicyan/discord";
import { EmbedBuilder } from "discord.js";

const embedSuccess = new EmbedBuilder()
    .setDescription(`${settings.emojis.success} A informação foi salva com sucesso!`)
    .setColor(hexToRgb(settings.colors.success));

const embedError = new EmbedBuilder()
    .setDescription(`${settings.emojis.error} Por favor, forneça o que foi pedido corretamente!`)
    .setColor(hexToRgb(settings.colors.danger));

export { embedSuccess, embedError };