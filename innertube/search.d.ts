import { IncomingHttpHeaders } from "http";

export class SearchResult {
    kind: "youtube#searchResult";
    etag: string;
    id: {
        kind: "youtube#video" | "youtube#channel" | "youtube#playlist",
        videoId: string,
        channelId: string,
        playlistId: string
    };
    snippet: {
        publishedAt: Date,
        channelId: string,
        title: string,
        description: string,
        thumbnails: {
            [key: string]: {
                url: string,
                width: number,
                height: number
            }
        },
        channelTitle: string,
        liveBroadcastContent: "upcoming" | "live" | "none"
    };

    constructor(response: { videoRenderer?: { videoId: string, thumbnail: { thumbnails: { url: string, width: number, height: number }[] }, title: { runs: { text: string }[], accessibility: { accessibilityData: { label: string } } }, longBylineText: { runs: { text: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string, canonicalBaseUrl: string } } }[] }, publishedTimeText: { simpleText: string }, lengthText: { accessibility: { accessibilityData: { label: string } }, simpleText: string }, viewCountText: { simpleText: string }, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, watchEndpoint: { videoId: string, params: string, playerParams: string, watchEndpointSupportedOnesieConfig: { html5PlaybackOnesieConfig: { commonConfig: { url: string } } } } }, badges: { metadataBadgeRenderer: { style: string, label: string, trackingParams: string, accessibilityData: { label: string } } }[], ownerBadges: { metadataBadgeRenderer: { icon: { iconType: string }, style: string, tooltip: string, trackingParams: string, accessibilityData: { label: string } } }[], ownerText: { runs: { text: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string, canonicalBaseUrl: string } } }[] }, shortBylineText: { runs: { text: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string, canonicalBaseUrl: string } } }[] }, trackingParams: string, showActionMenu: boolean, shortViewCountText: { accessibility: { accessibilityData: { label: string } }, simpleText: string }, menu: { menuRenderer: { items: { menuServiceItemRenderer: { text: { runs: { text: string }[] }, icon: { iconType: string }, serviceEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { sendPost: boolean } }, signalServiceEndpoint: { signal: string, actions: { clickTrackingParams: string, addToPlaylistCommand: { openMiniplayer: boolean, videoId: string, listType: string, onCreateListCommand: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { sendPost: boolean, apiUrl: string } }, createPlaylistServiceEndpoint: { videoIds: string[], params: string } }, videoIds: string[] } }[] } }, trackingParams: string } }[], trackingParams: string, accessibility: { accessibilityData: { label: string } } } }, channelThumbnailSupportedRenderers: { channelThumbnailWithLinkRenderer: { thumbnail: { thumbnails: { url: string, width: number, height: number }[] }, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string } }, accessibility: { accessibilityData: { label: string } } } }, thumbnailOverlays: { thumbnailOverlayTimeStatusRenderer: { text: { accessibility: { accessibilityData: { label: string } }, simpleText: string }, style: string } }[], richThumbnail: { movingThumbnailRenderer: { movingThumbnailDetails: { thumbnails: { url: string, width: number, height: number }[], logAsMovingThumbnail: boolean }, enableHoveredLogging: boolean, enableOverlay: boolean } }, detailedMetadataSnippets: { snippetText: { runs: { text: string }[] }, snippetHoverText: { runs: { text: string }[] }, maxOneLine: boolean }[], inlinePlaybackEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, watchEndpoint: { videoId: string, params: string, playerParams: string, playerExtraUrlParams: { key: string, value: string }[], watchEndpointSupportedOnesieConfig: { html5PlaybackOnesieConfig: { commonConfig: { url: string } } } } }, searchVideoResultEntityKey: string }, channelRenderer?: { channelId: string, title: { simpleText: string }, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string, canonicalBaseUrl: string } }, thumbnail: { thumbnails: { url: string, width: number, height: number }[] }, shortBylineText: { runs: { text: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string, canonicalBaseUrl: string } } }[] }, videoCountText: { accessibility: { accessibilityData: { label: string } }, simpleText: string }, subscriptionButton: { subscribed: boolean }, ownerBadges: { metadataBadgeRenderer: { icon: { iconType: string }, style: string, tooltip: string, trackingParams: string, accessibilityData: { label: string } } }[], subscriberCountText: { simpleText: string }, subscribeButton: { buttonRenderer: { style: string, size: string, isDisabled: boolean, text: { runs: { text: string }[] }, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, signInEndpoint: { nextEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, searchEndpoint: { query: string } }, continueAction: string } }, trackingParams: string } }, trackingParams: string, longBylineText: { runs: { text: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string, canonicalBaseUrl: string } } }[] } }, playlistRenderer?: { playlistId: string, title: { simpleText: string }, thumbnails: { thumbnails: { url: string, width: number, height: number }[] }[], videoCount: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, watchEndpoint: { videoId: string, playlistId: string, params: string, loggingContext: { vssLoggingContext: { serializedContextData: string } }, watchEndpointSupportedOnesieConfig: { html5PlaybackOnesieConfig: { commonConfig: { url: string } } } } }, viewPlaylistText: { runs: { text: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string } } }[] }, shortBylineText: { runs: { text: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string, canonicalBaseUrl: string } } }[] }, videos: { childVideoRenderer: { title: { simpleText: string }, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, watchEndpoint: { videoId: string, playlistId: string, loggingContext: { vssLoggingContext: { serializedContextData: string } }, watchEndpointSupportedOnesieConfig: { html5PlaybackOnesieConfig: { commonConfig: { url: string } } } } }, lengthText: { accessibility: { accessibilityData: { label: string } }, simpleText: string }, videoId: string } }[], videoCountText: { runs: { text: string }[] }, trackingParams: string, thumbnailText: { runs: { text: string, bold: boolean }[] }, longBylineText: { runs: { text: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string, canonicalBaseUrl: string } } }[] }, thumbnailRenderer: { playlistVideoThumbnailRenderer: { thumbnail: { thumbnails: { url: string, width: number, height: number }[], sampledThumbnailColor: { red: number, green: number, blue: number }, darkColorPalette: { section2Color: number, iconInactiveColor: number }, vibrantColorPalette: { iconInactiveColor: number } }, trackingParams: string } }, thumbnailOverlays: { thumbnailOverlayBottomPanelRenderer: { text: { simpleText: string }, icon: { iconType: string } } }[] } });
}

