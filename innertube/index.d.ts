import { RawBrowseData, RawPlayerData, RawPlaylistItemData, RawSearchData, RawSearchResultData } from "./rawTypes";

interface Thumbnail {
    /**
     * The image's URL.
     */
    readonly url: string;
    /**
     * The image's width.
     */
    readonly width: number;
    /**
     * The image's height.
     */
    readonly height: number;
}

interface Thumbnails {
    /**
     * The default thumbnail image. The default thumbnail for a video – or a resource that refers to a video such as a playlist item or search result – is 120px wide and 90px tall. The default thumbnail for a channel is 88px wide and 88px tall.
     */
    readonly default?: Thumbnail;
    /**
     * A higher resolution version of the thumbnail image. For a video (or a resource that refers to a video) this image is 320px wide and 180px tall. For a channel this image is 240px wide and 240px tall.
     */
    readonly medium?: Thumbnail;
    /**
     * A high resolution version of the thumbnail image. For a video (or a resource that refers to a video) this image is 480px wide and 360px tall. For a channel this image is 800px wide and 800px tall.
     */
    readonly high?: Thumbnail;
    /**
     * An even higher resolution version of the thumbnail image than the `high` resolution image. This image is available for some videos and other resources that refer to videos like playlist items or search results. This image is 640px wide and 480px tall.
     */
    readonly standard?: Thumbnail;
    /**
     * The highest resolution version of the thumbnail image. This image size is available for some videos and other resources that refer to videos like playlist items or search results. This image is 1280px wide and 720px tall.
     */
    readonly maxres?: Thumbnail;
}

/**
 * Specifies a type of search result.
 */
declare enum SearchResultTypes {
    /**
     * Video search results.
     */
    VIDEO = "video",
    /**
     * Channel search results.
     */
    CHANNEL = "channel",
    /**
     * Playlist search results.
     */
    PLAYLIST = "playlist"
}

/**
 * A `video` resource represents a YouTube video.
 */
