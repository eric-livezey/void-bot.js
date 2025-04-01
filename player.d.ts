import { AudioResource, VoiceConnection } from '@discordjs/voice';
import { downloadOptions, videoInfo } from '@distube/ytdl-core';
import { APIEmbedField, RestOrArray, Snowflake } from 'discord.js';
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { PlaylistItem } from './innertube';
type PrepareOptions<T extends downloadOptions = downloadOptions> = T & {
    download?: boolean;
};
interface TrackAuthor {
    /**
     * Author name
     */
    readonly name: string | null;
    /**
     * URL to author
     */
    readonly url: string | null;
    /**
     * URL to author icon
     */
    readonly iconURL: string | null;
}
interface TrackOptions {
    url?: string;
    thumbnail?: string;
    duration?: number;
    author?: {
        -readonly [P in keyof TrackAuthor]?: TrackAuthor[P];
    };
}
/**
 * Represents a track to played by a player.
 */
declare class Track<T = unknown> {
    #private;
    /**
     * The title of the track
     */
    readonly title: string;
    /**
     * The URL to the track
     */
    readonly url: string | null;
    /**
     * The URL to the thumbnail image
     */
    readonly thumbnail: string | null;
    /**
     * The track's duration in milliseconds
     */
    readonly duration: number | null;
    /**
     * The track's author's info
     */
    readonly author: TrackAuthor;
    /**
     * Returns the current state of the {@link AudioResource} object associated with the track.
     */
    get resource(): AudioResource<T> | Promise<AudioResource<T>>;
    /**
     * @param prepare a function which resolves an {@link AudioResource} to be used
     * @param title the title of the track
     * @param details track details
     */
    constructor(prepare: () => Promise<AudioResource<T>> | AudioResource<T>, title: string, details?: TrackOptions);
    /**
     * Create a track from a URL. A track created this way will never be downloaded.
     *
     * @param url a url to an audio file
     * @param title the title of the track
     * @param details track details
     */
    static fromURL(url: URL | string, title?: string, details?: TrackOptions): Track<null>;
    /**
     * Creates a track from a ytdl videoInfo object.
     *
     * @param info a ytdl videoInfo object
     * @param options ytdl download options
     */
    static fromVideoInfo(info: videoInfo, options?: PrepareOptions): Track<null>;
    /**
     * Creates a track from a YouTube video ID.
     *
     * @param id a YouTube video ID
     * @param options ytdl download options
     */
    static fromVideoId(id: string, options?: PrepareOptions): Promise<Track<null>>;
    /**
     * Creates a track from a playlist item.
     *
     * @param item a playlist item
     * @param options ytdl download options
     */
    static fromPlaylistItem(item: PlaylistItem, options?: PrepareOptions): Track<null>;
    /**
     * Returns whether the track has been resolved successfully.
     */
    isResolved(): this is this & {
        resource: AudioResource<T>;
    };
    /**
     * Returns whether the track has been prepared.
     */
    isPrepared(): this is this & {
        resource: Promise<AudioResource<T> | null> | AudioResource<T>;
    };
    /**
     * Reset the track which allows the audio resource to be created again.
     */
    reset(): void;
    /**
     * Prepare the audio resource. If the resource is already being prepared, nothing will happen.
     */
    prepare(): void;
    /**
     * Resolve the audio resource.
     */
    resolve(): Promise<AudioResource<T>>;
    /**
     * Returns a APIEmbed representation of the track.
     *
     * @param fields additional embed fields
     */
    toEmbed(...fields: RestOrArray<APIEmbedField>): import("discord.js").APIEmbed;
}
/**
 * Represents a queue of tracks. Ensures that the first track is the queue is always prepared.
 */
declare class Queue implements Iterable<Track> {
    #private;
    get length(): number;
    constructor();
    [Symbol.iterator](): ArrayIterator<Track<unknown>>;
    values(): ArrayIterator<Track<unknown>>;
    push(value: Track): number;
    shift(): Track;
    get(index: number): Track<unknown>;
    set(index: number, value: Track): void;
    remove(index: number): Track<unknown>;
    move(source: number, destination: number): void;
    clear(): void;
    shuffle(): void;
    calcDuration(): number;
}
/**
 * Represents a player for a guild.
 */
declare class Player extends EventEmitter {
    #private;
    /**
     * The id of the guild the player is associated with.
     */
    readonly guildId: Snowflake;
    /**
     * The player's {@link Queue} of tracks.
     */
    readonly queue: Queue;
    /**
     * Whether the player should loop the current track.
     */
    loop: boolean;
    /**
     * The currently playing track.
     */
    get nowPlaying(): Track<unknown>;
    private constructor();
    /**
     * Returns the player associated with `guildId` or creates a new one if one does not yet exist.
     *
     * @param guildId A guild ID
     */
    static get(guildId: Snowflake): Player;
    /**
     * Whether the player is ready to play audio.
     */
    isReady(): this is this & {
        connection: VoiceConnection;
    };
    /**
     * Returns whether the player is currently playing a track.
     */
    isPlaying(): this is this & {
        nowPlaying: Track;
    };
    /**
     * Whether the player is paused.
     */
    isPaused(): boolean;
    /**
     * Return the volume of the player.
     */
    getVolume(): number;
    /**
     * Set the volume of the player.
     *
     * @param value a percentage
     */
    setVolume(value: number): void;
    /**
     * Returns the {@link VoiceConnection} the player is subscribed.
     */
    getConnection(): VoiceConnection | null;
    /**
     * Set the {@link VoiceConnection} the player should be subscribed to.
     *
     * @param value
     */
    setConnection(value: VoiceConnection | null): void;
    /**
     * Plays a track or pushes it to the queue.
     *
     * @param track a track
     */
    enqueue(track: Track): Promise<number>;
    /**
     * Pauses the player.
     */
    pause(): boolean;
    /**
     * Unpauses the player.
     */
    unpause(): boolean;
    /**
     * Stops the player and clears the queue.
     */
    stop(): void;
    /**
     * Skips the current track.
     */
    skip(): Promise<Track<unknown>>;
    getEmbed(page: number): import("discord.js").APIEmbed;
}
declare function downloadFromStream(stream: Readable, path: string, id: string): Promise<string>;
export { Player, Queue, Track, TrackAuthor, TrackOptions, downloadFromStream };