import { VoiceConnectionStatus, createAudioResource, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { Attachment, ChannelType, Client, EmbedBuilder, Events, Guild, GuildMember, Message, MessageFlags, Partials, PermissionsBitField, VoiceChannel } from "discord.js";
import { readFileSync } from "fs";
import internal from "stream";
import ytdl from "ytdl-core";
import { InteractionCommandContext, MessageCommandContext } from "./context.js";
import { SearchResultType, getPlaylist, listSearchResults } from "./innertube/index.js";
import { now } from "./innertube/utils.js";
import { evaluate } from "./math.js";
import { Player, Track, getPlayer } from "./player.js";
import { formatDuration, formatDurationMillis } from "./utils.js";

Object.assign(process.env, JSON.parse(readFileSync("./env.json")));

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
 */
async function playPlaylist_r(ctx, id) {
    // Get the playlist by id
    const playlist = await getPlaylist(id);
    if (playlist === null)
        return await ctx.reply("That is not a valid YouTube playlist link.");
    const player = getPlayer(ctx.member.guild.id)
    let totalAdded = 0;
    for (const listItem of await playlist.listItems()) {
        if (!player.isReady) {
            player.stop();
            return await ctx.reply("A voice connection error occurred whilst adding the playlist.");
        }
        if (listItem.playable) {
            try {
                await player.enqueue(Track.fromPlaylistItem(listItem, shouldDownload));
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
async function connect_r(ctx, channel) {
    channel = channel || ctx.member.voice.channel;
    if (!channel)
        return await ctx.reply("You are not in a voice channel.");
    if ((await ctx.member.guild.members.fetchMe()).voice.channelId === channel.id)
        return await ctx.reply("I am already in that channel");
    createVoiceConnection(channel);
    return await ctx.reply(`Connected to <#${channel.id}>.`);
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 */
async function disconnect_r(ctx) {
    const me = await ctx.member.guild.members.fetchMe();
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
 */
async function play_r(ctx, query, attachment) {
    const channel = ctx.member.voice.channel;
    if (!channel)
        return await ctx.reply("You are not in a voice channel.");
    if ((await ctx.member.guild.members.fetchMe()).voice.channelId !== channel.id)
        createVoiceConnection(channel);

    const player = getPlayer(ctx.member.guild.id);
    let track;
    if (ctx.isInteraction())
        await ctx.interaction.deferReply();
    if (attachment) {
        // Create a track from the attachment
        track = new Track(async () => createAudioResource(internal.Readable.fromWeb((await fetch(attachment.url)).body), { inlineVolume: true }), attachment.name, { url: attachment.url, duration: attachment.duration || undefined });
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
                    return await playPlaylist_r(ctx, listId);
                // Non youtube URL
                track = new Track(async () => createAudioResource(internal.Readable.fromWeb((await fetch(url)).body), { inlineVolume: true }), url.pathname.substring(url.pathname.lastIndexOf('/') !== -1 ? url.pathname.lastIndexOf('/') + 1 : "Unknown Title"), { url: url.toString() });
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
        if (!track) {
            // Get the video info
            let info;
            try {
                info = await ytdl.getInfo(id, { requestOptions: { headers: YT_HEADERS } });
            } catch (e) {
                return await ctx.reply("An error occurred whilst trying to retrieve the requested video.\n\n" + e.message);
            }
            track = Track.fromVideoInfo(info, shouldDownload);
        }
    } else {
        // resume
        return await resume_r(ctx);
    }
    return await ctx.reply({ content: await player.enqueue(track) ? "**Now Playing:**" : "**Added to the Queue:**", embeds: [track.toEmbed()] });
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 */
async function skip_r(ctx) {
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
async function stop_r(ctx) {
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
async function pause_r(ctx) {
    const member = ctx.member;
    const player = getPlayer(member.guild.id);
    if (!player.isPlaying)
        return await ctx.reply("Nothing is playing.");
    if (member.voice.channel === null)
        return await ctx.reply("You are not in a voice channel.");
    if ((await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        return await ctx.reply("You must be in the same voice channel as the bot to use the command.");
    if (player.isPaused)
        return await resume_r(ctx);
    player.pause();
    return await ctx.reply("Playback paused.")
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 */
async function resume_r(ctx) {
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
async function volume_r(ctx, percentage) {
    const player = getPlayer(ctx.member.guild.id);
    player.volume = percentage / 100;
    return await ctx.reply(`Volume set to ${percentage}%.`);
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 */
async function loop_r(ctx) {
    const player = getPlayer(ctx.member.guild.id);
    player.loop = !player.loop;
    return await ctx.reply("Loop " + (player.loop ? "enabled." : "disabled."));
}

// Queue

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 */
async function nowPlaying_r(ctx) {
    const player = getPlayer(ctx.member.guild.id);
    if (!player.isPlaying)
        return await ctx.reply("Nothing is playing.");
    return await ctx.reply({ content: "**Now playing:**", embeds: [player.nowPlaying.toEmbed()] });
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 */
async function queue_r(ctx) {
    const player = getPlayer(ctx.member.guild.id);
    if (player.queue.length === 0)
        return await nowPlaying_r(ctx);
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
async function remove_r(ctx, index) {
    const player = getPlayer(guild.id);
    if (!player.isPlaying)
        return await ctx.reply("Nothing is playing.");
    if (player.queue.length === 0)
        return await ctx.reply("The queue is empty.");
    if (index < 1 | index > player.queue.length)
        return await ctx.reply(`${index} is not a valid index in the queue.`);
    const track = player.queue.splice(index - 1, 1)[0];
    if (index === 1 && player.queue.length > 0 && player.queue[0].resource === null)
        player.queue[0].resource = await player.queue[0].getResource();
    return await ctx.reply({ content: "**Removed:**", embeds: [track.toEmbed()] });
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 * @param {number} source
 * @param {number} destination
 */
async function move_r(ctx, source, destination) {
    const player = getPlayer(ctx.member.guild.id);
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
        player.queue[0].resource = await player.queue[0].getResource();
    return await ctx.reply(`Moved \`${track.title}\` to index ${destination} in the queue.`);
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 */
async function shuffle_r(ctx) {
    const player = getPlayer(ctx.member.guild.id);
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
        player.queue[0].resource = await player.queue[0].getResource();
    return await ctx.reply("Queue shuffled.");
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 * @param {number} index
 */
async function info_r(ctx, index) {
    const player = getPlayer(ctx.member.guild.id);
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
async function evaluate_r(ctx, expression) {
    try {
        return await ctx.reply(String(evaluate(expression)));
    } catch (e) {
        return await ctx.reply(e.message);
    }
}

/**
 * @param {MessageCommandContext<true>|InteractionCommandContext} ctx 
 */
async function help_r(ctx) {
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
        var page = Number(interaction.customId.split(".")[1]);
        var player = getPlayer(interaction.guild.id);
        // Decrease page number until it is valid
        while (player.queue.length <= (page - 1) * 25) {
            page--;
        }
        if (player.queue.length == 0) {
            // The queue is empty
            var response = nowPlaying(interaction.guild)
            if (typeof response == "string") {
                // Clear embeds
                response = { content: response, embeds: [] };
            }
            // Clear components
            response.components = [];
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
        if (channel !== null && channel.isTextBased())
            channel.send(`From DM of <@${message.author.id}>:`);
        channel.send({
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
    } else if (message.content.startsWith(PREFIX)) {
        // Parse command name and arguments
        const args = message.content.split(" ");
        const cmd = args.shift().substring(PREFIX.length);
        try {
            const ctx = new MessageCommandContext(message);
            // Handle Command
            switch (cmd) {
                // case "cookie":
                //     if (message.author.id === "420741651804323843") {
                //         if (args.length < 1) {
                //             if ("cookie" in YT_HEADERS)
                //                 delete YT_HEADERS["cookie"];
                //             await ctx.reply("Cookie unset.";
                //         } else {
                //             YT_HEADERS["cookie"] = args[0];
                //             await ctx.reply("Cookie set.";
                //         }
                //     } else {
                //         await ctx.reply("You can't use this command."
                //     }
                //     break;
                // case "id":
                //     if (message.author.id === "420741651804323843") {
                //         if (args.length < 1) {
                //             if ("X-Youtube-Identity-Token" in YT_HEADERS)
                //                 delete YT_HEADERS["X-Youtube-Identity-Token"];
                //             await ctx.reply("ID unset.";
                //         } else {
                //             YT_HEADERS["X-Youtube-Identity-Token"] = args[0];
                //             await ctx.reply("ID set.";
                //         }
                //     } else {
                //         await ctx.reply("You can't use this command."
                //     }
                //     break;
                case "join":
                case "connect":
                    // Connect
                    await connect_r(ctx/*, args.length <= 1 ? args[0] : undefined*/);
                    break;
                case "leave":
                case "disconnect":
                    // Disconnect
                    await disconnect_r(ctx);
                    break;
                case "play":
                    await play_r(ctx, message.content.substring(cmd.length + 1).trim(), message.attachments.at(0));
                    break;
                case "pause":
                    // Pause
                    await pause_r(ctx);
                    break;
                case "unpause":
                case "resume":
                    // Resume
                    await resume_r(ctx);
                    break;
                case "stop":
                    // Stop
                    await stop_r(ctx);
                    break;
                case "skip":
                    // Skip
                    await skip_r(ctx);
                    break;
                case "now-playing":
                case "np":
                    // Now Playing
                    await nowPlaying_r(ctx);
                    break;
                case "queue":
                case "q":
                    // Queue
                    await queue_r(ctx);
                    break;
                case "remove":
                    // Remove
                    if (args.length < 1)
                        await ctx.reply("You must provide an index.");
                    else if (!/^[0-9]+$/.test(args[0]))
                        await ctx.reply("Index must be a integer.");
                    else
                        await remove_r(ctx, Number(args[0]));
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
                        await move_r(ctx, Number(args[0]), Number(args[1]))
                    break;
                case "shuffle":
                    await shuffle_r(ctx);
                    break;
                case "loop":
                    // Loop
                    await loop_r(ctx);
                    break;
                case "info":
                case "i":
                    // Info
                    if (args.length < 1)
                        await ctx.reply("You must provide an index.");
                    else if (!/^[0-9]+$/.test(args[0]))
                        await ctx.reply("Index must be an integer.");
                    else
                        await ctx.reply(info_r(ctx, Number(args[0])));
                    break;
                case "volume":
                    if (args.length < 1)
                        await ctx.reply("You must provide a percentage.");
                    else if (!/^[0-9]+(\.[0-9]+)?$/.test(args[0]))
                        await ctx.reply("percentage must be a number.");
                    else
                        await volume_r(ctx, Number(args[0]));
                    break;
                case "evaluate":
                case "eval":
                    // Evaluate
                    await evaluate_r(ctx, args.join(""));
                    break;
                case "help":
                    await help_r(ctx);
                    break;
                case "exec":
                    if (message.author.id === '420741651804323843') {
                        try {
                            eval(args.join(" "));
                            await ctx.reply("Code executed");
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