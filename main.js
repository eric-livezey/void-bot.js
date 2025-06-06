import ytdl from "@distube/ytdl-core";
import { ActionRowBuilder, Attachment, ButtonBuilder, ButtonStyle, ChannelType, Client, EmbedBuilder, Events, MessageFlags, Partials, PermissionFlagsBits, VoiceChannel } from "discord.js";
import fs from "fs";
import { SlashCommandContext, MessageCommandContext } from "./context.js";
import { SearchResultType, channelURL, getChannel, getPlaylist, getPlaylistIdFromAlbumId, getVideo, listAlbumSearchResults, listSearchResults, listSongSearchResults, playlistURL, videoURL } from "./innertube/index.js";
import { evaluate } from "./math.js";
import { Player, Track } from "./player.js";
import { createVoiceConnection, timelog } from "./utils.js";

Object.assign(process.env, JSON.parse(fs.readFileSync("./env.json")));

// Global Variables
const PREFIX = ".";

const CLIENT = new Client({
    intents: [((1 << 17) - 1) | (1 << 20) | (1 << 21)],
    partials: [Partials.Channel]
});

const AGENT = "COOKIE" in process.env ? ytdl.createAgent([{ name: "cookie", value: process.env.COOKIE }]) : ytdl.createAgent();

// Utility Functions

/**
 * Returns a parsed URL object for the given string only if the given string is a valid URL.
 * 
 * @param {string} s The string to parse
 * @returns The URL object for given string if it is a valid URL, otherwise `null`.
 */
function parseURL(s) {
    if (URL.canParse(s) && /^(https?:\/\/)?(www\.)?([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}|[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}(:\.[0-9]{1,5})?)\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(s)) {
        // String is a valid URL
        return new URL(s);
    } else {
        // String is not a valid URL
        return null;
    }
}

/**
 * Extracts the video ID from a YouTube video URL and returns it.
 * 
 * @param {URL} url A YouTube video URL.
 * @returns The video ID if the url is valid, otherwise `null`.
 */
function extractVideoID(url) {
    const str = url.host + url.pathname;
    if (/^((www|music)\.)?youtube\.com\/watch$/.test(str) && url.searchParams.has("v")) {
        // URL is a regular video link
        return url.searchParams.get("v");
    } else if (/^(youtu\.be|(www\.)?youtube\.com\/shorts)\/[A-Za-z0-9_-]{11}?$/.test(str)) {
        // URL is a short link or YouTube short
        if (url.pathname.startsWith("/shorts/")) {
            // URL is a YouTube short
            return url.pathname.substring(8);
        } else {
            // URL is a short link
            return url.pathname.substring(1);
        }
    } else {
        // URL is not a YouTube video link
        return null;
    }
}

/**
 * Extracts the playlist ID from a YouTube playlist URL and returns it.
 * 
 * @param {URL} url A YouTube playlist URL.
 * @returns The playlist ID if the url is valid, otherwise `null`.
 */
function extractPlaylistID(url) {
    if (/^((www|music)\.)?youtube\.com\/playlist$/.test(url.host + url.pathname) && url.searchParams.has("list")) {
        // URL is a YouTube playlist link
        return url.searchParams.get("list");
    } else {
        // URL does not correspond to a YouTube playlist
        return null;
    }
}

/**
 * @param {Player} player 
 * @param {number} page 
 * @returns {import("discord.js").MessageEditOptions}
 */
function getQueuePage(player, page) {
    const n = Math.max(Math.ceil(player.queue.length / 25) - 1, 0);
    if ((page + 1) * 25 > player.queue.length)
        page = n;
    if (page < 0)
        page = 0;
    const embed = player.getEmbed(page);
    const arb = new ActionRowBuilder();
    if (page > 0)
        arb.addComponents(
            new ButtonBuilder()
                .setEmoji("\u2b05")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`QUEUE_PAGE:${page - 1}`)
        );
    if (page < n)
        arb.addComponents(
            new ButtonBuilder()
                .setEmoji("\u27a1")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`QUEUE_PAGE:${page + 1}`)
        );
    let content;
    if (embed === null)
        content = "Nothing is playing."
    else if (player.queue.length === 0)
        content = "**Now Playing**";
    const embeds = [];
    if (embed !== null)
        embeds.push(embed);
    const components = [];
    if (arb.components.length > 0)
        components.push(arb.toJSON());
    return { content, embeds, components };
}

// Commands

// Utility

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 * @param {string} id 
 */