declare class Video {
    /**
     * The ID that YouTube uses to uniquely identify the video.
     */
    readonly id: string;
    /**
     * The date and time that the video was published. Note that this time might be different than the time that the video was uploaded. For example, if a video is uploaded as a private video and then made public at a later time, this property will specify the time that the video was made public.
     * 
     * There are a couple of special cases:
     * - If a video is uploaded as a private video and the video metadata is retrieved by the channel owner, then the property value specifies the date and time that the video was uploaded.
     * - If a video is uploaded as an unlisted video, the property value also specifies the date and time that the video was uploaded. In this case, anyone who knows the video's unique video ID can retrieve the video metadata.
     */
    readonly publishedAt: Date;
    /**
     * The ID that YouTube uses to uniquely identify the channel that the video was uploaded to.
     */
    readonly channelId: string;
    /**
     * The video's title. The property value has a maximum length of 100 characters and may contain all valid UTF-8 characters except `<` and `>`.
     */
    readonly title: string;
    /**
     * The video's description. The property value has a maximum length of 5000 bytes and may contain all valid UTF-8 characters except `<` and `>`.
     */
    readonly description: string;
    /**
     * A map of thumbnail images associated with the video. For each object in the map, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail.
     */
    readonly thumbnails: Thumbnails;
    /**
     * Channel title for the channel that the video belongs to.
     */
    readonly channelTitle: string;
    /**
     * A list of keyword tags associated with the video. Tags may contain spaces. The property value has a maximum length of 500 characters. Note the following rules regarding the way the character limit is calculated:
     * - The property value is a list, and commas between items in the list count toward the limit.
     * - If a tag contains a space, the API server handles the tag value as though it were wrapped in quotation marks, and the quotation marks count toward the character limit. So, for the purposes of character limits, the tag **Foo-Baz** contains seven characters, but the tag **Foo Baz** contains nine characters.
     */
    readonly tags: string[];
    /**
     * The YouTube video category associated with the video. 
     */
    readonly category: string;
    /**
     * Indicates if the video is an upcoming/active live broadcast. Or it's "none" if the video is not an upcoming/active live broadcast.
     */
    readonly liveBroadcastContent: "live" | "none" | "upcoming";
    /**
     * The length of the video.
     */
    readonly duration: {
        /**
         * Total length in seconds.
         */
        readonly total: number;
        /**
         * Number of seconds.
         */
        readonly seconds: number;
        /**
         * Number of minutes.
         */
        readonly minutes: number;
        /**
         * Number of hours.
         */
        readonly hours: number;
        /**
         * Number of days.
         */
        readonly days: number;
    };
    /**
     * Indicates whether the video is available in 3D or in 2D.
     */
    readonly dimension: "2d" | "3d";
    /**
     * Indicates whether the video is available in high definition (HD) or only in standard definition.
     */
    readonly definition: "hd" | "sd";
    /**
     * The `regionRestriction` object contains information about the countries where a video is (or is not) viewable. The object will contain either the `contentDetails.regionRestriction.allowed` property or the `contentDetails.regionRestriction.blocked` property.
     */
    readonly regionRestriction: {
        /**
         * A list of region codes that identify countries where the video is viewable. If this property is present and a country is not listed in its value, then the video is blocked from appearing in that country. If this property is present and contains an empty list, the video is blocked in all countries.
         */
        readonly allowed?: string[];
        /**
         * A list of region codes that identify countries where the video is blocked. If this property is present and a country is not listed in its value, then the video is viewable in that country. If this property is present and contains an empty list, the video is viewable in all countries.
         */
        readonly blocked?: string[];
    };
    /**
     * Indicates whether the video is age restricted.
     */
    readonly ageRestricted: boolean;
    /**
     * Specifies the projection format of the video.
     */
    readonly projection: "360" | "rectangular";
    /**
     * The status of the uploaded video.
     */
    readonly uploadStatus: "processed" | "uploaded";
    /**
     * The video's privacy status.
     */
    readonly privacyStatus: "private" | "public" | "unlisted";
    /**
     * This value indicates whether the video can be embedded on another website.
     */
    readonly embeddable: boolean;
    /**
     * The number of times the video has been viewed.
     */
    readonly viewCount: number;
    /**
     * An `<iframe>` tag that embeds a player that plays the video.
     * - If the video's aspect ratio is unknown, the embedded player defaults to a 4:3 format.
     */
    readonly embedHtml: string;
    /**
     * The `fileDetails` object encapsulates information about the video file that was uploaded to YouTube, including the file's resolution, duration, audio and video codecs, stream bitrates, and more.
     */
    readonly fileDetails: {
        /**
         * A list of video streams contained in the uploaded video file. Each item in the list contains detailed metadata about a video stream.
         */
        readonly videoStreams: {
            /**
             * The encoded video content's width in pixels. You can calculate the video's encoding aspect ratio as `width_pixels / height_pixels`.
             */
            readonly widthPixels: number;
            /**
             * The encoded video content's height in pixels.
             */
            readonly heightPixels: number;
            /**
             * The video stream's frame rate, in frames per second.
             */
            readonly frameRateFps: number;
            /**
             * The video content's display aspect ratio, which specifies the aspect ratio in which the video should be displayed.
             */
            readonly aspectRatio: number;
            /**
             * The video codec that the stream uses.
             */
            readonly codec: string;
            /**
             * The video stream's bitrate, in bits per second.
             */
            readonly bitrateBps: number;
            /**
             * The video stream's URL.
             */
            readonly url: string;
            /**
             * The video stream's size in bytes.
             */
            readonly contentLength: number;
        }[];
        /**
         * A list of audio streams contained in the uploaded video file. Each item in the list contains detailed metadata about an audio stream.
         */
        readonly audioStreams: {
            /**
             * The number of audio channels that the stream contains.
             */
            readonly channelCount: number;
            /**
             * The audio codec that the stream uses.
             */
            readonly codec: string;
            /**
             * The audio stream's bitrate, in bits per second.
             */
            readonly bitrateBps: number;
            /**
             * The audio stream's URL.
             */
            readonly url: string;
            /**
             * The audio stream's size in bytes.
             */
            readonly contentLength: number;
        }[];
        /**
         * The length of the uploaded video in milliseconds.
         */
        readonly durationMs: number;
        /**
         * The uploaded video file's combined (video and audio) bitrate in bits per second.
         */
        readonly bitrateBps: number;
        /**
         * The video's DASH manifest URL. Will only be present if the video is a live live broadcast.
         */
        readonly dashManifestUrl?: string;
        /**
         * The video's HLS manifest URL. Will only be present if the video is a live live broadcast.
         */
        readonly hlsManifestUrl?: string;
    };
    /**
     * The `liveStreamingDetails` object contains metadata about a live video broadcast. The object will only be present in a `video` resource if the video is an upcoming, live, or completed live broadcast.
     */
    readonly liveStreamingDetails?: {
        /**
         * The time that the broadcast actually started. This value will not be available until the broadcast begins.
         */
        readonly actualStartTime?: Date;
        /**
         * The time that the broadcast actually ended. This value will not be available until the broadcast is over.
         */
        readonly actualEndTime?: Date;
        /**
         * The time that the broadcast is scheduled to begin.
         */
        readonly scheduledStartTime: Date;
        /**
         * The time that the broadcast is scheduled to end. If the value is empty or the property is not present, then the broadcast is scheduled to continue indefinitely.
         */
        readonly scheduledEndTime?: Date;
        /**
         * The number of viewers currently watching the broadcast. The property and its value will be present if the broadcast has current viewers and the broadcast owner has not hidden the viewcount for the video. Note that YouTube stops tracking the number of concurrent viewers for a broadcast when the broadcast ends. So, this property would not identify the number of viewers watching an archived video of a live broadcast that already ended.
         */
        readonly concurrentViewers?: number;
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
    readonly id: string;
    /**
     * The item's title.
     */
    readonly title: string;
    /**
     * The item's description.
     */
    readonly description: string;
    /**
     * A map of thumbnail images associated with the playlist item. For each object in the map, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail.
     */
    readonly thumbnails: Thumbnails;
    /**
     * The channel title of the channel that uploaded this video.
     */
    readonly videoOwnerChannelTitle: string;
    /**
     * The ID that YouTube uses to uniquely identify the playlist that the playlist item is in.
     */
    readonly playlistId: string;
    /**
     * The order in which the item appears in the playlist. The value uses a zero-based index, so the first item has a position of 0, the second item has a position of 1, and so forth.
     */
    readonly position: number;
    /**
     * The ID that YouTube uses to uniquely identify a video. To {@link getVideo retrieve the `video` resource}, set the `id` query parameter to this value in your API request.
     */
    readonly videoId: string;
    /**
     * The playlist item's privacy status.
     */
    readonly privacyStatus: "private" | "public" | "unlisted";

    constructor(data: RawPlaylistItemData)
}

/**
 * A `playlist` resource represents a YouTube playlist. A playlist is a collection of videos that can be viewed sequentially and shared with other users. By default, playlists are publicly visible to other users, but playlists can be public or private.
 */
declare class Playlist {
    /**
     * The ID that YouTube uses to uniquely identify the playlist.
     */
    readonly id: string;
    /**
     * The ID that YouTube uses to uniquely identify the channel that published the playlist.
     */
    readonly channelId: string;
    /**
     * The playlist's title.
     */
    readonly title: string;
    /**
     * The playlist's description.
     */
    readonly description: string;
    /**
     * A map of thumbnail images associated with the playlist. For each object in the map, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail.
     */
    readonly thumbnails: Thumbnails;
    /**
     * The channel title of the channel that the video belongs to.
     */
    readonly channelTitle: string;
    /**
     * The playlist's privacy status.
     */
    readonly privacyStatus: "private" | "public" | "unlisted";
    /**
     * The number of videos in the playlist.
     */
    readonly itemCount: number;

