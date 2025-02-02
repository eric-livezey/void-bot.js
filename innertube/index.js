import { createInterface } from "node:readline";
import { MimeType, getRenderedText } from "./utils.js";

const API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

// Client secrets for YouTube on TV
const CLIENT_ID = "861556708454-d6dlm3lh05idd8npek18k6be8ba3oc68.apps.googleusercontent.com";
const CLIENT_SECRET = "SboVhoG9s0rNafixCSGGKXAT";

/**
 * @typedef {{decipher:(cipher:string)=>string;signatureTimestamp:number;}} JS
 * @type {{[key:string]:JS;}}
 */
const JS_CACHE = {};

const ClientInfo = Object.freeze({
    1: Object.freeze({
        name: "WEB",
        version: "2.20240620.05.00",
        platform: "DESKTOP"
    }),
    2: Object.freeze({
        name: "MWEB",
        version: "2.20240620.05.00",
        platform: "MOBILE"
    }),
    67: Object.freeze({
        name: "WEB_REMIX",
        version: "1.20240617.01.00",
        platform: "DESKTOP"
    })
})

/**
 * @type {typeof import("./index.d.ts").SearchResultType}
 */
const SearchResultType = Object.freeze({
    VIDEO: 0,
    CHANNEL: 1,
    PLAYLIST: 2
});

const ClientId = Object.freeze({
    "WEB": 1,
    "MWEB": 2,
    "WEB_REMIX": 67
});

class OAuthClient {
    #accessToken;
    #expires;
    #refreshToken;

    get initialized() {
        return this.#accessToken !== null;
    }

    constructor(id, secret) {
        this.#accessToken = this.#expires = this.#refreshToken = null;
        if (id === undefined) id = CLIENT_ID;
        else if (typeof id !== "string") throw new TypeError("id must be a string");
        if (secret === undefined) secret = CLIENT_SECRET;
        else if (typeof secret !== "string") throw new TypeError("secret must be a string");
        Object.defineProperties(this, {
            id: {
                value: id,
                enumerable: true
            },
            secret: {
                value: secret,
                enumerable: true
            }
        });
        Object.preventExtensions(this);
    }

