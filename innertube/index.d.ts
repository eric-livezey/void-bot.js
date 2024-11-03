import { RawBrowseData, RawChannelData, RawPlayerData, RawPlaylistItemData, RawSearchData, RawSearchResultData } from "./rawTypes";
import ytdl from "@distube/ytdl-core"; 

interface Thumbnail {
    /**
     * The image's URL.
     */
    url: string;
    /**
     * The image's width.
     */
    width: number;
    /**
     * The image's height.
     */
    height: number;
}

interface Thumbnails {
    /**
     * The default thumbnail image. The default thumbnail for a video – or a resource that refers to a video such as a playlist item or search result – is 120px wide and 90px tall. The default thumbnail for a channel is 88px wide and 88px tall.
     */
    default?: Thumbnail;
    /**
     * A higher resolution version of the thumbnail image. For a video (or a resource that refers to a video) this image is 320px wide and 180px tall. For a channel this image is 240px wide and 240px tall.
     */
    medium?: Thumbnail;
    /**
     * A high resolution version of the thumbnail image. For a video (or a resource that refers to a video) this image is 480px wide and 360px tall. For a channel this image is 800px wide and 800px tall.
     */
    high?: Thumbnail;
    /**
     * An even higher resolution version of the thumbnail image than the `high` resolution image. This image is available for some videos and other resources that refer to videos like playlist items or search results. This image is 640px wide and 480px tall.
     */
    standard?: Thumbnail;
    /**
     * The highest resolution version of the thumbnail image. This image size is available for some videos and other resources that refer to videos like playlist items or search results. This image is 1280px wide and 720px tall.
     */
    maxres?: Thumbnail;
}

/**
 * Specifies a type of search result.
 */
declare enum SearchResultType {
    /**
     * Video search results.
     */
    VIDEO = 0,
    /**
     * Channel search results.
     */
    CHANNEL = 1,
    /**
     * Playlist search results.
     */
    PLAYLIST = 2
}

/**
 * A `video` resource represents a YouTube video.
 */
