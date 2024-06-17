const CLIENTS = {
    WEB: { id: 1, name: "WEB", version: "2.20230914.04.00" },
    ANDROID_EMBED: { name: "ANDROID", version: "16.20", screen: "EMBED" }
}

// Client secrets for YouTube on TV
const CLIENT_ID = "861556708454-d6dlm3lh05idd8npek18k6be8ba3oc68.apps.googleusercontent.com";
const CLIENT_SECRET = "SboVhoG9s0rNafixCSGGKXAT";

/**
 * @typedef {{decipher:(cipher:string)=>string;signatureTimestamp:number;}} JS
 * @type {{[key:string]:JS;}}
 */
const JS_CACHE = {};

/**
 * @type {{access_token:string;expires:number;refresh_token:string;} | {}}
 */
const BEARER_TOKEN = {};

/**
 * @param {string} path 
 * @param {*} body 
 */
async function request(path, body) {
    var useOAuth = false;
    var client = CLIENTS.WEB;
    // Check if bearer token is set
    if ("access_token" in BEARER_TOKEN) {
        // Check if bearer token is still valid
        if (new Date().getTime() >= BEARER_TOKEN.expires) {
            await refreshBearerToken();
        }
        useOAuth = true;
        client = CLIENTS.ANDROID_EMBED;
    }
    // Append base context to body
    body = {
        ...body,
        context: {
            client: {
                clientName: client.name,
                clientVersion: client.version,
                clientScreen: client.screen
            }
        }
    }
    // Set authorization header if using OAuth
    const authHeader = useOAuth ? { authorization: "Bearer " + BEARER_TOKEN.access_token } : {};
    return await fetch(`https://www.youtube.com/youtubei/v1${path}` + (useOAuth ? "" : "?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8"), {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
            "x-youtube-client-version": client.version,
            ...authHeader
        },
        body: JSON.stringify(body)
    });
}

/**
 * @param {string} videoId 
 */
async function getPlayerId(videoId) {
    // Fetch source video HTML
    const html = await (await fetch(`https://www.youtube.com/watch?v=${videoId}`)).text();
    // Find the player id
    return html.match(/\/s\/player\/(?<id>((?!\/).)+)\/player_ias\.vflset\/en_US\/base\.js/).groups["id"];
}

/**
 * @param {string} html 
 */
function extractPlayerId(html) {
    // Find the player id
    return html.match(/\/s\/player\/(?<id>((?!\/).)+)\/player_ias\.vflset\/en_US\/base\.js/).groups["id"];
}

/**
 * @param {string} playerId 
 */
async function getJs(playerId) {
    // Check if JS is already cached
    if (!JS_CACHE[playerId]) {
        // Fetch JS with player id
        const js = (await (await fetch(`https://www.youtube.com/s/player/${playerId}/player_ias.vflset/en_US/base.js`)).text()).replaceAll("\n", "");
        // Find the object containing decipher functions
        const functions = js.match(/var ((?!=).)+=\{((?!:).)+:function(\(a,b\)\{var c=a\[0\];a\[0\]=a\[b%a\.length\];a\[b%a\.length\]=c\}|\(a\)\{a\.reverse\(\)\}|\(a,b\)\{a\.splice\(0,b\)\})((?!\}\}).)+\}\}/)[0];
        // Find the function for deciphering signature ciphers
        const decipher = js.match(/\{a=a\.split\(\"\"\);((?!\}).)+\}/)[0];
        // Find the signature timestamp
        const signatureTimestamp = js.match(/signatureTimestamp:(?<timestamp>[0-9]+)(,|\})/).groups["timestamp"];
        // Evaluate the code that will save a new object to the cache
        eval(`${functions};JS_CACHE[playerId]={decipher:(a)=>${decipher},signatureTimestamp:${signatureTimestamp}}`);
    }
    return JS_CACHE[playerId];
}

/**
 * @param {JS} js 
 * @param {URLSearchParams} cipher 
 */
