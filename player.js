import { AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, getVoiceConnection, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import ytdl from "@distube/ytdl-core";
import { EmbedBuilder } from "discord.js";
import { EventEmitter } from "events";
import { createWriteStream, existsSync, rmSync } from "fs";
import { Readable } from "stream";
import { formatDurationMillis } from "./utils.js";
import { channelURL, videoURL } from "./innertube/index.js";

// keep track of in-progress downloads
const downloads = {};

function download(stream, path, id) {
    if (id in downloads)
        // return in progress downloads
        return downloads[id];
    else
        return downloads[id] = new Promise((resolve, reject) => {
            const writeStream = createWriteStream(path);
            // cleanly reject errors and remove the file
            function error(reason) {
                try {
                    writeStream.close();
                    rmSync(path);
                } catch (e) {
                    delete downloads[id];
                    reject(e);
                }
                delete downloads[id];
                reject(reason);
            }
            // timeout
            let timeout = setTimeout(() => {
                if (writeStream.bytesWritten === 0)
                    error(`error on download ${id}: timed out after 10 seconds`);
            }, 10000);
            writeStream.once("finish", () => {
                clearTimeout(timeout);
                if (writeStream.bytesWritten === 0)
                    error(`error on download ${id}: the write stream didn't write any data`);
                delete downloads[id];
                resolve(path);
            });
            writeStream.once("error", (e) => {
                clearTimeout(timeout);
                error(e);
            });
            stream.pipe(writeStream);
        });
}

function ytdlPrepare(id, options, fn, arg) {
    if (options === undefined)
        options = {};
    return options.download ? async function prepare() {
        const path = `./audio/${id}.webm`;
        if (existsSync(path))
            return createAudioResource(path, { inlineVolume: true });
        else
            return createAudioResource(await download(fn(arg, { quality: "highestaudio", ...options }), path, id), { inlineVolume: true });
    } : function prepare() {
        return createAudioResource(fn(arg, { quality: "highestaudio", ...options }));
    }
}

class Track {
    #resource;
    #error;
    #prepare;
    get prepared() {
        return this.#resource !== null;
    }
    get resolved() {
        return this.#resource instanceof AudioResource;
    }
    get resource() {
        return this.resolved ? this.#resource : null;
    }
    constructor(prepare, title, details) {
        this.#resource = null;
        this.#error = null;
        if (typeof prepare !== "function")
            throw new TypeError("prepare must be a function")
        this.#prepare = prepare;
        if (typeof title !== "string")
            throw new TypeError("title must be a string");
        Object.defineProperty(this, "title", { value: title, enumerable: true });
        if (details === undefined)
            details = {};
        if (!(details instanceof Object))
            throw new TypeError("details must be an instance of Object or undefined");
        if (typeof details.url !== "string" && details.url !== undefined)
            throw new TypeError("details.url must be a string or undefined");
        Object.defineProperty(this, "url", { value: details.url === undefined ? null : details.url, enumerable: true });
        if (typeof details.thumbnail !== "string" && details.thumbnail !== undefined)
            throw new TypeError("details.thumbnail must be a string or undefined");
        Object.defineProperty(this, "thumbnail", { value: details.thumbnail === undefined ? null : details.thumbnail, enumerable: true });
        if (typeof details.duration !== "number" && details.duration !== undefined)
            throw new TypeError("details.duration must be a number or undefined");
        Object.defineProperty(this, "duration", { value: details.duration === undefined ? null : details.duration, enumerable: true });
        if (details.author === undefined)
            details.author = {};
        if (!(details.author instanceof Object))
            throw new TypeError("details.author must be an instance of Object or undefined");
        const author = {};
        if (typeof details.author.name !== "string" && details.author.name !== undefined)
            throw TypeError("details.author.name must be a string or undefined");
        Object.defineProperty(author, "name", { value: details.author.name === undefined ? null : details.author.name, enumerable: true });
        if (typeof details.author.url !== "string" && details.author.url !== undefined)
            throw TypeError("details.author.url must be a string or undefined");
        Object.defineProperty(author, "url", { value: details.author.url === undefined ? null : details.author.url, enumerable: true });
        if (typeof details.author.iconURL !== "string" && details.author.iconURL !== undefined)
            throw TypeError("details.author.iconURL must be a string or undefined");
        Object.defineProperty(author, "iconURL", { value: details.author.iconURL === undefined ? null : details.author.iconURL, enumerable: true });
        Object.defineProperty(this, "author", { value: author, enumerable: true });
    }
    reset() {
        this.#resource = null;
        this.#error = null;
    }
    prepare() {
        if (!this.prepared)
            this.#resource = new Promise((resolve) => { resolve(this.#prepare()) }).catch((e) => { this.#error = e; return null; });
    }
    async resolve() {
        if (this.resolved)
            return this.#resource;
        this.prepare();
        this.#resource = await this.#resource;
        if (this.#error !== null)
            throw this.#error;
        if (!(this.#resource instanceof AudioResource))
            throw TypeError("prepare must return an instance of AudioResource");
        return this.#resource;
    }
    toEmbed(...fields) {
        const eb = new EmbedBuilder();
        eb.setTitle(this.title);
        if (this.url !== null)
            eb.setURL(this.url);
        if (this.author.name !== null)
            eb.setAuthor({ name: this.author.name || undefined, url: this.author.url || undefined, iconURL: this.author.iconURL || undefined });
        if (this.thumbnail !== null)
            eb.setThumbnail(this.thumbnail);
        if (this.duration !== null) {
            let duration = formatDurationMillis(this.duration);
            if (this.resource !== null && this.resource.started)
                duration = `${formatDurationMillis(this.resource.playbackDuration)}/${duration}`;
            eb.addFields({ name: "Duration", value: duration, inline: true });
        }
        eb.addFields(fields || []);
        return eb.toJSON();
    }
    static fromURL(url, title, details) {
        if (typeof url === "string")
            url = new URL(url);
        if (!(url instanceof URL))
            throw new TypeError("url must be an instance of URL or a string");
        const prepare = async () => createAudioResource(Readable.fromWeb((await fetch(url)).body), { inlineVolume: true });
        if (title === undefined)
            title = url.pathname.substring(url.pathname.lastIndexOf('/') + 1) || "Unknown Title";
        if (typeof title !== "string")
            throw new TypeError("title must be a string or undefined");
        if (details === undefined)
            details = {};
        if (!(details instanceof Object))
            throw new TypeError("details must be an instanceof Object or undefined");
        if (details.url === undefined)
            details.url = url.toString();
        return new Track(prepare, title, details);
    }
    static async fromVideoId(id, options) {
        const info = await ytdl.getInfo(id, options);
        return Track.fromVideoInfo(info, options);
    }
    static fromVideoInfo(info, options) {
        const videoDetails = info.videoDetails;
        const id = videoDetails.videoId;
        const prepare = ytdlPrepare(id, options, ytdl.downloadFromInfo, info);
        const format = ytdl.chooseFormat(info.formats, { quality: "highestaudio" });
        const details = {
            url: videoURL(id),
            thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url,
            duration: format.approxDurationMs !== undefined ? Number(format.approxDurationMs) : undefined,
            author: {
                name: videoDetails.ownerChannelName,
                url: channelURL(videoDetails.channelId)
            }
        }
        return new Track(prepare, videoDetails.title, details);
    }
    static fromPlaylistItem(item, options) {
        const id = item.id;
        const prepare = ytdlPrepare(id, options, ytdl, id);
        const details = {
            url: videoURL(id),
            thumbnail: item.thumbnails.maxres?.url,
            duration: item.duration * 1000,
            author: {
                name: item.videoOwnerChannelTitle,
                url: channelURL(item.videoOwnerChannelId)
            }
        };
        return new Track(prepare, item.title, details);
    }
}

class Queue {
    #queue;
    get length() {
        return this.#queue.length;
    }
    get duration() {
        return this.#queue.reduce((pv, cv) => pv + cv.duration, 0);
    }
    constructor() {
        this[Symbol.iterator] = this.values;
        this.#queue = [];
    }
    values(...[value]) {
        return this.#queue.values(...[value]);
    }
    push(value) {
        if (!(value instanceof Track))
            throw new TypeError("value must be an instance of Track");
        const length = this.#queue.push(value);
        if (this.#queue.length === 1)
            value.prepare();
        return length;
    }
    shift() {
        const value = this.#queue.shift();
        if (this.#queue.length > 0)
            this.#queue[0].prepare();
        return value;
    }
    get(index) {
        if (typeof index !== "number")
            throw new TypeError("index must be a number");
        if (index < 0 || index >= this.#queue.length)
            throw new RangeError(`index ${index} is out of bounds`);
        return this.#queue[index];
    }
    set(index, value) {
        if (typeof index !== "number")
            throw new TypeError("index must be a number");
        if (!(value instanceof Track))
            throw new TypeError("value must be an instance of Track");
        if (index < 0 || index >= this.#queue.length)
            throw new RangeError(`index ${index} is out of bounds`);
        if (index)
            this.#queue[index] = value;
        if (index === 0)
            value.prepare();
    }
    remove(index) {
        if (typeof index !== "number")
            throw new TypeError("index must be a number");
        if (index < 0 || index >= this.#queue.length)
            throw new RangeError(`index ${index} is out of bounds`);
        const value = this.#queue.splice(index, 1)[0];
        if (index === 0 && this.#queue.length > 0)
            this.#queue[0].prepare();
        return value;
    }
    move(source, destination) {
        if (typeof source !== "number")
            throw new TypeError("source must be a number");
        if (typeof destination !== "number")
            throw new TypeError("destination must be a number");
        if (source < 0 || source >= this.#queue.length)
            throw new RangeError(`index ${source} is out of bounds`);
        if (destination < 0 || destination >= this.#queue.length)
            throw new RangeError(`index ${destination} is out of bounds`);
        const value = this.#queue.splice(source, 1)[0];
        this.#queue.splice(destination, 0, value);
        if (source === 0 || destination === 0)
            this.#queue[0].prepare();
    }
    clear() {
        this.#queue.splice(0);
    }
    shuffle() {
        let currentIndex = this.#queue.length, randomIndex = -1;
        while (currentIndex > 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [this.#queue[currentIndex], this.#queue[randomIndex]] = [this.#queue[randomIndex], this.#queue[currentIndex]];
        }
        if (this.#queue.length > 0)
            this.#queue[0].prepare();
    }
}

class Player extends EventEmitter {
    #nowPlaying
    #volume;
    #loop;
    #connection;
    #audioPlayer;
    #subscription;
    get nowPlaying() {
        return this.#nowPlaying;
    }
    get volume() {
        return this.#volume;
    }
    set volume(value) {
        if (typeof value !== "number" || value < 0)
            throw new TypeError("volume must be a positive number");
        this.#volume = value;
        if (this.playing && this.nowPlaying.resource.volume !== undefined)
            this.nowPlaying.resource.volume.setVolume(value);
    }
    get loop() {
        return this.#loop;
    }
    set loop(value) {
        if (typeof value !== "boolean")
            throw new TypeError("loop must be a boolean");
        this.#loop = value;
    }
    get connection() {
        if (this.#connection === null || this.#connection.state.status === VoiceConnectionStatus.Destroyed)
            this.connection = getVoiceConnection(this.guildId) || null;
        return this.#connection;
    }
    set connection(value) {
        if (this.#subscription !== null)
            this.#subscription.unsubscribe();
        if (value === null || value.state?.status === VoiceConnectionStatus.Destroyed || value.state?.status === VoiceConnectionStatus.Disconnected) {
            this.stop();
        } else if (value instanceof VoiceConnection) {
            this.connection = null;
            this.#subscription = value.subscribe(this.#audioPlayer);
            value.on("stateChange", (_oldState, newState) => {
                if (newState.status === VoiceConnectionStatus.Destroyed || newState.status === VoiceConnectionStatus.Disconnected)
                    this.stop();
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
    get ready() {
        const connection = this.connection;
        return this.connection !== null && connection.state.status !== VoiceConnectionStatus.Destroyed && connection.state.status !== VoiceConnectionStatus.Disconnected;
    }
    get playing() {
        return this.nowPlaying !== null;
    }
    get paused() {
        return this.#audioPlayer.state.status === AudioPlayerStatus.Paused;
    }
    constructor(guildId) {
        super();
        if (typeof guildId === "string")
            Object.defineProperty(this, "guildId", { value: guildId, enumerable: true });
        else
            throw new TypeError("guildId must be a string");
        Object.defineProperty(this, "queue", { value: new Queue(), enumerable: true });
        this.#nowPlaying = null;
        this.#volume = 1;
        this.#loop = false;
        this.#connection = null;
        this.#subscription = null;
        const audioPlayer = createAudioPlayer();
        audioPlayer.on(AudioPlayerStatus.Idle, async (oldState) => {
            if (oldState.status !== AudioPlayerStatus.Idle)
                await this.#next().catch((e) => { this.emit("error", e); });
        });
        audioPlayer.on("error", async (e) => {
            this.emit("error", e);
            await this.skip();
        });
        this.#audioPlayer = audioPlayer;
    }
    async #next() {
        if (this.#audioPlayer.state.status !== AudioPlayerStatus.Idle) {
            this.#audioPlayer.stop(true);
            return;
        }
        if (this.loop && this.playing) {
            this.nowPlaying.reset();
            await this.#play(this.nowPlaying).catch(this.skip);
        }
        else if (this.queue.length > 0)
            await this.#play(this.queue.shift()).catch(this.skip);
        else
            this.stop();
    }
    async #play(track) {
        if (!this.ready) {
            this.stop();
            throw new Error("the audio connection was invalidated");
        }
        this.#nowPlaying = track;
        let resource = null;
        try {
            resource = await track.resolve();
        } catch (e) {
            this.#nowPlaying = null;
            throw e;
        }
        if (resource.volume !== undefined)
            resource.volume.setVolume(this.volume);
        this.#audioPlayer.play(track.resource);
        if (this.paused)
            this.unpause();
    }
    async enqueue(track) {
        if (!this.playing) {
            return await this.#play(track).then(() => 0).catch(() => -1);
        }
        return this.queue.push(track);
    }
    pause() {
        if (this.playing && !this.paused)
            if (this.#audioPlayer.pause())
                return true;
            else
                throw new Error("failed to pause the track");
        return false;
    }
    unpause() {
        if (this.playing && this.paused)
            if (this.#audioPlayer.unpause())
                return true;
            else
                throw new Error("failed to unpause the track");
        return false;
    }
    stop() {
        this.queue.clear();
        this.loop = false;
        this.#nowPlaying = null;
        this.#audioPlayer.stop(true);
    }
    async skip() {
        this.loop = false;
        const track = this.nowPlaying;
        await this.#next();
        return track;
    }
    getEmbed(page) {
        if (typeof page !== "number")
            throw new TypeError("page must be an integer");
        const n = Math.max(Math.ceil(this.queue.length / 25) - 1, 0);
        if (page < 0 || n > 0 && page > n || !Number.isSafeInteger(page))
            throw new RangeError(`page ${page} is invalid`);
        if (!this.playing)
            return null;
        if (this.queue.length === 0)
            return this.nowPlaying.toEmbed();
        const eb = new EmbedBuilder();
        if (page === 0) {
            const { title, url, description } = this.nowPlaying.toEmbed();
            eb.setAuthor({ name: "Now Playing:" });
            if (title !== undefined)
                eb.setTitle(title);
            if (url !== undefined)
                eb.setURL(url);
            if (description !== undefined)
                eb.setDescription(description);
        }
        for (var i = page * 25; i < this.queue.length && i < (page + 1) * 25; i++) {
            const track = this.queue.get(i);
            eb.addFields({ name: " ", value: `**${i + 1}: ${track.url ? `[${track.title}](${track.url})` : track.title}**\n${formatDurationMillis(track.duration)}` });
        }
        const duration = this.nowPlaying.duration + this.queue.duration;
        eb.setFooter({ text: `${this.queue.length + 1} items (${formatDurationMillis(duration)})${this.queue.length > 25 ? `\nPage ${page + 1}/${n + 1}` : ""}` });
        return eb.toJSON();
    }
}

export {
    Player,
    Queue,
    Track
};