export class SearchListResponse {
    /**
     * Identifies the API resource's type. The value will be `youtube#searchListResponse`.
     */
    kind: "youtube#searchListResponse";
    /**
     * The Etag of this resource.
     */
    etag: string;
    /**
     * The token that can be used as the value of the `pageToken` parameter to retrieve the next page in the result set.
     */
    nextPageToken: string;
    /**
     * The token that can be used as the value of the `pageToken` parameter to retrieve the previous page in the result set.
     */
    prevPageToken: string;
    /**
     * The region code that was used for the search query. The property value is a two-letter ISO country code that identifies the region. The `i18nRegions.list` method returns a list of supported regions. The default value is US. If a non-supported region is specified, YouTube might still select another region, rather than the default value, to handle the query.
     */
    regionCode: string;
    /**
     * The `pageInfo` object encapsulates paging information for the result set.
     */
    pageInfo: {
        /**
         * The total number of results in the result set.Please note that the value is an approximation and may not represent an exact value. In addition, the maximum value is 1,000,000.
         * 
         * You should not use this value to create pagination links. Instead, use the `nextPageToken` and `prevPageToken` property values to determine whether to show pagination links.
         */
        totalResults: number,
        /**
         * The number of results included in the API response.
         */
        resultsPerPage: number
    };
    /**
     * A list of results that match the search criteria.
     */
    items: SearchResult[];