function decipher(js, cipher) {
    const url = new URL(cipher.get("url"));
    url.searchParams.set("alr", "yes");
    url.searchParams.set(cipher.get("sp"), encodeURIComponent(js.decipher(cipher.get("s"))));
    return url.toString();
}

/**
 * @type {{readonly VIDEO:import("./index.d.ts").SearchResultType.VIDEO;readonly CHANNEL:import("./index.d.ts").SearchResultType.CHANNEL;readonly PLAYLIST:import("./index.d.ts").SearchResultType.PLAYLIST;}}
 */
const SearchResultType = Object.create(null);
Object.defineProperties(SearchResultType, {
    VIDEO: {
        enumerable: true,
        value: "video"
    },
    CHANNEL: {
        enumerable: true,
        value: "channel"
    },
    PLAYLIST: {
        enumerable: true,
        value: "playlist"
    }
});

class Video {
    id;
    publishedAt;
    channelId;
    title;
    description;
    thumbnails;
    channelTitle;
    tags;
    category;
    liveBroadcastContent;
    duration;
    dimension;
    definition;
    regionRestriction;
    ageRestricted;
    projection;
    uploadStatus;
    privacyStatus;
    embeddable;
    viewCount;
    embedHtml;
    fileDetails;
    liveStreamingDetails;

    /**
     * @param {import("./rawTypes").RawPlayerData} data 
     * @param {JS} js 
     */
    constructor(data, js) {
        if ("videoDetails" in data) {
            const videoDetails = data.videoDetails;
            this.id = videoDetails.videoId;
            this.channelId = videoDetails.channelId;
            this.title = videoDetails.title;
            this.description = videoDetails.shortDescription;
            this.thumbnails = {
                default: {
                    url: `https://i.ytimg.com/vi/${this.id}/default.jpg`,
                    width: 120,
                    height: 90
                },
                medium: {
                    url: `https://i.ytimg.com/vi/${this.id}/mqdefault.jpg`,
                    width: 320,
                    height: 180
                },
                high: {
                    url: `https://i.ytimg.com/vi/${this.id}/hqdefault.jpg`,
                    width: 480,
                    height: 360
                },
                standard: {
                    url: `https://i.ytimg.com/vi/${this.id}/sddefault.jpg`,
                    width: 640,
                    height: 480
                },
                maxres: {
                    url: `https://i.ytimg.com/vi/${this.id}/maxresdefault.jpg`,
                    width: 1280,
                    height: 720
                }
            };
            this.channelTitle = videoDetails.author;
            this.tags = videoDetails.keywords;
            this.liveBroadcastContent = videoDetails.isLive ? "live" : videoDetails.isLiveContent ? "upcoming" : "none";
            this.duration = (seconds => {
                return {
                    total: seconds,
                    days: Math.floor(seconds / 86400),
                    hours: Math.floor(seconds % 86400 / 3600),
                    minutes: Math.floor(seconds % 3600 / 60),
                    seconds: seconds % 60
                }
            })(Number(videoDetails.lengthSeconds));
            this.privacyStatus = videoDetails.isUnpluggedCorpus ? "unlisted" : videoDetails.isPrivate || "messages" in data.playabilityStatus && data.playabilityStatus.messages[0] === "This is a private video. Please sign in to verify that you may see it." ? "private" : "public";
            this.viewCount = Number(videoDetails.viewCount);
        }
        if ("microformat" in data) {
            const microformat = data.microformat;
            this.publishedAt = new Date(microformat.playerMicroformatRenderer.publishDate);
            this.category = microformat.playerMicroformatRenderer.category;
            this.regionRestriction = {
                allowed: microformat.playerMicroformatRenderer.availableCountries
            };
            this.embedHtml = `\u003ciframe width=\"${microformat.playerMicroformatRenderer.embed.width}\" height=\"${microformat.playerMicroformatRenderer.embed.height}\" src=\"${microformat.playerMicroformatRenderer.embed.iframeUrl}\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen\u003e\u003c/iframe\u003e`;
            if ("liveBroadcastDetails" in microformat.playerMicroformatRenderer) {
                const liveBroadcastDetails = microformat.playerMicroformatRenderer.liveBroadcastDetails;
                this.liveStreamingDetails = {
                    actualStartTime: new Date(liveBroadcastDetails.startTimestamp),
                };
                if ("endTimestamp" in liveBroadcastDetails)
                    this.liveStreamingDetails.actualEndTime = new Date(liveBroadcastDetails.endTimestamp);
            }
        }
        if ("streamingData" in data) {
            const streamingData = data.streamingData;
            this.projection = streamingData.adaptiveFormats[0].projectionType.toLowerCase();
            this.fileDetails = {
                videoStreams: streamingData.adaptiveFormats.filter(value => value.mimeType.startsWith("video")).map(value => {
                    return {
                        widthPixels: value.width,
                        heightPixels: value.height,
                        frameRateFps: value.fps,
                        aspectRatio: value.width / value.width,
                        codec: value.mimeType.substring(value.mimeType.indexOf("codecs=") + 8, value.mimeType.length - 1),
                        bitrateBps: value.bitrate,
                        url: value.url ? value.url : decipher(js, new URLSearchParams(value.signatureCipher)),
                        contentLength: value.contentLength
                    }
                }),
                audioStreams: streamingData.adaptiveFormats.filter(value => value.mimeType.startsWith("audio")).map(value => {
                    return {
                        channelCount: value.audioChannels,
                        codec: value.mimeType.substring(value.mimeType.indexOf("codecs=") + 8, value.mimeType.length - 1),
                        bitrateBps: value.bitrate,
                        url: value.url ? value.url : decipher(js, new URLSearchParams(value.signatureCipher)),
                        contentLength: value.contentLength
                    }
                }),
                durationMs: streamingData.adaptiveFormats[0].approxDurationMs,
                dashManifestUrl: streamingData.dashManifestUrl,
                hlsManifestUrl: streamingData.hlsManifestUrl
            };
        }
        this.dimension = null;
        this.definition = null;
        this.ageRestricted = data.playabilityStatus.reason === "Sign in to confirm your age";
        this.uploadStatus = data.playabilityStatus.reason === "We're processing this video. Check back later." ? "uploaded" : "processed";
        this.embeddable = data.playabilityStatus.playableInEmbed;
    };
}

