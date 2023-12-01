import { AudioPlayer, AudioPlayerStatus, AudioResource, PlayerSubscription, VoiceConnection, VoiceConnectionStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { ChannelType, Client, Colors, EmbedBuilder, Events, Guild, GuildMember, Message, Partials } from "discord.js";
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { Duration, now } from "./innertube/utils.js";
import * as Videos from "./innertube/videos.js";
import { getPlaylist, listSearchResults } from "./innertube/index.js";
import { evaluate } from "./math.js";

process.env.TOKEN = JSON.parse(readFileSync("./env.json")).TOKEN;

// Global Variables
const PREFIX = ".";

const CLIENT = new Client({
    intents: [((1 << 17) - 1) | (1 << 20) | (1 << 21)],
    partials: [Partials.Channel]
});
/**
 * @type {{[id:string]:Videos.Video}}
 */
const CACHE = JSON.parse(readFileSync("./innertube/cache.json"));

/**
 * @type {{[guildId:string]:{audioPlayer:AudioPlayer,voiceConnection:VoiceConnection}}}
 */
const PLAYERS = {};

// Utility Functions

/**
 * Returns a parsed URL object for the given string only if the given string is a valid URL.
 * 
 * @param {string} s The string to parse
 * @returns The URL object for given string if it is a valid URL, otherwise `null`.
 */
function getUrl(s) {
    if (/^[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(s) && !s.startsWith("http")) {
        // String is a valid URL without a protocol
        s = "https://" + s;
    }
    if (URL.canParse(s) && /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(s)) {
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
function extractVideoId(url) {
    if (/^https?:\/\/((www|music)\.)?youtube\.com\/watch\?[A-Za-z0-9-._~&=]+$/.test(url.toString())) {
        // URL is a regular video link
        return url.searchParams.get("v");
    } else if (/^https?:\/\/(youtu\.be|(www\.)?youtube\.com\/shorts)\/[A-Za-z0-9_-]{11}(\?[A-Za-z0-9-._~&=]+)?$/.test(url.toString())) {
        // URL is a short link or YouTube short
        if (url.pathname.startsWith("/shorts")) {
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
function extractPlaylistId(url) {
    if (/^https?:\/\/((www|music)\.)?youtube\.com\/playlist\?[A-Za-z0-9-._~&=]+$/.test(url.toString())) {
        // URL is a YouTube playlist link
        return url.searchParams.get("list");
    } else {
        // URL does not correspond to a YouTube playlist
        return null;
    }
}

// Player

class Player {
    audioPlayer;
    /**
     * @type {VoiceConnection | undefined}
     */
    voiceConnection;
    /**
     * @type {PlayerSubscription | undefined}
     */
    playerSubscription;
    /**
     * @type {?Track}
     */
    nowPlaying;
    /**
     * @type {Track[]}
     */
    queue;
    loop;
    /**
     * @type {AudioResource<null> | null}
     */
    audioResource;
    /**
     * @type {number}
     */
    volume;

    /**
     * @param {string} guildId 
     */
    constructor(guildId) {
        this.audioPlayer = createAudioPlayer();
        this.audioPlayer.once(AudioPlayerStatus.Playing, () => {
            this.voiceConnection = getVoiceConnection(guildId);
            this.playerSubscription = this.voiceConnection.subscribe(this.audioPlayer);
        });
        this.nowPlaying = null;
        this.queue = [];
        this.loop = false;
        this.audioResource = null;
        this.volume = 1;
        this.audioPlayer.on(AudioPlayerStatus.Idle, async () => {
            if (this.nowPlaying !== null) {
                // Something is playing
                if (this.nowPlaying.skipped || !this.loop) {
                    // Current track was skipped or is over
                    if (this.queue.length > 0) {
                        // Play next track in the queue
                        this.nowPlaying = null;
                        await this.play(this.queue.shift());
                    } else {
                        // Queue is finished
                        this.nowPlaying = null;
                    }
                } else {
                    // Current track is being looped
                    await this.play(this.nowPlaying);
                }
            }
        })
    }

    /**
     * @param {Track} track 
     */
    async play(track) {
        this.nowPlaying = track;
        try {
            this.audioResource = createAudioResource(await track.path, { inlineVolume: true });
            this.audioResource.volume.setVolume(this.volume);
            this.audioPlayer.play(this.audioResource);
            this.nowPlaying.startTime = Date.now();
            return true;
        } catch {
            // Something went wrong, reset and return false
            this.nowPlaying = null;
            this.audioResource = null;
            return false;
        }
    }

    skip() {
        if (this.nowPlaying) {
            this.nowPlaying.skipped = true;
            return this.audioPlayer.stop();
        } else {
            return false;
        }
    }

    /**
     * Set the volume percentage
     * @param {number} volume the new volume
     */
    setVolume(volume) {
        this.volume = volume;
        if (this.audioResource) {
            this.audioResource.volume.setVolume(volume);
        }
    }
}

/**
 * @param {string} guildId 
 * @returns {Player}
 */
function getPlayer(guildId) {
    if (PLAYERS[guildId]) {
        return PLAYERS[guildId];
    }
    PLAYERS[guildId] = new Player(guildId);
    return PLAYERS[guildId];
}

class Track {
    id;
    title;
    url;
    duration;
    author;
    authorUrl;
    thumbnail;
    skipped;
    /**
     * @type {string}
     */
    startTime;
    /**
     * @type {Promise<string>}
     */
    path;

    /**
     * @param {Videos.Video} video
     */
    constructor(video) {
        this.id = video.id;
        this.title = video.snippet.title;
        this.url = "https://www.youtube.com/watch?v=" + video.id;
        this.startTime = null;
        this.duration = video.contentDetails.duration;
        this.author = video.snippet.channelTitle;
        this.authorUrl = "https://www.youtube.com/channel/" + video.snippet.channelId;
        this.thumbnail = video.snippet.thumbnails.maxres ? video.snippet.thumbnails.maxres.url : video.snippet.thumbnails.high.url;
        this.skipped = false;
        if (video.fileDetails) {
            this.path = new Promise(async (resolve, reject) => {
                if (readdirSync("audio").includes(video.id + ".webm")) {
                    resolve("audio/" + video.id + ".webm");
                    return;
                }
                var bestAudioStream;
                for (var audioStream of video.fileDetails.audioStreams) {
                    if (!bestAudioStream) {
                        bestAudioStream = audioStream;
                    } else if (audioStream.codec != "opus") {
                        continue;
                    } else if (audioStream.bitrateBps > bestAudioStream.bitrateBps) {
                        bestAudioStream = audioStream;
                    }
                }
                resolve(await bestAudioStream.download("audio/" + video.id + ".webm").catch((reason) => {
                    console.error(`[${now()}] ` + reason);
                    reject(reason);
                }));
            })
        } else {
            this.path = null;
        }
    }

    embed() {
        return new EmbedBuilder()
            .setTitle(this.title)
            .setURL(this.url)
            .setThumbnail(this.thumbnail)
            .setAuthor({ name: this.author, url: this.authorUrl })
            .addFields({ name: "Duration", value: (this.startTime ? new Duration(Math.floor((Date.now() - this.startTime) / 1000)).format() + "/" : "") + this.duration.format() })
            .data;
    }
}

// Commands

/**
 * 
 * @param {Player} player 
 * @param {string} listId 
 * @returns 
 */
async function playPlaylist(player, listId) {
    return new Promise(async (resolve) => {
        // Get the playlist by id
        var playlist = await getPlaylist(listId);
        if (playlist === null) {
            resolve("That is not a valid YouTube playlist link.");
            return;
        };
        var totalAdded = 0;
        for (var listItem of await playlist.listItems()) {
            var video
            if (CACHE[listItem.id]) {
                // Video has been cached
                video = CACHE[listItem.id];
                if (typeof video == "object") {
                    // Cached video does not have proper duration object so make it one
                    video.contentDetails.duration = new Duration(video.contentDetails.duration.total);
                }
            } else {
                // Video was not cached, fetch it
                video = await Videos.get(listItem.id);
                if (video != null && video != "PRIVATE") {
                    // Update the cache
                    CACHE[listItem.id] = video;
                    writeFileSync("./innertube/cache.json", JSON.stringify(CACHE));
                }
            }
            if (typeof video == "string" || video == null) {
                continue;
            }
            var track = new Track(video);
            if (!track.path) {
                continue;
            }
            if (player.nowPlaying !== null) {
                // Something is already playing, add it to the queue
                player.queue.push(track);
            } else {
                // Nothing is playing, play it
                if (!player.play(track)) {
                    continue;
                }
            }
            totalAdded++;
        }
        resolve({
            content: "**Added " + totalAdded + " tracks to the queue:**",
            embeds: [new EmbedBuilder()
                .setTitle(playlist.title)
                .setURL("https://www.youtube.com/playlist?list=" + listId)
                .setThumbnail(playlist.thumbnails.maxres ? playlist.thumbnails.maxres.url : playlist.thumbnails.high.url)
                .setAuthor({ name: playlist.channelTitle, url: playlist.channelId ? "https://www.youtube.com/channel/" + playlist.channelId : undefined }).data]
        });
    })
}

/**
 * @param {GuildMember} member 
 * @param {string | undefined} channelId 
 */
async function connectCommand(member, channelId) {
    if (!channelId) {
        // No channel ID provided
        if (member.voice.channelId !== null) {
            // Get member's currently connected voice channel
            channelId = member.voice.channelId;
        } else {
            // Member is not connected to voice
            return "You are not in a voice channel.";
        }
    }
    if (channelId.startsWith("<#") & channelId.endsWith(">")) {
        // Channel ID is a mention
        channelId = channelId.substring(2, channelId.length - 1);
    }
    if ((await member.guild.members.fetch(CLIENT.user.id)).voice.channelId == channelId) {
        // Bot is already connected to specified channel
        return "I am already connected to <#" + channelId + ">.";
    }
    // Join specified channel
    var vc = joinVoiceChannel({
        channelId: channelId,
        guildId: member.guild.id,
        adapterCreator: member.guild.voiceAdapterCreator,
        selfDeaf: false
    });
    return new Promise(async (resolve) => {
        vc.on(VoiceConnectionStatus.Ready, () => {
            // Successful connection
            resolve("Connected to <#" + channelId + ">.");
        });
        // Try to fetch channel by ID
        var channel = await member.guild.channels.fetch(channelId).catch(() => {
            // Invalid channel ID
            resolve("*" + channelId + "* is not a valid channel ID.");
        });
        if (channel) {
            // Channel exists
            if (channel.type != ChannelType.GuildVoice) {
                // Channel is a not a voice channel
                resolve("<#" + channelId + "> is not a voice channel.")
            }
        }
    })
}

/**
 * @param {Guild} guild 
 */
async function disconnectCommand(guild) {
    // Get voice connection for guild
    var vc = getVoiceConnection(guild.id);
    if (!vc) {
        // Bot is not connected to a voice channel
        return "I am not connected to a voice channel.";
    }
    var channelId = (await guild.members.fetchMe()).voice.channelId;
    vc.disconnect();
    vc.destroy();
    // Successful disconnection
    return "Disconnected from <#" + channelId + ">";
}

/**
 * @param {GuildMember} member 
 * @param {string} query 
 */
async function play(member, query) {
    if (member.voice.channel === null) {
        // Member is not in a voice channel
        return "You are not in a voice channel."
    } else if (member.voice.channel != member.guild.members.me.voice.channel) {
        // Bot not connected to member's voice channel
        joinVoiceChannel({
            channelId: member.voice.channelId,
            guildId: member.guild.id,
            adapterCreator: member.guild.voiceAdapterCreator,
            selfDeaf: false
        });
    }
    const player = getPlayer(member.guild.id);
    player.voiceConnection = getVoiceConnection(member.guild.id);
    player.playerSubscription = player.voiceConnection.subscribe(player.audioPlayer);
    var videoId;
    const url = getUrl(query);
    if (url !== null) {
        // Query is a URL
        videoId = extractVideoId(url);
        if (videoId === null) {
            // URL does not correspond to a YouTube video, try it as a playlist
            const listId = extractPlaylistId(url);
            if (listId !== null) {
                // URL corresponds to a playlist
                return await playPlaylist(player, listId);
            }
            // URL does not correspond to a YouTube video or playlist
            return "That URL does not correspond to a YouTube video or playlist.";
        }
    } else {
        // Query is a search query
        var search = await listSearchResults(query, "video");
        // Check if there are 0 results
        if (search.totalResults === 0) {
            return "There were no results for your query.";
        }
        // Arbitrarily try 25 times since inntertube items is sometimes 0
        var attempt = 1;
        while (search.items.length === 0) {
            if (attempt === 25) {
                return "Something went wrong.";
            }
            search = await listSearchResults(query, "video");
            attempt++;
        }
        // Get the video ID of the first search result
        videoId = search.items[0].id.videoId;
    }
    return new Promise(async (resolve) => {
        var video
        if (CACHE[videoId]) {
            // Video has been cached
            video = CACHE[videoId];
            if (typeof video == "object") {
                video.contentDetails.duration = new Duration(video.contentDetails.duration.total);
            }
        } else {
            // Video was not cached, fetch it
            video = await Videos.get(videoId);
            if (video !== null && video != "PRIVATE") {
                // Update the cache
                CACHE[videoId] = video;
                writeFileSync("./innertube/cache.json", JSON.stringify(CACHE));
            }
        }
        if (video === null) {
            // Video is unavailable
            resolve({ content: "**Issue playing track:**", embeds: [{ color: Colors.Red, description: "The video is unavailable.", title: "Unavailable Video" }] });
            return;
        } else if (video == "PRIVATE") {
            // Video is private
            resolve({ content: "**Issue playing track:**", embeds: [{ color: Colors.Red, description: "The video is private.", title: "Private Video" }] });
            return;
        }
        var track = new Track(video);
        if (video.contentDetails.contentRating.ytRating == "ytAgeRestricted") {
            // Video is age restricted
            resolve({ content: "**Issue playing track:**", embeds: [{ color: Colors.Red, description: "The video is age restricted.", ...track.embed() }] });
        } else if (player.nowPlaying !== null) {
            // Something is already playing, add it to the queue
            player.queue.push(track);
            resolve({ content: "**Added to the queue:**", embeds: [track.embed()] });
        } else {
            // Nothing is playing, play it
            if (!player.play(track)) {
                resolve("Something went wrong.");
                console.log(track);
            } else {
                resolve({ content: "**Now playing:**", embeds: [track.embed()] });
            }
        }
    });
}

/**
 * @param {Guild} guild 
 */
async function stopCommand(guild) {
    var player = getPlayer(guild.id);
    if (player.nowPlaying) {
        player.queue.splice(0, player.queue.length);
        player.nowPlaying = null;
        player.audioPlayer.stop();
        return "Audio stopped."
    } else {
        return "Nothing is playing."
    }
}

/**
 * @param {Guild} guild 
 */
async function skipCommand(guild) {
    var player = getPlayer(guild.id);
    var track = player.nowPlaying;
    if (await player.skip()) {
        return {
            content: "**Skipped:**",
            embeds: [track.embed()]
        };
    } else {
        return "There is nothing playing.";
    }
}

/**
 * @param {Guild} guild 
 */
function nowPlayingCommand(guild) {
    var player = getPlayer(guild.id);
    if (player.nowPlaying) {
        return { content: "**Now playing:**", embeds: [player.nowPlaying.embed()] };
    } else {
        return "Nothing is playing.";
    }
}

/**
 * @param {Message} message 
 */
function queueCommand(message) {
    var player = getPlayer(message.guild.id);
    if (player.queue.length == 0) {
        return nowPlayingCommand(message.guild);
    }
    var totalSeconds = player.nowPlaying.duration.total;
    for (var i = 0; i < player.queue.length; i++) {
        totalSeconds += player.queue[i].duration.total;
    }
    var eb = new EmbedBuilder()
        .setAuthor({ name: "Now Playing:" })
        .setTitle(player.nowPlaying.title)
        .setURL(player.nowPlaying.url)
        .setDescription(new Duration(Math.floor((Date.now() - player.nowPlaying.startTime) / 1000)).format() + "/" + player.nowPlaying.duration.format())
        .setFooter({ text: player.queue.length + 1 + " items (" + new Duration(totalSeconds).format() + ")" });
    for (var i = 0; i < player.queue.length && i < 25; i++) {
        eb.addFields({ name: i + 1 + ": " + player.queue[i].title, value: player.queue[i].duration.format() });
    }
    var response = { embeds: [eb.data] }
    if (player.queue.length > 25) {
        response.components = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: { id: null, name: "➡️", animated: false },
                        style: 2,
                        custom_id: message.id + ".2"
                    }
                ]

            }
        ]
    }
    return response;
}

/**
 * @param {Guild} guild
 * @param {number} index 
 */
function removeCommand(guild, index) {
    var player = getPlayer(guild.id);
    if (player.queue.length == 0) {
        return "The queue is empty.";
    }
    if (index < 1 | index > player.queue.length) {
        return `${index} is not a valid index in the queue.`;
    }
    var track = player.queue.splice(index - 1, 1)[0];
    return { content: "**Removed:**", embeds: [track.embed()] };
}

/**
 * @param {Guild} guild
 * @param {number} source 
 * @param {number} destination 
 */
function moveCommand(guild, source, destination) {
    var player = getPlayer(guild.id);
    if (player.queue.length == 0) {
        return "The queue is empty.";
    }
    if (source < 1 | source > player.queue.length) {
        return `${source} is not a valid index in the queue.`;
    }
    if (destination < 1 | destination > player.queue.length) {
        return `${destination} is not a valid index in the queue.`;
    }
    if (source == destination) {
        return "Indices must not be equal.";
    }
    var track = player.queue.splice(source - 1, 1)[0];
    if (source > destination) {
        player.queue.splice(destination - 1, 0, track);
    } else {
        player.queue.splice(destination - 1, 0, track);
    }
    return `Moved \`${track.title}\` to index ${destination} in the queue.`;
}

/**
 * @param {Guild} guild 
 */
function loopCommand(guild) {
    var player = getPlayer(guild.id);
    player.loop = !player.loop;
    return "Loop " + (player.loop ? "enabled." : "disabled.")
}

function infoCommand(guild, index) {
    var player = getPlayer(guild.id);
    if (player.queue.length == 0) {
        return "The queue is empty.";
    }
    if (index < 1 | index > player.queue.length) {
        return `${index} is not a valid index in the queue.`;
    }
    return { embeds: [player.queue[index - 1].embed()] };
}

function shuffleCommand(guild) {
    var player = getPlayer(guild.id);
    if (player.queue.length == 0) {
        return "The queue is empty";
    }
    let currentIndex = player.queue.length, randomIndex;

    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [player.queue[currentIndex], player.queue[randomIndex]] = [
            player.queue[randomIndex], player.queue[currentIndex]];
    }

    return "Queue shuffled.";
}

/**
 * 
 * @param {Guild} guild 
 * @param {number} percentage 
 */
async function volumeCommand(guild, percentage) {
    const player = getPlayer(guild.id);
    player.setVolume(percentage / 100);
    return `Volume set to ${percentage}%.`;
}

// Events

CLIENT.once(Events.ClientReady, async (client) => {
    // Ready
    console.log(`[${now()}] Logged in as ${client.user.tag}`);
    // Update voice connections
    for (var guild of CLIENT.guilds.cache.values()) {
        var channelId = (await guild.members.fetch(CLIENT.user.id)).voice.channelId;
        if (channelId) {
            joinVoiceChannel({
                channelId: channelId,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: false
            })
        }
    }
});

CLIENT.on(Events.VoiceStateUpdate, (oldState, newState) => {
    if (oldState.member.id == CLIENT.user.id && oldState.channelId !== null && newState.channelId === null) {
        // Bot left a voice channel
        var player = getPlayer(oldState.guild.id);
        if (player.nowPlaying) {
            player.queue.splice(0, player.queue.length);
            player.nowPlaying = null;
            player.audioPlayer.stop();
        }
        player.voiceConnection = getVoiceConnection(oldState.guild.id);
        if (player.voiceConnection) {
            player.voiceConnection.destroy();
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
            var response = nowPlayingCommand(interaction.guild)
            if (typeof response == "string") {
                // Clear embeds
                response = { content: response, embeds: [] };
            }
            // Clear components
            response.components = [];
            interaction.update(response);
            return;
        }
        var totalSeconds = player.nowPlaying.duration.total;
        for (var i = 0; i < player.queue.length; i++) {
            totalSeconds += player.queue[i].duration.total;
        }
        var eb = new EmbedBuilder()
            .setFooter({ text: player.queue.length + 1 + " items (" + new Duration(totalSeconds).format() + ")" });
        if (page == 1) {
            // Include now playing if on first page
            eb.setAuthor({ name: "Now Playing:" })
                .setTitle(player.nowPlaying.title)
                .setURL(player.nowPlaying.url)
                .setDescription(new Duration(Math.floor((Date.now() - player.nowPlaying.startTime) / 1000)).format() + "/" + player.nowPlaying.duration.format())
        }
        // Append up to 25 tracks to the queue message
        for (var i = (page - 1) * 25; i < player.queue.length && i < page * 25; i++) {
            eb.addFields({ name: i + 1 + ": " + player.queue[i].title, value: player.queue[i].duration.format() });
        }
        var response = { embeds: [eb.data], components: [{ type: 1, components: [] }] }
        if (page > 1) {
            // Add a last page button
            response.components[0].components.push({
                type: 2,
                emoji: { id: null, name: "⬅️", animated: false },
                style: 2,
                custom_id: interaction.customId.split(".")[0] + "." + (page - 1)
            });
        }
        if (player.queue.length > 25 * page) {
            // Add a next page button
            response.components[0].components.push(
                {
                    type: 2,
                    emoji: { id: null, name: "➡️", animated: false },
                    style: 2,
                    custom_id: interaction.customId.split(".")[0] + "." + (page + 1)
                })
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
        // Handle DMs
    } else if (message.content.startsWith(PREFIX)) {
        // Parse command name and arguments
        const args = message.content.split(" ");
        const cmd = args.shift().substring(PREFIX.length);
        try {
            var response;
            // Handle Command
            switch (cmd) {
                case "join":
                case "connect":
                    // Connect
                    response = await connectCommand(message.member, args.length <= 1 ? args[0] : undefined);
                    break;
                case "leave":
                case "disconnect":
                    // Disconnect
                    response = await disconnectCommand(message.guild);
                    break;
                case "play":
                    // Play
                    if (args.length < 1) {
                        response = "You must provide a query.";
                    } else {
                        response = await play(message.member, message.content.substring(6).trim());
                    }
                    break;
                case "stop":
                    // Stop
                    response = await stopCommand(message.guild);
                    break;
                case "skip":
                    // Skip
                    response = await skipCommand(message.guild);
                    break;
                case "now-playing":
                case "np":
                    // Now Playing
                    response = nowPlayingCommand(message.guild);
                    break;
                case "queue":
                case "q":
                    // Queue
                    response = queueCommand(message);
                    break;
                case "remove":
                    // Remove
                    if (args.length < 1) {
                        response = "You must provide an index.";
                    }
                    else if (!/^[0-9]+$/.test(args[0])) {
                        response = "Index must be a integer.";
                    } else {
                        response = removeCommand(message.guild, Number(args[0]));
                    }
                    break;
                case "move":
                    // Move
                    if (args.length < 1) {
                        response = "You must provide source and destination indexes.";
                    }
                    else if (args.length < 2) {
                        response = "You must provide a destination index";
                    }
                    else if (!/^[0-9]+$/.test(args[0]) || !/^[0-9]+$/.test(args[1])) {
                        response = "Both indexes must be integers.";
                    } else {
                        response = moveCommand(message.guild, Number(args[0]), Number(args[1]))
                    }
                    break;
                case "shuffle":
                    response = shuffleCommand(message.guild);
                    break;
                case "loop":
                    // Loop
                    response = loopCommand(message.guild);
                    break;
                case "info":
                case "i":
                    // Info
                    if (args.length < 1) {
                        response = "You must provide an index.";
                    }
                    else if (!/^[0-9]+$/.test(args[0])) {
                        response = "Index must be an integer.";
                    } else {
                        response = infoCommand(message.guild, Number(args[0]));
                    }
                    break;
                case "volume":
                    if (args.length < 1) {
                        response = "You must provide a percentage.";
                    }
                    else if (!/^[0-9]+(\.[0-9]+)?$/.test(args[0])) {
                        response = "percentage must be a number.";
                    } else {
                        response = await volumeCommand(message.guild, Number(args[0]));
                    }
                    break;
                case "evaluate":
                case "eval":
                    // Evaluate
                    try {
                        response = String(evaluate(args.join(" ")));
                    } catch (e) {
                        response = e.message;
                    }
                    break;
                case "help":
                    response = {
                        embeds: [new EmbedBuilder().addFields(
                            { name: "play [query]", value: "Plays something from YouTube using the [query] as a link or search query." },
                            { name: "skip", value: "Skips the currently playing track." },
                            { name: "stop", value: "Stops the currently playing track and clears the queue." },
                            { name: "nowPlaying|np", value: "Displays the currently playing track." },
                            { name: "queue|q", value: "Displays the queue." },
                            { name: "connect|join [voice_channel]*", value: "Makes the bot join a voice channel, either [voice_channel]* or your current voice channel.." },
                            { name: "disconnect|leave", value: "Makes the bot leave it's current voice channel." },
                            { name: "remove [index]", value: "Remove track [index] from the queue." },
                            { name: "move [source_index] [destination index]", value: "Move the track at [source_index] to [destination_index]" },
                            { name: "shuffle", value: "Shuffles the queue." },
                            { name: "loop", value: "Loops the currently playing track." },
                            { name: "info|i [index]", value: "Display info about a queued track at [index] in the queue." },
                            { name: "evaluate|eval [expression]", value: "Evaluate a mathematical expression." },
                            { name: "volume [percentage]", value: "Set the volume to the specified percentage" },
                            { name: "help", value: "Display this message." }).data]
                    };
                    break;
                default:
                    response = "Unrecognized command.\nUse `.help` for a list of commands.";
                    break;
            }
            await message.channel.send(response);
        } catch (e) {
            console.error(`[${now()}] Uncaught Error:`);
            console.error(e);
        }
    }
});

CLIENT.login(process.env.TOKEN);