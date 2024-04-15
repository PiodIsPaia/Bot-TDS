import { Component } from "#base";
import { createRow } from "@magicyan/discord";
import { ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

function createRegisterModal() {
    const name = new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Qual seu nome?")
        .setPlaceholder("Por favor, digite seu nome completo!")
        .setStyle(TextInputStyle.Paragraph)
        .setValue("");

    const polo = new TextInputBuilder()
        .setCustomId("polo")
        .setLabel("Qual o nome do seu Polo?")
        .setPlaceholder("Exemplo: ETE Maria Jose, Bezerros, PE")
        .setStyle(TextInputStyle.Short)
        .setValue("");

    const age = new TextInputBuilder()
        .setCustomId("age")
        .setLabel("Qual sua idade")
        .setPlaceholder("Digite aqui sua idade")
        .setStyle(TextInputStyle.Short)
        .setValue("");

    const rowName = createRow(name);
    const rowPolo = createRow(polo);
    const rowAge = createRow(age);

    const modal = new ModalBuilder()
        .setCustomId("modal/register")
        .setTitle("Registro")
        .addComponents(rowName)
        .addComponents(rowPolo)
        .addComponents(rowAge);

    return modal;
}

new Component({
    customId: "init/register",
    cache: "cached",
    type: ComponentType.Button,
    async run(interaction) {
        await interaction.showModal(createRegisterModal());
    },
});

new Component({
    customId: "edit",
    cache: "cached",
    type: ComponentType.Button,
    async run(interaction) {
        await interaction.showModal(createRegisterModal());
        await interaction.deleteReply();
    },
});