declare class Video {
    /**
     * The ID that YouTube uses to uniquely identify the video.
     */
    id?: string;
    /**
     * The date and time that the video was published. Note that this time might be different than the time that the video was uploaded. For example, if a video is uploaded as a private video and then made public at a later time, this property will specify the time that the video was made public.
     * 
     * There are a couple of special cases:
     * - If a video is uploaded as a private video and the video metadata is retrieved by the channel owner, then the property value specifies the date and time that the video was uploaded.
     * - If a video is uploaded as an unlisted video, the property value also specifies the date and time that the video was uploaded. In this case, anyone who knows the video's unique video ID can retrieve the video metadata.
     */
    publishedAt?: Date;
    /**
     * The ID that YouTube uses to uniquely identify the channel that the video was uploaded to.
     */
    channelId?: string;
    /**
     * The video's title. The property value has a maximum length of 100 characters and may contain all valid UTF-8 characters except `<` and `>`.
     */
    title?: string;
    /**
     * The video's description. The property value has a maximum length of 5000 bytes and may contain all valid UTF-8 characters except `<` and `>`.
     */
    description?: string;
    /**
     * A map of thumbnail images associated with the video. For each object in the map, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail.
     */
    thumbnails?: Thumbnails;
    /**
     * Channel title for the channel that the video belongs to.
     */
    channelTitle?: string;
    /**
     * A list of keyword tags associated with the video. Tags may contain spaces. The property value has a maximum length of 500 characters. Note the following rules regarding the way the character limit is calculated:
     * - The property value is a list, and commas between items in the list count toward the limit.
     * - If a tag contains a space, the API server handles the tag value as though it were wrapped in quotation marks, and the quotation marks count toward the character limit. So, for the purposes of character limits, the tag **Foo-Baz** contains seven characters, but the tag **Foo Baz** contains nine characters.
     */
    tags?: string[];
    /**
     * The YouTube video category associated with the video. 
     */
    category?: string;
    /**
     * Indicates if the video is an upcoming/active live broadcast. Or it's "none" if the video is not an upcoming/active live broadcast.
     */
    liveBroadcastContent?: "live" | "none" | "upcoming";
    /**
     * The length of the video.
     */
    duration?: {
        /**
         * Total length in seconds.
         */
        total: number;
        /**
         * Number of seconds.
         */
        seconds: number;
        /**
         * Number of minutes.
         */
        minutes: number;
        /**
         * Number of hours.
         */
        hours: number;
        /**
         * Number of days.
         */
        days: number;
    };
    /**
     * Indicates whether the video is available in 3D or in 2D.
     */
    dimension: "2d" | "3d";
    /**
     * Indicates whether the video is available in high definition (HD) or only in standard definition.
     */
    definition: "hd" | "sd";
    /**
     * The `regionRestriction` object contains information about the countries where a video is (or is not) viewable. The object will contain either the `contentDetails.regionRestriction.allowed` property or the `contentDetails.regionRestriction.blocked` property.
     */
    regionRestriction?: {
        /**
         * A list of region codes that identify countries where the video is viewable. If this property is present and a country is not listed in its value, then the video is blocked from appearing in that country. If this property is present and contains an empty list, the video is blocked in all countries.
         */
        allowed?: string[];
        /**
         * A list of region codes that identify countries where the video is blocked. If this property is present and a country is not listed in its value, then the video is viewable in that country. If this property is present and contains an empty list, the video is viewable in all countries.
         */
        blocked?: string[];
    };
    /**
     * Indicates whether the video is age restricted.
     */
    ageRestricted: boolean;
    /**
     * Specifies the projection format of the video.
     */
    projection?: "360" | "rectangular";
    /**
     * The status of the uploaded video.
     */
    uploadStatus: "processed" | "uploaded";
    /**
     * The video's privacy status.
     */
    privacyStatus?: "private" | "public" | "unlisted";
    /**
     * This value indicates whether the video can be embedded on another website.
     */
    embeddable?: boolean;
    /**
     * The number of times the video has been viewed.
     */
    viewCount?: number;
    /**
     * An `<iframe>` tag that embeds a player that plays the video.
     * - If the video's aspect ratio is unknown, the embedded player defaults to a 4:3 format.
     */
    embedHtml?: string;
    /**
     * The `fileDetails` object encapsulates information about the video file that was uploaded to YouTube, including the file's resolution, duration, audio and video codecs, stream bitrates, and more.
     */
    fileDetails?: {
        /**
         * A list of video streams contained in the uploaded video file. Each item in the list contains detailed metadata about a video stream.
         */
        videoStreams: {
            /**
             * The encoded video content's width in pixels. You can calculate the video's encoding aspect ratio as `width_pixels / height_pixels`.
             */
            widthPixels: number;
            /**
             * The encoded video content's height in pixels.
             */
            heightPixels: number;
            /**
             * The video stream's frame rate, in frames per second.
             */
            frameRateFps: number;
            /**
             * The video content's display aspect ratio, which specifies the aspect ratio in which the video should be displayed.
             */
            aspectRatio: number;
            /**
             * The video codec that the stream uses.
             */
            codec: string;
            /**
             * The video stream's bitrate, in bits per second.
             */
            bitrateBps: number;
            /**
             * The video stream's URL.
             */
            url: string;
            /**
             * The video stream's size in bytes.
             */
            contentLength: number;
        }[];
        /**
         * A list of audio streams contained in the uploaded video file. Each item in the list contains detailed metadata about an audio stream.
         */
        audioStreams: {
            /**
             * The number of audio channels that the stream contains.
             */
            channelCount: number;
            /**
             * The audio codec that the stream uses.
             */
            codec: string;
            /**
             * The audio stream's bitrate, in bits per second.
             */
            bitrateBps: number;
            /**
             * The audio stream's URL.
             */
            url: string;
            /**
             * The audio stream's size in bytes.
             */
            contentLength: number;
        }[];
        /**
         * The length of the uploaded video in milliseconds.
         */
        durationMs: number;
        /**
         * The uploaded video file's combined (video and audio) bitrate in bits per second.
         */
        bitrateBps: number;
        /**
         * The video's DASH manifest URL. Will only be present if the video is a live live broadcast.
         */
        dashManifestUrl?: string;
        /**
         * The video's HLS manifest URL. Will only be present if the video is a live live broadcast.
         */
        hlsManifestUrl?: string;
    };
    /**
     * The `liveStreamingDetails` object contains metadata about a live video broadcast. The object will only be present in a `video` resource if the video is an upcoming, live, or completed live broadcast.
     */
    liveStreamingDetails?: {
        /**
         * The time that the broadcast actually started. This value will not be available until the broadcast begins.
         */
        actualStartTime?: Date;
        /**
         * The time that the broadcast actually ended. This value will not be available until the broadcast is over.
         */
        actualEndTime?: Date;
        /**
         * The time that the broadcast is scheduled to begin.
         */
        scheduledStartTime: Date;
        /**
         * The time that the broadcast is scheduled to end. If the value is empty or the property is not present, then the broadcast is scheduled to continue indefinitely.
         */
        scheduledEndTime?: Date;
        /**
         * The number of viewers currently watching the broadcast. The property and its value will be present if the broadcast has current viewers and the broadcast owner has not hidden the viewcount for the video. Note that YouTube stops tracking the number of concurrent viewers for a broadcast when the broadcast ends. So, this property would not identify the number of viewers watching an archived video of a live broadcast that already ended.
         */
        concurrentViewers?: number;
    };

    constructor(data: RawPlayerData, js: {
        signatureTimestamp: number;
        decipher: (cipher: string) => string;
    });
}

