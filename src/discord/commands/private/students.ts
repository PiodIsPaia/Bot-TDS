import { Command } from "#base";
import { settings } from "#settings";
import { ApplicationCommandType } from "discord.js";
import MemberViewer from "../../../functions/students.js";

const memberViewer = new MemberViewer();

new Command({
    name: "estudantes",
    description: "Veja todos os estudantes que estão cadastrados no banco de dados",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false, 
    async run(interaction) {
        const piod = settings.config.piod;
        const andre = settings.config.andre;

        const error = settings.emojis.error;

        if (interaction.user.id != piod && interaction.user.id != andre) {
            await interaction.reply({ ephemeral, content: `${error} Você não tem permissão para executar este comando!` });
            return;
        }

        await memberViewer.viewStudents(interaction);
    },
});