class PlaylistItem {
    id;
    title;
    thumbnails;
    videoOwnerChannelTitle;
    playlistId;
    position;
    videoId;
    privacyStatus;

    /**
     * @param {import("./rawTypes").RawPlaylistItemData} data 
     */
    constructor(data) {
        this.id = data.videoId;
        this.title = data.title.runs.map(value => value.text).join(" ");
        this.thumbnails = {
            default: {
                url: `https://i.ytimg.com/vi/${this.id}/default.jpg`,
                width: 120,
                height: 90
            },
            medium: {
                url: `https://i.ytimg.com/vi/${this.id}/mqdefault.jpg`,
                width: 320,
                height: 180
            },
            high: {
                url: `https://i.ytimg.com/vi/${this.id}/hqdefault.jpg`,
                width: 480,
                height: 360
            },
            standard: {
                url: `https://i.ytimg.com/vi/${this.id}/sddefault.jpg`,
                width: 640,
                height: 480
            },
            maxres: {
                url: `https://i.ytimg.com/vi/${this.id}/maxresdefault.jpg`,
                width: 1280,
                height: 720
            }
        };
        this.videoOwnerChannelTitle = data.shortBylineText.runs.map(value => value.text).join(" ");
        this.playlistId = data.navigationEndpoint.watchEndpoint.playlistId;
        this.position = Number(data.index.simpleText);
        this.videoId = this.id;
        this.privacyStatus = "public";
    };
}

class Playlist {
    id;
    channelId;
    title;
    description;
    thumbnails;
    channelTitle;
    privacyStatus;
    itemCount;
    #contents;

