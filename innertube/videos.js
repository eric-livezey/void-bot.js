import { Duration, download, httpsRequest, requestAPI, requestMusicAPI } from "./utils.js";

/**
 * @typedef {{decipher:(cipher:string)=>string;signatureTimestamp:number;}} JS
 * @type {{[key:string]:JS;}}
 */
const JS_CACHE = {};

export class Video {
    kind;
    etag;
    id;
    snippet;
    contentDetails;
    status;
    statistics;
    player;
    fileDetails;

    /**
     * @param {{statusCode:number,statusMessage:string,headers:{accept?:string|undefined,"accept-language"?:string|undefined,"accept-patch"?:string|undefined,"accept-ranges"?:string|undefined,"access-control-allow-credentials"?:string|undefined,"access-control-allow-headers"?:string|undefined,"access-control-allow-methods"?:string|undefined,"access-control-allow-origin"?:string|undefined,"access-control-expose-headers"?:string|undefined,"access-control-max-age"?:string|undefined,"access-control-request-headers"?:string|undefined,"access-control-request-method"?:string|undefined,age?:string|undefined,allow?:string|undefined,"alt-svc"?:string|undefined,authorization?:string|undefined,"cache-control"?:string|undefined,connection?:string|undefined,"content-disposition"?:string|undefined,"content-encoding"?:string|undefined,"content-language"?:string|undefined,"content-length"?:string|undefined,"content-location"?:string|undefined,"content-range"?:string|undefined,"content-type"?:string|undefined,cookie?:string|undefined,date?:string|undefined,etag?:string|undefined,expect?:string|undefined,expires?:string|undefined,forwarded?:string|undefined,from?:string|undefined,host?:string|undefined,"if-match"?:string|undefined,"if-modified-since"?:string|undefined,"if-none-match"?:string|undefined,"if-unmodified-since"?:string|undefined,"last-modified"?:string|undefined,location?:string|undefined,origin?:string|undefined,pragma?:string|undefined,"proxy-authenticate"?:string|undefined,"proxy-authorization"?:string|undefined,"public-key-pins"?:string|undefined,range?:string|undefined,referer?: string | undefined,"retry-after"?:string|undefined,"sec-websocket-accept"?:string|undefined,"sec-websocket-extensions"?: string | undefined,"sec-websocket-key"?:string|undefined,"sec-websocket-protocol"?:string|undefined,"sec-websocket-version"?:string|undefined,"set-cookie"?:string[]|undefined,"strict-transport-security"?:string|undefined,tk?:string|undefined,trailer?:string|undefined,"transfer-encoding"?:string|undefined,upgrade?:string|undefined,"user-agent"?:string|undefined;vary?:string|undefined,via?:string|undefined,warning?:string|undefined,"www-authenticate"?: string | undefined},body:{responseContext:{visitorData:string,serviceTrackingParams:{service:string,params:{key:string,value:string}[]}[],mainAppWebResponseContext:{loggedOut:boolean,trackingParam:string},webResponseContextExtensionData:{hasDecorated:boolean}},playabilityStatus:{status:string,playableInEmbed:boolean,miniplayer:{miniplayerRenderer:{playbackMode:string}},contextParams:string},streamingData:{expiresInSeconds:string,formats:{itag:number,mimeType:string,bitrate:number,width:number,height:number,lastModified:string,quality:string,fps:number,qualityLabel:string,projectionType:string,audioQuality:string,approxDurationMs:string,audioSampleRate:string,audioChannels:number,signatureCipher:string}[],adaptiveFormats:{itag:number,mimeType:string,bitrate:number,width:number,height:number,initRange:{start:number,end:number},indexRange:{start:number,end:number},lastModified:string,contentLength:number,quality:string,fps:number,qualityLabel:string,projectionType:string,averageBitrate:number,audioQuality:string,colorInfo:{primaries:string,transferCharacteristics:string,matrixCoefficients:string},approxDurationMs:number,audioSampleRate:number,audioChannels:number,loudnessDb:number,url?:string,signatureCipher?:string}[]},playerAds:{playerLegacyDesktopWatchAdsRenderer:{playerAdParams:{showContentThumbnail:boolean,enabledEngageTypes:string},gutParams:{tag:string},showCompanion:boolean,showInstream:boolean,useGut:boolean}}[],playbackTracking:{videostatsPlaybackUrl:{baseUrl:string},videostatsDelayplayUrl:{baseUrl:string},videostatsWatchtimeUrl:{baseUrl:string},ptrackingUrl:{baseUrl:string},qoeUrl:{baseUrl:string},atrUrl:{baseUrl:string,elapsedMediaTimeSeconds:number},videostatsScheduledFlushWalltimeSeconds:number[],videostatsDefaultFlushIntervalSeconds:number},videoDetails:{videoId:string,title:string,lengthSeconds:string,keywords:string[],channelId:string,isOwnerViewing:boolean,shortDescription:string,isCrawlable:boolean,thumbnail:{thumbnails:{url:string,width:number,height:number}[]},allowRatings:boolean,viewCount:string,author:string,isPrivate:boolean,isUnpluggedCorpus:boolean,isLiveContent:boolean},playerConfig:{audioConfig:{loudnessDb:number,perceptualLoudnessDb:number,enablePerFormatLoudness:boolean},streamSelectionConfig:{maxBitrate:string},mediaCommonConfig:{dynamicReadaheadConfig:{maxReadAheadMediaTimeMs:number,minReadAheadMediaTimeMs:number,readAheadGrowthRateMs:number}},webPlayerConfig:{useCobaltTvosDash:boolean,webPlayerActionsPorting:{getSharePanelCommand:{clickTrackingParams:string,commandMetadata:{webCommandMetadata:{sendPost:boolean,apiUrl:string}},webPlayerShareEntityServiceEndpoint:{serializedShareEntity:string}},subscribeCommand:{clickTrackingParams:string,commandMetadata:{webCommandMetadata:{sendPost:boolean,apiUrl:string}},subscribeEndpoint:{channelIds:string[],params:string}},unsubscribeCommand:{clickTrackingParams:string,commandMetadata:{webCommandMetadata:{sendPost:boolean,apiUrl:string}},unsubscribeEndpoint:{channelIds:string[],params:string}},addToWatchLaterCommand:{clickTrackingParams:string,commandMetadata:{webCommandMetadata:{sendPost:boolean,apiUrl:string}},playlistEditEndpoint:{playlistId:string,actions:{addedVideoId:string,action:string}[]}},removeFromWatchLaterCommand:{clickTrackingParams:string,commandMetadata:{webCommandMetadata:{sendPost:boolean,apiUrl:string}},playlistEditEndpoint:{playlistId:string,actions:{action:string,removedVideoId:string}[]}}}}},storyboards:{playerStoryboardSpecRenderer:{spec:string,recommendedLevel:number}},microformat:{playerMicroformatRenderer:{thumbnail:{thumbnails:{url:string,width:number,height:number}[]},embed:{iframeUrl:string,width:number,height:number},title:{simpleText:string},description:{simpleText:string},lengthSeconds:string,ownerProfileUrl:string,externalChannelId:string,isFamilySafe:boolean,availableCountries:string[],isUnlisted:boolean,hasYpcMetadata:boolean,viewCount:string,category:string,publishDate:string,ownerChannelName:string,uploadDate:string}},cards:{cardCollectionRenderer:{cards:{cardRenderer:{teaser:{simpleCardTeaserRenderer:{message:{simpleText:string},trackingParams:string,prominent:boolean,logVisibilityUpdates:boolean,onTapCommand:{clickTrackingParams:string,changeEngagementPanelVisibilityAction:{targetId:string,visibility:string}}}},cueRanges:{startCardActiveMs:string,endCardActiveMs:string,teaserDurationMs:string,iconAfterTeaserMs:string}[],trackingParams:string}}[],headerText:{simpleText:string},icon:{infoCardIconRenderer:{trackingParams:string}},closeButton:{infoCardIconRenderer:{trackingParams:string}},trackingParams:string,allowTeaserDismiss:boolean,logIconVisibilityUpdates:boolean}},trackingParams:string,attestation:{playerAttestationRenderer:{challenge:string,botguardData:{program:string,interpreterSafeUrl:{privateDoNotAccessOrElseTrustedResourceUrlWrappedValue:string},serverEnvironment:number}}},videoQualityPromoSupportedRenderers:{videoQualityPromoRenderer:{triggerCriteria:{connectionWhitelist:string[],joinLatencySeconds:number,rebufferTimeSeconds:number,watchTimeWindowSeconds:number,refractorySeconds:number},text:{runs:{text:string}[]},endpoint:{clickTrackingParams:string,commandMetadata:{webCommandMetadata:{url:string,webPageType:string,rootVe:number}},urlEndpoint:{url:string,target:string}},trackingParams:string,snackbar:{notificationActionRenderer:{responseText:{runs:{text:string}[]},actionButton:{buttonRenderer:{text:{runs:{text:string}[]},navigationEndpoint:{clickTrackingParams:string,commandMetadata:{webCommandMetadata:{url:string,webPageType:string,rootVe:number}},urlEndpoint:{url:string,target:string}},trackingParams:string}},trackingParams:string}}}},messages:{mealbarPromoRenderer:{icon:{thumbnails:{url:string,width:number,height:number}[]},messageTexts:{runs:{text:string}[]}[],actionButton:{buttonRenderer:{style:string,size:string,text:{runs:{text:string}[]},trackingParams:string,command:{clickTrackingParams:string,commandExecutorCommand:{commands:{clickTrackingParams:string,commandMetadata:{webCommandMetadata:{url:string,webPageType:string,rootVe:number}},urlEndpoint:{url:string,target:string}}[]}}}},dismissButton:{buttonRenderer:{style:string,size:string,text:{runs:{text:string}[]},trackingParams:string,command:{clickTrackingParams:string,commandExecutorCommand:{commands:{clickTrackingParams:string,commandMetadata:{webCommandMetadata:{sendPost:boolean,apiUrl:string}},feedbackEndpoint:{feedbackToken:string,uiActions:{hideEnclosingContainer:boolean}}}[]}}}},triggerCondition:string,style:string,trackingParams:string,impressionEndpoints:{clickTrackingParams:string,commandMetadata:{webCommandMetadata:{sendPost:boolean,apiUrl:string}},feedbackEndpoint:{feedbackToken:string,uiActions:{hideEnclosingContainer:boolean}}}[],isVisible:boolean,messageTitle:{runs:{text:string}[]},enableSharedFeatureForImpressionHandling:boolean}}[],adPlacements:{adPlacementRenderer:{config:{adPlacementConfig:{kind:string,adTimeOffset:{offsetStartMilliseconds:string,offsetEndMilliseconds:string},hideCueRangeMarker:boolean}},renderer:{adBreakServiceRenderer:{prefetchMilliseconds:string,getAdBreakUrl:string}},adSlotLoggingData:{serializedSlotAdServingDataEntry:string}}}[],frameworkUpdates:{entityBatchUpdate:{mutations:{entityKey:string,type:string,payload:{offlineabilityEntity:{key:string,addToOfflineButtonState:string}}}[],timestamp:{seconds:string,nanos:number}}}}}} response raw player response
     * @param {{functions:string,decipherFunction:string,signatureTimestamp:number}} js
     */
    constructor(response, js) {
        const data = response.body
        if (data.playabilityStatus.messages) {
            if (data.playabilityStatus.messages[0] == "This is a private video. Please sign in to verify that you may see it.") {
                // Video is private
                return;
            }
        }
        this.kind = "youtube#video";
        this.etag = response.headers.etag;
        this.id = data.videoDetails.videoId;
        this.snippet = {
            publishedAt: new Date(data.microformat.playerMicroformatRenderer.publishDate),
            channelId: data.videoDetails.channelId,
            title: data.videoDetails.title,
            description: data.videoDetails.shortDescription,
            thumbnails: {
                default: data.videoDetails.thumbnail.thumbnails[0],
                medium: data.videoDetails.thumbnail.thumbnails[1],
                high: data.videoDetails.thumbnail.thumbnails[2],
                standard: data.videoDetails.thumbnail.thumbnails[3],
                maxres: data.videoDetails.thumbnail.thumbnails[4]
            },
            channelTitle: data.videoDetails.author,
            tags: undefined,
            categoryId: data.microformat.playerMicroformatRenderer.category,
            liveBroadcastContent: data.videoDetails.isLiveContent && data.videoDetails.isLive ? "live" : data.videoDetails.isLiveContent ? "upcoming" : "none",
            defaultLanguage: undefined,
            localized: undefined,
            defaultAudioLanguage: undefined
        };
        this.contentDetails = {
            duration: new Duration(Number(data.videoDetails.lengthSeconds)),
            dimension: undefined,
            definition: undefined,
            caption: undefined,
            licensedContent: undefined,
            regionRestriction: {
                allowed: data.microformat.playerMicroformatRenderer.availableCountries,
            },
            contentRating: {
                ytRating: data.playabilityStatus.reason == "Sign in to confirm your age" ? "ytAgeRestricted" : undefined
            },
            projection: data.streamingData ? data.streamingData.adaptiveFormats[0].projectionType.toLowerCase() : undefined,
            hasCustomThumbnail: undefined
        };
        this.status = {
            uploadStatus: undefined,
            failureReason: undefined,
            rejectionReason: undefined,
            privacyStatus: data.microformat.playerMicroformatRenderer.isPrivate ? "private" : data.microformat.playerMicroformatRenderer.isUnlisted ? "unlisted" : "public",
            publishAt: undefined,
            license: undefined,
            embeddable: data.playabilityStatus.playableInEmbed,
            publicStatsViewable: undefined,
            madeForKids: undefined,
            selfDeclaredMadeForKids: undefined
        }
        this.statistics = {
            viewCount: Number(data.microformat.playerMicroformatRenderer.viewCount),
            likeCount: undefined,
            dislikeCount: undefined,
            favoriteCount: undefined,
            commentCount: undefined
        }
        this.player = data.microformat.playerMicroformatRenderer.embed ? {
            embedHtml: `<iframe width="${data.microformat.playerMicroformatRenderer.embed.width}" height="${data.microformat.playerMicroformatRenderer.embed.height}" src="${data.microformat.playerMicroformatRenderer.embed.iframeUrl}" title="${data.microformat.playerMicroformatRenderer.title.simpleText}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`,
            embedHeight: data.microformat.playerMicroformatRenderer.embed.height,
            embedWidth: data.microformat.playerMicroformatRenderer.embed.width
        } : undefined
        this.fileDetails = data.streamingData ? {
            fileName: undefined,
            fileSize: undefined,
            fileType: undefined,
            container: undefined,
            videoStreams: ((adaptiveFormats) => {
                const arr = [];
                for (var adaptiveFormat of adaptiveFormats) {
                    if (adaptiveFormat.mimeType.startsWith("video/")) {
                        const url = adaptiveFormat.url ? new URL(adaptiveFormat.url) : decipher(new URLSearchParams(adaptiveFormat.signatureCipher), js);
                        arr.push({
                            widthPixels: adaptiveFormat.width,
                            heightPixels: adaptiveFormat.height,
                            frameRateFps: adaptiveFormat.fps,
                            aspectRatio: adaptiveFormat.width / adaptiveFormat.height,
                            codec: adaptiveFormat.mimeType.substring(adaptiveFormat.mimeType.indexOf("\"") + 1, adaptiveFormat.mimeType.length - 1),
                            bitrateBps: adaptiveFormat.bitrate,
                            rotation: undefined,
                            vendor: undefined,
                            url: url
                        })
                    }
                }
                return arr;
            })(data.streamingData.adaptiveFormats),
            audioStreams: ((adaptiveFormats) => {
                const arr = [];
                for (var adaptiveFormat of adaptiveFormats) {
                    if (adaptiveFormat.mimeType.startsWith("audio/")) {
                        const url = adaptiveFormat.url ? adaptiveFormat.url : decipher(new URLSearchParams(adaptiveFormat.signatureCipher), js);
                        arr.push({
                            channelCount: adaptiveFormat.audioChannels,
                            codec: adaptiveFormat.mimeType.substring(adaptiveFormat.mimeType.indexOf("\"") + 1, adaptiveFormat.mimeType.length - 1),
                            bitrateBps: adaptiveFormat.bitrate,
                            vendor: undefined,
                            contentLength: adaptiveFormat.contentLength,
                            url: url
                        })
                    }
                }
                return arr;
            })(data.streamingData.adaptiveFormats),
            durationMs: Number(data.streamingData.adaptiveFormats[0].approxDurationMs),
            bitrateBps: undefined,
            creationTime: undefined
        } : undefined
    }
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
 * @param {string} playerId 
 */
async function getJs(playerId) {
    // Check if JS is already cached
    if (!JS_CACHE[playerId]) {
        // Fetch JS with player id
        const js = (await (await fetch(`https://www.youtube.com/s/player/${playerId}/player_ias.vflset/en_US/base.js`)).text()).replaceAll("\n", "");
        // Find the object containing decipher functions
        const mat = js.match(/var [A-Za-z0-9]+=\{[A-Za-z0-9]+:function(\(a,b\)\{var c=a\[0\];a\[0\]=a\[b%a.length\];a\[b%a.length\]=c\}|\(a\)\{a.reverse\(\)\}|\(a,b\)\{a.splice\(0,b\)\})((?!\}\}).)+\}\}/);
        if (mat === null) {
            console.log(js);
        }
        const functions = mat[0];
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
 * @param {URLSearchParams} signatureCipher 
 */