/**
 * A `playlistItem` resource identifies another resource, such as a video, that is included in a playlist. In addition, the playlistItem resource contains details about the included resource that pertain specifically to how that resource is used in that playlist.
 */
declare class PlaylistItem {
    /**
     * The ID that YouTube uses to uniquely identify the playlist item.
     */
    id: string;
    /**
     * The item's title.
     */
    title: string;
    /**
     * The item's description.
     */
    description: string;
    /**
     * A map of thumbnail images associated with the playlist item. For each object in the map, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail.
     */
    thumbnails: Thumbnails;
    /**
     * The channel title of the channel that uploaded this video.
     */
    videoOwnerChannelTitle: string;
    /**
     * The ID that YouTube uses to uniquely identify the channel that uploaded this video.
     */
    videoOwnerChannelId: string;
    /**
     * The ID that YouTube uses to uniquely identify the playlist that the playlist item is in.
     */
    playlistId: string;
    /**
     * The order in which the item appears in the playlist. The value uses a zero-based index, so the first item has a position of 0, the second item has a position of 1, and so forth.
     */
    position: number;
    /**
     * The ID that YouTube uses to uniquely identify a video. To {@link getVideo retrieve the `video` resource}, set the `id` query parameter to this value in your API request.
     */
    videoId: string;
    /**
     * The playlist item's privacy status.
     */
    privacyStatus: "private" | "public" | "unlisted";
    /**
     * The playlist item's duration in seconds.
     */
    duration: number;
    /**
     * Whether the playlist item is playable.
     */
    playable: boolean;

    constructor(data: RawPlaylistItemData)
}

/**
 * A `playlist` resource represents a YouTube playlist. A playlist is a collection of videos that can be viewed sequentially and shared with other users. By default, playlists are publicly visible to other users, but playlists can be public or private.
 */
declare class Playlist {
    /**
     * The ID that YouTube uses to uniquely identify the playlist.
     */
    id: string;
    /**
     * The ID that YouTube uses to uniquely identify the channel that published the playlist.
     */
    channelId: string | undefined;
    /**
     * The playlist's title.
     */
    title: string | undefined;
    /**
     * The playlist's description.
     */
    description: string | undefined;
    /**
     * A map of thumbnail images associated with the playlist. For each object in the map, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail.
     */
    thumbnails: Thumbnails | undefined;
    /**
     * The channel title of the channel that the video belongs to.
     */
    channelTitle: string | undefined;
    /**
     * The playlist's privacy status.
     */
    privacyStatus: "private" | "public" | "unlisted";
    /**
     * The number of videos in the playlist.
     */
    itemCount: number | undefined;

    /**
     * Returns a collection of playlist items from this playlist.
     */
    listItems(): Promise<PlaylistItem[]>;

    constructor(data: RawBrowseData);
}

type SearchResultID = {
    [SearchResultType.VIDEO]: {
        /**
         * The type of the API resource.
         */
        type: SearchResultType.VIDEO;
        /**
         * If the `id.type` property's value is {@link SearchResultType.VIDEO}, then this property will be present and its value will contain the ID that YouTube uses to uniquely identify a video that matches the search query.
         */
        videoId: string;
    };
    [SearchResultType.CHANNEL]: {
        /**
         * The type of the API resource.
         */
        type: SearchResultType.CHANNEL;
        /**
         * If the `id.type` property's value is {@link SearchResultType.CHANNEL}, then this property will be present and its value will contain the ID that YouTube uses to uniquely identify a channel that matches the search query.
         */
        channelId: string;
    };
    [SearchResultType.PLAYLIST]: {
        /**
         * The type of the API resource.
         */
        type: SearchResultType.PLAYLIST;
        /**
         * If the `id.type` property's value is {@link SearchResultType.PLAYLIST}, then this property will be present and its value will contain the ID that YouTube uses to uniquely identify a playlist that matches the search query.
         */
        playlistId: string;
    };
}

/**
 * A search result contains information about a YouTube video, channel, or playlist that matches the search parameters specified in an API request. While a search result points to a uniquely identifiable resource, like a video, it does not have its own persistent data.
 */
declare class SearchResult<T extends SearchResultType> {
    /**
     * The `id` object contains information that can be used to uniquely identify the resource that matches the search request.
     */
    id: SearchResultID[T];
    /**
     * The value that YouTube uses to uniquely identify the channel that published the resource that the search result identifies.
     */
    channelId: string;
    /**
     * The title of the search result.
     */
    title: string;
    /**
     * A description of the search result.
     */
    description: string | undefined;
    /**
     * A map of thumbnail images associated with the search result. For each object in the map, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail.
     */
    thumbnails: Thumbnails | undefined;
    /**
     * The title of the channel that published the resource that the search result identifies.
     */
    channelTitle: string | undefined;
    /**
     * An indication of whether a video or channel resource has live broadcast content.
     * 
     * For a `video` resource, a value of `upcoming` indicates that the video is a live broadcast that has not yet started, while a value of `live` indicates that the video is an active live broadcast. For a channel resource, a value of `upcoming` indicates that the channel has a scheduled broadcast that has not yet started, while a value of `live` indicates that the channel has an active live broadcast.
     */
    liveBroadcastContent: "live" | "upcoming" | "none" | undefined;

