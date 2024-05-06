import { IncomingHttpHeaders } from "http";
import { Duration } from "./utils";

/**
 * A `video` resource represents a YouTube video.
 */
export class Video {

	/**
	 * Identifies the API resource's type. The value will be `youtube#video`.
	 */
	kind: "youtube#video";

	/**
	 * The Etag of this resource.
	 */
	etag?: string;

	/**
	 * The ID that YouTube uses to uniquely identify the video.
	 */
	id: string;

	/**
	 * The `snippet` object contains basic details about the video, such as
	 * its title, description, and category.
	 */
	snippet: {

		/**
		 * The date and time that the video was published. Note that this time might be
		 * different than the time that the video was uploaded. For example, if a video
		 * is uploaded as a private video and then made at a later time, this
		 * property will specify the time that the video was made public.
		 * 
		 * There are a couple of special cases:
		 * - If a video is uploaded as a private video and the video metadata is
		 * retrieved by the channel owner, then the property value specifies the date
		 * and time that the video was uploaded.
		 * - If a video is uploaded as an unlisted video, the property value also
		 * specifies the date and time that the video was uploaded. In this case, anyone
		 * who knows the video's unique video ID can retrieve the video metadata.
		 */
		publishedAt: Date,

		/**
		 * The ID that YouTube uses to uniquely identify the channel that the video was
		 * uploaded to.
		 */
		channelId: string,

		/**
		 * The video's title. The property value has a maximum length of 100 characters
		 * and may contain all valid UTF-8 characters except < and >. You must set a
		 * value for this property if you call the `videos.update` method and are
		 * updating the {@link snippet `Video#snippet`} part of a `video` resource.
		 */
		title: string,

		/**
		 * The video's description. The property value has a maximum length of 5000
		 * bytes and may contain all valid UTF-8 characters except < and >.
		 */
		description: string,

		/**
		 * A map of thumbnail images associated with the video. For each object in the
		 * map, the key is the name of the thumbnail image, and the value is an object
		 * that contains other information about the thumbnail.
		 * 
		 * Valid key values are:
		 * - `default` – The default thumbnail image. The default thumbnail for
		 * a video – or a resource that refers to a video, such as a playlist item or
		 * search result – is 120px wide and 90px tall. The default thumbnail for a
		 * channel is 88px wide and 88px tall.
		 * - `medium` – A higher resolution version of the thumbnail image. For
		 * a video (or a resource that refers to a video), this image is 320px wide and
		 * 180px tall. For a channel, this image is 240px wide and 240px tall.
		 * - `high – A high resolution version of the thumbnail image. For a
		 * video (or a resource that refers to a video), this image is 480px wide and
		 * 360px tall. For a channel, this image is 800px wide and 800px tall.
		 * - `standard` – An even higher resolution version of the thumbnail
		 * image than the high resolution image. This image is available for some videos
		 * and other resources that refer to videos, like playlist items or search
		 * results. This image is 640px wide and 480px tall.
		 * - `maxres` – The highest resolution version of the thumbnail image.
		 * This image size is available for some videos and other resources that refer
		 * to videos, like playlist items or search results. This image is 1280px wide
		 * and 720px tall.
		 */
		thumbnails: {
			/**
			 * @param key Valid key values are:
			 * - `default` – The default thumbnail image. The default thumbnail for a video – or a resource that refers to a video, such as a playlist item or search result – is 120px wide and 90px tall. The default thumbnail for a channel is 88px wide and 88px tall.
			 * - `medium` – A higher resolution version of the thumbnail image. For a video (or a resource that refers to a video), this image is 320px wide and 180px tall. For a channel, this image is 240px wide and 240px tall.
			 * - `high` – A high resolution version of the thumbnail image. For a video (or a resource that refers to a video), this image is 480px wide and 360px tall. For a channel, this image is 800px wide and 800px tall.
			 * - `standard` – An even higher resolution version of the thumbnail image than the high resolution image. This image is available for some videos and other resources that refer to videos, like playlist items or search results. This image is 640px wide and 480px tall.
			 * - `maxres` – The highest resolution version of the thumbnail image. This image size is available for some videos and other resources that refer to videos, like playlist items or search results. This image is 1280px wide and 720px tall.
			 */
			[key: string]: {
				/**
				 * The image's URL.
				 */
				url: string,
				/**
				 * The image's width.
				 */
				width: number,
				/**
				 * The image's height.
				 */
				height: number
			}
		},

		/**
		 * Channel title for the channel that the video belongs to.
		 */
		channelTitle: string,

		/**
		 * A list of keyword tags associated with the video. Tags may contain spaces.
		 * The property value has a maximum length of 500 characters. Note the following
		 * rules regarding the way the character limit is calculated:
		 * - The property value is a list, and commas between items in the list count
		 * toward the limit.
		 * - If a tag contains a space, the API server handles the tag value as though
		 * it were wrapped in quotation marks, and the quotation marks count toward the
		 * character limit. So, for the purposes of character limits, the tag
		 * **Foo-Baz** contains seven characters, but the tag **Foo Baz** contains
		 * nine characters.
		 */
		tags: string[],

		/**
		 * The YouTube {@link VideoCategory.list video category} associated with the
		 * video. You must set a value for this property if you call the
		 * `videos.update` method and are updating the {@link snippet `snippet`}
		 * part of a `video` resource
		 */
		categoryId: string,

		/**
		 * Indicates if the video is an upcoming/active live broadcast. Or it's "none"
		 * if the video is not an upcoming/active live broadcast.
		 * 
		 * Valid values for this property are:
		 * - `live`
		 * - `none`
		 * - `upcoming`
		 */
		liveBroadcastContent: "live" | "none" | "upcoming",

		/**
		 * The language of the text in the `video` resource's
		 * `snippet.title` and `snippet.description` properties.
		 */
		defaultLanguage: string,

		/**
		 * The `snippet.localized` object contains either a localized title and
		 * description for the video or the title in the {@link snippet.defaultLanguage default language} for the video's metadata.
		 * - Localized text is returned in the resource snippet if the
		 * {@link get `videos.list`} request used the hl parameter to specify a
		 * language for which localized text should be returned and localized text is
		 * available in that language.
		 * - Metadata for the default language is returned if an `hl` parameter
		 * value is not specified or a value is specified but localized metadata is not
		 * available for the specified language.
		 * 
		 * The property contains a read-only value. Use the {@link snippet.localizations
		 * `localizations`} object to add, update, or delete localized titles.
		 */
		localized: {

			/**
			 * The localized video title.
			 */
			title: string,

			/**
			 * The localized video description.
			 */
			description: string

		},

		/**
		 * The `default_audio_language` property specifies the language spoken in
		 * the video's default audio track.
		 */
		defaultAudioLanguage: string

	}

