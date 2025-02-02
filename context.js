import { ChatInputCommandInteraction, DMChannel, GuildMember, Message, NewsChannel, PermissionsBitField, StageChannel, TextChannel, User, VoiceChannel } from "discord.js";

class CommandContext {
    constructor(user, channel, member) {
        if (user instanceof User)
            Object.defineProperties(this, { "user": { value: user, enumerable: true }, "client": { value: user.client } });
        else
            throw new TypeError("user must be an instance of User");
        if (channel instanceof DMChannel || channel instanceof NewsChannel || channel instanceof StageChannel || channel instanceof TextChannel || channel instanceof VoiceChannel)
            Object.defineProperty(this, "channel", { value: channel, enumerable: true });
        else
            throw new TypeError("channel must be an instance of a text based channel");
        if (member instanceof GuildMember)
            Object.defineProperties(this, { "member": { value: member, enumerable: true }, "guild": { value: member.guild, enumerable: true } });
        else if (member === null || member === undefined)
            Object.defineProperties(this, { "member": { value: null, enumerable: true }, "guild": { value: null, enumerable: true } });
        else
            throw new TypeError("member must be an instance of a GuildMember or null or undefined");
    }

    isMessage() {
        return this instanceof MessageCommandContext;
    }

    isInteraction() {
        return this instanceof InteractionCommandContext;
    }
}

class MessageCommandContext extends CommandContext {
    constructor(message) {
        super(message.author, message.channel, message.member);
        if (message instanceof Message)
            Object.defineProperty(this, "message", { value: message, enumerable: true });
        else
            throw new TypeError("message must be an instance of Message");
    }

    async reply(options) {
        return await this.message.channel.send(options);
    }
}

class InteractionCommandContext extends CommandContext {
    constructor(interaction) {
        super(interaction.user, interaction.channel, interaction.member);
        if (interaction instanceof ChatInputCommandInteraction)
            Object.defineProperty(this, "interaction", { value: interaction, enumerable: true });
        else
            throw new TypeError("interaction must be an instance of ChatInputCommandInteraction");
    }

    async reply(options) {
        return this.interaction.replied || this.interaction.deferred ? this.interaction.editReply(options) : await this.interaction.reply(options);
    }
}

export {
    InteractionCommandContext,
    MessageCommandContext
};
