import { AnyThreadChannel, BaseMessageOptions, ChatInputCommandInteraction, Client, Guild, GuildMember, GuildTextBasedChannel, If, InteractionReplyOptions, Message, MessagePayload, MessageReplyOptions, PartialDMChannel, TextBasedChannel, User } from "discord.js";

declare abstract class CommandContext<InGuild extends boolean = boolean> {
    /**
     * The client associated with this command invokation.
     */
    public readonly client: Client<true>;
    /**
     * The user who invoked the command.
     */
    public readonly user: User;
    /**
     * The channel in which the command was invoked.
     */
    public readonly channel: Exclude<If<InGuild, GuildTextBasedChannel, TextBasedChannel>, PartialDMChannel | AnyThreadChannel>;
    /**
     * The member who invoked the command or `null` if not in a guild.
     */
    public readonly member: If<InGuild, GuildMember>;
    /**
     * The guild in which the command was invoked
     */
    public readonly guild: If<InGuild, Guild>;

    protected constructor(user: User, channel: Exclude<TextBasedChannel, PartialDMChannel | AnyThreadChannel>, member?: GuildMember | null);

    /**
     * Returns `true` if the command was invoked via an interaction, else `false`.
     */
    public isInteraction(): this is InteractionCommandContext;
    /**
     * Reply to the command.
     */
    public abstract reply(message: string | MessagePayload | BaseMessageOptions): Promise<Message<InGuild>>;
}

declare class MessageCommandContext<InGuild extends boolean = boolean> extends CommandContext<InGuild> {
    /**
     * The message associated with the command.
     */
    public readonly message: Message<InGuild>;

    private constructor(message: Message);

    public reply(options: string | MessagePayload | MessageReplyOptions): Promise<Message<InGuild>>;
}

declare class InteractionCommandContext extends CommandContext<true> {
    /**
     * The interaction associated with the command.
     */
    public readonly interaction: ChatInputCommandInteraction;

    private constructor(interaction: ChatInputCommandInteraction);

    public reply(options: string | MessagePayload | InteractionReplyOptions): Promise<Message<true>>;
}