    /**
     * @param {import("./rawTypes").RawBrowseData} data 
     */
    constructor(data) {
        if ("header" in data) {
            const header = data.header;
            this.id = header.playlistHeaderRenderer.playlistId;
            if ("ownerEndpoint" in header.playlistHeaderRenderer)
                this.channelId = header.playlistHeaderRenderer.ownerEndpoint.browseEndpoint.browseId;
            this.title = header.playlistHeaderRenderer.title.simpleText;
            if ("descriptionText" in header.playlistHeaderRenderer)
                this.description = header.playlistHeaderRenderer.descriptionText.simpleText;
            this.thumbnails = (thumbnailData => {
                const thumbnails = {};
                if (!new URL(thumbnailData[0].url).searchParams.has("v")) {
                    const url = thumbnailData[0].url.substring(0, thumbnailData[0].url.indexOf("&rs="));
                    thumbnails.default = {
                        url: url.replace("hqdefault.jpg", "default.jpg"),
                        width: 120,
                        height: 90
                    }
                    thumbnails.medium = {
                        url: url.replace("hqdefault.jpg", "mqdefault.jpg"),
                        width: 320,
                        height: 180
                    }
                    thumbnails.high = {
                        url: url,
                        width: 480,
                        height: 360
                    }
                    thumbnails.standard = {
                        url: url.replace("hqdefault.jpg", "sddefault.jpg"),
                        width: 640,
                        height: 480
                    }
                    thumbnails.maxres = {
                        url: url.replace("hqdefault.jpg", "maxresdefault.jpg"),
                        width: 1280,
                        height: 720
                    }
                } else {
                    thumbnails.medium = thumbnailData[0];
                    thumbnails.standard = thumbnailData[1];
                    thumbnails.maxres = thumbnailData[2];
                }
                return thumbnails;
            })(header.playlistHeaderRenderer.playlistHeaderBanner.heroPlaylistThumbnailRenderer.thumbnail.thumbnails);
            if ("ownerText" in header.playlistHeaderRenderer)
                this.channelTitle = header.playlistHeaderRenderer.ownerText.runs.map(value => value.text).join(" ");
            else if ("subtitle" in header.playlistHeaderRenderer)
                this.channelTitle = header.playlistHeaderRenderer.subtitle.simpleText;
            this.privacyStatus = header.playlistHeaderRenderer.privacy.toLowerCase();
            this.itemCount = Number(header.playlistHeaderRenderer.numVideosText.runs[0].text.split(" ")[0]);
        } else {
            this.privacyStatus = "private"
        }
        this.#contents = "contents" in data ? data.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents : null;
    }

    async listItems() {
        if (this.#contents === null) {
            return [];
        }
        var contents = this.#contents;
        var items = contents.filter(value => "playlistVideoRenderer" in value).map(value => new PlaylistItem(value.playlistVideoRenderer));
        var continuationContainer = this.#contents.find(value => "continuationItemRenderer" in value);
        var continuation = continuationContainer ? continuationContainer.continuationItemRenderer.continuationEndpoint.continuationCommand.token : null;
        while (continuation !== null) {
            /**
             * @type {import("./rawTypes").RawBrowseContinuationData}
             */
            const data = await (await request("/browse", { continuation: continuation })).json();
            contents = data.onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems;
            items.push(...contents.filter(value => "playlistVideoRenderer" in value).map(value => new PlaylistItem(value.playlistVideoRenderer)));
            continuationContainer = contents.find(value => "continuationItemRenderer" in value);
            continuation = continuationContainer ? continuationContainer.continuationItemRenderer.continuationEndpoint.continuationCommand.token : null;
        }
        return items;
    };
}

class SearchResult {
    id;
    channelId;
    title;
    description;
    thumbnails;
    channelTitle;
    liveBroadcastContent;