async function playPlaylist(ctx, id) {
    // Get the playlist by id
    const playlist = await getPlaylist(id);
    if (playlist === null)
        return await ctx.reply("That is not a valid YouTube playlist link.");
    const player = Player.get(ctx.guild.id)
    let totalAdded = 0;
    for (const item of await playlist.listItems()) {
        if (!player.isReady()) {
            player.stop();
            return await ctx.reply("A voice connection error occurred whilst adding the playlist.");
        }
        if (item.playable) {
            try {
                await player.enqueue(Track.fromPlaylistItem(item, { agent: AGENT, download: !player.stream }));
            } catch {
                continue;
            }
            totalAdded++;
        }
    }
    const eb = new EmbedBuilder()
        .setTitle(playlist.title || "Unknown")
        .setURL(playlistURL(id))
        .setThumbnail(playlist.thumbnails ? playlist.thumbnails.maxres ? playlist.thumbnails.maxres.url : playlist.thumbnails.high.url : null);
    if (playlist.channelTitle != null) eb.setAuthor({ name: playlist.channelTitle, url: playlist.channelId ? channelURL(playlist.channelId) : undefined });
    return await ctx.reply({
        content: "**Added " + totalAdded + " tracks to the queue:**",
        embeds: [eb.toJSON()]
    });
}

// Voice

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 * @param {VoiceChannel|null|undefined} channel
 */
async function connect_c(ctx, channel) {
    channel = channel || ctx.member.voice.channel;
    if (!channel)
        return await ctx.reply("You are not in a voice channel.");
    if ((await ctx.guild.members.fetchMe()).voice.channelId === channel.id)
        return await ctx.reply("I am already in that channel");
    createVoiceConnection(channel);
    return await ctx.reply(`Connected to <#${channel.id}>.`);
}

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 */
async function disconnect_c(ctx) {
    const me = await ctx.guild.members.fetchMe();
    const voice = me.voice;
    const channel = voice.channel;
    if (!channel)
        return await ctx.reply("I am not in a voice channel.");
    await voice.disconnect();
    return await ctx.reply(`Disconnected from <#${channel.id}>.`);
}

// Playback

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 * @param {string | null | undefined} query 
 * @param {Attachment | null | undefined} attachment
 */
async function play_c(ctx, query, attachment) {
    // handle voice channel
    const channel = ctx.member.voice.channel;
    if (!channel)
        return await ctx.reply("You are not in a voice channel.");
    if ((await ctx.guild.members.fetchMe()).voice.channelId !== channel.id)
        createVoiceConnection(channel);

    const player = Player.get(ctx.guild.id);
    let track = null;
    if (ctx.isInteraction() && !ctx.interaction.deferred)
        await ctx.interaction.deferReply();
    if (attachment) {
        // Create a track from the attachment
        track = Track.fromURL(attachment.url, attachment.name, { url: attachment.url, duration: attachment.duration || undefined });
    } else if (query) {
        let id;
        // Check if the query is a URL
        const url = parseURL(query);
        if (url !== null) {
            // Attempt to extract the video ID
            id = extractVideoID(url);
            if (id === null) {
                // Attempt to extract a playlist ID
                const listId = extractPlaylistID(url);
                if (listId !== null)
                    return await playPlaylist(ctx, listId);
                // Non YouTube URL
                if (ctx.user.id === process.env.OWNER) // owner only
                    track = Track.fromURL(url);
                else
                    return await ctx.reply("That URL does not correspond to a YouTube video or playlist.");
            }
        } else {
            // Search
            let search = await listSearchResults(query, SearchResultType.VIDEO);
            if (search.totalResults === 0)
                // No results
                return await ctx.reply("There were no valid results for your query.");
            // Retry the search in case innertube returns an incorrect response
            for (let attempts = 0; search.items.length === 0 && attempts < 10; attempts++)
                search = await listSearchResults(query, SearchResultType.VIDEO);
            if (search.items.length === 0)
                // Innertube returned an invalid response 10 times
                return await ctx.reply("Something went wrong whilst trying to search for your query.");
            // Retrieve the id of the first search result
            id = search.items[0].id.videoId;
        }
        if (track === null) {
            try {
                track = await Track.fromVideoId(id, { agent: AGENT, download: !player.stream });
            } catch (e) {
                return await ctx.reply(e.toString());
            }
        }
    } else {
        // resume
        return await resume_c(ctx);
    }
    const pos = await player.enqueue(track);
    return await ctx.reply(pos === -1 ? "An error occurred whilst downloading audio." : pos == 0 ? { content: "**Now Playing:**", embeds: [track.toEmbed()] } : { content: "**Added to the Queue:**", embeds: [track.toEmbed({ name: "Position", value: pos.toString(), inline: true })] });
}