    /**
     * Returns a collection of playlist items from this playlist.
     */
    listItems(): Promise<PlaylistItem[]>;

    constructor(data: RawBrowseData);
}

/**
 * A search result contains information about a YouTube video, channel, or playlist that matches the search parameters specified in an API request. While a search result points to a uniquely identifiable resource, like a video, it does not have its own persistent data.
 */
declare class SearchResult {
    /**
     * The `id` object contains information that can be used to uniquely identify the resource that matches the search request.
     */
    readonly id: {
        /**
         * The type of the API resource.
         */
        readonly type: SearchResultTypes;
        /**
         * If the `id.type` property's value is {@link SearchResultTypes.VIDEO}, then this property will be present and its value will contain the ID that YouTube uses to uniquely identify a video that matches the search query.
         */
        readonly videoId?: string;
        /**
         * If the `id.type` property's value is {@link SearchResultTypes.CHANNEL}, then this property will be present and its value will contain the ID that YouTube uses to uniquely identify a channel that matches the search query.
         */
        readonly channelId?: string;
        /**
         * If the `id.type` property's value is {@link SearchResultTypes.PLAYLIST}, then this property will be present and its value will contain the ID that YouTube uses to uniquely identify a playlist that matches the search query.
         */
        readonly playlistId?: string;
    };
    /**
     * The value that YouTube uses to uniquely identify the channel that published the resource that the search result identifies.
     */
    readonly channelId: string;
    /**
     * The title of the search result.
     */
    readonly title: string;
    /**
     * A description of the search result.
     */
    readonly description: string;
    /**
     * A map of thumbnail images associated with the search result. For each object in the map, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail.
     */
    readonly thumbnails: Thumbnails;
    /**
     * The title of the channel that published the resource that the search result identifies.
     */
    readonly channelTitle: string;
    /**
     * An indication of whether a video or channel resource has live broadcast content.
     * 
     * For a `video` resource, a value of `upcoming` indicates that the video is a live broadcast that has not yet started, while a value of `live` indicates that the video is an active live broadcast. For a channel resource, a value of `upcoming` indicates that the channel has a scheduled broadcast that has not yet started, while a value of `live` indicates that the channel has an active live broadcast.
     */
    readonly liveBroadcastContent: "live" | "upcoming" | "none";

