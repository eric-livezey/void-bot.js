import { ChatInputCommandInteraction, Client, Guild, GuildMember, GuildTextBasedChannel, If, InteractionEditReplyOptions, InteractionReplyOptions, Message, MessagePayload, MessageReplyOptions, SendableChannels, User } from 'discord.js';
declare abstract class CommandContext<InGuild extends boolean = boolean> {
    /**
     * The client associated with this command invocation.
     */
    readonly client: Client<true>;
    /**
     * The user who invoked the command.
     */
    readonly user: User;
    /**
     * The channel in which the command was invoked.
     */
    readonly channel: If<InGuild, GuildTextBasedChannel, SendableChannels>;
    /**
     * The member who invoked the command or `null` if not in a guild.
     */
    readonly member: If<InGuild, GuildMember>;
    /**
     * The guild in which the command was invoked.
     */
    readonly guild: If<InGuild, Guild>;
    constructor(user: User, channel: SendableChannels, member?: GuildMember);
    /**
     * Returns `true` if the command was invoked via a message, else `false`.
     */
    isMessage(): this is MessageCommandContext;
    /**
     * Returns `true` if the command was invoked via an interaction, else `false`.
     */
    isInteraction(): this is SlashCommandContext;
    /**
     * Reply to the command.
     */
    abstract reply(options: any): Promise<Message<InGuild>>;
}
declare class SlashCommandContext<InGuild extends boolean = boolean> extends CommandContext<InGuild> {
    /**
     * The interaction associated with the command.
     */
    readonly interaction: ChatInputCommandInteraction;
    constructor(interaction: ChatInputCommandInteraction<'cached'>);
    /**
     * Reply to the command.
     *
     * If the interaction was already deferred or replied to, the reply will be edited.
     */
    reply(options: string | MessagePayload | InteractionReplyOptions | InteractionEditReplyOptions): Promise<Message<InGuild>>;
}
declare class MessageCommandContext<InGuild extends boolean = boolean> extends CommandContext<InGuild> {
    /**
     * The message associated with the command.
     */
    readonly message: Message<InGuild>;
    /**
     * Message content excluding the command name and prefix.
     */
    readonly content: string;
    /**
     * Parsed argument list.
     */
    readonly args: string[];
    constructor(message: Message<InGuild> & {
        channel: SendableChannels;
    }, content: string);
    reply(options: string | MessagePayload | MessageReplyOptions): Promise<Message<InGuild>>;
}
export { CommandContext, SlashCommandContext, MessageCommandContext };