    constructor(response: { statusCode: number, statusMessage: string, headers: IncomingHttpHeaders, body: { responseContext: { visitorData: string, serviceTrackingParams: { service: string, params: { key: string, value: string }[] }[], mainAppWebResponseContext: { loggedOut: boolean, trackingParam: string }, webResponseContextExtensionData: { hasDecorated: boolean } }, estimatedResults: string, contents: { twoColumnSearchResultsRenderer: { primaryContents: { sectionListRenderer: { contents: { itemSectionRenderer: { contents: { showingResultsForRenderer?: { showingResultsFor: { runs: { text: string }[] }, correctedQuery: { runs: { text: string, italics: boolean }[] }, correctedQueryEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, searchEndpoint: { query: string } }, searchInsteadFor: { runs: { text: string }[] }, originalQuery: { simpleText: string }, originalQueryEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, searchEndpoint: { query: string, params: string } }, trackingParams: string }, videoRenderer?: { videoId: string, thumbnail: { thumbnails: { url: string, width: number, height: number }[] }, title: { runs: { text: string }[], accessibility: { accessibilityData: { label: string } } }, longBylineText: { runs: { text: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string, canonicalBaseUrl: string } } }[] }, publishedTimeText: { simpleText: string }, lengthText: { accessibility: { accessibilityData: { label: string } }, simpleText: string }, viewCountText: { simpleText: string }, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, watchEndpoint: { videoId: string, params: string, playerParams: string, watchEndpointSupportedOnesieConfig: { html5PlaybackOnesieConfig: { commonConfig: { url: string } } } } }, badges: { metadataBadgeRenderer: { style: string, label: string, trackingParams: string, accessibilityData: { label: string } } }[], ownerBadges: { metadataBadgeRenderer: { icon: { iconType: string }, style: string, tooltip: string, trackingParams: string, accessibilityData: { label: string } } }[], ownerText: { runs: { text: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string, canonicalBaseUrl: string } } }[] }, shortBylineText: { runs: { text: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string, canonicalBaseUrl: string } } }[] }, trackingParams: string, showActionMenu: boolean, shortViewCountText: { accessibility: { accessibilityData: { label: string } }, simpleText: string }, menu: { menuRenderer: { items: { menuServiceItemRenderer: { text: { runs: { text: string }[] }, icon: { iconType: string }, serviceEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { sendPost: boolean } }, signalServiceEndpoint: { signal: string, actions: { clickTrackingParams: string, addToPlaylistCommand: { openMiniplayer: boolean, videoId: string, listType: string, onCreateListCommand: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { sendPost: boolean, apiUrl: string } }, createPlaylistServiceEndpoint: { videoIds: string[], params: string } }, videoIds: string[] } }[] } }, trackingParams: string } }[], trackingParams: string, accessibility: { accessibilityData: { label: string } } } }, channelThumbnailSupportedRenderers: { channelThumbnailWithLinkRenderer: { thumbnail: { thumbnails: { url: string, width: number, height: number }[] }, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string } }, accessibility: { accessibilityData: { label: string } } } }, thumbnailOverlays: { thumbnailOverlayTimeStatusRenderer: { text: { accessibility: { accessibilityData: { label: string } }, simpleText: string }, style: string } }[], richThumbnail: { movingThumbnailRenderer: { movingThumbnailDetails: { thumbnails: { url: string, width: number, height: number }[], logAsMovingThumbnail: boolean }, enableHoveredLogging: boolean, enableOverlay: boolean } }, detailedMetadataSnippets: { snippetText: { runs: { text: string }[] }, snippetHoverText: { runs: { text: string }[] }, maxOneLine: boolean }[], inlinePlaybackEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, watchEndpoint: { videoId: string, params: string, playerParams: string, playerExtraUrlParams: { key: string, value: string }[], watchEndpointSupportedOnesieConfig: { html5PlaybackOnesieConfig: { commonConfig: { url: string } } } } }, searchVideoResultEntityKey: string }, channelRenderer?: { channelId: string, title: { simpleText: string }, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string, canonicalBaseUrl: string } }, thumbnail: { thumbnails: { url: string, width: number, height: number }[] }, shortBylineText: { runs: { text: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string, canonicalBaseUrl: string } } }[] }, videoCountText: { accessibility: { accessibilityData: { label: string } }, simpleText: string }, subscriptionButton: { subscribed: boolean }, ownerBadges: { metadataBadgeRenderer: { icon: { iconType: string }, style: string, tooltip: string, trackingParams: string, accessibilityData: { label: string } } }[], subscriberCountText: { simpleText: string }, subscribeButton: { buttonRenderer: { style: string, size: string, isDisabled: boolean, text: { runs: { text: string }[] }, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, signInEndpoint: { nextEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, searchEndpoint: { query: string } }, continueAction: string } }, trackingParams: string } }, trackingParams: string, longBylineText: { runs: { text: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string, canonicalBaseUrl: string } } }[] } }, playlistRenderer?: { playlistId: string, title: { simpleText: string }, thumbnails: { thumbnails: { url: string, width: number, height: number }[] }[], videoCount: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, watchEndpoint: { videoId: string, playlistId: string, params: string, loggingContext: { vssLoggingContext: { serializedContextData: string } }, watchEndpointSupportedOnesieConfig: { html5PlaybackOnesieConfig: { commonConfig: { url: string } } } } }, viewPlaylistText: { runs: { text: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string } } }[] }, shortBylineText: { runs: { text: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string, canonicalBaseUrl: string } } }[] }, videos: { childVideoRenderer: { title: { simpleText: string }, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, watchEndpoint: { videoId: string, playlistId: string, loggingContext: { vssLoggingContext: { serializedContextData: string } }, watchEndpointSupportedOnesieConfig: { html5PlaybackOnesieConfig: { commonConfig: { url: string } } } } }, lengthText: { accessibility: { accessibilityData: { label: string } }, simpleText: string }, videoId: string } }[], videoCountText: { runs: { text: string }[] }, trackingParams: string, thumbnailText: { runs: { text: string, bold: boolean }[] }, longBylineText: { runs: { text: string, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string, canonicalBaseUrl: string } } }[] }, thumbnailRenderer: { playlistVideoThumbnailRenderer: { thumbnail: { thumbnails: { url: string, width: number, height: number }[], sampledThumbnailColor: { red: number, green: number, blue: number }, darkColorPalette: { section2Color: number, iconInactiveColor: number }, vibrantColorPalette: { iconInactiveColor: number } }, trackingParams: string } }, thumbnailOverlays: { thumbnailOverlayBottomPanelRenderer: { text: { simpleText: string }, icon: { iconType: string } } }[] } }[], trackingParams: string } }[], trackingParams: string, subMenu: { searchSubMenuRenderer: { trackingParams: string } }, hideBottomSeparator: boolean, targetId: string } } } }, trackingParams: string, header: { searchHeaderRenderer: { chipBar: { chipCloudRenderer: { chips: { chipCloudChipRenderer: { style: { styleType: string }, text: { simpleText: string }, trackingParams: string, isSelected: boolean, location: string } }[], trackingParams: string, nextButton: { buttonRenderer: { style: string, size: string, isDisabled: boolean, icon: { iconType: string }, accessibility: { label: string }, trackingParams: string } }, previousButton: { buttonRenderer: { style: string, size: string, isDisabled: boolean, icon: { iconType: string }, accessibility: { label: string }, trackingParams: string } }, loggingDirectives: { trackingParams: string, visibility: { types: string }, enableDisplayloggerExperiment: boolean } } }, searchFilterButton: { buttonRenderer: { style: string, size: string, isDisabled: boolean, text: { runs: { text: string }[] }, icon: { iconType: string }, tooltip: string, trackingParams: string, accessibilityData: { accessibilityData: { label: string } }, command: { clickTrackingParams: string, openPopupAction: { popup: { searchFilterOptionsDialogRenderer: { title: { runs: { text: string }[] }, groups: { searchFilterGroupRenderer: { title: { simpleText: string }, filters: { searchFilterRenderer: { label: { simpleText: string }, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, searchEndpoint: { query: string, params: string } }, tooltip: string, trackingParams: string } }[], trackingParams: string } }[] } }, popupType: string } }, iconPosition: string } }, trackingParams: string } }, topbar: { desktopTopbarRenderer: { logo: { topbarLogoRenderer: { iconImage: { iconType: string }, tooltipText: { runs: { text: string }[] }, endpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number, apiUrl: string } }, browseEndpoint: { browseId: string } }, trackingParams: string, overrideEntityKey: string } }, searchbox: { fusionSearchboxRenderer: { icon: { iconType: string }, placeholderText: { runs: { text: string }[] }, config: { webSearchboxConfig: { requestLanguage: string, requestDomain: string, hasOnscreenKeyboard: boolean, focusSearchbox: boolean } }, trackingParams: string, searchEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, searchEndpoint: { query: string } }, clearButton: { buttonRenderer: { style: string, size: string, isDisabled: boolean, icon: { iconType: string }, trackingParams: string, accessibilityData: { accessibilityData: { label: string } } } } } }, trackingParams: string, topbarButtons: { topbarMenuButtonRenderer: { icon: { iconType: string }, menuRequest: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { sendPost: boolean, apiUrl: string } }, signalServiceEndpoint: { signal: string, actions: { clickTrackingParams: string, openPopupAction: { popup: { multiPageMenuRenderer: { trackingParams: string, style: string, showLoadingSpinner: boolean } }, popupType: string, beReused: boolean } }[] } }, trackingParams: string, accessibility: { accessibilityData: { label: string } }, tooltip: string, style: string } }[], hotkeyDialog: { hotkeyDialogRenderer: { title: { runs: { text: string }[] }, sections: { hotkeyDialogSectionRenderer: { title: { runs: { text: string }[] }, options: { hotkeyDialogSectionOptionRenderer: { label: { runs: { text: string }[] }, hotkey: string } }[] } }[], dismissButton: { buttonRenderer: { style: string, size: string, isDisabled: boolean, text: { runs: { text: string }[] }, trackingParams: string } }, trackingParams: string } }, backButton: { buttonRenderer: { trackingParams: string, command: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { sendPost: boolean } }, signalServiceEndpoint: { signal: string, actions: { clickTrackingParams: string, signalAction: { signal: string } }[] } } } }, forwardButton: { buttonRenderer: { trackingParams: string, command: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { sendPost: boolean } }, signalServiceEndpoint: { signal: string, actions: { clickTrackingParams: string, signalAction: { signal: string } }[] } } } }, a11ySkipNavigationButton: { buttonRenderer: { style: string, size: string, isDisabled: boolean, text: { runs: { text: string }[] }, trackingParams: string, command: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { sendPost: boolean } }, signalServiceEndpoint: { signal: string, actions: { clickTrackingParams: string, signalAction: { signal: string } }[] } } } }, voiceSearchButton: { buttonRenderer: { style: string, size: string, isDisabled: boolean, serviceEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { sendPost: boolean } }, signalServiceEndpoint: { signal: string, actions: { clickTrackingParams: string, openPopupAction: { popup: { voiceSearchDialogRenderer: { placeholderHeader: { runs: { text: string }[] }, promptHeader: { runs: { text: string }[] }, exampleQuery1: { runs: { text: string }[] }, exampleQuery2: { runs: { text: string }[] }, promptMicrophoneLabel: { runs: { text: string }[] }, loadingHeader: { runs: { text: string }[] }, connectionErrorHeader: { runs: { text: string }[] }, connectionErrorMicrophoneLabel: { runs: { text: string }[] }, permissionsHeader: { runs: { text: string }[] }, permissionsSubtext: { runs: { text: string }[] }, disabledHeader: { runs: { text: string }[] }, disabledSubtext: { runs: { text: string }[] }, microphoneButtonAriaLabel: { runs: { text: string }[] }, exitButton: { buttonRenderer: { style: string, size: string, isDisabled: boolean, icon: { iconType: string }, trackingParams: string, accessibilityData: { accessibilityData: { label: string } } } }, trackingParams: string, microphoneOffPromptHeader: { runs: { text: string }[] } } }, popupType: string } }[] } }, icon: { iconType: string }, tooltip: string, trackingParams: string, accessibilityData: { accessibilityData: { label: string } } } } } }, refinements: string[], targetId: string } });
}

/**
 * Returns a collection of search results that match the query parameters specified in the API request. By default, a search result set identifies matching `video`, `channel`, and `playlist` resources, but you can also configure queries to only retrieve a specific type of resource.
 */
export function list(options: {
    /**
     * The `q` parameter specifies the query term to search for.
    **/
    q?: string,
    /**
     * The `pageToken` parameter identifies a specific page in the result set that should be returned. In an API response, the `nextPageToken` and `prevPageToken` properties identify other pages that could be retrieved.
     */
    pageToken?: string
}): Promise<SearchListResponse>;