	/**
	 * The `contentDetails` object contains information about the video
	 * content, including the length of the video and an indication of whether
	 * captions are available for the video.
	 */
	contentDetails: {
		/**
		 * The length of the video. The property value is an {@link https://en.wikipedia.org/wiki/ISO_8601#Durations ISO 8601} duration. For example, for a video that is at least one minute long and less than one hour long, the duration is in the format `PT#M#S`, in which the letters `PT` indicate that the value specifies a period of time, and the letters `M` and `S` refer to length in minutes and seconds, respectively. The `#` characters preceding the `M` and `S` letters are both integers that specify the number of minutes (or seconds) of the video. For example, a value of `PT15M33S` indicates that the video is 15 minutes and 33 seconds long.
		 * 
		 * If the video is at least one hour long, the duration is in the format `PT#H#M#S`, in which the `#` preceding the letter `H` specifies the length of the video in hours and all of the other details are the same as described above. If the video is at least one day long, the letters `P` and `T` are separated, and the value's format is `P#DT#H#M#S`. Please refer to the ISO 8601 specification for complete details.
		 */
		duration: Duration,//string,
		dimension: string,
		definition: string,
		caption: string,
		licensedContent: boolean,
		regionRestriction: {
			allowed: string[],
			blocked: string[]
		},
		contentRating: {
			acbRating: string,
			agcomRating: string,
			anatelRating: string,
			bbfcRating: string,
			bfvcRating: string,
			bmukkRating: string,
			catvRating: string,
			catvfrRating: string,
			cbfcRating: string,
			cccRating: string,
			cceRating: string,
			chfilmRating: string,
			chvrsRating: string,
			cicfRating: string,
			cnaRating: string,
			cncRating: string,
			csaRating: string,
			cscfRating: string,
			czfilmRating: string,
			djctqRating: string,
			djctqRatingReasons: string[],
			ecbmctRating: string,
			eefilmRating: string,
			egfilmRating: string,
			eirinRating: string,
			fcbmRating: string,
			fcoRating: string,
			fmocRating: string,
			fpbRating: string,
			fpbRatingReasons: string[],
			fskRating: string,
			grfilmRating: string,
			icaaRating: string,
			ifcoRating: string,
			ilfilmRating: string,
			incaaRating: string,
			kfcbRating: string,
			kijkwijzerRating: string,
			kmrbRating: string,
			lsfRating: string,
			mccaaRating: string,
			mccypRating: string,
			mcstRating: string,
			mdaRating: string,
			medietilsynetRating: string,
			mekuRating: string,
			mibacRating: string,
			mocRating: string,
			moctwRating: string,
			mpaaRating: string,
			mpaatRating: string,
			mtrcbRating: string,
			nbcRating: string,
			nbcplRating: string,
			nfrcRating: string,
			nfvcbRating: string,
			nkclvRating: string,
			oflcRating: string,
			pefilmRating: string,
			rcnofRating: string,
			resorteviolenciaRating: string,
			rtcRating: string,
			rteRating: string,
			russiaRating: string,
			skfilmRating: string,
			smaisRating: string,
			smsaRating: string,
			tvpgRating: string,
			/**
			 * A rating that YouTube uses to identify age-restricted content.
			 * 
			 * Valid values for this property are:
			 * - `ytAgeRestricted`
			 */
			ytRating: "ytAgeRestricted" | undefined
		},
		/**
		 * Specifies the projection format of the video.
		 * 
		 * Valid values for this property are:
		 * - `360`
		 * - `rectangular`
		 */
		projection: "360" | "rectangular",
		/**
		 * Indicates whether the video uploader has provided a custom thumbnail image for the video. This property is only visible to the video uploader.
		 */
		hasCustomThumbnail: boolean
	}

