import { AudioPlayer, AudioResource, VoiceConnection } from "@discordjs/voice";
import { APIEmbed, Snowflake } from "discord.js";
import { EventEmitter } from "events";
import ytdl from "@distube/ytdl-core";
import { PlaylistItem } from "./innertube";

declare class Player extends EventEmitter {
    /**
     * The id of guild which the player is for
     */
    readonly id: Snowflake;
    /**
     * The AudioPlayer this player uses
     */
    readonly player: AudioPlayer;
    /**
     * The voice connection the player is currently subscribed to.
     */
    get connection(): VoiceConnection | null;
    set connection(value);
    /**
     * The currently playing track
     */
    nowPlaying: Omit<Track, "resource"> & { resource: AudioResource<unknown> };
    /**
     * A list of tracks in the queue
     */
    queue: Track[];
    /**
     * Whether player should loop the current track
     */
    loop: boolean;
    /**
     * The volume of the player
     */
    get volume(): number;
    set volume(value);
    /**
     * Whether the player is ready to play audio
     */
    get isReady(): boolean;
    /**
     * Whether the player is currently playing audio
     */
    get isPlaying(): boolean;
    /**
     * Whether the player is currently paused
     */
    get isPaused(): boolean;

    /**
     * @param id Guild ID
     */
    constructor(id: Snowflake);

    #next(): Promise<void>;

    /**
     * Plays a track.
     * 
     * @param track the track to play 
     */
    play(track: Track): Promise<void>;

    /**
     * Pauses the currently playing track. Returns whether the player was successfully paused.
     */
    pause(): boolean;

    /**
     * Unpauses the currently playing track. Returns whether the player was successfully unpaused.
     */
    unpause(): boolean;

    /**
     * Skips the current track.
     */
    skip(): Promise<void>;

    /**
     * Stops the current track and clears the queue.
     */
    stop(): void;

    /**
     * Enqueue a track. If nothing is playing, it will played immediately, otherwise it will be added to the queue.
     * 
     * @param track the track to enqueue
     */
    enqueue(track: Track): Promise<boolean>;
}

declare class Track<T = unknown> {
    /**
     * A function which gets a new audio resource to play
     */
    getResource: () => Promise<AudioResource<T>> | AudioResource<T>;
    /**
     * The audio resource, if any
     */
    resource: Promise<AudioResource<T>> | AudioResource<T> | null;
    /**
     * The title of the track
     */
    title: string;
    /**
     * The url to embed in the track's title
     */
    url: string | null;
    /**
     * Data about the author of the track
     */
    author: { title: string, url?: string, iconURL?: string } | null;
    /**
     * The url to a thumbnail for the track
     */
    thumbnail: string | null;
    /**
     * The duration of the track is milliseconds
     */
    duration: number | null;

    /**
     * @param getResource a function which returns an audio resource to play
     * @param title the title of the track
     * @param options additional info about the track
     */
    constructor(getResource: () => Promise<AudioResource<T>> | AudioResource<T>, title: string, options?: { url?: string, author?: { title: string, url?: string, iconURL?: string }, thumbnail?: string, duration?: number });

    /**
     * Returns an Embed reprentation of this track
     */
    toEmbed(): APIEmbed;

    /**
     * Creates a track from a URL.
     * 
     * @param url a url to create the track from
     * @param title the title of the track, if no title is provided it will taken from the last part of the pathname
     * @param options additional info about the track
     */
    static fromURL(url: string | URL, title?: string, options?: { url?: string, author?: { title: string, url?: string, iconURL?: string }, thumbnail?: string, duration?: number }): Track<null>;

    /**
     * Creates a track from YouTube video.
     * 
     * @param info a videoInfo object to construct the track from
     * @param download whether the track should be downloaded
     */
    static fromVideoInfo(info: ytdl.videoInfo, agent: ytdl.Agent, download?: boolean): Track<null>;

    /**
     * Creates a track from a playlist item.
     * 
     * @param item a PlaylistItem to construct the track from
     * @param download whether the track should be downloaded
     */
    static fromPlaylistItem(item: PlaylistItem, agent: ytdl.Agent, download?: boolean): Track<null>;
}

/**
 * Gets the player for the guild with the given id
 * 
 * @param id the guild id to retrieve the player for
 */
declare function getPlayer(id: string): Player;

export {
    Player,
    Track, getPlayer
};