import { AudioPlayerStatus, VoiceConnection, VoiceConnectionStatus, createAudioPlayer, createAudioResource, getVoiceConnection } from "@discordjs/voice";
import { EmbedBuilder } from "discord.js";
import { EventEmitter } from "events";
import { createWriteStream, existsSync } from "fs";
import { Readable } from "stream";
import ytdl from "@distube/ytdl-core";
import { formatDurationMillis } from "./utils.js";

const PLAYERS = {};

class Player extends EventEmitter {
    id;
    #subscription;
    #connection = null;
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
            value.on("stateChange", (_oldState, newState) => {
                if (newState.status === VoiceConnectionStatus.Destroyed || newState.status === VoiceConnectionStatus.Disconnected) this.stop();
            });
            value.on("error", (e) => {
                this.stop();
                this.emit("error", e);
            });
        } else {
            throw new TypeError("connection must be an instance of VoiceConnection or null");
        }
        this.#connection = value;
    }
    nowPlaying;
    queue;
    loop;
    #volume;
    get volume() {
        return this.#volume;
    }
    set volume(value) {
        this.#volume = value;
        if (this.isPlaying)
            this.nowPlaying.resource.volume.setVolume(this.#volume);
    }
    get isReady() {
        return this.connection !== null && this.connection.state.status !== VoiceConnectionStatus.Destroyed && this.connection.state.status !== VoiceConnectionStatus.Disconnected;
    }
    get isPlaying() {
        return this.nowPlaying !== null;
    }
    get isPaused() {
        return this.player.state.status === AudioPlayerStatus.Paused;
    }

    constructor(id) {
        super({ captureRejections: true });
        Object.defineProperty(this, "id", { value: id });
        Object.defineProperty(this, "player", { value: createAudioPlayer() });
        this.connection = getVoiceConnection(id) || null;
        this.nowPlaying = null;
        this.queue = [];
        this.loop = false;
        this.volume = 1;
        this.player.on("stateChange", async (oldState, newState) => {
            // play next track when the track finished
            if (oldState.status === AudioPlayerStatus.Playing && newState.status === AudioPlayerStatus.Idle)
                await this.#next();
        });
        this.player.on("error", (e) => {
            // skip on error
            this.skip();
            this.emit("error", e);
        });
    }

    async #next() {
        if (this.loop && this.isPlaying) {
            await this.play(this.nowPlaying);
        } else if (this.queue.length > 0) {
            await this.play(this.queue.shift())
        } else {
            this.stop();
        }
        this.emit("next");
    }

    /**
     * 
     * @param {import("./player.d.ts").Track<null>} track 
     */
    async play(track) {
        if (!this.isReady) {
            this.stop();
            throw new Error("the audio connection was invalidated");
        }
        if (track.resource instanceof Promise)
            track.resource = await track.resource;
        else if (track.resource === null || track.resource.started || track.resource.ended)
            track.resource = await track.getResource();
        if (track.resource.ended)
            throw new Error("the resource was already ended");
        track.resource.volume.setVolume(this.volume);
        this.player.play(track.resource);
        if (this.isPaused)
            this.player.unpause();
        this.nowPlaying = track;
        // prepare the next track's resource
        if (this.queue.length > 0 && this.queue[0].resource === null)
            this.queue[0].resource = this.queue[0].getResource();
    }

    pause() {
        if (this.isPlaying && !this.isPaused)
            if (this.player.pause())
                return true;
            else
                throw new Error("failed to pause the track");
        return false;
    }

    unpause() {
        if (this.isPlaying && this.isPaused)
            if (this.player.unpause())
                return true;
            else
                throw new Error("failed to unpause the track");
        return false;
    }

    async skip() {
        this.loop = false;
        await this.#next();
    }

    stop() {
        this.queue = [];
        this.nowPlaying = null;
        this.loop = false;
        this.player.stop(true);
    }

    async enqueue(track) {
        if (!this.isPlaying) {
            await this.play(track);
            return true;
        }
        this.queue.push(track);
        if (this.queue.length === 1)
            track.resource = track.getResource();
        return false;
    }
}

