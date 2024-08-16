import { joinVoiceChannel } from "@discordjs/voice";
import ytdl from "@distube/ytdl-core";
import { Attachment, ChannelType, Client, EmbedBuilder, Events, MessageFlags, Partials, PermissionFlagsBits, VoiceChannel } from "discord.js";
import fs from "fs";
import { InteractionCommandContext, MessageCommandContext } from "./context.js";
import { SearchResultType, getChannel, getPlaylist, getVideo, listSearchResults } from "./innertube/index.js";
import { now } from "./innertube/utils.js";
import { evaluate } from "./math.js";
import { Track, getPlayer } from "./player.js";
import { formatDuration, formatDurationMillis } from "./utils.js";

Object.assign(process.env, JSON.parse(fs.readFileSync("./env.json")));

// Global Variables
const PREFIX = ".";

const CLIENT = new Client({
    intents: [((1 << 17) - 1) | (1 << 20) | (1 << 21)],
    partials: [Partials.Channel]
});

const YT_HEADERS = "COOKIE" in process.env && "ID" in process.env ? {
    "Cookie": process.env.COOKIE,
    "X-Youtube-Identity-Token": process.env.ID
} : undefined;

const shouldDownload = true;

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

function timelog(msg) {
    console.log(`[${now()}]`, msg);
}

/**
 * @param {import("discord.js").VoiceBasedChannel} channel 
 */
function createVoiceConnection(channel) {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false
    });
    connection.on("error", () => {
        timelog("A voice connection error occurred.\nAttempting to rejoin...");
        connection.rejoinAttempts = 0;
        while (connection.rejoinAttempts < 5) {
            if (connection.rejoin()) {
                timelog("Rejoin was successful.");
                return;
            }
        }
        timelog("Rejoin failed after 5 attempts with the following error:");
        connection.destroy();
        console.error(e);
    });
    return connection;
}

// Commands

// Utility

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 * @param {string} id 
 * @param {boolean | undefined} forceInverse
 */
async function playPlaylist_c(ctx, id, forceInverse) {
    // Get the playlist by id
    const playlist = await getPlaylist(id);
    if (playlist === null)
        return await ctx.reply("That is not a valid YouTube playlist link.");
    const player = getPlayer(ctx.guild.id)
    let totalAdded = 0;
    for (const listItem of await playlist.listItems()) {
        if (!player.isReady) {
            player.stop();
            return await ctx.reply("A voice connection error occurred whilst adding the playlist.");
        }
        if (listItem.playable) {
            try {
                await player.enqueue(Track.fromPlaylistItem(listItem, forceInverse ? !shouldDownload : shouldDownload));
            } catch {
                continue;
            }
            totalAdded++;
        }
    }
    return await ctx.reply({
        content: "**Added " + totalAdded + " tracks to the queue:**",
        embeds: [new EmbedBuilder()
            .setTitle(playlist.title)
            .setURL("https://www.youtube.com/playlist?list=" + id)
            .setThumbnail(playlist.thumbnails.maxres ? playlist.thumbnails.maxres.url : playlist.thumbnails.high.url)
            .setAuthor({ name: playlist.channelTitle, url: playlist.channelId ? "https://www.youtube.com/channel/" + playlist.channelId : undefined }).data]
    });
}

// Voice

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 * @param {VoiceChannel | undefined} channel
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
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
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
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 * @param {string | undefined} query 
 * @param {Attachment | undefined} attachment
 * @param {boolean | undefined} forceInverse
 */