/**
 * @param {CommandContext} ctx 
 * @param {string} query 
 */
async function playMusic_c(ctx, query) {
    if (ctx.isInteraction()) {
        await ctx.interaction.deferReply();
    }
    const items = await listSongSearchResults(query).catch(() => []);
    if (items.length === 0) {
        return ctx.reply("There were no valid results for your query.");
    }
    return await play_c(ctx, videoURL(items[0].id, undefined));
}

/**
 * 
 * @param {CommandContext} ctx 
 * @param {string} query 
 */
async function playAlbum_c(ctx, query) {
    const items = await listAlbumSearchResults(query).catch(() => []);
    if (items.length === 0) {
        return ctx.reply("There were no valid results for your query.");
    }
    const id = await getPlaylistIdFromAlbumId(items[0].id);
    return await play_c(ctx, playlistURL(id));
}

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 */
async function skip_c(ctx) {
    const member = ctx.member;
    const player = Player.get(member.guild.id);
    if (!player.isPlaying())
        return await ctx.reply("Nothing is playing.");
    if (member.voice.channel === null)
        return await ctx.reply("You are not in a voice channel.");
    if ((await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        return await ctx.reply("You must be in the same voice channel as the bot to use the command.");
    const track = player.nowPlaying;
    await player.skip();
    return await ctx.reply({ content: "**Skipped:**", embeds: [track.toEmbed()] });
}

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 */
async function stop_c(ctx) {
    const member = ctx.member;
    const player = Player.get(member.guild.id);
    if (!player.isPlaying())
        return await ctx.reply("Nothing is playing.");
    if (member.voice.channel === null)
        return await ctx.reply("You are not in a voice channel.");
    if ((await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        return await ctx.reply("You must be in the same voice channel as the bot to use the command.");
    player.stop();
    return await ctx.reply("Playback stopped.");
}

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 */
async function pause_c(ctx) {
    const member = ctx.member;
    const player = Player.get(member.guild.id);
    if (!player.isPlaying())
        return await ctx.reply("Nothing is playing.");
    if (member.voice.channel === null)
        return await ctx.reply("You are not in a voice channel.");
    if ((await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        return await ctx.reply("You must be in the same voice channel as the bot to use the command.");
    if (player.isPaused())
        return await resume_c(ctx);
    player.pause();
    return await ctx.reply("Playback paused.")
}

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 */
async function resume_c(ctx) {
    const member = ctx.member;
    const player = Player.get(member.guild.id);
    if (!player.isPlaying())
        return await ctx.reply("Nothing is playing.")
    if (member.voice.channel === null)
        return await ctx.reply("You are not in a voice channel.");
    if ((await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        return await ctx.reply("You must be in the same voice channel as the bot to use the command.")
    if (!player.isPaused())
        return await ctx.reply("Playback is not paused.");
    player.unpause();
    return await ctx.reply("Playback resumed.")
}

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 * @param {number} percentage
 */
async function volume_c(ctx, percentage) {
    const player = Player.get(ctx.guild.id);
    player.volume = percentage / 100;
    return await ctx.reply(`Volume set to ${percentage}%.`);
}

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 */
async function loop_c(ctx) {
    const player = Player.get(ctx.guild.id);
    player.loop = !player.loop;
    return await ctx.reply("Loop " + (player.loop ? "enabled." : "disabled."));
}

// Queue

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 */
async function nowPlaying_c(ctx) {
    const player = Player.get(ctx.guild.id);
    return player.isPlaying() ? await ctx.reply({ content: "**Now playing:**", embeds: [player.nowPlaying.toEmbed()] }) : await ctx.reply("Nothing is playing.");
}

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 */
async function queue_c(ctx) {
    return await ctx.reply(getQueuePage(Player.get(ctx.guild.id), 0));
}

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 * @param {number} index
 */
async function remove_c(ctx, index) {
    const player = Player.get(ctx.guild.id);
    if (!player.isPlaying())
        return await ctx.reply("Nothing is playing.");
    if (player.queue.length === 0)
        return await ctx.reply("The queue is empty.");
    if (index < 1 | index > player.queue.length)
        return await ctx.reply(`${index} is not a valid index in the queue.`);
    const track = player.queue.remove(index - 1);
    return await ctx.reply({ content: "**Removed:**", embeds: [track.toEmbed()] });
}

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 * @param {number} source
 * @param {number} destination
 */
async function move_c(ctx, source, destination) {
    const player = Player.get(ctx.guild.id);
    if (!player.isPlaying())
        return await ctx.reply("Nothing is playing.");
    if (player.queue.length == 0)
        return await ctx.reply("The queue is empty.");
    if (source < 1 | source > player.queue.length)
        return await ctx.reply(`${source} is not a valid index in the queue.`);
    if (destination < 1 | destination > player.queue.length)
        return await ctx.reply(`${destination} is not a valid index in the queue.`);
    if (source === destination)
        return await ctx.reply("Indices must not be equal.");
    const track = player.queue.get(source - 1);
    player.queue.move(source - 1, destination - 1);
    return await ctx.reply({ content: `Moved **${track.url ? `[${track.title}](${track.url})` : track.title}** to index ${destination} in the queue.`, flags: [MessageFlags.SuppressEmbeds] });
}

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 */
async function clear_c(ctx) {
    const player = Player.get(ctx.guild.id);
    if (!player.isPlaying())
        return ctx.reply("Nothing is playing.");
    if (player.queue.length == 0)
        return ctx.reply("The queue is already empty.");
    player.queue.clear();
    return ctx.reply("Queue cleared.");
}

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 */
async function shuffle_c(ctx) {
    const player = Player.get(ctx.guild.id);
    if (!player.isPlaying())
        return await ctx.reply("Nothing is playing.");
    if (player.queue.length == 0)
        return await ctx.reply("The queue is empty.");
    player.queue.shuffle();
    return await ctx.reply("Queue shuffled.");
}

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 * @param {number} index
 */
async function info_c(ctx, index) {
    const player = Player.get(ctx.guild.id);
    if (!player.isPlaying())
        return await ctx.reply("Nothing is playing.");
    if (player.queue.length == 0)
        return await ctx.reply("The queue is empty.");
    if (index < 1 || index > player.queue.length)
        return await ctx.reply(`${index} is not a valid index in the queue.`);
    return await ctx.reply({ embeds: [player.queue.get(index - 1).toEmbed({ name: "Position", value: index.toString(), inline: true })] });
}

// Reaction roles

/**
 * 
 * @param {SlashCommandContext} ctx 
 * @param {*} messageId 
 * @param {*} emoji 
 * @param {*} role 
 * @returns 
 */
async function createReactionRole_c(ctx, messageId, emoji, role) {
    return await ctx.reply({ ephemeral: true, content: "This command is still in development. If you actually want to use this command let know and I'll finish implementing it." });
}

async function removeReactionRole_c(ctx, messageId, emoji) {
    return await ctx.reply({ ephemeral: true, content: "This command is still in development. If you actually want to use this command let know and I'll finish implementing it." });
}

// Misc

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 * @param {string} expression
 */
async function evaluate_c(ctx, expression) {
    try {
        return await ctx.reply(String(evaluate(expression)));
    } catch (e) {
        return await ctx.reply(e.message);
    }
}

/**
 * @param {MessageCommandContext<true>|SlashCommandContext} ctx 
 */
async function help_c(ctx) {
    return await ctx.reply({
        embeds: [new EmbedBuilder().addFields(
            { name: "play *[query]", value: "Plays something from YouTube using the [query] as a link or search query. If any atachments are added, the bot will attempt to play them as audio, otherwise if no query is provided, attempts resume." },
            { name: "playmusic|playm|pm [query]", value: "Plays a song from YouTube using the [query] as a search query. Should only find official music in search results (not videos)." },
            { name: "playalbum|playa|pa [query]", value: "Queues every song in a album from YouTube based off of the search query." },
            { name: "pause", value: "Pauses the currently playing track." },
            { name: "resume", value: "Resumes the currently playing track." },
            { name: "skip", value: "Skips the currently playing track." },
            { name: "stop", value: "Stops the currently playing track and clears the queue." },
            { name: "nowplaying|np", value: "Displays the currently playing track." },
            { name: "queue|q", value: "Displays the queue." },
            { name: "connect|join *[voice_channel]", value: "Makes the bot join a voice channel, either [voice_channel] or your current voice channel." },
            { name: "disconnect|leave", value: "Makes the bot leave it's current voice channel." },
            { name: "remove|rm [index]", value: "Removes track [index] from the queue." },
            { name: "move|mv [source_index] [destination index]", value: "Moves the track at [source_index] to [destination_index]" },
            { name: "clear", value: "Clears the queue." },
            { name: "shuffle", value: "Shuffles the queue." },
            { name: "loop", value: "Loops the currently playing track." },
            { name: "info|i [index]", value: "Displays info about a queued track at [index] in the queue." },
            { name: "evaluate|eval [expression]", value: "Evaluates a mathematical expression." },
            { name: "volume [percentage]", value: "Sets the volume to the specified percentage." },
            { name: "help|h", value: "Displays this message." }).toJSON()]
    });
}

// Events

CLIENT.once(Events.ClientReady, async (client) => {
    timelog(`Logged in as ${client.user.tag}`);
    // Update voice connections
    for (const guild of client.guilds.cache.values()) {
        const channel = (await guild.members.fetchMe()).voice.channel;
        if (channel !== null) {
            createVoiceConnection(channel);
        }
    }
    initYTTracking();
});

CLIENT.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isMessageComponent()) {
        const [type, arg] = interaction.customId.split(":", 2);
        switch (type) {
            case "QUEUE_PAGE": // Page update interaction for queue
                await interaction.update(getQueuePage(Player.get(interaction.guild.id), Number(arg)));
                break;
        }
    } else if (interaction.isChatInputCommand()) {
        const ctx = new SlashCommandContext(interaction);
        const options = interaction.options;
        try {
            // Ids are obviously unique to the version of the bot I use
            switch (interaction.commandId) {
                case "1310548215606542357": // join
                    await connect_c(ctx, options.getChannel("channel", false, [ChannelType.GuildVoice]));
                    break;
                case "1310548217078747166": // leave
                    await disconnect_c(ctx);
                    break;
                case "1310147625114275930": // play
                    await play_c(ctx, options.getString("query", true));
                    break;
                case "1310538948191457311": // play-file
                    await play_c(ctx, null, options.getAttachment("file", true))
                    break;
                case "1310150411092623450": // play-music
                    await playMusic_c(ctx, options.getString("query", true));
                    break;
                case "1310547396488466514": // pause
                    await pause_c(ctx);
                    break;
                case "1310547398581420095": // resume
                    await resume_c(ctx);
                    break;
                case "1310547401098006569": // stop
                    await stop_c(ctx);
                    break;
                case "1310547400120729651": // skip
                    await skip_c(ctx);
                    break;
                case "1310548304681238528": // loop
                    await loop_c(ctx);
                    break;
                case "1310547402536517652": // now-playing
                    await nowPlaying_c(ctx);
                    break;
                case "1310547482328961045": // queue
                    await queue_c(ctx);
                    break;
                case "1310548305910169610": // info
                    await info_c(ctx, options.getInteger("index", true));
                    break;
                case "1310548218555138098": // move
                    await move_c(ctx, options.getInteger("source", true), options.getInteger("destination", true));
                    break;
                case "1310548219817885706": // remove
                    await remove_c(ctx, options.getInteger("index", true));
                    break;
                case "1310548302835748934": // shuffle
                    await shuffle_c(ctx);
                    break;
                case "1310548221520515112": // clear
                    await clear_c(ctx);
                    break;
                case "1310548315271729173": // volume
                    await volume_c(ctx, options.getNumber("percentage", true));
                    break;
                case "1311586863437316096": // reaction-roles
                    switch (options.getSubcommand()) {
                        case "create": // reaction-roles create
                            await createReactionRole_c(ctx, options.getString("message-id", true), options.getString("emoji", true), options.getRole("role", true));
                            break;
                        case "remove": // reaction-roles remove
                            await removeReactionRole_c(ctx, options.getString("message-id", true), options.getString("emoji"));
                            break;
                    }
                    break;
                default:
                    console.error("Unrecognized Command:", interaction);
            }
        } catch (e) {
            console.error(`[${new Date(Date.now()).toLocaleString()}] Uncaught Error on "${interaction.commandName}":`);
            console.error(e);
        }
    }
});

CLIENT.on(Events.MessageCreate, async (message) => {
    if (message.channel.isDMBased()) {
        const channel = await CLIENT.channels.fetch("1008484508200357929");
        if (channel !== null && channel.isSendable()) {
            await channel.send(`<@${process.env.OWNER}>\nFrom DM of <@${message.channel.recipientId}>:`);
            await channel.send({
                content: message.content,
                embeds: message.embeds.map(value => value.toJSON()),
                files: message.attachments.map(value => value),
                components: message.components.map(value => value.toJSON()),
                poll: message.poll || undefined,
                tts: false,
                nonce: undefined,
                enforceNonce: false,
                reply: undefined,
                stickers: message.stickers.map((value) => value),
                flags: message.flags.remove(MessageFlags.Crossposted, MessageFlags.IsCrosspost, MessageFlags.SourceMessageDeleted, MessageFlags.Urgent, MessageFlags.HasThread, MessageFlags.Ephemeral, MessageFlags.Loading, MessageFlags.FailedToMentionSomeRolesInThread, MessageFlags.ShouldShowLinkNotDiscordWarning, MessageFlags.IsVoiceMessage)
            }).catch(console.error);
        }
    } else if (message.content.startsWith(PREFIX) && message.author.id !== CLIENT.user.id) {
        const ctx = new MessageCommandContext(message, PREFIX);
        const {name, args} = ctx;
        try {
            // Handle command
            switch (name) {
                case "join":
                case "connect":
                    // Connect the bot
                    let channel;
                    if (args.length > 0) {
                        channel = args[0];
                        if (/^<#[0-9]+>$/.test(channel))
                            channel = channel.substring(2, channel.length - 1);
                        channel = await CLIENT.channels.fetch(channel).catch(() => null);
                    }
                    await connect_c(ctx, channel);
                    break;
                case "leave":
                case "disconnect":
                case "kys":
                case "fuckoff":
                case "die":
                    // Disconnect the bot
                    await disconnect_c(ctx);
                    break;
                case "play":
                    // Play something
                    await play_c(ctx, ctx.content, message.attachments.at(0));
                    break;
                case "playmusic":
                case "playm":
                case "pm":
                    // Play music from a query
                    if (args.length < 1)
                        await ctx.reply("You must provide a query.");
                    else
                        await playMusic_c(ctx, ctx.content);
                    break;
                case "playalbum":
                case "playa":
                case "pa":
                    // Play album from a query
                    if (args.length < 1)
                        await ctx.reply("You must provide a query.");
                    else
                        await playAlbum_c(ctx, ctx.content);
                    break;
                case "pause":
                    // Pause the player
                    await pause_c(ctx);
                    break;
                case "unpause":
                case "resume":
                    // Resume the player
                    await resume_c(ctx);
                    break;
                case "stop":
                    // Stop the player
                    await stop_c(ctx);
                    break;
                case "skip":
                    // Skip the current track
                    await skip_c(ctx);
                    break;
                case "nowplaying":
                case "np":
                    // Display the currently playing track
                    await nowPlaying_c(ctx);
                    break;
                case "queue":
                case "q":
                    // Display the queue
                    await queue_c(ctx);
                    break;
                case "remove":
                case "rm":
                    // Remove a track from the queue
                    if (args.length < 1)
                        await ctx.reply("You must provide an index.");
                    else if (!/^[0-9]+$/.test(args[0]))
                        await ctx.reply("Index must be a integer.");
                    else
                        await remove_c(ctx, Number(args[0]));
                    break;
                case "move":
                case "mv":
                    // Move a track in the queue
                    if (args.length < 1)
                        await ctx.reply("You must provide source and destination indices.");
                    else if (args.length < 2)
                        await ctx.reply("You must provide a destination index");
                    else if (!/^[0-9]+$/.test(args[0]) || !/^[0-9]+$/.test(args[1]))
                        await ctx.reply("Both indices must be integers.");
                    else
                        await move_c(ctx, Number(args[0]), Number(args[1]))
                    break;
                case "clear":
                    // Clear the queue
                    await clear_c(ctx);
                    break;
                case "shuffle":
                    // Shuffle the queue
                    await shuffle_c(ctx);
                    break;
                case "loop":
                    // Loop the player
                    await loop_c(ctx);
                    break;
                case "info":
                case "i":
                    // Display info for a specific track
                    if (args.length < 1)
                        await ctx.reply("You must provide an index.");
                    else if (!/^[0-9]+$/.test(args[0]))
                        await ctx.reply("Index must be an integer.");
                    else
                        await info_c(ctx, Number(args[0]));
                    break;
                case "volume":
                    // Change the volume
                    if (args.length < 1)
                        await ctx.reply("You must provide a percentage.");
                    else if (!/^[0-9]+(\.[0-9]+)?$/.test(args[0]))
                        await ctx.reply("percentage must be a number.");
                    else
                        await volume_c(ctx, Number(args[0]));
                    break;
                case "viewcount":
                    // Create a YouTube view count tracker
                    if (args.length < 1)
                        await ctx.reply("You must provide a youtube video URL.");
                    else
                        await viewCount_c(ctx, args[0]);
                    break;
                case "subcount":
                    // Create a YouTube subscriber count tracker
                    if (message.author.id === process.env.OWNER) {
                        if (args.length < 1)
                            await ctx.reply("You must provide a youtube channel id.");
                        else
                            await subCount_c(ctx, args[0]);
                    } else {
                        await ctx.reply("Unrecognized command.\nUse `.help` for a list of commands.");
                    }
                    break;
                case "evaluate":
                case "eval":
                    // Evaluate a mathematical expression
                    await evaluate_c(ctx, args.join(""));
                    break;
                case "help":
                case "h":
                    // Display the help message
                    await help_c(ctx);
                    break;
                case "toggledownload":
                case "td":
                    // Toggle between downloading and streaming for YouTube videos (Owner Only)
                    if (ctx.member.id === process.env.OWNER) {
                        const player = Player.get(ctx.guild.id);
                        player.stream = !player.stream;
                        ctx.reply(`Downloads toggled ${!player.stream ? "on" : "off"}.`);
                        break;
                    }
                case "execute":
                case "exec":
                    // Execute code (Owner Only)
                    if (ctx.member.id === process.env.OWNER) {
                        try {
                            let res = "Code Executed.";
                            eval(args.join(" "));
                            await ctx.reply(res);
                        } catch (e) {
                            await ctx.reply(e.toString());
                        }
                        break;
                    }
                default:
                    // Unrecognized command
                    await ctx.reply("Unrecognized command.\nUse `.help` for a list of commands.");
            }
        } catch (e) {
            // An error occurred
            console.error(`[${new Date(Date.now()).toLocaleString()}] Uncaught Error on "${name}":`);
            console.error(e);
            try {
                // Attempt to send a message to notify about the error
                await message.channel.send("An error occurred whist processing your command.");
            } catch (e) {
                // An error occurred whilst trying to respond
                console.error(`[${new Date(Date.now()).toLocaleString()}] Failed to send response message:`);
                console.error(e);
            }
        }
    }
});

// YT Tracking

const YT_TRACKER_TYPE = Object.freeze({ VIDEO: 0, CHANNEL: 1 });
/**
 * @type {{[guildId: string]:{[id: string]:{type:0|1;categoryId:string;channelId:string}}}}
 */
const YT_TRACKERS = JSON.parse(String(fs.readFileSync("./yt_trackers.json")));

/**
 * @param {MessageCommandContext|SlashCommandContext} ctx 
 * @param {string} url 
 * @returns 
 */
async function viewCount_c(ctx, url) {
    url = parseURL(url);
    if (url !== null) {
        // Attempt to extract the video ID
        const id = extractVideoID(url);
        if (id === null)
            // Non YouTube URL
            return await ctx.reply("That URL does not correspond to a YouTube video.");
        if (ctx.guild.id in YT_TRACKERS && id in YT_TRACKERS[ctx.guild.id])
            return await ctx.reply("That video is already being tracked.");
        if (await addVideoTracker(id, ctx.guild.id))
            return await ctx.reply(`Added view count tracking for <${videoURL(id)}>.`);
        else
            return await ctx.reply("There was error getting view count statistics for that video.");
    } else {
        return await ctx.reply("That is not a valid URL.");
    }
}

/**
 * 
 * @param {MessageCommandContext|SlashCommandContext} ctx 
 * @param {string} id 
 * @returns 
 */
async function subCount_c(ctx, id) {
    if (ctx.guild.id in YT_TRACKERS && id in YT_TRACKERS[ctx.guild.id])
        return await ctx.reply("That channel is already being tracked.");
    if (await addChannelTracker(id, ctx.guild.id))
        return await ctx.reply(`Added subscriber count tracking.`);
    else
        return await ctx.reply("There was error getting subscriber count statistics for that channel.");
}

function formatNumber(n) {
    const str = String(n);
    const decIndex = str.indexOf('.');
    const isDec = decIndex != -1;
    let dec = '';
    if (isDec)
        dec = str.substring(decIndex);
    let result = '';
    for (let i = isDec ? decIndex : str.length; i > 0; i -= 3)
        result = ',' + str.substring(i - 3, i) + result;
    return result.substring(1) + dec;
}

function formatViewCount(n) {
    if (n > 1000000000)
        return Math.floor(n / 100000000) / 10 + "B";
    if (n > 1000000)
        return Math.floor(n / 100000) / 10 + "M";
    else return formatNumber(n);
}

async function addVideoTracker(id, guildId) {
    try {
        const video = await getVideo(id).catch(() => null);
        if (!video || !video.title || !video.viewCount)
            return false;
        const guild = await CLIENT.guilds.fetch(guildId);
        const category = await guild.channels.create({ name: video.title, type: ChannelType.GuildCategory });
        const voiceChannel = await guild.channels.create({ name: formatViewCount(video.viewCount) + " views", type: ChannelType.GuildVoice, parent: category, permissionOverwrites: [{ allow: PermissionFlagsBits.ViewChannel, deny: PermissionFlagsBits.Connect, id: guild.roles.everyone }] });
        if (!(guildId in YT_TRACKERS))
            YT_TRACKERS[guildId] = {};
        YT_TRACKERS[guildId][id] = { type: YT_TRACKER_TYPE.VIDEO, categoryId: category.id, channelId: voiceChannel.id };
        fs.writeFileSync("./yt_trackers.json", JSON.stringify(YT_TRACKERS));
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

async function addChannelTracker(id, guildId) {
    try {
        const channel = await getChannel(id).catch(() => null);
        if (!channel || !channel.title || !channel.subscriberCount)
            return false;
        const guild = await CLIENT.guilds.fetch(guildId);
        const category = await guild.channels.create({ name: channel.title, type: ChannelType.GuildCategory });
        const voiceChannel = await guild.channels.create({ name: channel.subscriberCount, type: ChannelType.GuildVoice, parent: category, permissionOverwrites: [{ allow: PermissionFlagsBits.ViewChannel, deny: PermissionFlagsBits.Connect, id: guild.roles.everyone }] });
        if (!(guildId in YT_TRACKERS))
            YT_TRACKERS[guildId] = {};
        YT_TRACKERS[guildId][id] = { type: YT_TRACKER_TYPE.CHANNEL, categoryId: category.id, channelId: voiceChannel.id };
        fs.writeFileSync("./yt_trackers.json", JSON.stringify(YT_TRACKERS));
        return true;
    } catch (e) {
        return false;
    }
}

async function updateYTCounts() {
    const promises = [];
    let save = false;
    for (const guildId in YT_TRACKERS) {
        for (const id in YT_TRACKERS[guildId]) {
            const tracker = YT_TRACKERS[guildId][id];
            promises.push(new Promise(async resolve => {
                const category = await CLIENT.channels.fetch(tracker.categoryId).catch(() => null);
                const voiceChannel = await CLIENT.channels.fetch(tracker.channelId).catch(() => null);
                if (category === null || voiceChannel === null) {
                    delete YT_TRACKERS[guildId][id];
                    if (Object.keys(YT_TRACKERS[guildId]).length === 0) delete YT_TRACKERS[guildId];
                    save = true;
                    resolve();
                    return;
                }
                switch (tracker.type) {
                    case YT_TRACKER_TYPE.VIDEO:
                        const video = await getVideo(id).catch(() => null);
                        if (!video) break;
                        if (video.title) {
                            const catName = video.title.length <= 100 ? video.title : video.title.substring(0, 100);
                            if (category.name != catName)
                                category.edit({ name: catName, reason: "video title update" });
                        }
                        if (video.viewCount) {
                            const viewCountText = formatViewCount(video.viewCount) + " views";
                            if (voiceChannel.name != viewCountText)
                                voiceChannel.edit({ name: viewCountText, reason: "view count update" });
                        }
                        break;
                    case YT_TRACKER_TYPE.CHANNEL:
                        const channel = await getChannel(id).catch(() => null);
                        if (!channel) break;
                        if (channel.title) {
                            const catName = channel.title.length <= 100 ? channel.title : channel.title.substring(0, 100);
                            if (category.name != catName)
                                category.edit({ name: catName, reason: "channel title update" });
                        }
                        if (channel.subscriberCount) {
                            const subscriberCountText = channel.subscriberCount;
                            if (voiceChannel.name != subscriberCountText)
                                voiceChannel.edit({ name: subscriberCountText, reason: "subscriber count update" });
                        }
                        break;
                }
                resolve();
            }).catch(e => {
                console.error(e);
            }));
        }
    }
    await Promise.all(promises);
    if (save)
        fs.writeFileSync("./yt_trackers.json", JSON.stringify(YT_TRACKERS));
}

function initYTTracking() {
    return setInterval(updateYTCounts, 60000);
}

CLIENT.login(process.env.TOKEN);