import { Command } from "#base";
import { ApplicationCommandType } from "discord.js";
import MemberViewer from "functions/students.js";

const memberViewer = new MemberViewer();

new Command({
    name: "estudantes",
    description: "Veja todos os estudantes que estão cadastrados no banco de dados",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false, 
    async run(interaction) {
        await memberViewer.viewStudents(interaction);
    },
});