	/**
	 * The `status` object contains information about the video's uploading, processing, and privacy statuses.
	 */
	status: {
		uploadStatus: string,
		failureReason: string,
		rejectionReason: string,
		/**
		 * The video's privacy status.
		 * 
		 * Valid values for this property are:
		 * - `private`
		 * - `public`
		 * - `unlisted`
		 */
		privacyStatus: "private" | "public" | "unlisted",
		publishAt: Date,
		license: string,
		/**
		 * This value indicates whether the video can be embedded on another website.
		 */
		embeddable: boolean,
		publicStatsViewable: boolean,
		madeForKids: boolean,
		selfDeclaredMadeForKids: boolean
	}

	/**
	 * The `statistics` object contains statistics about the video.
	 */
	statistics: {
		/**
		 * The number of times the video has been viewed.
		 */
		viewCount: string,
		/**
		 * The number of users who have indicated that they liked the video.
		 */
		likeCount: string,
		/**
		 * **Note:** The `statistics.dislikeCount` property was made private as of December 13, 2021. This means that the property is included in an API response only if the API request was authenticated by the video owner. See the {@link https://developers.google.com/youtube/v3/revision_history#release_notes_12_15_2021 revision history} for more information.
		 * 
		 * The number of users who have indicated that they disliked the video.
		 */
		dislikeCount: string,
		/**
		 * **Note:** This property has been deprecated. The deprecation is effective as of August 28, 2015. The property's value is now always set to 0.
		 */
		favoriteCount: string,
		/**
		 * The number of comments for the video.
		 */
		commentCount: string
	}

	/**
	 * The `player` object contains information that you would use to play the video in an embedded player.
	 */
	player: {
		/**
		 * An `<iframe>` tag that embeds a player that plays the video.
		 * - If the API request to retrieve the resource specifies a value for the {@link get `maxHeight`} and/or {@link get `maxWidth`} parameters, the size of the embedded player is scaled to satisfy the `maxHeight` and/or `maxWidth` requirements.
		 * - If the video's aspect ratio is unknown, the embedded player defaults to a 4:3 format.
		 */
		embedHtml: string,
		/**
		 * The height of the embedded player returned in the `player.embedHtml` property. This property is only returned if the request specified a value for the {@link get `maxHeight`} and/or {@link get `maxWidth`} parameters and the video's aspect ratio is known.
		 */
		embedHeight: number,
		/**
		 * The width of the embedded player returned in the `player.embedHtml` property. This property is only returned if the request specified a value for the {@link get `maxHeight`} and/or {@link get `maxWidth`} parameters and the video's aspect ratio is known.
		 */
		embedWidth: number
	}