    constructor(data: RawSearchResultData)
}

/**
 * A search list response contains information from the response to a search query.
 */
declare class SearchListResponse<T extends SearchResultType> {
    /**
     * The token that can be used as the value of the `pageToken` parameter to retrieve the next page in the result set.
     */
    nextPageToken: string;
    /**
     * The region code that was used for the search query. The property value is a two-letter ISO country code that identifies the region.
     */
    regionCode: "US";
    /**
     * The total number of results in the result set.Please note that the value is an approximation and may not represent an exact value. In addition, the maximum value is 1,000,000.
     * 
     * You should not use this value to create pagination links. Instead, use the `nextPageToken` property value to determine whether to show pagination links.
     */
    totalResults: number;
    /**
     * The number of results included in the API response.
     */
    resultsPerPage: number;
    /**
     * The list of search results returned from the search.
     */
    items: SearchResult<T>[];
    /**
     * Updates `items` with the next page of search results.
     */
    next(): Promise<SearchResult<T>[]>;

    constructor(data: RawSearchData)
}

/**
 * Represents a YouTube channel.
 */
declare class Channel {
    title: string;
    subscriberCount: string;

    constructor(data: RawChannelData);
}

/**
 * Represents a client for the innertube API.
 */
declare class Client {
    id: number;
    name: string;
    version: string;
    platform: "DESKTOP" | "MOBILE";

    /**
     * Creates a new client with the specified type.
     * 
     * @param type the client type
     */
    constructor(type: "WEB" | "MWEB" | "WEB_REMIX");

    /**
     * Request the API.
     * 
     * @param endpoint the endpoint of the request
     * @param body the body of the request
     */
    request(endpoint: string, body?: object): Promise<Response>;
}

/**
 * Returns the video with the matching ID.
 * 
 * @param id Specifies a YouTube video ID for the resource that is being retrieved. In a `video` resource, the `id` property specifies the video's ID.
 * @deprecated in favor of {@linkcode ytdl}.
 */
declare function getVideo(id: string): Promise<Video | null>;

/**
 * Returns the playlist with the matching ID.
 * 
 * @param id Specifies a YouTube playlist ID for the resource that is being retrieved. In a `playlist` resource, the id property specifies the playlist's YouTube playlist ID.
 * @param unavailable Indicates whether unavailable videos should be included in the playlist.
 */
declare function getPlaylist(id: string, unavailable?: boolean): Promise<Playlist | null>;

/**
 * Returns a collection of search results that match the query parameters specified in the API request. By default, a search result set identifies matching `video`, `channel`, and `playlist` resources, but you can also configure queries to only retrieve a specific type of resource.
 * 
 * @param q Specifies the query term to search for.
 * @param type Restricts the search query to only retrieve a particular type of resource.
 */
declare function listSearchResults<T extends SearchResultType = SearchResultType>(q: string, type?: T): Promise<SearchListResponse<T>>;

/**
 * Returns a list of ids of songs which correspond to the given query.
 * 
 * @param q Specifies the query term to search for.
 */
declare function listSongSearchResults(q: string): Promise<{ id: string }[]>;

/**
 * Returns the channel with the matching ID.
 * 
 * @param id Specified a YouTube channel ID for the resource that is being retrieved.
 */
declare function getChannel(id: string): Promise<Channel | null>;

/**
 * Returns an object representing a device code and verification URL for a linking device. You must visit `verificationUrl` and enter `userCode` before `expires` in order for the `deviceCode` to be valid.
 */
declare function getDeviceCode(): Promise<{
    deviceCode: string,
    userCode: string,
    expires: number,
    verificationUrl: string
}>

/**
 * Sets the bearer token using the given device code. The device code can be obtained from the `deviceCode` property of the object returned from {@link getDeviceCode}.
 * @param deviceCode A device code
 */
declare function setBearerToken(deviceCode: string): Promise<void>;

declare function getMusicSearchSuggestions(q: string): Promise<string[]>;

export {
    SearchResultType,
    Video,
    PlaylistItem,
    Playlist,
    SearchResult,
    SearchListResponse,
    Channel,
    Client,
    getVideo,
    getPlaylist,
    listSearchResults,
    getChannel,
    getDeviceCode,
    setBearerToken,
    getMusicSearchSuggestions,
    listSongSearchResults
}