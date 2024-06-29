import { AudioPlayer, AudioResource, VoiceConnection } from "@discordjs/voice";
import { APIEmbed, Snowflake } from "discord.js";
import EventEmitter from "ws";
import ytdl from "ytdl-core";
import { PlaylistItem } from "./innertube";

declare class Player extends EventEmitter.EventEmitter {
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
    nowPlaying: Track;
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

    play(track: Track): Promise<void>;

    pause(): boolean;

    unpause(): boolean;

    skip(): Promise<void>;

    stop(): void;

    enqueue(track: Track): Promise<boolean>;
}

declare class Track<T = unknown> {
    getResource: () => Promise<AudioResource<T>> | AudioResource<T>;
    resource: AudioResource<T> | null;
    title: string;
    url: string | null;
    author: { title: string, url?: string, iconURL?: string } | null;
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
     * Creates a track from YouTube video.
     * 
     * @param info a videoInfo object to construct the track from
     */
    static fromVideoInfo(info: ytdl.videoInfo, download?: boolean): Track<null>;


    static fromPlaylistItem(item: PlaylistItem, download?: boolean): Track<null>;
}

/**
 * Gets the player for the guild with the given id
 * 
 * @param id the guild id to retrieve the player for
 */
declare function getPlayer(id: string): Player;

export {
    Player,
    Track,
    getPlayer
};