    /**
     * @param {import("./rawTypes").RawSearchResultData} data 
     */
    constructor(data) {
        if ("videoRenderer" in data) {
            const videoRenderer = data.videoRenderer;
            this.id = {
                type: SearchResultType.VIDEO,
                videoId: videoRenderer.videoId
            };
            if ("browseEndpoint" in videoRenderer.ownerText.runs[0].navigationEndpoint)
                this.channelId = videoRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId;
            this.title = videoRenderer.title.runs.map(value => value.text).join(" ");
            if ("detailedMetadataSnippets" in videoRenderer && "runs" in videoRenderer.detailedMetadataSnippets[0].snippetText)
                this.description = videoRenderer.detailedMetadataSnippets[0].snippetText.runs.map(value => value.text).join(" ");
            this.thumbnails = {
                default: {
                    url: `https://i.ytimg.com/vi/${this.id.videoId}/default.jpg`,
                    width: 120,
                    height: 90
                },
                medium: {
                    url: `https://i.ytimg.com/vi/${this.id.videoId}/mqdefault.jpg`,
                    width: 320,
                    height: 180
                },
                high: {
                    url: `https://i.ytimg.com/vi/${this.id.videoId}/hqdefault.jpg`,
                    width: 480,
                    height: 360
                },
                standard: {
                    url: `https://i.ytimg.com/vi/${this.id.videoId}/sddefault.jpg`,
                    width: 640,
                    height: 480
                },
                maxres: {
                    url: `https://i.ytimg.com/vi/${this.id.videoId}/maxresdefault.jpg`,
                    width: 1280,
                    height: 720
                }
            };
            this.channelTitle = videoRenderer.ownerText.runs.map(value => value.text).join(" ");
            if ("badges" in videoRenderer)
                this.liveBroadcastContent = videoRenderer.badges.find(value => value.metadataBadgeRenderer.label === "LIVE") ? "live" : "none";
        } else if ("channelRenderer" in data) {
            const channelRenderer = data.channelRenderer;
            this.id = {
                type: SearchResultType.CHANNEL,
                channelId: channelRenderer.channelId
            };
            this.channelId = this.id.channelId;
            this.title = channelRenderer.title.simpleText;
            if ("descriptionSnippet" in channelRenderer)
                this.description = channelRenderer.descriptionSnippet.runs.map(value => value.text).join(" ");
            this.thumbnails = {
                default: {
                    url: "https:" + channelRenderer.thumbnail.thumbnails[0].url,
                    width: 88,
                    height: 88
                },
                medium: {
                    url: "https:" + channelRenderer.thumbnail.thumbnails[0].url.replace("=s88", "=s240"),
                    width: 240,
                    height: 240
                },
                high: {
                    url: "https:" + channelRenderer.thumbnail.thumbnails[0].url.replace("=s88", "=s800"),
                    width: 800,
                    height: 800
                }
            };
            this.channelTitle = this.title;
        } else if ("playlistRenderer" in data) {
            const playlistRenderer = data.playlistRenderer
            this.id = {
                type: SearchResultType.PLAYLIST,
                playlistId: playlistRenderer.playlistId
            };
            if ("browseEndpoint" in playlistRenderer.longBylineText.runs[0].navigationEndpoint)
                this.channelId = playlistRenderer.longBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId;
            this.title = playlistRenderer.title.simpleText;
            this.thumbnails = {
                default: {
                    url: `https://i.ytimg.com/vi/${playlistRenderer.videos[0].childVideoRenderer.navigationEndpoint.watchEndpoint.videoId}/default.jpg`,
                    width: 120,
                    height: 90
                },
                medium: {
                    url: `https://i.ytimg.com/vi/${playlistRenderer.videos[0].childVideoRenderer.navigationEndpoint.watchEndpoint.videoId}/mqdefault.jpg`,
                    width: 320,
                    height: 180
                },
                high: {
                    url: `https://i.ytimg.com/vi/${playlistRenderer.videos[0].childVideoRenderer.navigationEndpoint.watchEndpoint.videoId}/hqdefault.jpg`,
                    width: 480,
                    height: 360
                },
                standard: {
                    url: `https://i.ytimg.com/vi/${playlistRenderer.videos[0].childVideoRenderer.navigationEndpoint.watchEndpoint.videoId}/sddefault.jpg`,
                    width: 640,
                    height: 480
                }
            };
            this.channelTitle = playlistRenderer.longBylineText.runs[0].text;
        } else {
            const universalWatchCardRenderer = data.universalWatchCardRenderer;
            if ("watchPlaylistEndpoint" in universalWatchCardRenderer.callToAction.watchCardHeroVideoRenderer.navigationEndpoint)
                this.id = {
                    type: SearchResultType.PLAYLIST,
                    playlistId: universalWatchCardRenderer.callToAction.watchCardHeroVideoRenderer.navigationEndpoint.watchPlaylistEndpoint.playlistId
                };
            this.title = universalWatchCardRenderer.header.watchCardRichHeaderRenderer.title.simpleText;
            if ("singleHeroImageRenderer" in universalWatchCardRenderer.callToAction.watchCardHeroVideoRenderer.heroImage && universalWatchCardRenderer.callToAction.watchCardHeroVideoRenderer.heroImage.singleHeroImageRenderer.style == "SINGLE_HERO_IMAGE_STYLE_SQUARE")
                this.thumbnails = {
                    standard: {
                        url: universalWatchCardRenderer.callToAction.watchCardHeroVideoRenderer.heroImage.singleHeroImageRenderer.thumbnail.thumbnails[0].url,
                        width: 640,
                        height: 640
                    }
                };
            this.channelTitle = universalWatchCardRenderer.header.watchCardRichHeaderRenderer.subtitle.simpleText;
        }
    }
}

