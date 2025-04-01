import { nullifyValue } from './utils.js';
class CommandContext {
    /**
     * The client associated with this command invocation.
     */
    client;
    /**
     * The user who invoked the command.
     */
    user;
    /**
     * The channel in which the command was invoked.
     */
    channel;
    /**
     * The member who invoked the command or `null` if not in a guild.
     */
    member;
    /**
     * The guild in which the command was invoked.
     */
    guild;
    constructor(user, channel, member) {
        this.client = user.client;
        this.user = user;
        this.channel = channel;
        this.member = nullifyValue(member);
        this.guild = nullifyValue(member?.guild);
    }
    /**
     * Returns `true` if the command was invoked via a message, else `false`.
     */
    isMessage() {
        return this instanceof MessageCommandContext;
    }
    /**
     * Returns `true` if the command was invoked via an interaction, else `false`.
     */
    isInteraction() {
        return this instanceof SlashCommandContext;
    }
}
class SlashCommandContext extends CommandContext {
    /**
     * The interaction associated with the command.
     */
    interaction;
    constructor(interaction) {
        super(interaction.user, interaction.channel, interaction.member || undefined);
        this.interaction = interaction;
    }
    /**
     * Reply to the command.
     *
     * If the interaction was already deferred or replied to, the reply will be edited.
     */
    async reply(options) {
        return this.interaction.replied || this.interaction.deferred ? await this.interaction.editReply(options) : await (await this.interaction.reply(options)).fetch();
    }
}
class MessageCommandContext extends CommandContext {
    /**
     * The message associated with the command.
     */
    message;
    /**
     * The name of the command.
     */
    name;
    /**
     * Message content excluding the command name and prefix.
     */
    content;
    /**
     * Parsed argument list.
     */
    args;
    constructor(message, prefix) {
        super(message.author, message.channel, message.member || undefined);
        this.message = message;
        const messageContent = message.content.substring(prefix.length);
        [this.name] = messageContent.split(' ');
        this.content = messageContent.substring(this.name.length).trimStart();
        this.args = this.content.split(' ');
    }
    async reply(options) {
        return await this.channel.send(options);
    }
}
export { CommandContext, SlashCommandContext, MessageCommandContext };