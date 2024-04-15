import { Command } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, Events, GuildMember } from "discord.js";

new Command({
    name: "emit",
    description: "Emit a discord.js event",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: Events.GuildMemberAdd.toLowerCase(),
            description: `Emit a ${Events.GuildMemberAdd} event`,
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "member",
                    description: "Select a member",
                    type: ApplicationCommandOptionType.User,
                    required: true,
                }
            ]
        },
    ],
    async run(interaction){
        const { options, client } = interaction;

        const selectedEvent = options.getSubcommand(true);

        switch(selectedEvent){
            case Events.GuildMemberAdd.toLocaleLowerCase():{
                const mention = options.getMember("member") as GuildMember;

                client.emit("guildMemberAdd", mention);

                interaction.reply({ ephemeral: true,
                    content: `Evento emitido para ${mention}`
                });
                return;
            }
        }

    }
});