function decipher(signatureCipher, js) {
    return `${signatureCipher.get("url")}&${signatureCipher.get("sp")}=${encodeURIComponent(js.decipher(signatureCipher.get("s")))}`;
}

export async function get(id) {
    var js = await getJs(await getPlayerId(id));
    var response = await requestAPI("player", {
        videoId: id,
        playbackContext: {
            contentPlaybackContext: {
                currentUrl: `/watch?v=${id}`,
                vis: 0,
                splay: false,
                autoCaptionsDefaultOn: false,
                autonavState: "STATE_NONE",
                html5Preference: "HTML5_PREF_WANTS",
                signatureTimestamp: js.signatureTimestamp,
                referer: `https://www.youtube.com/watch?v=${id}`,
                lactMilliseconds: "-1",
                watchAmbientModeContext: {
                    watchAmbientModeEnabled: true
                }
            }
        },
        racyCheckOk: false,
        contentCheckOk: false
    })
    if (response.body.playabilityStatus.status == "ERROR") {
        // Video is unavailable or does not exist
        return null;
    } else if (response.body.playabilityStatus.messages) {
        if (response.body.playabilityStatus.messages[0] == "This is a private video. Please sign in to verify that you may see it.") {
            // Video is private
            "PRIVATE";
        }
    } else {
        return new Video(response, js);
    }
}

export async function getMusicSearchSuggestions(q) {
    const res = (await requestMusicAPI("music/get_search_suggestions", { input: q })).body;
    if (!res.contents) {
        return [];
    }
    const suggestions = [];
    for (const content of res.contents[0].searchSuggestionsSectionRenderer.contents) {
        var text = "";
        for (const run of content.searchSuggestionRenderer.suggestion.runs) {
            text += run.text;
        }
        suggestions.push(text);
    }
    return suggestions;
}