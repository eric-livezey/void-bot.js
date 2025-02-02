import { AudioPlayer, AudioResource, PlayerSubscription, VoiceConnection } from "@discordjs/voice";
import { downloadOptions, videoInfo } from "@distube/ytdl-core";
import { APIEmbed, APIEmbedField, RestOrArray, Snowflake } from "discord.js";
import { EventEmitter } from "events";
import { PlaylistItem } from "./innertube";

declare interface TrackDetails {
    url?: string;
    thumbnail?: string;
    duration?: number;
    author?: {
        name?: string;
        url?: string;
        iconURL?: string
    }
}

declare interface TrackAuthor {
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

/**
 * Represents a track to played by a player.
 */
declare class Track<T = null> {
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
    #resource: Promise<AudioResource<T>> | null;
    #error: Error | null;
    #prepare: () => Promise<AudioResource<T>> | AudioResource<T>;
    /**
     * Returns whether the track has been prepared.
     */
    get prepared(): boolean;
    /**
     * Returns whether the track has been resolved.
     */
    get resolved(): boolean;
    /**
     * Returns the current {@link AudioResource} object for the track if it's been resolved.
     */
    get resource(): AudioResource<T> | null;
    /**
     * @param prepare a function which resolved the {@link AudioResource} to be used
     * @param title the title of the track
     * @param details track details
     */
    constructor(prepare: () => Promise<AudioResource<T>> | AudioResource<T>, title: string, details?: TrackDetails);
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
    toEmbed(...fields: RestOrArray<APIEmbedField>): APIEmbed;
    /**
     * Create a track from a URL. A track created this way will never be downloaded.
     * 
     * @param url a url to an audio file
     * @param title the title of the track
     * @param details track details
     */
    static fromURL(url: URL | string, title?: string, details?: TrackDetails): Track;
    /**
     * Creates a track from a YouTube video ID.
     * 
     * @param id a YouTube video ID
     * @param options ytdl download options
     */
    static fromVideoId(id: string, options?: downloadOptions & { download?: boolean }): Promise<Track>;
    /**
     * Creates a track from a ytdl videoInfo object.
     * 
     * @param info a ytdl videoInfo object
     * @param options ytdl download options
     */
    static fromVideoInfo(info: videoInfo, options?: downloadOptions & { download?: boolean }): Track;
    /**
     * Creates a track from a playlist item.
     * 
     * @param item a playlist item
     * @param options ytdl download options
     */
    static fromPlaylistItem(item: PlaylistItem, options?: downloadOptions & { download?: boolean }): Track;
}

/**
 * Represents a queue of tracks. Ensures that the first track is the queue is always prepared.
 */
declare class Queue<T = null> implements Iterable<Track<T>> {
    #queue: Track<T>[];
    [Symbol.iterator](): ArrayIterator<Track<T>>;
    get length(): number;
    get duration(): number;
    values(): ArrayIterator<Track<T>>;
    push(track: Track<T>): number;
    shift(): Track<T>;
    get(index: number): Track<T>;
    set(index: number, value: Track<T>): void;
    clear(): void;
    shuffle(): void;
    remove(index: number): Track<T>;
    move(src: number, dst: number): void;
}

/**
 * Represents a player for a guild.
 */
declare class Player<T = null> extends EventEmitter {
    /**
     * The id of the guild the player is associated with.
     */
    readonly guildId: Snowflake;
    /**
     * The player's {@link Queue} of tracks.
     */
    readonly queue: Queue<T>;
    #nowPlaying: Track<T> | null;
    #volume: number;
    #loop: boolean;
    #subscription: PlayerSubscription;
    #connection: VoiceConnection;
    #audioPlayer: AudioPlayer[];
    /**
     * The currently playing track.
     */
    get nowPlaying(): Track<T> | null;
    /**
     * The volume.
     */
    get volume(): number;
    set volume(value);
    /**
     * Whether the player should loop the current track.
     */
    get loop(): boolean;
    set loop(value);
    /**
     * The {@link VoiceConnection} the player is subscribed.
     */
    get connection(): VoiceConnection | null;
    set connection(value);
    /**
     * Whether the player is ready to play audio.
     */
    get ready(): boolean;
    /**
     * Whether the player is currently playing a track.
     */
    get playing(): boolean;
    /**
     * Whether the player is paused.
     */
    get paused(): boolean;
    #next(): Promise<void>;
    #play(track: Track<T>): Promise<void>;
    /**
     * Plays a track or pushes it to the queue.
     * 
     * @param track a track
     */
    enqueue(track: Track<T>): Promise<number>;
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
    stop(): boolean;
    /**
     * Skips the current track.
     */
    skip(): Promise<Track<T> | null>;
    getEmbed(page: number): APIEmbed | null;
}

export {
    TrackDetails,
    TrackAuthor,
    Player,
    Queue,
    Track
};