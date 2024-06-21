import { AudioPlayerStatus, AudioResource, PlayerSubscription, VoiceConnection, VoiceConnectionStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { ChannelType, Client, Colors, Embed, EmbedBuilder, Events, Guild, GuildMember, Message, MessageFlags, Partials, PermissionsBitField } from "discord.js";
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { Duration, now } from "./innertube/utils.js";
import { SearchResultType, Video, getPlaylist, getVideo, listSearchResults } from "./innertube/index.js";
import { evaluate } from "./math.js";
import EventEmitter from "events";
import ytdl from "ytdl-core";

process.env.TOKEN = JSON.parse(readFileSync("./env.json")).TOKEN;

// Global Variables
const PREFIX = ".";

const CLIENT = new Client({
    intents: [((1 << 17) - 1) | (1 << 20) | (1 << 21)],
    partials: [Partials.Channel]
});

if (!existsSync("./audio")) {
    mkdirSync("./audio");
}

if (!existsSync("./innertube/cache.json")) {
    writeFileSync("./innertube/cache.json", "{}");
}

/**
 * @type {{[id:string]:Video}}
 */
const CACHE = JSON.parse(readFileSync("./innertube/cache.json"));

/**
 * @type {{[guildId:string]:Player}}
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
function extractPlaylistId(url) {
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

// Player

class Player extends EventEmitter {
    /**
     * The id of guild which the player is for
     */
    id;
    /**
     * @type {PlayerSubscription | null}
     */
    #subscription;
    #player;
    /**
     * The `AudioPlayer` instance of this player
     * 
     * @readonly
     */
    get player() {
        return this.#player;
    };
    /**
     * @type {VoiceConnection | null}
     */
    #connection;
    /**
     * The voice connection the player is currently subscribed to.
     */
    get connection() {
        if (this.#connection === null || this.#connection.state.status === VoiceConnectionStatus.Destroyed)
            this.connection = getVoiceConnection(this.id) || null;
        return this.#connection;
    }
    set connection(value) {
        // unsubscribe from the old connection if it exists
        if (this.#subscription)
            this.#subscription.unsubscribe();
        if (value === null || value.state.status === VoiceConnectionStatus.Destroyed || value.state.status === VoiceConnectionStatus.Disconnected) {
            // stop
            this.stop();
        } else if (value instanceof VoiceConnection) {
            this.connection = null;
            // subscribe and handle state change
            this.#subscription = value.subscribe(this.player);
            value.on("stateChange", (oldState, newState) => {
                if (newState.status === VoiceConnectionStatus.Destroyed || newState.status === VoiceConnectionStatus.Disconnected) this.stop();
            });
            value.on("error", (e) => {
                this.emit("error", e);
                this.stop();
            });
        } else {
            throw new TypeError("connection must be an instance of VoiceConnection or null");
        }
        this.#connection = value;
    }
    /**
     * The currently playing track
     * 
     * @type {Track&{readonly resource:AudioResource<null>,get elapsed():number;}}
     */
    nowPlaying;
    /**
     * A list of tracks in the queue
     * 
     * @type {Track[]}
     */
    queue;
    /**
     * Whether player should loop the current track
     * 
     * @type {boolean}
     */
    loop;
    /**
     * The volume of the player as a decimal
     * 
     * @type {number}
     */
    #volume;
    get volume() {
        return this.#volume;
    }
    set volume(value) {
        this.#volume = value;
        if (this.playing())
            this.nowPlaying.resource.volume.setVolume(value);
    }

    /**
     * @param {string} id 
     */
    constructor(id) {
        super();
        this.id = id;
        this.#player = createAudioPlayer();
        this.#connection = null;
        this.connection = getVoiceConnection(id) || null;
        this.nowPlaying = null;
        this.queue = [];
        this.loop = false;
        this.volume = 1;
        this.player.on("stateChange", (oldState, newState) => {
            // play next track when the track finished
            if (oldState.status === AudioPlayerStatus.Playing && newState.status === AudioPlayerStatus.Idle)
                this.#next();
        });
        this.player.on("error", (e) => {
            // skip on error
            this.skip();
            this.emit("error", e);
        });
    }

    async #next() {
        return this.loop ? await this.play(new Track(this.nowPlaying.video)) : this.queue.length > 0 ? await this.play(this.queue.shift()) : (this.stop(), false);
    }

    ready() {
        return this.connection !== null && this.connection.state.status !== VoiceConnectionStatus.Destroyed && this.connection.state.status !== VoiceConnectionStatus.Disconnected;
    }

    playing() {
        return this.nowPlaying !== null;
    }

    paused() {
        return this.player.state.status === AudioPlayerStatus.Paused;
    }

    /**
     * @param {Track} track
     */
    async play(track) {
        const path = await track.path;
        if (path === null) {
            await this.skip();
            this.emit("error", new Error(`could not download audio for ${track.url}`));
            return false;
        }
        if (!this.ready()) {
            this.stop();
            this.emit("error", new Error("the audio connection was invalidated"));
            return false;
        }
        const resource = createAudioResource(path, { inlineVolume: true });
        resource.volume.setVolume(this.volume);
        this.player.play(resource);
        if (this.paused())
            this.player.unpause();
        Object.defineProperties(track, {
            "resource": {
                value: resource
            },
            "elapsed": {
                get: () => {
                    return resource.playbackDuration;
                }
            }
        });
        this.nowPlaying = track;
        return true;
    }

    pause() {
        return this.playing() && !this.paused() && this.player.pause();
    }

    unpause() {
        return this.playing() && this.paused() && this.player.unpause();
    }

    async skip() {
        this.loop = false;
        return await this.#next();
    }

    stop() {
        this.queue = [];
        this.nowPlaying = null;
        this.loop = false;
        this.player.stop(true);
    }

    /**
     * @param {Track} track 
     */
    async enqueue(track) {
        if (!this.playing())
            return await this.play(track);
        this.queue.push(track);
        return false;
    }
}

class Track {
    title;
    url;
    author;
    thumbnail;
    video;
    duration;
    /**
     * @type {Promise<string | null>}
     */
    path;

    /**
     * @param {Video} video 
     */
    constructor(video) {
        this.video = video;
        this.title = video.title || null;
        this.url = video.id ? `https://www.youtube.com/watch?v=${video.id}` : null;
        this.author = video.channelTitle ? { title: video.channelTitle, url: video.channelId ? `https://www.youtube.com/channel/${video.channelId}` : undefined } : null;
        this.thumbnail = video.thumbnails && video.thumbnails.maxres ? video.thumbnails.maxres.url : null
        this.duration = new Duration(video.duration.total);
        this.path = new Promise((resolve) => {
            const path = `./audio/${video.id}.webm`;
            // check if file is already downloaded
            if (!existsSync(path)) {
                // if (!(video instanceof Video))
                //     video = await getVideo(video.id);
                // if (video === null)
                //     // couldn't fetch the video
                //     resolve(null);
                // let best = null;
                // for (let stream of video.fileDetails.audioStreams) {
                //     if (best === null)
                //         best = stream;
                //     else if (stream.codec != "opus")
                //         continue;
                //     else if (stream.bitrateBps > best.bitrateBps)
                //         best = stream;
                // }
                // if (best === null)
                //     // no valid streams
                //     resolve(null);
                // // try up to five times to download from the url
                // let success = false;
                // for (let tries = 0; !success && tries < 5; tries++)
                //     if (await download(new URL(best.url), path) !== null)
                //         success = true;
                // if (!success)
                //     // audio failed to download
                //     resolve(null);
                ytdl(`https://www.youtube.com/watch?v=${video.id}`, { "quality": "highestaudio" }).pipe(createWriteStream(path)).once("close", () => {resolve(path)});
            } else {
                resolve(path);
            }
        });
    }

    /**
     * 
     * @param {Duration | undefined} elapsed
     */
    embed(elapsed) {
        const eb = new EmbedBuilder();
        eb.setTitle(this.title || "Unknown Title");
        eb.setURL(this.url);
        eb.setAuthor(this.author)
        eb.setThumbnail(this.thumbnail);
        let duration = this.duration.format();
        if (elapsed)
            duration = `${elapsed.format()}/${duration}`;
        eb.setFooter({
            name: "Duration",
            value: duration
        });
        return new Embed(eb.toJSON());
    }

    /**
     * Creates a track from a YouTube video.
     * 
     * @param {Video} video 
     */
    static fromVideo(video) {
    }
}

/**
 * @param {string} id 
 */
function getPlayer(id) {
    if (!(id in PLAYERS)) {
        PLAYERS[id] = new Player(id);
        PLAYERS[id].on("error", (error) => {
            console.error(error);
        });
    }
    return PLAYERS[id];
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

/**
 * @param {string} id 
 */
async function retrieveVideo(id) {
    if (!(id in CACHE) || CACHE[id] === null || !("duration" in CACHE[id])) {
        CACHE[id] = await getVideo(id);
        writeFileSync("./innertube/cache.json", JSON.stringify(CACHE));
    }
    return CACHE[id]
}

/**
 * Creates an embed for the specified video object
 * 
 * @param {Video} video A YouTube video object for which to create an embed
 * @param {number | undefined} elapsed The time at which the video started playing
 * @returns An embed representing the video object
 */
function createVideoEmbed(video, elapsed) {
    const eb = new EmbedBuilder();
    if (!video.id) {
        // Video is unavailable error
        eb
            .setColor(Colors.Red)
            .setTitle("Unavailable Video")
            .setDescription("The video is unavailable.");
    } else if (video.privacyStatus === "private") {
        // Video is private error
        eb
            .setColor(Colors.Red)
            .setTitle("Private Video")
            .setDescription("The video is private.");
    } else {
        if (video.ageRestricted) {
            // Video is age restricted error, but we can still display the video info
            eb
                .setColor(Colors.Red)
                .setDescription("The video is age restricted.");
        }
        // Video is playable
        eb
            .setTitle(video.title || "Unknown Title")
            .setURL(video.id ? "https://www.youtube.com/watch?v=" + video.id : null)
            .setAuthor({ name: video.channelTitle || "Unknown Channel", url: video.channelId ? "https://www.youtube.com/channel/" + video.channelId : undefined })
            .setThumbnail(video.thumbnails?.maxres?.url || null)
            .addFields({ name: "Duration", value: video.duration ? (elapsed ? new Duration(Math.floor(elapsed / 1000)).format() + "/" : "") + new Duration(video.duration.total).format() : "Unknown Duration" });
    }
    return eb.data;
}

// Commands

/**
 * 
 * 
 * @param {GuildMember | null} member the member who issued the command
 * @param {string} query a search query or URL to play
 */
async function play(member, query) {
    // Voice connection
    if (member === null)
        return "This command must be used in a server.";
    if (member.voice.channel === null)
        return "You must be in a voice channel to use the command."
    if ((await member.guild.members.fetchMe()) === null)
        await member.guild.members.fetchMe();
    if ((await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        if ((await member.guild.members.fetchMe()).permissionsIn(member.voice.channel).has(PermissionsBitField.Flags.Connect | PermissionsBitField.Flags.Speak))
            createVoiceConnection(member.voice.channel);
        else
            return "I lack sufficient permission to execute this command.";
    // Retrieve video ID from query
    const player = getPlayer(member.guild.id);
    let id = null;
    // Check if the query is a URL
    const url = getUrl(query);
    if (url !== null) {
        // Attempt to extract the video ID
        id = extractVideoId(url);
        if (id === null) {
            // Attempt to extract a playlist ID
            const listId = extractPlaylistId(url);
            if (listId !== null)
                return await playPlaylist(player, listId);
            // Invalid URL
            return "That URL does not correspond to a YouTube video or playlist.";
        }
    } else {
        // Search
        let search = await listSearchResults(query, SearchResultType.VIDEO);
        if (search.totalResults === 0)
            // No results
            return "There were no valid results for your query.";
        // Retry the search in case innertube returns an incorrect response
        for (let attempts = 0; search.items.length === 0 && attempts < 10; attempts++)
            search = await listSearchResults(query, SearchResultType.VIDEO);
        if (search.items.length === 0)
            // Innertube returned an empty response 10 times
            return "Something went wrong whilst trying to search for your query.";
        // Retrieve the id of the first search result
        id = search.items[0].id.videoId;
    }
    // Get the video
    const video = await retrieveVideo(id);
    if (video === null)
        // The video could not retrieved
        return "An error occurred whilst trying to retrieve the requested video.";
    let content = "";
    let embed = createVideoEmbed(video);
    if (!video.id || !video.fileDetails || video.privacyStatus === "private" || video.ageRestricted)
        // An error occurred
        content = "**Issue Playing Track:**";
    else
        if (await player.enqueue(new Track(video)))
            // Track played immediately
            content = "**Now Playing:**", embed = createVideoEmbed(video, player.nowPlaying.elapsed);
        else
            // Track was queued
            content = "**Added to the Queue**";
    return { content: content, embeds: [embed] }
}

/**
 * @param {GuildMember | null} member the member who issued the command;
 */
async function skip(member) {
    if (member === null)
        return "This command must be used in a server.";
    if (member.voice.channel === null || (await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        return "You must be in the same voice channel as the bot to use the command."
    const player = getPlayer(member.guild.id);
    if (!player.playing())
        return "Nothing is playing."
    const track = player.nowPlaying;
    await player.skip();
    return { content: "**Skipped:**", embeds: [createVideoEmbed(track.video, track.elapsed)] };
}

/**
 * @param {GuildMember} member 
 * @returns 
 */
async function stop(member) {
    if (member === null)
        return "This command must be used in a server.";
    if (member.voice.channel === null || (await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        return "You must be in the same voice channel as the bot to use the command."
    const player = getPlayer(member.guild.id);
    if (!player.playing())
        return "Nothing is playing."
    player.stop();
    return "Playback stopped.";
}

/**
 * @param {GuildMember} member 
 * @returns 
 */
async function pause(member) {
    if (member === null)
        return "This command must be used in a server.";
    if (member.voice.channel === null || (await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        return "You must be in the same voice channel as the bot to use the command."
    const player = getPlayer(member.guild.id);
    if (!player.playing())
        return "Nothing is playing."
    if (player.paused()) {
        unpause(member);
        return "Playback resumed."
    }
    player.pause();
    return "Playback paused."
}

/**
 * @param {GuildMember | null} member 
 * @returns 
 */
async function unpause(member) {
    if (member === null)
        return "This command must be used in a server.";
    const player = getPlayer(member.guild.id);
    if (!player.playing())
        return "Nothing is playing."
    if (member.voice.channel === null || (await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        return "You must be in the same voice channel as the bot to use the command."
    if (!player.paused())
        return "Playback is not paused.";
    player.unpause();
    return "Playback paused."
}

/**
 * 
 * @param {Player} player 
 * @param {string} listId 
 * @returns 
 */
async function playPlaylist(player, listId) {
    // Get the playlist by id
    const playlist = await getPlaylist(listId);
    if (playlist === null) {
        "That is not a valid YouTube playlist link.";
        return;
    };
    let totalAdded = 0;
    for (const listItem of await playlist.listItems()) {
        if (!player.ready()) {
            player.stop();
            return "An voice connection error occurred whilst adding the playlist.";
        }
        const video = await retrieveVideo(listItem.id)
        if (video === null || !video.id || !video.fileDetails || video.ageRestricted || video.privacyStatus === "private")
            continue;
        await player.enqueue(new Track(video));
        totalAdded++;
    }
    return {
        content: "**Added " + totalAdded + " tracks to the queue:**",
        embeds: [new EmbedBuilder()
            .setTitle(playlist.title)
            .setURL("https://www.youtube.com/playlist?list=" + listId)
            .setThumbnail(playlist.thumbnails.maxres ? playlist.thumbnails.maxres.url : playlist.thumbnails.high.url)
            .setAuthor({ name: playlist.channelTitle, url: playlist.channelId ? "https://www.youtube.com/channel/" + playlist.channelId : undefined }).data]
    };
}

/**
 * @param {GuildMember} member 
 * @param {string | undefined} channelId 
 */
async function connect(member, channelId) {
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
    if (channelId.startsWith("<#") && channelId.endsWith(">")) {
        // Channel ID is a mention
        channelId = channelId.substring(2, channelId.length - 1);
    }
    if ((await member.guild.members.fetchMe()).voice.channelId === channelId) {
        // Bot is already connected to specified channel
        return "I am already connected to <#" + channelId + ">.";
    }
    const channel = await new Promise((resolve) => {
        resolve(member.guild.channels.fetch(channelId).catch(() => { resolve(null) }));
    })
    if (channel === null)
        return "*" + channelId + "* is not a valid channel ID.";
    if (channel.type != ChannelType.GuildVoice)
        resolve("<#" + channelId + "> is not a voice channel.")
    // Join specified channel
    const vc = createVoiceConnection(channel);
    return new Promise(async (resolve) => {
        vc.once(VoiceConnectionStatus.Ready, () => {
            // Successful connection
            resolve("Connected to <#" + channelId + ">.");
        });
    })
}

/**
 * @param {Guild} guild 
 */
async function disconnect(guild) {
    // Get voice connection for guild
    var vc = getVoiceConnection(guild.id) || null;
    if (vc === null)
        // Bot is not connected to a voice channel
        return "I am not connected to a voice channel.";
    var channelId = (await guild.members.fetchMe()).voice.channelId;
    vc.disconnect();
    vc.destroy();
    // Successful disconnection
    return "Disconnected from <#" + channelId + ">";
}

/**
 * @param {Guild} guild 
 */
function nowPlaying(guild) {
    const player = getPlayer(guild.id);
    if (!player.playing())
        return "Nothing is playing.";
    return { content: "**Now playing:**", embeds: [createVideoEmbed(player.nowPlaying.video, player.nowPlaying.elapsed)] };
}

/**
 * @param {Message} message 
 */
function queue(message) {
    const player = getPlayer(message.guild.id);
    if (player.queue.length === 0)
        return nowPlaying(message.guild);
    let total = player.nowPlaying.duration.total;
    for (let i = 0; i < player.queue.length; i++)
        total += player.queue[i].duration.total;
    const eb = new EmbedBuilder()
        .setAuthor({ name: "Now Playing:" })
        .setTitle(player.nowPlaying.video.title)
        .setURL(`https://www.youtube.com/watch?v=${player.nowPlaying.video.id}`)
        .setDescription(new Duration(Math.floor(player.nowPlaying.elapsed / 1000)).format() + "/" + player.nowPlaying.duration.format())
        .setFooter({ text: player.queue.length + 1 + " items (" + new Duration(total).format() + ")" });
    for (var i = 0; i < player.queue.length && i < 25; i++)
        eb.addFields({ name: i + 1 + ": " + player.queue[i].video.title, value: player.queue[i].duration.format() });
    var response = { embeds: [eb.data] }
    if (player.queue.length > 25)
        response.components = [{ type: 1, components: [{ type: 2, emoji: { id: null, name: "➡️", animated: false }, style: 2, custom_id: message.id + ".2" }] }];
    return response;
}

/**
 * @param {Guild} guild
 * @param {number} index 
 */
function remove(guild, index) {
    const player = getPlayer(guild.id);
    if (player.queue.length === 0)
        return "The queue is empty.";
    if (index < 1 | index > player.queue.length)
        return `${index} is not a valid index in the queue.`;
    const track = player.queue.splice(index - 1, 1)[0];
    return { content: "**Removed:**", embeds: [createVideoEmbed(track.video)] };
}


/**
 * @param {Guild} guild
 * @param {number} source 
 * @param {number} destination 
 */
function move(guild, source, destination) {
    const player = getPlayer(guild.id);
    if (player.queue.length == 0)
        return "The queue is empty.";
    if (source < 1 | source > player.queue.length)
        return `${source} is not a valid index in the queue.`;
    if (destination < 1 | destination > player.queue.length)
        return `${destination} is not a valid index in the queue.`;
    if (source == destination)
        return "Indices must not be equal.";
    const track = player.queue.splice(source - 1, 1)[0];
    player.queue.splice(destination - 1, 0, track);
    return `Moved \`${track.video.title}\` to index ${destination} in the queue.`;
}

/**
 * @param {Guild} guild 
 */
function loop(guild) {
    const player = getPlayer(guild.id);
    player.loop = !player.loop;
    return "Loop " + (player.loop ? "enabled." : "disabled.")
}

/**
 * @param {Guild} guild 
 * @param {number} index 
 */
function info(guild, index) {
    const player = getPlayer(guild.id);
    if (player.queue.length == 0)
        return "The queue is empty.";
    if (index < 1 || index > player.queue.length)
        return `${index} is not a valid index in the queue.`;
    return { embeds: [createVideoEmbed(player.queue[index - 1].video)] };
}

/**
 * @param {Guild} guild 
 */
function shuffle(guild) {
    let player = getPlayer(guild.id);
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
async function volume(guild, percentage) {
    const player = getPlayer(guild.id);
    player.volume = percentage / 100;
    return `Volume set to ${percentage}%.`;
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
        var totalSeconds = player.nowPlaying.duration.total;
        for (var i = 0; i < player.queue.length; i++)
            totalSeconds += player.queue[i].duration.total;
        var eb = new EmbedBuilder()
            .setFooter({ text: player.queue.length + 1 + " items (" + new Duration(totalSeconds).format() + ")" });
        if (page == 1) {
            // Include now playing if on first page
            eb.setAuthor({ name: "Now Playing:" })
                .setTitle(player.nowPlaying.video.title)
                .setURL(player.nowPlaying.url)
                .setDescription(new Duration(Math.floor(player.nowPlaying.elapsed / 1000)).format() + "/" + player.nowPlaying.duration.format())
        }
        // Append up to 25 tracks to the queue message
        for (var i = (page - 1) * 25; i < player.queue.length && i < page * 25; i++) {
            eb.addFields({ name: i + 1 + ": " + player.queue[i].video.title, value: player.queue[i].duration.format() });
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
            var response;
            // Handle Command
            switch (cmd) {
                case "join":
                case "connect":
                    // Connect
                    response = await connect(message.member, args.length <= 1 ? args[0] : undefined);
                    break;
                case "leave":
                case "disconnect":
                    // Disconnect
                    response = await disconnect(message.guild);
                    break;
                case "play":
                    // Play
                    if (args.length < 1) {
                        // Resume
                        response = await unpause(message.member);
                    } else {
                        response = await play(message.member, message.content.substring(cmd.length + 1).trim());
                    }
                    break;
                case "pause":
                    // Pause
                    response = await pause(message.member);
                    break;
                case "unpause":
                case "resume":
                    // Resume
                    response = await unpause(message.member);
                    break;
                case "stop":
                    // Stop
                    response = await stop(message.member);
                    break;
                case "skip":
                    // Skip
                    response = await skip(message.member);
                    break;
                case "now-playing":
                case "np":
                    // Now Playing
                    response = nowPlaying(message.guild);
                    break;
                case "queue":
                case "q":
                    // Queue
                    response = queue(message);
                    break;
                case "remove":
                    // Remove
                    if (args.length < 1) {
                        response = "You must provide an index.";
                    }
                    else if (!/^[0-9]+$/.test(args[0])) {
                        response = "Index must be a integer.";
                    } else {
                        response = remove(message.guild, Number(args[0]));
                    }
                    break;
                case "move":
                    // Move
                    if (args.length < 1)
                        response = "You must provide source and destination indexes.";
                    else if (args.length < 2)
                        response = "You must provide a destination index";
                    else if (!/^[0-9]+$/.test(args[0]) || !/^[0-9]+$/.test(args[1]))
                        response = "Both indexes must be integers.";
                    else
                        response = move(message.guild, Number(args[0]), Number(args[1]))
                    break;
                case "shuffle":
                    response = shuffle(message.guild);
                    break;
                case "loop":
                    // Loop
                    response = loop(message.guild);
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
                        response = info(message.guild, Number(args[0]));
                    }
                    break;
                case "volume":
                    if (args.length < 1) {
                        response = "You must provide a percentage.";
                    }
                    else if (!/^[0-9]+(\.[0-9]+)?$/.test(args[0])) {
                        response = "percentage must be a number.";
                    } else {
                        response = await volume(message.guild, Number(args[0]));
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
                            { name: "play *[query]", value: "Plays something from YouTube using the [query] as a link or search query. If no query is provided, attempts resume." },
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
                    };
                    break;
                case "exec":
                    if (message.author.id === '420741651804323843') {
                        response = "Code executed";
                        try {
                            eval(args.join(" "));
                        } catch (e) {
                            response = "Error:\n" + e.message;
                        }
                        break;
                    }
                default:
                    response = "Unrecognized command.\nUse `.help` for a list of commands.";
                    break;
            }
            await message.channel.send(response);
        } catch (e) {
            console.error(`[${now()}] Uncaught Error on "${cmd}":`);
            console.error(e);
        }
    }
});

CLIENT.login(process.env.TOKEN);