class Track {
    getResource;
    resource;
    title;
    url;
    author;
    thumbnail;
    duration;

    constructor(getResource, title, options) {
        this.getResource = getResource;
        this.resource = null;
        this.title = title;
        options = options || {};
        this.url = options.url || null;
        this.author = options.author || null;
        this.thumbnail = options.thumbnail || null;
        this.duration = options.duration || null;
    }

    toEmbed() {
        const eb = new EmbedBuilder();
        eb.setTitle(this.title);
        if (this.url !== null)
            eb.setURL(this.url);
        if (this.author !== null)
            eb.setAuthor(this.author)
        if (this.thumbnail !== null)
            eb.setThumbnail(this.thumbnail);
        if (this.duration !== null) {
            let duration = formatDurationMillis(this.duration);
            if (this.resource !== null && this.resource.started)
                duration = `${formatDurationMillis(this.resource.playbackDuration)}/${duration}`;
            eb.addFields({ name: "Duration", value: duration });
        }
        return eb.toJSON();
    }

    static fromURL(url, title, options) {
        if (typeof url === "string")
            url = new URL(url);
        const getResource = async () => createAudioResource(Readable.fromWeb((await fetch(url)).body), { inlineVolume: true });
        title = title || url.pathname.length > 1 ? url.pathname.substring(url.pathname.lastIndexOf('/') + 1) : "Unknown Title";
        options = options || {};
        options.url = options.url || url.toString();
        return new Track(getResource, title, options);
    }

    static fromVideoInfo(info, download) {
        const details = info.videoDetails;
        const getResource = download ? async () => {
            const path = `./audio/${details.videoId}.webm`;
            return createAudioResource(existsSync(path) ? path : await new Promise((resolve, reject) => {
                const writeStream = createWriteStream(path);
                writeStream.once("finish", () => resolve(path));
                writeStream.once("error", (e) => reject(e));
                ytdl.downloadFromInfo(info, { quality: "highestaudio" }).pipe(writeStream);
            }), { inlineVolume: true });
        } : () => createAudioResource(ytdl.downloadFromInfo(info, { quality: "highestaudio" }), { inlineVolume: true });
        const title = details.title;
        const options = {};
        options.url = details.video_url;
        options.author = { name: details.author.name, url: details.author.channel_url }
        options.thumbnail = details.thumbnails[details.thumbnails.length - 1].url;
        options.duration = ytdl.chooseFormat(info.formats, { quality: "highestaudio" }).approxDurationMs;
        return new Track(getResource, title, options);
    }

    static fromPlaylistItem(item, download) {
        const getResource = download ?
            async () => {
                const path = `./audio/${item.id}.webm`;
                return createAudioResource(existsSync(path) ? path : await new Promise((resolve, reject) => {
                    const writeStream = createWriteStream(path);
                    writeStream.once("finish", () => resolve(path));
                    writeStream.once("error", (e) => reject(e));
                    ytdl(item.id, { quality: "highestaudio" }).pipe(writeStream);
                }), { inlineVolume: true })
            } :
            () => createAudioResource(ytdl(item.id, { quality: "highestaudio" }), { inlineVolume: true });
        const title = item.title;
        const options = {};
        options.url = `https://www.youtube.com/watch?v=${item.id}`;
        options.author = { name: item.videoOwnerChannelTitle, url: `https://www.youtube.com/channel/${item.videoOwnerChannelId}` };
        const thumbnail = item.thumbnails.maxres || item.thumbnails.high || item.thumbnails.standard || item.thumbnails.medium || item.thumbnails.default;
        if (thumbnail)
            options.thumbnail = thumbnail.url;
        options.duration = item.duration * 1000;
        return new Track(getResource, title, options);
    }
}

function getPlayer(id) {
    if (!(id in PLAYERS)) {
        PLAYERS[id] = new Player(id);
        PLAYERS[id].on("error", (error) => {
            console.error(error);
        });
    }
    return PLAYERS[id];
}

export {
    Player,
    Track,
    getPlayer
};