	/**
	 * The `topicDetails` object encapsulates information about topics associated with the video.
	 * 
	 * **Important:** See the definitions of the `topicDetails.relevantTopicIds[]` and `topicDetails.topicIds[]` properties as well as the {@link https://developers.google.com/youtube/v3/revision_history#november-10-2016 revision history} for more details about upcoming changes related to topic IDs.
	 */
	topicDetails: {
		/**
		 * @deprecated **Important:** This property has been deprecated as of November 10, 2016. The API no longer returns values for this property, and any topics associated with a video are now returned by the `topicDetails.relevantTopicIds[]` property value.
		 */
		topicIds: string[],
		/**
		 * A list of topic IDs that are relevant to the video.
		 * @deprecated This property has been deprecated as of November 10, 2016. It will be supported until November 10, 2017.
		 * 
		 * **Important:** Due to the deprecation of Freebase and the Freebase API, topic IDs started working differently as of February 27, 2017. At that time, YouTube started returning a small set of curated topic IDs.
		 * 
		 * {@link https://developers.google.com/youtube/v3/docs/videos# See topic IDs supported as of February 15, 2017}
		 */
		relevantTopicIds: string[],
		/**
		 * A list of Wikipedia URLs that provide a high-level description of the video's content.
		 */
		topicCategories: string[]
	}

	recordingDetails: {
		recordingDate: Date
	}

	/**
	 * The `fileDetails` object encapsulates information about the video file that was uploaded to YouTube, including the file's resolution, duration, audio and video codecs, stream bitrates, and more. This data can only be retrieved by the video owner.
	 * 
	 * The `fileDetails` object will only be returned if the {@link processingDetails.fileDetailsAvailability `processingDetails.fileAvailability`} property has a value of `available`.
	 */
	fileDetails: {
		/**
		 * The uploaded file's name. This field is present whether a video file or another type of file was uploaded.
		 */
		fileName: string,
		/**
		 * The uploaded file's size in bytes. This field is present whether a video file or another type of file was uploaded.
		 */
		fileSize: number,
		/**
		 * The uploaded file's type as detected by YouTube's video processing engine. Currently, YouTube only processes video files, but this field is present whether a video file or another type of file was uploaded.
		 * 
		 * Valid values for this property are:
		 * - `archive` – The file is an archive file, such as a .zip archive.
		 * - `audio` – The file is a known audio file type, such as an .mp3 file.
		 * - `document` – The file is a document or text file, such as a MS Word document.
		 * - `image` – The file is an image file, such as a .jpeg image.
		 * - `other` – The file is another non-video file type.
		 * - `project` – The file is a video project file, such as a Microsoft Windows Movie Maker project, that does not contain actual video data.
		 * - `video` – The file is a known video file type, such as an .mp4 file.
		 */
		fileType: "archive" | "audio" | "document" | "image" | "other" | "project" | "video",
		/**
		 * The uploaded video file's container format.
		 */
		container: string,
		/**
		 * A list of video streams contained in the uploaded video file. Each item in the list contains detailed metadata about a video stream.
		 */
		videoStreams: {
			/**
			 * The encoded video content's width in pixels. You can calculate the video's encoding aspect ratio as `width_pixels` / `height_pixels`.
			 */
			widthPixels: number,
			/**
			 * The encoded video content's height in pixels.
			 */
			heightPixels: number,
			/**
			 * The video stream's frame rate, in frames per second.
			 */
			frameRateFps: number,
			/**
			 * The video content's display aspect ratio, which specifies the aspect ratio in which the video should be displayed.
			 */
			aspectRatio: number,
			/**
			 * The video codec that the stream uses.
			 */
			codec: string,
			/**
			 * The video stream's bitrate, in bits per second.
			 */
			bitrateBps: number,
			/**
			 * The amount that YouTube needs to rotate the original source content to properly display the video.
			 * 
			 * Valid values for this property are:
			 * - `clockwise` – The video needs to be rotated 90 degrees clockwise.
			 * - `counterClockwise` – The video needs to be rotated 90 degrees counter-clockwise.
			 * - `none` – The video does not need to be rotated.
			 * - `other` – The video needs to be rotated in some other, non-trivial way.
			 * - `upsideDown` – The video needs to be rotated upside down.
			 */
			rotation: "clockwise" | "counterClockwise" | "none" | "other" | "upsideDown",
			/**
			 * A value that uniquely identifies a video vendor. Typically, the value is a four-letter vendor code.
			 */
			vendor: string,
			download(path?: string): Promise<string>;
		}[],
		/**
		 * A list of audio streams contained in the uploaded video file. Each item in the list contains detailed metadata about an audio stream.
		 */
		audioStreams: {
			/**
			 * The number of audio channels that the stream contains.
			 */
			channelCount: number,
			/**
			 * The audio codec that the stream uses.
			 */
			codec: "opus" | "mp4a.40.2",
			/**
			 * The audio stream's bitrate, in bits per second.
			 */
			bitrateBps: number,
			/**
			 * A value that uniquely identifies a video vendor. Typically, the value is a four-letter vendor code.
			 */
			vendor: string,
			/**
			 * The content length of the audio stream in bytes.
			 */
			contentLength: number,
			url: string
		}[],
		/**
		 * The length of the uploaded video in milliseconds.
		 */
		durationMs: number,
		/**
		 * The uploaded video file's combined (video and audio) bitrate in bits per second.
		 */
		bitrateBps: number,
		/**
		 * The date and time when the uploaded video file was created.
		 * 
		 * The value is specified in ISO 8601 format. Currently, the following {@link http://www.w3.org/TR/NOTE-datetime ISO 8601} formats are supported:
		 * - Date only: `YYYY-MM-DD`
		 * - Naive time: `YYYY-MM-DDTHH:MM:SS`
		 * - Time with timezone: `YYYY-MM-DDTHH:MM:SS+HH:MM`
		 */
		creationTime: string
	}