    async #getCode() {
        const start = new Date().getTime();
        const data = await (await fetch("https://oauth2.googleapis.com/device/code", {
            headers: {
                "content-type": "application/json",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
            },
            body: JSON.stringify({
                "client_id": this.id,
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

    async #setToken(deviceCode) {
        const start = new Date().getTime();
        const response = await fetch("https://oauth2.googleapis.com/token", {
            headers: {
                "content-type": "application/json",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
            },
            body: JSON.stringify({
                client_id: this.id,
                client_secret: this.secret,
                device_code: deviceCode,
                grant_type: "urn:ietf:params:oauth:grant-type:device_code"
            }),
            method: "POST"
        });
        const data = await response.json();
        this.#accessToken = data.access_token;
        this.#expires = start + data.expires_in * 1000;
        this.#refreshToken = data.refresh_token;
    }

    async getToken() {
        if (this.#expires >= Date.now()) await this.refresh();
        return this.#accessToken;
    }

    async initialize() {
        const code = await this.#getCode();
        const rl = createInterface(process.stdin, process.stdout);
        await new Promise(resolve => {
            rl.question(`Go to ${code.verificationUrl} and enter ${code.userCode}.`, resolve);
        })
        rl.close();
        await this.#setToken(code.deviceCode);
    }

    async refresh() {
        const start = new Date().getTime();
        const response = await fetch("https://oauth2.googleapis.com/token", {
            headers: {
                "content-type": "application/json",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
            },
            body: JSON.stringify({
                client_id: this.id,
                client_secret: this.secret,
                grant_type: "refresh_token",
                refresh_token: this.#refreshToken
            }),
            method: "POST"
        });
        const data = await response.json();
        this.#accessToken = data.access_token;
        this.#expires = start + data.expires_in * 1000;
        if ("refresh_token" in data) {
            this.#refreshToken = data.refresh_token;
        }
    }
}

class Client {
    id;
    name;
    version;
    platform;
    get userAgent() {
        return this.platform === "DESKTOP" ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36" : "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36";
    }
    get context() {
        return { client: { clientName: this.name, clientVersion: this.version, platform: this.platform } };
    }
    get headers() {
        return {
            "User-Agent": this.userAgent,
            "Content-Type": "application/json",
            "X-Youtube-Bootstrap-Logged-In": false,
            "X-Youtube-Client-Name": this.id,
            "X-Youtube-Client-Version": this.version
        }
    }

    constructor(type) {
        if (typeof type !== "string" || !(type in ClientId))
            throw new TypeError("invalid client type");
        this.id = ClientId[type];
        const info = ClientInfo[this.id];
        this.name = info.name;
        this.version = info.version;
        this.platform = info.platform;
    }

    /**
     * @param {string} endpoint 
     * @param {object | undefined} body
     * @param {OAuthClient | undefined} auth
     */
    async request(endpoint, body, auth) {
        if (typeof endpoint != "string")
            throw new TypeError("endpoint must of type string");
        if (typeof body != "undefined" && typeof body != "object")
            throw new TypeError("body must of type object or undefined");
        const response = await fetch(`https://www.youtube.com/youtubei/v1${endpoint}?key=${API_KEY}`, {
            method: "POST",
            headers: { ...this.headers, ...(auth && auth.initialized ? { Authorization: "Bearer ".concat(await auth.getToken()) } : {}) },
            body: JSON.stringify({ context: this.context, ...(body || {}) })
        });
        if (!response.ok)
            throw new Error(`${response.status} ${response.statusText}`);
        return response;
    }
}

const CLIENTS = Object.freeze({
    WEB: new Client("WEB"),
    MWEB: new Client("MWEB"),
    WEB_REMIX: new Client("WEB_REMIX")
});

/**
 * @param {string} html 
 */
function extractPlayerId(html) {
    // Find the player id
    return html.match(/\/s\/player\/(?<id>((?!\/).)+)\/player_ias\.vflset\/en_US\/base\.js/).groups["id"];
}

/**
 * @param {string} videoId 
 */
async function getPlayerId(videoId) {
    // Fetch source video HTML
    const html = await (await fetch(`https://www.youtube.com/watch?v=${videoId}`)).text();
    // Extract the player id
    return extractPlayerId(html);
}

/**
 * @param {string} playerId 
 * @deprecated doesn't do anything since I don't feel like updating the regex
 */
async function getJs(playerId) {
    // Check if JS is already cached
    if (!JS_CACHE[playerId]) {
        JS_CACHE[playerId] = { decipher: a => a, signatureTimeStamp: "" };
        // // Fetch JS with player id
        // const js = (await (await fetch(`https://www.youtube.com/s/player/${playerId}/player_ias.vflset/en_US/base.js`)).text());
        // // Find the object containing decipher functions
        // const functions = js.match(/var ((?!=).)+=\{((?!:).)+:function(\(.,.\)\{var .=.\[0\];.\[0\]=.\[.%.\.length\];.\[.%.\.length\]=.\}|\(.\)\{.\.reverse\(\)\}|\(.,.\)\{.\.splice\(0,.\)\})((?!\}\}).)+\}\}/s)[0];
        // // Find the function for deciphering signature ciphers
        // const decipher = js.match(/\{a=a\.split\(\"\"\);((?!\}).)+\}/s)[0];
        // // Find the signature timestamp
        // const signatureTimestamp = js.match(/signatureTimestamp:(?<st>[0-9]+)(,|\})/s).groups["st"];
        // // Evaluate the code that will save a new object to the cache
        // eval(`${functions};JS_CACHE[playerId]={decipher:(a)=>${decipher},signatureTimestamp:${signatureTimestamp}}`);
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
    playable;

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
            this.duration = (seconds => ({
                total: seconds,
                days: Math.floor(seconds / 86400),
                hours: Math.floor(seconds % 86400 / 3600),
                minutes: Math.floor(seconds % 3600 / 60),
                seconds: seconds % 60
            }))(Number(videoDetails.lengthSeconds));
            this.privacyStatus = videoDetails.isUnpluggedCorpus ? "unlisted" : videoDetails.isPrivate || "messages" in data.playabilityStatus && data.playabilityStatus.messages[0] === "This is a private video. Please sign in to verify that you may see it." ? "private" : "public";
            this.viewCount = Number(videoDetails.viewCount);
        }
        if ("microformat" in data) {
            const microformat = data.microformat;
            this.publishedAt = new Date(microformat.playerMicroformatRenderer.publishDate);
            this.category = microformat.playerMicroformatRenderer.category;
            this.regionRestriction = {
                allowed: microformat.playerMicroformatRenderer.availableCountries || []
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
        // Even though the API does return this data, none of it is valid anymore.
        let streamingData;
        if (streamingData = data.streamingData) {
            this.projection = streamingData.adaptiveFormats[0].projectionType.toLowerCase();
            let adaptiveFormats;
            if (adaptiveFormats = streamingData.adaptiveFormats) {
                const fileDetails = {};
                const audioStreams = [];
                const videoStreams = [];
                for (const format of adaptiveFormats) {
                    if (format.mimeType && /(vp9|vp09|vp8|avc1|av01)/.test(format.mimeType || "")) {
                        videoStreams.push({
                            widthPixels: format.width,
                            heightPixels: format.height,
                            frameRateFps: format.fps,
                            aspectRatio: format.width / format.width,
                            codec: MimeType.parse(format.mimeType).parameters.get("codecs"),
                            bitrateBps: format.bitrate,
                            url: format.url || decipher(js, new URLSearchParams(format.cipher || format.signatureCipher)),
                            contentLength: format.contentLength
                        })
                    } else if (format.mimeType && /(opus|mp4a|dtse|ac-3|ec-3|iamf)/.test(format.mimeType || "")) {
                        audioStreams.push({
                            channelCount: format.audioChannels,
                            codec: MimeType.parse(format.mimeType).parameters.get("codecs"),
                            bitrateBps: format.bitrate,
                            url: format.url ? format.url : decipher(js, new URLSearchParams(format.signatureCipher)),
                            contentLength: format.contentLength
                        })
                    }

                }
                fileDetails.videoStreams = videoStreams;
                fileDetails.audioStreams = audioStreams;
                this.fileDetails = fileDetails;
            }
        }
        this.dimension = null;
        this.definition = null;
        this.ageRestricted = data.playabilityStatus.reason === "Sign in to confirm your age";
        this.uploadStatus = data.playabilityStatus.reason === "We're processing this video. Check back later." ? "uploaded" : "processed";
        this.embeddable = data.playabilityStatus.playableInEmbed;
        const errorScreen = data.playabilityStatus.errorScreen;
        this.playable = errorScreen && (errorScreen.playerLegacyDesktopYpcOfferRenderer || errorScreen.playerLegacyDesktopYpcTrailerRenderer || errorScreen.ypcTrailerRenderer) ? true : data.videoDetails && data.videoDetails.isUpcoming ? true : ["OK", "LIVE_STREAM_OFFLINE", "FULLSCREEN_ONLY"].includes(data.playabilityStatus.status);
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
    duration;
    playable;

    /**
     * @param {import("./rawTypes").RawPlaylistItemData} data 
     */
    constructor(data) {
        this.id = data.videoId;
        this.title = getRenderedText(data.title);
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
        this.videoOwnerChannelTitle = getRenderedText(data.shortBylineText);
        this.videoOwnerChannelId = data.shortBylineText.runs.find(value => value.navigationEndpoint && value.navigationEndpoint.browseEndpoint && value.navigationEndpoint.browseEndpoint.browseId).navigationEndpoint.browseEndpoint.browseId;
        this.playlistId = data.navigationEndpoint.watchEndpoint.playlistId;
        if (data.index)
            this.position = Number(getRenderedText(data.index));
        this.videoId = this.id;
        this.privacyStatus = "public";
        this.duration = Number(data.lengthSeconds);
        this.playable = data.isPlayable;
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
        if ("header" in data && "playlistHeaderRenderer" in data.header) {
            const header = data.header;
            if ("playlistHeaderRenderer" in header) {
                const playlistHeaderRenderer = header.playlistHeaderRenderer;
                this.id = playlistHeaderRenderer.playlistId;
                if ("ownerEndpoint" in playlistHeaderRenderer && "browseEndpoint" in playlistHeaderRenderer.ownerEndpoint)
                    this.channelId = playlistHeaderRenderer.ownerEndpoint.browseEndpoint.browseId;
                else if (playlistHeaderRenderer.ownerText && playlistHeaderRenderer.ownerText.runs && playlistHeaderRenderer.ownerText.runs.length > 0 && playlistHeaderRenderer.ownerText.runs[0].navigationEndpoint && playlistHeaderRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint)
                    this.channelId = playlistHeaderRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId;
                this.title = getRenderedText(playlistHeaderRenderer.title);
                if ("descriptionText" in playlistHeaderRenderer)
                    this.description = getRenderedText(playlistHeaderRenderer.descriptionText);
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
                })(playlistHeaderRenderer.playlistHeaderBanner.heroPlaylistThumbnailRenderer.thumbnail.thumbnails);
                if ("ownerText" in playlistHeaderRenderer)
                    this.channelTitle = getRenderedText(playlistHeaderRenderer.ownerText)
                else if ("subtitle" in playlistHeaderRenderer)
                    this.channelTitle = getRenderedText(playlistHeaderRenderer.subtitle);
                this.privacyStatus = playlistHeaderRenderer.privacy.toLowerCase();
                this.itemCount = Number(playlistHeaderRenderer.numVideosText.runs[0].text.split(" ")[0]);
            }
            // TODO: Resolve metadata when playlistHeaderRenderer is not present
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
            const data = await (await CLIENTS.WEB.request("/browse", { continuation: continuation })).json();
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
            this.title = getRenderedText(videoRenderer.title)
            if ("detailedMetadataSnippets" in videoRenderer && "runs" in videoRenderer.detailedMetadataSnippets[0].snippetText)
                this.description = getRenderedText(videoRenderer.detailedMetadataSnippets[0].snippetText)
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
            this.channelTitle = getRenderedText(videoRenderer.ownerText)
            if ("badges" in videoRenderer)
                this.liveBroadcastContent = videoRenderer.badges.find(value => value.metadataBadgeRenderer.label === "LIVE") ? "live" : "none";
        } else if ("channelRenderer" in data) {
            const channelRenderer = data.channelRenderer;
            this.id = {
                type: SearchResultType.CHANNEL,
                channelId: channelRenderer.channelId
            };
            this.channelId = this.id.channelId;
            this.title = getRenderedText(channelRenderer.title);
            if ("descriptionSnippet" in channelRenderer)
                this.description = getRenderedText(channelRenderer.descriptionSnippet)
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
            this.title = getRenderedText(playlistRenderer.title);
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
            this.title = getRenderedText(universalWatchCardRenderer.header.watchCardRichHeaderRenderer.title);
            if ("singleHeroImageRenderer" in universalWatchCardRenderer.callToAction.watchCardHeroVideoRenderer.heroImage && universalWatchCardRenderer.callToAction.watchCardHeroVideoRenderer.heroImage.singleHeroImageRenderer.style == "SINGLE_HERO_IMAGE_STYLE_SQUARE")
                this.thumbnails = {
                    standard: {
                        url: universalWatchCardRenderer.callToAction.watchCardHeroVideoRenderer.heroImage.singleHeroImageRenderer.thumbnail.thumbnails[0].url,
                        width: 640,
                        height: 640
                    }
                };
            this.channelTitle = getRenderedText(universalWatchCardRenderer.header.watchCardRichHeaderRenderer.subtitle);
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
        const data = await (await CLIENTS.WEB.request("/search", { continuation: this.nextPageToken })).json();
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

class Channel {
    title;
    subscriberCount;
    /**
     * @param {import("./rawTypes").RawChannelData} data 
     */
    constructor(data) {
        this.title = data.metadata?.channelMetadataRenderer?.title;
        this.subscriberCount = data.header?.pageHeaderRenderer?.content?.pageHeaderViewModel?.metadata?.contentMetadataViewModel?.metadataRows[1]?.metadataParts[0]?.text?.content;
        // TODO: implement from innertube
    }
}

function videoURL(id, short) {
    return short ? `https://youtu.be/${id}` : `https://www.youtube.com/watch?v=${id}`;
}

function playlistURL(id) {
    return `https://www.youtube.com/playlist?list=${id}`;
}

function channelURL(id) {
    return `https://www.youtube.com/channel/${id}`;
}

/**
 * @param {string} id 
 * @param {OAuthClient | undefined} auth
 */
async function getVideo(id, auth) {
    const js = await getJs(await getPlayerId(id));
    const response = await CLIENTS.WEB.request("/player", {
        videoId: id//,
        // playbackContext: {
        //     contentPlaybackContext: {
        //         signatureTimestamp: js.signatureTimestamp
        //     }
        // },
        // racyCheckOk: false,
        // contentCheckOk: false
    }, auth);
    if (response.ok) {
        return new Video(await response.json(), js);
    } else {
        return null;
    }
}

/**
 * @param {string} id
 * @param {boolean} includeUnavailable
 */
async function getPlaylist(id, includeUnavailable = false) {
    const response = await CLIENTS.WEB.request("/browse", {
        browseId: "VL" + id,
        params: includeUnavailable ? "wgYCCAA%3D" : undefined
    });
    if (response.ok) {
        return new Playlist(await response.json());
    } else {
        return null;
    }
}

/**
 * @param {string} q 
 * @param {typeof SearchResultType} type 
 */
async function listSearchResults(q, type = null) {
    const payload = { query: q };
    switch (type) {
        case SearchResultType.VIDEO:
            payload.params = "EgIQAQ%3D%3D";
            break;
        case SearchResultType.CHANNEL:
            payload.params = "EgIQAg%3D%3D";
            break;
        case SearchResultType.PLAYLIST:
            payload.params = "EgIQAw%3D%3D";
            break;
    }
    const response = await CLIENTS.WEB.request("/search", payload);
    if (response.ok) {
        return new SearchListResponse(await response.json());
    } else {
        return null;
    }
}

/**
 * @param {string} q 
 */
async function listSongSearchResults(q) {
    const response = await CLIENTS.WEB_REMIX.request("/search", { query: q, params: "EgWKAQIIAWoSEAMQBBAJEA4QChAFEBEQEBAV" });
    if (response.ok) {
        const data = await response.json();
        return data.contents.tabbedSearchResultsRenderer.tabs.find(v => "tabRenderer" in v)?.tabRenderer.content.sectionListRenderer.contents.find(v => "musicShelfRenderer" in v)?.musicShelfRenderer.contents.map(v => { const r = v.musicResponsiveListItemRenderer; return { id: r.playlistItemData.videoId, title: getRenderedText(r.flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text) } }) || [];
    } else {
        return null;
    }
}

/**
 * 
 * @param {string} q 
 */
async function listAlbumSearchResults(q) {
    const response = await CLIENTS.WEB_REMIX.request("/search", { query: q, params: "EgWKAQIYAWoQEAMQBBAJEAoQBRAREBAQFQ%3D%3D" });
    if (response.ok) {
        const data = await response.json();
        return data.contents.tabbedSearchResultsRenderer.tabs.find(v => "tabRenderer" in v)?.tabRenderer.content.sectionListRenderer.contents.find(v => "musicShelfRenderer" in v)?.musicShelfRenderer.contents.map(v => { const r = v.musicResponsiveListItemRenderer; return { id: r.navigationEndpoint.browseEndpoint.browseId, title: getRenderedText(r.flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text) } }) || [];
    } else {
        return null;
    }
}

async function getPlaylistIdFromAlbumId(id) {
    const response = await CLIENTS.WEB_REMIX.request("/browse", { browseId: id });
    if (response.ok) {
        const data = await response.json();
        return new URL(data.microformat.microformatDataRenderer.urlCanonical).searchParams.get("list");
    } else {
        return null;
    }
}

async function getChannel(id) {
    const response = await CLIENTS.WEB.request("/browse", {
        browseId: id,
    });
    if (response.ok) {
        return new Channel(await response.json());
    } else {
        return null;
    }
}

async function getMusicSearchSuggestions(q) {
    const response = await CLIENTS.WEB_REMIX.request("/music/get_search_suggestions", { input: q });
    if (response.ok) {
        const data = await response.json();
        if (!("contents" in data)) {
            return [];
        }
        return data.contents[0].searchSuggestionsSectionRenderer.contents.map(c => getRenderedText(c.searchSuggestionRenderer.suggestion));
    } else {
        return null;
    }
}

export {
    SearchResultType,
    OAuthClient,
    Playlist,
    PlaylistItem,
    SearchListResponse,
    SearchResult,
    Video,
    videoURL,
    playlistURL,
    channelURL,
    getChannel,
    getMusicSearchSuggestions,
    getPlaylist,
    getPlaylistIdFromAlbumId,
    getVideo,
    listAlbumSearchResults,
    listSearchResults,
    listSongSearchResults
};