class SearchListResponse {
    nextPageToken;
    regionCode;
    totalResults;
    resultsPerPage;
    items;

    /**
     * @param {import("./rawTypes").RawSearchData} data 
     */
    constructor(data) {
        const continuation = data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents.find(value => "continuationItemRenderer" in value);
        if (continuation)
            this.nextPageToken = continuation.continuationItemRenderer.continuationEndpoint.continuationCommand.token;
        this.regionCode = "US";
        this.totalResults = Number(data.estimatedResults);
        this.resultsPerPage = null;
        const itemSection = data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents.find(value => "itemSectionRenderer" in value);
        this.items = [];
        if ("secondaryContents" in data.contents.twoColumnSearchResultsRenderer)
            this.items.push(...data.contents.twoColumnSearchResultsRenderer.secondaryContents.secondarySearchContainerRenderer.contents.filter(value => "universalWatchCardRenderer" in value).map(value => new SearchResult(value)));
        if (itemSection)
            this.items.push(...itemSection.itemSectionRenderer.contents.filter(value => "videoRenderer" in value || "channelRenderer" in value || "playlistRenderer" in value).map(value => new SearchResult(value)));
        else
            console.log(data);
    }

    async next() {
        if (!this.nextPageToken) {
            return null;
        }
        /**
         * @type {import("./rawTypes").RawSearchData}
         */
        const data = await (await request("/search", { continuation: this.nextPageToken })).json();
        var continuation = null;
        if ("onResponseReceivedCommands" in data)
            continuation = data.onResponseReceivedCommands.find(value => "appendContinuationItemsAction" in value);
        if (continuation !== null && "continuationItems" in continuation.appendContinuationItemsAction) {
            const continuationItems = continuation.appendContinuationItemsAction.continuationItems;
            const continuationItem = continuationItems.find(value => "continuationItemRenderer" in value);
            if (continuationItem)
                this.nextPageToken = continuationItem.continuationItemRenderer.continuationEndpoint.continuationCommand.token;
            else
                this.nextPageToken = undefined;
            const itemSection = continuationItems.find(value => "itemSectionRenderer" in value);
            if (itemSection) {
                const newItems = itemSection.itemSectionRenderer.contents.filter(value => "videoRenderer" in value || "channelRenderer" in value || "playlistRenderer" in value).map(value => new SearchResult(value));
                this.items.push(...newItems);
                return newItems;
            }
        }
        return [];
    }
}

/**
 * @param {string} id 
 */