	/**
	 * The `processingDetails` object encapsulates information about YouTube's progress in processing the uploaded video file. The properties in the object identify the current processing status and an estimate of the time remaining until YouTube finishes processing the video. This part also indicates whether different types of data or content, such as file details or thumbnail images, are available for the video.
	 * 
	 * The `processingProgress` object is designed to be polled so that the video uploaded can track the progress that YouTube has made in processing the uploaded video file. This data can only be retrieved by the video owner.
	 */
	processingDetails: {
		/**
		 * The video's processing status. This value indicates whether YouTube was able to process the video or if the video is still being processed.
		 * 
		 * Valid values for this property are:
		 * - `failed` – Video processing has failed. See ProcessingFailureReason.
		 * - `processing` – Video is currently being processed. See ProcessingProgress.
		 * - `succeeded` – Video has been successfully processed.
		 * - `terminated` – Processing information is no longer available.
		 */
		processingStatus: "failed" | "processing" | "succeeded" | "terminated",
		/**
		 * The `processingProgress` object contains information about the progress YouTube has made in processing the video. The values are really only relevant if the video's processing status is `processing`.
		 */
		processingProgress: {
			/**
			 * An estimate of the total number of parts that need to be processed for the video. The number may be updated with more precise estimates while YouTube processes the video.
			 */
			partsTotal: number,
			/**
			 * The number of parts of the video that YouTube has already processed. You can estimate the percentage of the video that YouTube has already processed by calculating:
			 * `100 * parts_processed / parts_total`
			 * 
			 * Note that since the estimated number of parts could increase without a corresponding increase in the number of parts that have already been processed, it is possible that the calculated progress could periodically decrease while YouTube processes a video.
			 */
			partsProcessed: number,
			/**
			 * An estimate of the amount of time, in millseconds, that YouTube needs to finish processing the video.
			 */
			timeLeftMs: number
		},
		processingFailureReason: string,
		fileDetailsAvailability: string,
		processingIssuesAvailability: string,
		tagSuggestionsAvailability: string,
		editorSuggestionsAvailability: string,
		thumbnailsAvailability: string
	}

	suggestions: {
		processingErrors: string[],
		processingWarnings: string[],
		processingHints: string[],
		tagSuggestions: {
			tag: string,
			categoryRestricts: string[]
		}[],
		editorSuggestions: string[]
	}

	liveStreamingDetails: {
		actualStartTime: Date,
		actualEndTime: Date,
		scheduledStartTime: Date,
		scheduledEndTime: Date,
		concurrentViewers: number,
		activeLiveChatId: string
	}

