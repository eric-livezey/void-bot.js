import { AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, getVoiceConnection, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import ytdl from '@distube/ytdl-core';
import { EmbedBuilder } from 'discord.js';
import { EventEmitter } from 'events';
import { createWriteStream, existsSync, rmSync } from 'fs';
import { Readable } from 'stream';
import { Duration, nullify } from './utils.js';
import { channelURL, videoURL } from './innertube/index.js';
/**
 * Represents a track to played by a player.
 */
class Track {
    /**
     * The title of the track.
     */
    title;
    /**
     * The URL to the track.
     */
    url;
    /**
     * The URL to the thumbnail image.
     */
    thumbnail;
    /**
     * The track's duration in milliseconds.
     */
    duration;
    /**
     * The track's author's info.
     */
    author;
    #resource;
    #error;
    #prepare;
    /**
     * Returns the current state of the {@link AudioResource} object associated with the track.
     */
    get resource() {
        return this.#resource;
    }
    /**
     * @param prepare A function which resolves an {@link AudioResource} to be used.
     * @param title The title of the track.
     * @param details Track details.
     */
    constructor(prepare, title, details) {
        this.#resource = null;
        this.#error = null;
        this.#prepare = prepare;
        this.title = title;
        if (details === undefined) {
            details = {};
        }
        this.url = nullify(details.url);
        this.thumbnail = nullify(details.thumbnail);
        this.duration = nullify(details.duration);
        this.author = nullify(details.author || {}, 'name', 'url', 'iconURL');
    }
    /**
     * Create a track from a URL. A track created this way will never be downloaded.
     *
     * @param url A url to an audio file.
     * @param title The title of the track.
     * @param details Track details.
     */
    static fromURL(url, title, details) {
        url = new URL(url);
        const prepare = async () => {
            const res = await fetch(url);
            if (!res.body) {
                throw new Error(`Request to ${url} did not return a response body.`);
            }
            const stream = Readable.fromWeb(res.body);
            return createAudioResource(stream, { inlineVolume: true });
        };
        if (title === undefined)
            title = url.pathname.substring(url.pathname.lastIndexOf('/') + 1) || 'Unknown Title';
        if (details === undefined)
            details = {};
        if (details.url === undefined)
            details.url = url.toString();
        return new Track(prepare, title, details);
    }
    /**
     * Creates a track from a ytdl videoInfo object.
     *
     * @param info A ytdl videoInfo object.
     * @param options ytdl download options.
     */
    static fromVideoInfo(info, options) {
        const videoDetails = info.videoDetails;
        const id = videoDetails.videoId;
        const prepare = ytdlPrepare(id, ytdl.downloadFromInfo, info, options);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        const details = {
            url: videoURL(id),
            thumbnail: videoDetails.thumbnails.length > 0 ? videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url : undefined,
            duration: format.approxDurationMs !== undefined ? Number(format.approxDurationMs) : undefined,
            author: {
                name: videoDetails.ownerChannelName,
                url: channelURL(videoDetails.channelId)
            }
        };
        return new Track(prepare, videoDetails.title, details);
    }
    /**
     * Creates a track from a YouTube video ID.
     *
     * @param id A YouTube video ID.
     * @param options ytdl download options.
     */
    static async fromVideoId(id, options) {
        const info = await ytdl.getInfo(id, options);
        return Track.fromVideoInfo(info, options);
    }
    /**
     * Creates a track from a playlist item.
     *
     * @param item A playlist item.
     * @param options ytdl download options.
     */
    static fromPlaylistItem(item, options) {
        const id = item.id;
        const prepare = ytdlPrepare(id, ytdl, id, options);
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
    /**
     * Returns whether the track has been resolved successfully.
     */
    isResolved() {
        return this.resource instanceof AudioResource;
    }
    /**
     * Returns whether the track has been prepared.
     */
    isPrepared() {
        return this.#resource !== null;
    }
    /**
     * Reset the track which allows the audio resource to be created again.
     */
    reset() {
        this.#resource = null;
        this.#error = null;
    }
    /**
     * Prepare the audio resource. If the resource is already being prepared, nothing will happen.
     */
    prepare() {
        if (!this.isPrepared()) {
            this.#resource = new Promise((resolve) => { resolve(this.#prepare()); }).catch((e) => { this.#error = e; return null; });
        }
    }
    /**
     * Resolve the audio resource.
     */
    async resolve() {
        if (this.isResolved()) {
            return this.resource;
        }
        this.prepare();
        this.#resource = await this.resource;
        if (this.#error !== null || !this.isResolved()) {
            throw this.#error || new Error('the resource could not resolved to an AudioResource');
        }
        return this.resource;
    }
    /**
     * Returns a APIEmbed representation of the track.
     *
     * @param fields Additional embed fields.
     */
    toEmbed(...fields) {
        new Date().getSeconds();
        const eb = new EmbedBuilder();
        eb.setTitle(this.title);
        if (this.url !== null) {
            eb.setURL(this.url);
        }
        if (this.author.name !== null) {
            eb.setAuthor({ name: this.author.name, url: this.author.url || undefined, iconURL: this.author.iconURL || undefined });
        }
        if (this.thumbnail !== null) {
            eb.setThumbnail(this.thumbnail);
        }
        if (this.duration !== null || this.isResolved() && this.resource.started) {
            let duration = this.duration !== null ? Duration.format(this.duration) : 'unknown';
            if (this.isResolved() && this.resource.started) {
                duration = `${Duration.format(this.resource.playbackDuration)}/${duration}`;
            }
            eb.addFields({ name: 'Duration', value: duration, inline: true });
        }
        if (fields.length > 0)
            eb.addFields(...fields);
        return eb.toJSON();
    }
}
/**
 * Represents a queue of tracks. Ensures that the first track is the queue is always prepared.
 */
class Queue {
    #queue;
    get length() {
        return this.#queue.length;
    }
    constructor() {
        this.#queue = [];
    }
    [Symbol.iterator]() {
        return this.values();
    }
    values() {
        return this.#queue.values();
    }
    push(value) {
        const length = this.#queue.push(value);
        if (this.#queue.length === 1) {
            value.prepare();
        }
        return length;
    }
    shift() {
        const value = this.#queue.shift();
        if (this.#queue.length > 0) {
            this.#queue[0].prepare();
        }
        return value;
    }
    get(index) {
        if (index < 0 || index >= this.#queue.length) {
            throw new RangeError(`index ${index} is out of bounds`);
        }
        return this.#queue[index];
    }
    set(index, value) {
        if (index < 0 || index >= this.#queue.length) {
            throw new RangeError(`index ${index} is out of bounds`);
        }
        this.#queue[index] = value;
        if (index === 0) {
            value.prepare();
        }
    }
    remove(index) {
        if (index < 0 || index >= this.#queue.length) {
            throw new RangeError(`index ${index} is out of bounds`);
        }
        const value = this.#queue.splice(index, 1)[0];
        if (index === 0 && this.#queue.length > 0) {
            this.#queue[0].prepare();
        }
        return value;
    }
    move(source, destination) {
        if (source < 0 || source >= this.#queue.length) {
            throw new RangeError(`index ${source} is out of bounds`);
        }
        if (destination < 0 || destination >= this.#queue.length) {
            throw new RangeError(`index ${destination} is out of bounds`);
        }
        const value = this.#queue.splice(source, 1)[0];
        this.#queue.splice(destination, 0, value);
        if (source === 0 || destination === 0) {
            this.#queue[0].prepare();
        }
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
        if (this.#queue.length > 0) {
            this.#queue[0].prepare();
        }
    }
    calcDuration() {
        return this.#queue.reduce((pv, cv) => pv + (cv.duration || 0), 0);
    }
}
/**
 * Represents a player for a guild.
 */
class Player extends EventEmitter {
    /**
     * The id of the guild the player is associated with.
     */
    guildId;
    /**
     * The player's {@link Queue} of tracks.
     */
    queue;
    /**
     * Whether the player should loop the current track.
     */
    loop;
    static #players = {};
    #nowPlaying;
    #volume;
    #subscription;
    #connection;
    #audioPlayer;
    /**
     * The currently playing track.
     */
    get nowPlaying() {
        return this.#nowPlaying;
    }
    constructor(guildId) {
        super();
        this.guildId = guildId;
        this.queue = new Queue();
        this.loop = false;
        this.#nowPlaying = null;
        this.#volume = 1;
        this.#connection = null;
        this.#subscription = null;
        const audioPlayer = createAudioPlayer();
        audioPlayer.on(AudioPlayerStatus.Idle, async (oldState) => {
            if (oldState.status !== AudioPlayerStatus.Idle)
                await this.#next().catch((e) => { this.emit('error', e); });
        });
        audioPlayer.on('error', async (e) => {
            this.emit('error', e);
            await this.skip();
        });
        this.#audioPlayer = audioPlayer;
    }
    /**
     * Returns the player associated with `guildId` or creates a new one if one does not yet exist.
     *
     * @param guildId A guild ID.
     */
    static get(guildId) {
        const players = Player.#players;
        if (!(guildId in players)) {
            const player = new Player(guildId);
            player.on('error', (error) => {
                console.error(error);
            });
            players[guildId] = player;
        }
        return players[guildId];
    }
    /**
     * Returns whether the player is ready to play audio.
     */
    isReady() {
        const connection = this.getConnection();
        return connection !== null && connection.state.status !== VoiceConnectionStatus.Destroyed && connection.state.status !== VoiceConnectionStatus.Disconnected;
    }
    /**
     * Returns whether the player is currently playing a track.
     */
    isPlaying() {
        return this.nowPlaying !== null;
    }
    /**
     * Returns whether the player is paused.
     */
    isPaused() {
        return this.#audioPlayer.state.status === AudioPlayerStatus.Paused;
    }
    /**
     * Returns the volume of the player.
     */
    getVolume() {
        return this.#volume;
    }
    /**
     * Set the volume of the player.
     *
     * @param value A percentage.
     */
    setVolume(value) {
        if (value < 0) {
            throw new RangeError('volume must be a positive number');
        }
        this.#volume = value;
        if (this.isPlaying() && this.nowPlaying.isResolved() && this.nowPlaying.resource.volume !== undefined) {
            this.nowPlaying.resource.volume.setVolume(value);
        }
    }
    /**
     * Returns the {@link VoiceConnection} the player is subscribed.
     */
    getConnection() {
        if (this.#connection === null || this.#connection.state.status === VoiceConnectionStatus.Destroyed) {
            this.setConnection(getVoiceConnection(this.guildId) || null);
        }
        return this.#connection;
    }
    /**
     * Set the {@link VoiceConnection} the player should be subscribed to.
     *
     * @param value
     */
    setConnection(value) {
        if (this.#subscription !== null) {
            this.#subscription.unsubscribe();
        }
        if (value === null || value.state?.status === VoiceConnectionStatus.Destroyed || value.state?.status === VoiceConnectionStatus.Disconnected) {
            this.stop();
        }
        else if (value instanceof VoiceConnection) {
            this.setConnection(null);
            this.#subscription = value.subscribe(this.#audioPlayer);
            value.on('stateChange', (_oldState, newState) => {
                if (newState.status === VoiceConnectionStatus.Destroyed || newState.status === VoiceConnectionStatus.Disconnected) {
                    this.stop();
                }
            });
            value.on('error', (e) => {
                this.stop();
                this.emit('error', e);
            });
        }
        else {
            throw new TypeError('connection must be an instance of VoiceConnection or null');
        }
        this.#connection = value;
    }
    /**
     * Plays a track or pushes it to the queue.
     *
     * @param track A track.
     */
    async enqueue(track) {
        if (!this.isPlaying()) {
            return await this.#play(track).then(() => 0).catch(() => -1);
        }
        return this.queue.push(track);
    }
    /**
     * Pauses the player.
     */
    pause() {
        if (this.isPlaying() && !this.isPaused()) {
            if (this.#audioPlayer.pause()) {
                return true;
            }
            else {
                throw new Error('failed to pause the track');
            }
        }
        return false;
    }
    /**
     * Unpauses the player.
     */
    unpause() {
        if (this.isPlaying() && this.isPaused()) {
            if (this.#audioPlayer.unpause()) {
                return true;
            }
            else {
                throw new Error('failed to unpause the track');
            }
        }
        return false;
    }
    /**
     * Stops the player and clears the queue.
     */
    stop() {
        this.queue.clear();
        this.loop = false;
        this.#nowPlaying = null;
        this.#audioPlayer.stop(true);
    }
    /**
     * Skips the current track.
     */
    async skip() {
        this.loop = false;
        const track = this.nowPlaying;
        await this.#next();
        return track;
    }
    /**
     * Destroys the player.
     */
    destroy() {
        this.stop();
        delete Player.#players[this.guildId];
    }
    getEmbed(page) {
        const n = Math.max(Math.ceil(this.queue.length / 25) - 1, 0);
        if (page < 0 || n > 0 && page > n || !Number.isSafeInteger(page))
            throw new RangeError(`page ${page} is invalid`);
        if (!this.isPlaying())
            return null;
        if (this.queue.length === 0)
            return this.nowPlaying.toEmbed();
        const eb = new EmbedBuilder();
        if (page === 0) {
            const { title, url, description } = this.nowPlaying.toEmbed();
            eb.setAuthor({ name: 'Now Playing:' });
            if (title !== undefined)
                eb.setTitle(title);
            if (url !== undefined)
                eb.setURL(url);
            if (description !== undefined)
                eb.setDescription(description);
        }
        for (var i = page * 25; i < this.queue.length && i < (page + 1) * 25; i++) {
            const track = this.queue.get(i);
            eb.addFields({
                name: ' ',
                value: `**${i + 1}: ${track.url ? `[${track.title}](${track.url})` : track.title}**\n${track.duration !== null ? Duration.format(track.duration) : ''}`
            });
        }
        const duration = (this.nowPlaying.duration || 0) + this.queue.calcDuration();
        eb.setFooter({ text: `${this.queue.length + 1} items (${Duration.format(duration)})${this.queue.length > 25 ? `\nPage ${page + 1}/${n + 1}` : ''}` });
        return eb.toJSON();
    }
    async #next() {
        if (this.#audioPlayer.state.status !== AudioPlayerStatus.Idle) {
            this.#audioPlayer.stop(true);
            return;
        }
        if (this.loop && this.isPlaying()) {
            this.nowPlaying.reset();
            await this.#play(this.nowPlaying).catch(() => this.skip());
        }
        else {
            const track = this.queue.shift();
            if (track) {
                await this.#play(track).catch(() => this.skip());
            }
            else {
                this.stop();
            }
        }
    }
    // queue concurrent calls to #play()
    #playQueue = Promise.resolve();
    async #play(track) {
        return await this.#playQueue.then(this.#playImpl.bind(this, track));
    }
    async #playImpl(track) {
        if (!this.isReady()) {
            this.stop();
            throw new Error('the audio connection was invalidated');
        }
        this.#nowPlaying = track;
        let resource = null;
        try {
            resource = await track.resolve();
        }
        catch (e) {
            this.#nowPlaying = null;
            throw e;
        }
        if (resource.volume) {
            resource.volume.setVolume(this.getVolume());
        }
        this.#audioPlayer.play(resource);
        if (this.isPaused()) {
            this.unpause();
        }
    }
}
// keep track of in progress downloads
const downloads = {};
function downloadFromStream(stream, path, id) {
    if (id in downloads) {
        // return in progress downloads
        return downloads[id];
    }
    else {
        return downloads[id] = new Promise((resolve, reject) => {
            const writeStream = createWriteStream(path);
            // cleanly reject errors and remove the file
            function error(reason) {
                try {
                    writeStream.close();
                    rmSync(path);
                }
                catch (e) {
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
            writeStream.once('finish', () => {
                clearTimeout(timeout);
                if (writeStream.bytesWritten === 0)
                    error(`error on download ${id}: the write stream didn't write any data`);
                delete downloads[id];
                resolve(path);
            });
            writeStream.once('error', (e) => {
                clearTimeout(timeout);
                error(e);
            });
            stream.pipe(writeStream);
        });
    }
}
function ytdlPrepare(id, fn, arg, options) {
    options = { quality: 'highestaudio', ...options };
    if (options?.download) {
        const path = `./audio/${id}.webm`;
        return async function prepare() {
            if (existsSync(path)) {
                return createAudioResource(path, { inlineVolume: true });
            }
            else {
                return createAudioResource(await downloadFromStream(fn(arg, options), path, id), { inlineVolume: true });
            }
        };
    }
    else {
        return function prepare() {
            return createAudioResource(fn(arg, options), { inlineVolume: true });
        };
    }
}
export { Player, Queue, Track, downloadFromStream };