async function getVideo(id) {
    // const js = await getJs(await getPlayerId(id));
    // const response = await request("/player", {
    //     videoId: id,
    //     playbackContext: {
    //         contentPlaybackContext: {
    //             signatureTimestamp: js.signatureTimestamp
    //         }
    //     },
    //     racyCheckOk: false,
    //     contentCheckOk: false
    // })
    const response = await fetch(`https://www.youtube.com/watch?v=${id}`);
    if (response.ok) {
        // return new Video(await response.json(), js);
        const text = await response.text();
        const js = await getJs(extractPlayerId(text));
        var start = text.indexOf("var ytInitialPlayerResponse = ") + "var ytInitialPlayerResponse = ".length;
        var i = start + 1;
        for (var p = 1; i < text.length && p > 0; i++) {
            const c = text.charAt(i);
            if (c == '{')
                p++;
            else if (c == '}')
                p--;
        }
        const ytInitialPlayerResponse = JSON.parse(text.substring(start, i));
        return new Video(ytInitialPlayerResponse, js);
    } else {
        return null;
    }
}

/**
 * @param {string} id
 * @param {boolean} unavailable
 */
async function getPlaylist(id, unavailable = false) {
    const response = await request("/browse", {
        browseId: "VL" + id,
        params: unavailable ? "wgYCCAA%3D" : undefined
    });
    if (response.ok) {
        return new Playlist(await response.json());
    } else {
        return null;
    }
}

/**
 * @param {string} q 
 * @param {import("./index.d.ts").SearchResultType} type 
 */
async function listSearchResults(q, type = null) {
    const response = await request("/search", {
        query: q,
        params: type === SearchResultType.VIDEO ? "EgIQAQ%3D%3D" : type === SearchResultType.CHANNEL ? "EgIQAg%3D%3D" : type === SearchResultType.PLAYLIST ? "EgIQAw%3D%3D" : undefined
    })
    if (response.ok) {
        return new SearchListResponse(await response.json());
    } else {
        return null;
    }
}

async function getDeviceCode() {
    // Arbitrarily subtract 30 seconds to account for time discrepencies
    const start = new Date().getTime() - 30000;
    const data = await (await fetch("https://oauth2.googleapis.com/device/code", {
        headers: {
            "content-type": "application/json",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
        },
        body: JSON.stringify({
            "client_id": CLIENT_ID,
            "scope": "https://www.googleapis.com/auth/youtube"
        }),
        method: "POST"
    })).json();
    return {
        deviceCode: data.device_code,
        userCode: data.user_code,
        expires: start + data.expires_in * 1000,
        verificationUrl: data.verification_url
    };
}

/**
 * @param {string} deviceCode 
 */
async function setBearerToken(deviceCode) {
    // Arbitrarily subtract 30 seconds to account for time discrepencies
    const start = new Date().getTime() - 30000;
    const response = await (await fetch("https://oauth2.googleapis.com/token", {
        headers: {
            "content-type": "application/json",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
        },
        body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            device_code: deviceCode,
            grant_type: "urn:ietf:params:oauth:grant-type:device_code"
        }),
        method: "POST"
    })).json();
    BEARER_TOKEN.access_token = response.access_token;
    BEARER_TOKEN.expires = start + response.expires_in * 1000;
    BEARER_TOKEN.refresh_token = response.refresh_token;
}

async function refreshBearerToken() {
    if (!BEARER_TOKEN.refresh_token) {
        return;
    }
    const start = new Date().getTime() - 30000;
    const response = await (await fetch("https://oauth2.googleapis.com/token", {
        headers: {
            "content-type": "application/json",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
        },
        body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: BEARER_TOKEN.refresh_token
        }),
        method: "POST"
    })).json();
    BEARER_TOKEN.access_token = response.access_token;
    BEARER_TOKEN.expires = start + response.expires_in * 1000;
}

export {
    SearchResultType,
    Video,
    PlaylistItem,
    Playlist,
    SearchResult,
    SearchListResponse,
    getVideo,
    getPlaylist,
    listSearchResults,
    getDeviceCode,
    setBearerToken,

    extractPlayerId,
    getPlayerId,
    getJs,
    decipher
}