	/**
	 * The `localizations object` contains translations of the video's metadata.
	 */
	localizations: {
		/**
		 * @param key The language of the localized text associated with the key value. The value is a string that contains a {@link http://www.rfc-editor.org/rfc/bcp/bcp47.txt BCP-47} language code.
		 */
		[key: string]: {
			/**
			 * The localized video title.
			 */
			title: string,
			/**
			 * The localized video description.
			 */
			description: string
		}
	}

	constructor(data: { statusCode: number, statusMessage: string, headers: IncomingHttpHeaders, body: { responseContext: { visitorData: string, serviceTrackingParams: { service: string, params: { key: string, value: string }[] }[], mainAppWebResponseContext: { loggedOut: boolean, trackingParam: string }, webResponseContextExtensionData: { hasDecorated: boolean } }, playabilityStatus: { status: string, playableInEmbed: boolean, miniplayer: { miniplayerRenderer: { playbackMode: string } }, contextParams: string }, streamingData: { expiresInSeconds: string, formats: { itag: number, mimeType: string, bitrate: number, width: number, height: number, lastModified: string, quality: string, fps: number, qualityLabel: string, projectionType: string, audioQuality: string, approxDurationMs: string, audioSampleRate: string, audioChannels: number, signatureCipher: string }[], adaptiveFormats: { itag: number, mimeType: string, bitrate: number, width: number, height: number, initRange: { start: string, end: string }, indexRange: { start: string, end: string }, lastModified: string, contentLength: string, quality: string, fps: number, qualityLabel: string, projectionType: string, averageBitrate: number, approxDurationMs: string, signatureCipher: string }[] }, playerAds: { playerLegacyDesktopWatchAdsRenderer: { playerAdParams: { showContentThumbnail: boolean, enabledEngageTypes: string }, gutParams: { tag: string }, showCompanion: boolean, showInstream: boolean, useGut: boolean } }[], playbackTracking: { videostatsPlaybackUrl: { baseUrl: string }, videostatsDelayplayUrl: { baseUrl: string }, videostatsWatchtimeUrl: { baseUrl: string }, ptrackingUrl: { baseUrl: string }, qoeUrl: { baseUrl: string }, atrUrl: { baseUrl: string, elapsedMediaTimeSeconds: number }, videostatsScheduledFlushWalltimeSeconds: number[], videostatsDefaultFlushIntervalSeconds: number }, videoDetails: { videoId: string, title: string, lengthSeconds: string, keywords: string[], channelId: string, isOwnerViewing: boolean, shortDescription: string, isCrawlable: boolean, thumbnail: { thumbnails: { url: string, width: number, height: number }[] }, allowRatings: boolean, viewCount: string, author: string, isPrivate: boolean, isUnpluggedCorpus: boolean, isLiveContent: boolean }, playerConfig: { audioConfig: { loudnessDb: number, perceptualLoudnessDb: number, enablePerFormatLoudness: boolean }, streamSelectionConfig: { maxBitrate: string }, mediaCommonConfig: { dynamicReadaheadConfig: { maxReadAheadMediaTimeMs: number, minReadAheadMediaTimeMs: number, readAheadGrowthRateMs: number } }, webPlayerConfig: { useCobaltTvosDash: boolean, webPlayerActionsPorting: { getSharePanelCommand: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { sendPost: boolean, apiUrl: string } }, webPlayerShareEntityServiceEndpoint: { serializedShareEntity: string } }, subscribeCommand: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { sendPost: boolean, apiUrl: string } }, subscribeEndpoint: { channelIds: string[], params: string } }, unsubscribeCommand: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { sendPost: boolean, apiUrl: string } }, unsubscribeEndpoint: { channelIds: string[], params: string } }, addToWatchLaterCommand: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { sendPost: boolean, apiUrl: string } }, playlistEditEndpoint: { playlistId: string, actions: { addedVideoId: string, action: string }[] } }, removeFromWatchLaterCommand: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { sendPost: boolean, apiUrl: string } }, playlistEditEndpoint: { playlistId: string, actions: { action: string, removedVideoId: string }[] } } } } }, storyboards: { playerStoryboardSpecRenderer: { spec: string, recommendedLevel: number } }, microformat: { playerMicroformatRenderer: { thumbnail: { thumbnails: { url: string, width: number, height: number }[] }, embed: { iframeUrl: string, width: number, height: number }, title: { simpleText: string }, description: { simpleText: string }, lengthSeconds: string, ownerProfileUrl: string, externalChannelId: string, isFamilySafe: boolean, availableCountries: string[], isUnlisted: boolean, hasYpcMetadata: boolean, viewCount: string, category: string, publishDate: string, ownerChannelName: string, uploadDate: string } }, cards: { cardCollectionRenderer: { cards: { cardRenderer: { teaser: { simpleCardTeaserRenderer: { message: { simpleText: string }, trackingParams: string, prominent: boolean, logVisibilityUpdates: boolean, onTapCommand: { clickTrackingParams: string, changeEngagementPanelVisibilityAction: { targetId: string, visibility: string } } } }, cueRanges: { startCardActiveMs: string, endCardActiveMs: string, teaserDurationMs: string, iconAfterTeaserMs: string }[], trackingParams: string } }[], headerText: { simpleText: string }, icon: { infoCardIconRenderer: { trackingParams: string } }, closeButton: { infoCardIconRenderer: { trackingParams: string } }, trackingParams: string, allowTeaserDismiss: boolean, logIconVisibilityUpdates: boolean } }, trackingParams: string, attestation: { playerAttestationRenderer: { challenge: string, botguardData: { program: string, interpreterSafeUrl: { privateDoNotAccessOrElseTrustedResourceUrlWrappedValue: string }, serverEnvironment: number } } }, videoQualityPromoSupportedRenderers: { videoQualityPromoRenderer: { triggerCriteria: { connectionWhitelist: string[], joinLatencySeconds: number, rebufferTimeSeconds: number, watchTimeWindowSeconds: number, refractorySeconds: number }, text: { runs: { text: string }[] }, endpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, urlEndpoint: { url: string, target: string } }, trackingParams: string, snackbar: { notificationActionRenderer: { responseText: { runs: { text: string }[] }, actionButton: { buttonRenderer: { text: { runs: { text: string }[] }, navigationEndpoint: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, urlEndpoint: { url: string, target: string } }, trackingParams: string } }, trackingParams: string } } } }, messages: { mealbarPromoRenderer: { icon: { thumbnails: { url: string, width: number, height: number }[] }, messageTexts: { runs: { text: string }[] }[], actionButton: { buttonRenderer: { style: string, size: string, text: { runs: { text: string }[] }, trackingParams: string, command: { clickTrackingParams: string, commandExecutorCommand: { commands: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { url: string, webPageType: string, rootVe: number } }, urlEndpoint: { url: string, target: string } }[] } } } }, dismissButton: { buttonRenderer: { style: string, size: string, text: { runs: { text: string }[] }, trackingParams: string, command: { clickTrackingParams: string, commandExecutorCommand: { commands: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { sendPost: boolean, apiUrl: string } }, feedbackEndpoint: { feedbackToken: string, uiActions: { hideEnclosingContainer: boolean } } }[] } } } }, triggerCondition: string, style: string, trackingParams: string, impressionEndpoints: { clickTrackingParams: string, commandMetadata: { webCommandMetadata: { sendPost: boolean, apiUrl: string } }, feedbackEndpoint: { feedbackToken: string, uiActions: { hideEnclosingContainer: boolean } } }[], isVisible: boolean, messageTitle: { runs: { text: string }[] }, enableSharedFeatureForImpressionHandling: boolean } }[], adPlacements: { adPlacementRenderer: { config: { adPlacementConfig: { kind: string, adTimeOffset: { offsetStartMilliseconds: string, offsetEndMilliseconds: string }, hideCueRangeMarker: boolean } }, renderer: { adBreakServiceRenderer: { prefetchMilliseconds: string, getAdBreakUrl: string } }, adSlotLoggingData: { serializedSlotAdServingDataEntry: string } } }[], frameworkUpdates: { entityBatchUpdate: { mutations: { entityKey: string, type: string, payload: { offlineabilityEntity: { key: string, addToOfflineButtonState: string } } }[], timestamp: { seconds: string, nanos: number } } } } }, js: { functions: string, decipherFunction: string, signatureTimestamp: number });

}

/**
 * @param id The id parameter specifies the YouTube video ID for the resource that is being retrieved. In a `video` resource, the `id` property specifies the video's ID.
 */
export function get(id: string): Promise<Video | "PRIVATE" | null>;

export function getMusicSearchSuggestions(q: string): Promise<string[]>;