    constructor(data: RawSearchResultData)
}

/**
 * A search list response contains information from the response to a search query.
 */
declare class SearchListResponse {
    /**
     * The token that can be used as the value of the `pageToken` parameter to retrieve the next page in the result set.
     */
    readonly nextPageToken: string;
    /**
     * The region code that was used for the search query. The property value is a two-letter ISO country code that identifies the region.
     */
    readonly regionCode: "US";
    /**
     * The total number of results in the result set.Please note that the value is an approximation and may not represent an exact value. In addition, the maximum value is 1,000,000.
     * 
     * You should not use this value to create pagination links. Instead, use the `nextPageToken` property value to determine whether to show pagination links.
     */
    readonly totalResults: number;
    /**
     * The number of results included in the API response.
     */
    readonly resultsPerPage: number;
    /**
     * A list of results that match the search criteria.
     */
    readonly items: SearchResult[];

    constructor(data: RawSearchData)
}

/**
 * Returns the video with the matching ID.
 * 
 * @param id Specifies a YouTube video ID for the resource that is being retrieved. In a `video` resource, the `id` property specifies the video's ID.
 */
declare function getVideo(id: string): Promise<Video | null>;

/**
 * Returns the playlist with the matching ID.
 * 
 * @param id Specifies a YouTube playlist ID for the resource that is being retrieved. In a `playlist` resource, the id property specifies the playlist's YouTube playlist ID.
 */
declare function getPlaylist(id: string): Promise<Playlist | null>;

/**
 * Returns a collection of search results that match the query parameters specified in the API request. By default, a search result set identifies matching `video`, `channel`, and `playlist` resources, but you can also configure queries to only retrieve a specific type of resource.
 * 
 * @param q Specifies the query term to search for.
 * @param type Restricts the search query to only retrieve a particular type of resource.
 */
declare function listSearchResults(q: string, type: SearchResultTypes): Promise<SearchListResponse | null>;

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

export {
    SearchResultTypes,
    Video,
    PlaylistItem,
    Playlist,
    SearchResult,
    SearchListResponse,
    getVideo,
    getPlaylist,
    listSearchResults,
    getDeviceCode,
    setBearerToken
}