async function play_c(ctx, query, attachment, forceInverse) {
    // handle voice channel
    const channel = ctx.member.voice.channel;
    if (!channel)
        return await ctx.reply("You are not in a voice channel.");
    if ((await ctx.guild.members.fetchMe()).voice.channelId !== channel.id)
        createVoiceConnection(channel);

    const player = getPlayer(ctx.guild.id);
    let track = null;
    if (ctx.isInteraction())
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
                    return await playPlaylist_c(ctx, listId);
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
            // Get the video info
            let info;
            try {
                info = await ytdl.getInfo(id, { requestOptions: { headers: YT_HEADERS } });
            } catch (e) {
                return await ctx.reply("An error occurred whilst trying to retrieve the requested video.\n\n" + e.message);
            }
            track = Track.fromVideoInfo(info, forceInverse ? !shouldDownload : shouldDownload);
        }
    } else {
        // resume
        return await resume_c(ctx);
    }
    return await ctx.reply({ content: await player.enqueue(track) ? "**Now Playing:**" : "**Added to the Queue:**", embeds: [track.toEmbed()] });
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 */
async function skip_c(ctx) {
    const member = ctx.member;
    const player = getPlayer(member.guild.id);
    if (!player.isPlaying)
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
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 */
async function stop_c(ctx) {
    const member = ctx.member;
    const player = getPlayer(member.guild.id);
    if (!player.isPlaying)
        return await ctx.reply("Nothing is playing.");
    if (member.voice.channel === null)
        return await ctx.reply("You are not in a voice channel.");
    if ((await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        return await ctx.reply("You must be in the same voice channel as the bot to use the command.");
    player.stop();
    return await ctx.reply("Playback stopped.");
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 */
async function pause_c(ctx) {
    const member = ctx.member;
    const player = getPlayer(member.guild.id);
    if (!player.isPlaying)
        return await ctx.reply("Nothing is playing.");
    if (member.voice.channel === null)
        return await ctx.reply("You are not in a voice channel.");
    if ((await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        return await ctx.reply("You must be in the same voice channel as the bot to use the command.");
    if (player.isPaused)
        return await resume_c(ctx);
    player.pause();
    return await ctx.reply("Playback paused.")
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 */
async function resume_c(ctx) {
    const member = ctx.member;
    const player = getPlayer(member.guild.id);
    if (!player.isPlaying)
        return await ctx.reply("Nothing is playing.")
    if (member.voice.channel === null)
        return await ctx.reply("You are not in a voice channel.");
    if ((await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        return await ctx.reply("You must be in the same voice channel as the bot to use the command.")
    if (!player.isPaused)
        return await ctx.reply("Playback is not paused.");
    player.unpause();
    return await ctx.reply("Playback resumed.")
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 * @param {number} percentage
 */
async function volume_c(ctx, percentage) {
    const player = getPlayer(ctx.guild.id);
    player.volume = percentage / 100;
    return await ctx.reply(`Volume set to ${percentage}%.`);
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 */
async function loop_c(ctx) {
    const player = getPlayer(ctx.guild.id);
    player.loop = !player.loop;
    return await ctx.reply("Loop " + (player.loop ? "enabled." : "disabled."));
}

// Queue

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 */
async function nowPlaying_c(ctx) {
    const player = getPlayer(ctx.guild.id);
    return player.isPlaying ? await ctx.reply({ content: "**Now playing:**", embeds: [player.nowPlaying.toEmbed()] }) : await ctx.reply("Nothing is playing.");
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 */
async function queue_c(ctx) {
    const player = getPlayer(ctx.guild.id);
    if (player.queue.length === 0)
        return await nowPlaying_c(ctx);
    let total = player.nowPlaying.duration / 1000;
    for (let i = 0; i < player.queue.length; i++)
        total += player.queue[i].duration / 1000;
    const eb = new EmbedBuilder()
        .setAuthor({ name: "Now Playing:" })
        .setTitle(player.nowPlaying.title)
        .setURL(player.nowPlaying.url)
        .setDescription(formatDurationMillis(player.nowPlaying.resource.playbackDuration) + "/" + formatDurationMillis(player.nowPlaying.duration))
        .setFooter({ text: `${player.queue.length + 1} items (${formatDuration(Math.floor(total))})` });
    for (let i = 0; i < player.queue.length && i < 25; i++)
        eb.addFields({ name: i + 1 + ": " + player.queue[i].title, value: formatDurationMillis(player.queue[i].duration) });
    let response = { embeds: [eb.toJSON()] }
    if (player.queue.length > 25)
        response.components = [{ type: 1, components: [{ type: 2, emoji: { id: null, name: "➡️", animated: false }, style: 2, custom_id: (ctx.isInteraction() ? ctx.interaction.id : ctx.message.id) + ".2" }] }];
    return await ctx.reply(response);
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 * @param {number} index
 */
async function remove_c(ctx, index) {
    const player = getPlayer(ctx.guild.id);
    if (!player.isPlaying)
        return await ctx.reply("Nothing is playing.");
    if (player.queue.length === 0)
        return await ctx.reply("The queue is empty.");
    if (index < 1 | index > player.queue.length)
        return await ctx.reply(`${index} is not a valid index in the queue.`);
    const track = player.queue.splice(index - 1, 1)[0];
    if (index === 1 && player.queue.length > 0 && player.queue[0].resource === null)
        player.queue[0].resource = player.queue[0].getResource();
    return await ctx.reply({ content: "**Removed:**", embeds: [track.toEmbed()] });
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 * @param {number} source
 * @param {number} destination
 */
async function move_c(ctx, source, destination) {
    const player = getPlayer(ctx.guild.id);
    if (!player.isPlaying)
        return await ctx.reply("Nothing is playing.");
    if (player.queue.length == 0)
        return await ctx.reply("The queue is empty.");
    if (source < 1 | source > player.queue.length)
        return await ctx.reply(`${source} is not a valid index in the queue.`);
    if (destination < 1 | destination > player.queue.length)
        return await ctx.reply(`${destination} is not a valid index in the queue.`);
    if (source === destination)
        return await ctx.reply("Indices must not be equal.");
    const track = player.queue.splice(source - 1, 1)[0];
    player.queue.splice(destination - 1, 0, track);
    if (destination === 1 && player.queue[0].resource === null)
        player.queue[0].resource = player.queue[0].getResource();
    return await ctx.reply(`Moved \`${track.title}\` to index ${destination} in the queue.`);
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 */
async function shuffle_c(ctx) {
    const player = getPlayer(ctx.guild.id);
    if (!player.isPlaying)
        return await ctx.reply("Nothing is playing.");
    if (player.queue.length == 0)
        return await ctx.reply("The queue is empty.");
    let currentIndex = player.queue.length, randomIndex;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [player.queue[currentIndex], player.queue[randomIndex]] = [
            player.queue[randomIndex], player.queue[currentIndex]];
    }
    if (player.queue[0].resource === null)
        player.queue[0].resource = player.queue[0].getResource();
    return await ctx.reply("Queue shuffled.");
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 * @param {number} index
 */
async function info_c(ctx, index) {
    const player = getPlayer(ctx.guild.id);
    if (!player.isPlaying)
        return await ctx.reply("Nothing is playing.");
    if (player.queue.length == 0)
        return await ctx.reply("The queue is empty.");
    if (index < 1 || index > player.queue.length)
        return await ctx.reply(`${index} is not a valid index in the queue.`);
    return await ctx.reply({ embeds: [player.queue[index - 1].toEmbed()] });
}

// Misc

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
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
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 */
async function help_c(ctx) {
    ctx.reply({
        embeds: [new EmbedBuilder().addFields(
            { name: "play *[query]", value: "Plays something from YouTube using the [query] as a link or search query. If any atachments are added, the bot will attempt to play them as audio, otherwise if no query is provided, attempts resume." },
            { name: "pause", value: "Resumes the currently playing track." },
            { name: "resume", value: "Pauses the currently playing track." },
            { name: "skip", value: "Skips the currently playing track." },
            { name: "stop", value: "Stops the currently playing track and clears the queue." },
            { name: "nowPlaying|np", value: "Displays the currently playing track." },
            { name: "queue|q", value: "Displays the queue." },
            { name: "connect|join *[voice_channel]", value: "Makes the bot join a voice channel, either [voice_channel] or your current voice channel." },
            { name: "disconnect|leave", value: "Makes the bot leave it's current voice channel." },
            { name: "remove [index]", value: "Remove track [index] from the queue." },
            { name: "move [source_index] [destination index]", value: "Move the track at [source_index] to [destination_index]" },
            { name: "shuffle", value: "Shuffles the queue." },
            { name: "loop", value: "Loops the currently playing track." },
            { name: "info|i [index]", value: "Display info about a queued track at [index] in the queue." },
            { name: "evaluate|eval [expression]", value: "Evaluate a mathematical expression." },
            { name: "volume [percentage]", value: "Set the volume to the specified percentage." },
            { name: "help", value: "Display this message." }).data]
    });
}

// Events

CLIENT.once(Events.ClientReady, async (client) => {
    // Ready
    timelog(`Logged in as ${client.user.tag}`);
    // Update voice connections
    for (const guild of CLIENT.guilds.cache.values()) {
        const channel = (await guild.members.fetch(CLIENT.user.id)).voice.channel;
        if (channel !== null) {
            createVoiceConnection(channel);
        }
    }
});

CLIENT.on(Events.InteractionCreate, (interaction) => {
    if (interaction.isButton()) {
        // Page update interaction for queue
        let page = Number(interaction.customId.split(".")[1]);
        const player = getPlayer(interaction.guild.id);
        // Decrease page number until it is valid
        while (player.queue.length <= (page - 1) * 25) {
            page--;
        }
        if (player.queue.length == 0) {
            // The queue is empty
            const response = player.isPlaying ? { content: "**Now playing:**", embeds: [player.nowPlaying.toEmbed()], components: [] } : { content: "Nothing is playing.", embeds: [], components: [] };
            interaction.update(response);
            return;
        }
        var total = player.nowPlaying.duration / 1000;
        for (var i = 0; i < player.queue.length; i++)
            total += player.queue[i].duration / 1000;
        var eb = new EmbedBuilder()
            .setFooter({ text: `${player.queue.length + 1} items (${formatDuration(Math.floor(total / 1000))})` });
        if (page == 1) {
            // Include now playing if on first page
            eb.setAuthor({ name: "Now Playing:" })
                .setTitle(player.nowPlaying.title)
                .setURL(player.nowPlaying.url)
                .setDescription(formatDurationMillis(player.nowPlaying.resource.playbackDuration) + "/" + formatDurationMillis(player.nowPlaying.duration))
        }
        // Append up to 25 tracks to the queue message
        for (var i = (page - 1) * 25; i < player.queue.length && i < page * 25; i++) {
            eb.addFields({ name: i + 1 + ": " + player.queue[i].title, value: formatDurationMillis(player.queue[i].duration) });
        }
        var response = { embeds: [eb.data], components: [{ type: 1, components: [] }] }
        if (page > 1) {
            // Add a last page button
            response.components[0].components.push({ type: 2, emoji: { id: null, name: "⬅️", animated: false }, style: 2, custom_id: interaction.customId.split(".")[0] + "." + (page - 1) });
        }
        if (player.queue.length > 25 * page) {
            // Add a next page button
            response.components[0].components.push({ type: 2, emoji: { id: null, name: "➡️", animated: false }, style: 2, custom_id: interaction.customId.split(".")[0] + "." + (page + 1) })
        }
        if (response.components[0].components.length == 0) {
            // No components
            response.components = [];
        }
        interaction.update(response);
    }
});

CLIENT.on(Events.MessageCreate, async (message) => {
    if (message.channel.isDMBased()) {
        const channel = await CLIENT.channels.fetch("1008484508200357929");
        if (channel !== null && channel.isTextBased()) {
            await channel.send(`From DM of <@${message.author.id}>:`);
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
            });
        }
    } else if (message.content.startsWith(PREFIX)) {
        // Parse command name and arguments
        const args = message.content.split(" ");
        const cmd = args.shift().substring(PREFIX.length);
        try {
            const ctx = new MessageCommandContext(message);
            // Handle Command
            switch (cmd) {
                case "join":
                case "connect":
                    // Connect
                    let channel;
                    if (args.length > 0) {
                        channel = args[0];
                        if (/<#[0-9]+>/.test(channel))
                            channel = channel.substring(2, channel.length - 1);
                        channel = await CLIENT.channels.fetch(channel).catch(() => null);
                        channel = channel || undefined;
                    }
                    await connect_c(ctx, channel);
                    break;
                case "leave":
                case "disconnect":
                case "kys":
                case "fuckoff":
                case "die":
                    // Disconnect
                    await disconnect_c(ctx);
                    break;
                case "play":
                    await play_c(ctx, message.content.substring(cmd.length + 1).trim(), message.attachments.at(0));
                    break;
                case "pause":
                    // Pause
                    await pause_c(ctx);
                    break;
                case "unpause":
                case "resume":
                    // Resume
                    await resume_c(ctx);
                    break;
                case "stop":
                    // Stop
                    await stop_c(ctx);
                    break;
                case "skip":
                    // Skip
                    await skip_c(ctx);
                    break;
                case "now-playing":
                case "np":
                    // Now Playing
                    await nowPlaying_c(ctx);
                    break;
                case "queue":
                case "q":
                    // Queue
                    await queue_c(ctx);
                    break;
                case "remove":
                    // Remove
                    if (args.length < 1)
                        await ctx.reply("You must provide an index.");
                    else if (!/^[0-9]+$/.test(args[0]))
                        await ctx.reply("Index must be a integer.");
                    else
                        await remove_c(ctx, Number(args[0]));
                    break;
                case "move":
                    // Move
                    if (args.length < 1)
                        await ctx.reply("You must provide source and destination indexes.");
                    else if (args.length < 2)
                        await ctx.reply("You must provide a destination index");
                    else if (!/^[0-9]+$/.test(args[0]) || !/^[0-9]+$/.test(args[1]))
                        await ctx.reply("Both indexes must be integers.");
                    else
                        await move_c(ctx, Number(args[0]), Number(args[1]))
                    break;
                case "shuffle":
                    await shuffle_c(ctx);
                    break;
                case "loop":
                    // Loop
                    await loop_c(ctx);
                    break;
                case "info":
                case "i":
                    // Info
                    if (args.length < 1)
                        await ctx.reply("You must provide an index.");
                    else if (!/^[0-9]+$/.test(args[0]))
                        await ctx.reply("Index must be an integer.");
                    else
                        await ctx.reply(info_c(ctx, Number(args[0])));
                    break;
                case "volume":
                    if (args.length < 1)
                        await ctx.reply("You must provide a percentage.");
                    else if (!/^[0-9]+(\.[0-9]+)?$/.test(args[0]))
                        await ctx.reply("percentage must be a number.");
                    else
                        await volume_c(ctx, Number(args[0]));
                    break;
                case "evaluate":
                case "eval":
                    // Evaluate
                    await evaluate_c(ctx, args.join(""));
                    break;
                case "help":
                    await help_c(ctx);
                    break;
                case "exec":
                    if (message.author.id === process.env.OWNER) {
                        try {
                            let res = "Code Executed.";
                            eval(args.join(" "));
                            await ctx.reply(res);
                        } catch (e) {
                            await ctx.reply("Error:\n" + e.message);
                        }
                        break;
                    }
                default:
                    await ctx.reply("Unrecognized command.\nUse `.help` for a list of commands.");
            }
        } catch (e) {
            console.error(`[${now()}] Uncaught Error on "${cmd}":`);
            console.error(e);
            try {
                await message.channel.send("An error occurred whist processing your command.");
            } catch (e) {
                console.error(`[${now()}] Failed to send response message:\n`);
                console.error(e);
            }
        }
    }
});

CLIENT.login(process.env.TOKEN);