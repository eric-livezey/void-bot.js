interface StereoLayout {
	readonly STEREO_LAYOUT_UNKNOWN: 0;
	readonly STEREO_LAYOUT_LEFT_RIGHT: 1;
	readonly STEREO_LAYOUT_TOP_BOTTOM: 2;
}

interface ProjectionType {
	readonly EQUIRECTANGULAR: 0;
	readonly MESH: 1;
	readonly UNKNOWN: null;
}

interface VideoQuality {
	readonly auto: 0;
	readonly tiny: 144;
	readonly light: 144;
	readonly small: 240;
	readonly medium: 360;
	readonly large: 480;
	readonly hd720: 720;
	readonly hd1080: 1080;
	readonly hd1440: 1440;
	readonly hd2160: 2160;
	readonly hd2880: 2880;
	readonly highres: 4320;
}

interface ColorTransferCharacteristics {
	readonly COLOR_TRANSFER_CHARACTERISTICS_BT709: "bt709";
	readonly COLOR_TRANSFER_CHARACTERISTICS_BT2020_10: "bt2020";
	readonly COLOR_TRANSFER_CHARACTERISTICS_SMPTEST2084: "smpte2084";
	readonly COLOR_TRANSFER_CHARACTERISTICS_ARIB_STD_B67: "arib-std-b67";
	readonly COLOR_TRANSFER_CHARACTERISTICS_UNKNOWN: null;
	readonly COLOR_TRANSFER_CHARACTERISTICS_UNSPECIFIED: null;
}

interface ColorPrimaries {
	readonly COLOR_PRIMARIES_BT709: "bt709";
	readonly COLOR_PRIMARIES_BT2020: "bt2020";
	readonly COLOR_PRIMARIES_UNKNOWN: null;
	readonly COLOR_PRIMARIES_UNSPECIFIED: null;
}

interface StreamType {
	readonly FAIRPLAY: "fairplay";
	readonly PLAYREADY: "playready";
	readonly WIDEVINE: "widevine";
	readonly CLEARKEY: null;
	readonly FLASHACCESS: null;
	readonly UNKNOWN: null;
	readonly WIDEVINE_CLASSIC: null;
}

interface LatencyClass {
	readonly MDE_STREAM_OPTIMIZATIONS_RENDERER_LATENCY_UNKNOWN: "UNKNOWN",
	readonly MDE_STREAM_OPTIMIZATIONS_RENDERER_LATENCY_NORMAL: "NORMAL",
	readonly MDE_STREAM_OPTIMIZATIONS_RENDERER_LATENCY_LOW: "LOW",
	readonly MDE_STREAM_OPTIMIZATIONS_RENDERER_LATENCY_ULTRA_LOW: "ULTRALOW"
}

type Parameter = {
	key: string;
	value: string;
}

type Range = {
	start: string;
	end: string;
}

type AudioTrack = {
	displayName: string;
	id: string;
	audioIsDefault: boolean;
}

type ColorInfo = {
	primaries: keyof ColorPrimaries;
	transferCharacteristics?: keyof ColorTransferCharacteristics;
}

type Format = {
	mimeType?: string;
	itag?: number;
	xtags?: string;
	captionTrack?: { displayName?: string; vssId?: string; languageCode?: string; kind?: string; id?: string; };
	bitrate?: number;
	contentLength?: number;
	lastModified?: number;
	drmFamilies?: string[];
	type?: keyof StreamType;
	targetDurationSec?: number;
	maxDvrDurationSec?: number;
	initRange?: Range;
	indexRange?: Range;
	cipher?: string;
	signatureCipher?: string;
	url?: string;
}

type VideoFormat = Format & {
	width?: number;
	height?: number;
	fps?: number;
	qualityLabel?: keyof VideoQuality;
	colorInfo?: ColorInfo;
	projectionType?: keyof ProjectionType;
	stereoLayout?: keyof StereoLayout;
}

type AudioFormat = Format & {
	audioSampleRate?: number;
	audioTrack?: AudioTrack;
	audioChannels?: number;
	spatialAudioType?: string;
	isDrc?: boolean;
	loudnessDb?: number;
	trackAbsoluteLoudnessLkfs?: number;
}

type Thumbnail = {
	thumbnails: {
		url: string;
		width: number;
		height: number;
	}[];
}

type NavigationEndpoint = {
	clickTrackingParams: string;
	loggingUrls?: LoggingURL[];
	commandMetadata?: {
		interactionLoggingCommandMetadata?: {
			loggingExpectations?: {
				screenCreatedLoggingExpectations: {
					expectedParentScreens: {
						screenVeType: number;
					}[];
				};
			};
		};
		webCommandMetadata?: {
			url?: string;
			sendPost?: boolean;
			webPageType?: string;
			rootVe?: number;
			apiUrl?: string;
		};
	};
	watchEndpoint?: {
		videoId?: string;
		playlistId?: string;
		index?: number;
		params?: string;
		playerParams?: string;
		loggingContext?: {
			vssLoggingContext: {
				serializedContextData: string;
			};
		};
		watchEndpointSupportedOnesieConfig?: {
			html5PlaybackOnesieConfig: {
				commonConfig: {
					url: string;
				};
			};
		};
	};
	browseEndpoint?: {
		browseId: string;
		canonicalBaseUrl: string;
	};
	signInEndpoint?: {
		nextEndpoint: NavigationEndpoint;
	};
	urlEndpoint?: {
		url: string;
		target: string;
		attributionSrcMode: string;
	};
	createPlaylistServiceEndpoint?: {
		videoIds: string[];
		params: string;
	};
	continuationCommand?: {
		token: string;
		request: string;
		command?: {
			clickTrackingParams: string;
			showReloadUiCommand: {
				targetId: string;
			};
		};
	};
	playlistEditEndpoint?: {
		playlistId?: string;
		actions: {
			action: string;
			removedVideoId?: string;
			addedVideoId?: string;
			sourcePlaylistId?: string;
		}[];
	};
	pingingEndpoint?: {
		hack: boolean;
	};
}

type Accessibility = {
	accessibilityData?: {
		label?: string;
	}
};

type LoggingURL = {
	baseUrl: string;
	headers?: {
		headerType: string;
	}[];
	attributionSrcMode?: string;
	elapsedMediaTimeSeconds?: number;
	offsetMilliseconds?: number;
}

type Icon = {
	iconType: string;
}

type OverlayRenderer = {
	text: TextRenderer;
	style?: string;
	icon?: Icon;
}

type TextRenderer = {
	simpleText?: string;
	runs?: {
		text: string;
		bold?: boolean;
		italics?: boolean;
		strikethrough?: boolean;
		navigationEndpoint?: NavigationEndpoint;
	}[];
	accessibility?: Accessibility;
}

export type RawPlayerData = {
	responseContext: {
		visitorData: string;
		serviceTrackingParams: {
			service: string;
			params: Parameter[];
		}[];
		maxAgeSeconds: number;
		mainAppWebResponseContext?: {
			loggedOut: boolean;
			trackingParam: string;
		};
		webResponseContextExtensionData?: {
			webResponseContextPreloadData?: {
				preloadMessageNames: string[];
			};
			hasDecorated: boolean;
		};
	};
	playabilityStatus: {
		backgroundability?: unknown;
		offlineability?: unknown;
		contextParams?: string;
		pictureInPicture?: unknown;
		playableInEmbed?: boolean;
		status?: "OK" | "LIVE_STREAM_OFFLINE" | "FULLSCREEN_ONLY" | "LOGIN_REQUIRED" | "CONTENT_CHECK_REQUIRED" | "AGE_CHECK_REQUIRED";
		ypcClickwrap?: unknown;
		errorScreen?: {
			playerErrorMessageRenderer?: {
				subreason?: TextRenderer;
				icon?: Icon;
				reason?: TextRenderer;
				thumbnail?: Thumbnail;
				proceedButton?: {
					buttonRenderer: {
						style: string;
						size?: string;
						isDisabled: boolean;
						text: TextRenderer;
						navigationEndpoint: NavigationEndpoint;
						trackingParams: string;
					};
				};
			};
			playerLegacyDesktopYpcTrailerRenderer?: {
				trailerVideoId?: string;
				ypcTrailer?: {
					ypcTrailerRenderer?: unknown;
				};
			}
			playerLegacyDesktopYpcOfferRenderer?: {
				itemTitle?: string;
				itemBuyUrl?: unknown;
				itemThumbnail?: string;
				offerHeadline?: string;
				offerDescription?: string;
				offerId?: string;
				offerButtonText?: string;
				offerButtonFormattedText?: unknown;
				overlayDurationMsec?: number;
				fullVideoMessage?: string;
			};
			ypcTrailerRenderer?: {
				fullVideoMessage?: TextRenderer;
			};
			playerKavRenderer?: {
				kavUrl?: string;
			};
		};
		errorCode?: string;
		reason?: string;
		isBlockedInRestrictedMode?: boolean;
		liveStreamability?: {
			liveStreamabilityRenderer: {
				videoId: string;
				pollDelayMs: string;
				displayEndscreen?: boolean;
				broadcastId?: string;
			};
		};
		miniplayer?: {
			miniplayerRenderer: {
				playbackMode: string;
			};
		};
		audioOnlyPlayability?: {
			audioOnlyPlayabilityRenderer: {
				trackingParams: string;
				audioOnlyAvailability: string;
			};
		};
		transportControlsConfig?: {
			seekForwardStatus: {
				replaceDefault: boolean;
			};
			seekBackwardStatus: {
				replaceDefault: boolean;
			};
			playbackRateStatus: {
				replaceDefault: boolean;
			};
		};
		desktopLegacyAgeGateReason?: number;
		messages?: string[];
	};
	streamingData?: {
		adaptiveFormats?: ((AudioFormat | VideoFormat) & {
			distinctParams?: string
		})[];
		streamingUrlTemplate?: string;
		formats?: (AudioFormat & VideoFormat)[];
		hlsFormats?: {
			itag: number;
			mimeType: string;
			url: string;
			bitrate: number;
			width: number;
			height: number;
			fps: number;
			audioTrack?: AudioTrack;
			drmFamilies?: string[];
			colorInfo?: ColorInfo;
			audioChannels?: number;
		}[];
		licenseInfos?: {
			drmFamily: string;
			url: string;
		}[];
		drmParams?: string;
		dashManifestUrl?: string;
		hlsManifestUrl?: string;
		probeUrl?: string;
		serverAbrStreamingUrl?: string;
	};
	heartbeatParams?: {
		softFailOnError: boolean;
		heartbeatServerData: string;
		intervalMilliseconds?: string;
	};
	playerAds?: {
		playerLegacyDesktopWatchAdsRenderer: {
			playerAdParams: {
				showContentThumbnail: boolean;
				adPreroll?: string;
				tagForChildDirected?: boolean;
				adDevice?: number;
				midrollFreqcap?: number;
				sffb?: boolean;
				adLoggingFlag?: number;
				fadeOutStartMilliseconds?: number;
				fadeOutDurationMilliseconds?: number;
				fadeInStartMilliseconds?: number;
				fadeInDurationMilliseconds?: number;
				applyFadeOnMidrolls?: boolean;
				enabledEngageTypes?: string;
			};
			gutParams: {
				tag: string;
			};
			showCompanion: boolean;
			showInstream: boolean;
			useGut: boolean;
		};
	}[];
	playbackTracking?: {
		videostatsPlaybackUrl: LoggingURL;
		videostatsDelayplayUrl: LoggingURL;
		videostatsWatchtimeUrl: LoggingURL;
		ptrackingUrl: LoggingURL;
		qoeUrl: LoggingURL;
		atrUrl: LoggingURL;
		videostatsScheduledFlushWalltimeSeconds: number[];
		videostatsDefaultFlushIntervalSeconds: number;
		youtubeRemarketingUrl?: LoggingURL;
	};
	videoDetails?: {
		videoId?: string;
		channelId?: string;
		title?: string;
		lengthSeconds?: string;
		keywords?: string[];
		viewCount?: string;
		author?: string;
		shortDescription?: string;
		isCrawlable?: boolean;
		musicVideoType?: string;
		isLive?: boolean;
		isUpcoming?: boolean;
		isLiveContent?: boolean;
		thumbnail?: Thumbnail;
		isExternallyHostedPodcast?: boolean;
		viewerLivestreamJoinPosition?: any;
		isLiveDefaultBroadcast?: boolean;
		isPostLiveDvr?: boolean;
		latencyClass?: keyof LatencyClass;
		isLowLatencyLiveStream?: boolean;
		isLiveDvrEnabled?: boolean;
		liveChunkReadahead?: number;
		isPrivate?: boolean;
		// not found in base.js
		isOwnerViewing?: boolean;
		allowRatings?: boolean;
		isUnpluggedCorpus?: boolean;
	};
	annotations?: {
		playerAnnotationsExpandedRenderer: {
			featuredChannel: {
				startTimeMs: string;
				endTimeMs: string;
				watermark: Thumbnail;
				trackingParams: string;
				navigationEndpoint: NavigationEndpoint;
				channelName: string;
				subscribeButton: {
					subscribeButtonRenderer: {
						buttonText: TextRenderer;
						subscribed: boolean;
						enabled: boolean;
						type: string;
						channelId: string;
						showPreferences: boolean;
						subscribedButtonText: TextRenderer;
						unsubscribedButtonText: TextRenderer;
						trackingParams: string;
						unsubscribeButtonText: TextRenderer;
						serviceEndpoints: {
							clickTrackingParams: string;
							subscribeEndpoint?: {
								channelIds: string[];
								params: string;
							};
							commandMetadata?: {
								webCommandMetadata: {
									sendPost: boolean;
									apiUrl?: string;
								};
							};
							unsubscribeEndpoint?: {
								channelIds: string[];
								params: string;
							};
							signalServiceEndpoint?: {
								signal: string;
								actions: {
									clickTrackingParams: string;
									openPopupAction: {
										popup: {
											confirmDialogRenderer: {
												trackingParams: string;
												dialogMessages: TextRenderer[];
												confirmButton: {
													buttonRenderer: {
														style: string;
														size?: string;
														isDisabled: boolean;
														text: TextRenderer;
														serviceEndpoint: {
															clickTrackingParams: string;
															commandMetadata?: {
																webCommandMetadata: {
																	sendPost: boolean;
																	apiUrl: string;
																};
															};
															unsubscribeEndpoint: {
																channelIds: string[];
																params: string;
															};
														};
														accessibility: {
															label: string;
														};
														trackingParams: string;
													};
												};
												cancelButton: {
													buttonRenderer: {
														style: string;
														size?: string;
														isDisabled: boolean;
														text: TextRenderer;
														accessibility: {
															label: string;
														};
														trackingParams: string;
													};
												};
												primaryIsCancel?: boolean;
											};
										};
										popupType: string;
									};
								}[];
							};
						}[];
						subscribeAccessibility?: Accessibility;
						unsubscribeAccessibility?: Accessibility;
						signInEndpoint?: {
							clickTrackingParams: string;
							commandMetadata: {
								webCommandMetadata: {
									url: string;
								};
							};
						};
					};
				};
			};
			allowSwipeDismiss: boolean;
			annotationId?: string;
		};
		playerAnnotationsUrlsRenderer?: {
			adsOnly?: boolean;
			allowInPlaceSwitch?: boolean;
			loadPolicy?: string;
			invideoUrl?: any;
		}
	}[];
	playerConfig?: {
		audioConfig: {
			loudnessDb?: number;
			perceptualLoudnessDb?: number;
			enablePerFormatLoudness: boolean;
		};
		streamSelectionConfig: {
			maxBitrate: string;
		};
		mediaCommonConfig: {
			dynamicReadaheadConfig: {
				maxReadAheadMediaTimeMs: number;
				minReadAheadMediaTimeMs: number;
				readAheadGrowthRateMs: number;
			};
		};
		embeddedPlayerConfig?: {
			embeddedPlayerMode: string;
		};
		webPlayerConfig?: {
			useCobaltTvosDash: boolean;
			webPlayerActionsPorting: {
				getSharePanelCommand?: {
					clickTrackingParams: string;
					webPlayerShareEntityServiceEndpoint: {
						serializedShareEntity: string;
					};
					commandMetadata?: {
						webCommandMetadata: {
							sendPost: boolean;
							apiUrl: string;
						};
					};
				};
				subscribeCommand: {
					clickTrackingParams: string;
					subscribeEndpoint: {
						channelIds: string[];
						params: string;
					};
					commandMetadata?: {
						webCommandMetadata: {
							sendPost: boolean;
							apiUrl: string;
						};
					};
				};
				unsubscribeCommand: {
					clickTrackingParams: string;
					unsubscribeEndpoint: {
						channelIds: string[];
						params: string;
					};
					commandMetadata?: {
						webCommandMetadata: {
							sendPost: boolean;
							apiUrl: string;
						};
					};
				};
				addToWatchLaterCommand: {
					clickTrackingParams: string;
					playlistEditEndpoint: {
						playlistId: string;
						actions: {
							addedVideoId: string;
							action: string;
						}[];
					};
					commandMetadata?: {
						webCommandMetadata: {
							sendPost: boolean;
							apiUrl: string;
						};
					};
				};
				removeFromWatchLaterCommand: {
					clickTrackingParams: string;
					playlistEditEndpoint: {
						playlistId: string;
						actions: {
							action: string;
							removedVideoId: string;
						}[];
					};
					commandMetadata?: {
						webCommandMetadata: {
							sendPost: boolean;
							apiUrl: string;
						};
					};
				};
			};
		};
		livePlayerConfig?: {
			liveReadaheadSeconds: number;
			hasSubfragmentedFmp4: boolean;
			hasSubfragmentedWebm: boolean;
			isLiveHeadPlayable: boolean;
		};
	};
	storyboards?: {
		playerStoryboardSpecRenderer?: {
			spec: string;
			recommendedLevel: number;
			highResolutionRecommendedLevel?: number;
		};
		playerLiveStoryboardSpecRenderer?: {
			spec: string;
		};
	};
	microformat?: {
		microformatDataRenderer?: {
			urlCanonical: string;
			title: string;
			description: string;
			thumbnail: Thumbnail;
			siteName: string;
			appName: string;
			androidPackage: string;
			iosAppStoreId: string;
			iosAppArguments: string;
			ogType: string;
			urlApplinksIos: string;
			urlApplinksAndroid: string;
			urlTwitterIos: string;
			urlTwitterAndroid: string;
			twitterCardType: string;
			twitterSiteHandle: string;
			schemaDotOrgType: string;
			noindex: boolean;
			unlisted: boolean;
			paid: boolean;
			familySafe: boolean;
			tags?: string[];
			pageOwnerDetails: {
				name: string;
				externalChannelId: string;
				youtubeProfileUrl: string;
			};
			videoDetails: {
				externalVideoId: string;
				durationSeconds?: string;
				durationIso8601?: string;
			};
			linkAlternates: {
				hrefUrl: string;
				title?: string;
				alternateType?: string;
			}[];
			viewCount: string;
			publishDate: string;
			category: string;
			uploadDate: string;
			availableCountries?: string[];
		};
		playerMicroformatRenderer?: {
			thumbnail: Thumbnail;
			embed: {
				iframeUrl: string;
				width: number;
				height: number;
			};
			title: TextRenderer;
			description: TextRenderer;
			lengthSeconds: string;
			ownerProfileUrl: string;
			externalChannelId: string;
			isFamilySafe: boolean;
			availableCountries?: string[];
			isUnlisted: boolean;
			hasYpcMetadata: boolean;
			viewCount: string;
			category: string;
			publishDate: string;
			ownerChannelName: string;
			uploadDate: string;
			liveBroadcastDetails?: {
				isLiveNow: boolean;
				startTimestamp: string;
				endTimestamp?: string;
			};
		};
	};
	cards?: {
		cardCollectionRenderer: {
			cards: {
				cardRenderer: {
					teaser: {
						simpleCardTeaserRenderer: {
							message: TextRenderer;
							trackingParams: string;
							prominent: boolean;
							logVisibilityUpdates: boolean;
							onTapCommand?: {
								clickTrackingParams: string;
								changeEngagementPanelVisibilityAction: {
									targetId: string;
									visibility: string;
								};
							};
						};
					};
					cueRanges: {
						startCardActiveMs: string;
						endCardActiveMs: string;
						teaserDurationMs: string;
						iconAfterTeaserMs: string;
					}[];
					trackingParams: string;
					content?: {
						videoInfoCardContentRenderer?: {
							videoThumbnail: Thumbnail;
							lengthString: TextRenderer;
							videoTitle: TextRenderer;
							channelName: TextRenderer;
							viewCountText: TextRenderer;
							action: {
								clickTrackingParams: string;
								watchEndpoint: {
									videoId: string;
								};
							};
							trackingParams: string;
						};
						playlistInfoCardContentRenderer?: {
							playlistThumbnail: Thumbnail;
							playlistVideoCount: TextRenderer;
							playlistTitle: TextRenderer;
							channelName: TextRenderer;
							videoCountText: TextRenderer;
							action: {
								clickTrackingParams: string;
								watchEndpoint: {
									videoId: string;
									playlistId: string;
									loggingContext: {
										vssLoggingContext: {
											serializedContextData: string;
										};
									};
								};
							};
							trackingParams: string;
						};
					};
					icon?: {
						infoCardIconRenderer: {
							trackingParams: string;
						};
					};
					cardId?: string;
					feature?: string;
				};
			}[];
			headerText: TextRenderer;
			icon: {
				infoCardIconRenderer: {
					trackingParams: string;
				};
			};
			closeButton: {
				infoCardIconRenderer: {
					trackingParams: string;
				};
			};
			trackingParams: string;
			allowTeaserDismiss: boolean;
			logIconVisibilityUpdates: boolean;
		};
	};
	trackingParams: string;
	attestation?: {
		playerAttestationRenderer: {
			challenge: string;
			botguardData: {
				program: string;
				interpreterSafeUrl: {
					privateDoNotAccessOrElseTrustedResourceUrlWrappedValue: string;
				};
				serverEnvironment: number;
			};
		};
	};
	videoQualityPromoSupportedRenderers?: {
		videoQualityPromoRenderer: {
			triggerCriteria: {
				connectionWhitelist: string[];
				joinLatencySeconds: number;
				rebufferTimeSeconds: number;
				watchTimeWindowSeconds: number;
				refractorySeconds: number;
			};
			text: TextRenderer;
			endpoint: {
				clickTrackingParams: string;
				commandMetadata: {
					webCommandMetadata: {
						url: string;
						webPageType: string;
						rootVe: number;
					};
				};
				urlEndpoint: {
					url: string;
					target: string;
				};
			};
			trackingParams: string;
			snackbar: {
				notificationActionRenderer: {
					responseText: TextRenderer;
					actionButton: {
						buttonRenderer: {
							text: TextRenderer;
							navigationEndpoint: {
								clickTrackingParams: string;
								commandMetadata: {
									webCommandMetadata: {
										url: string;
										webPageType: string;
										rootVe: number;
									};
								};
								urlEndpoint: {
									url: string;
									target: string;
								};
							};
							trackingParams: string;
						};
					};
					trackingParams: string;
				};
			};
		};
	};
	messages?: {
		mealbarPromoRenderer: {
			icon?: Thumbnail;
			messageTexts: TextRenderer[];
			actionButton: {
				buttonRenderer: {
					style?: string;
					size: string;
					text: TextRenderer;
					trackingParams: string;
					command?: {
						clickTrackingParams: string;
						commandExecutorCommand: {
							commands: {
								clickTrackingParams?: string;
								commandMetadata: {
									webCommandMetadata: {
										url?: string;
										webPageType?: string;
										rootVe?: number;
										apiUrl?: string;
										sendPost?: boolean;
									};
								};
								browseEndpoint?: {
									browseId: string;
									params: string;
								};
								urlEndpoint?: {
									url: string;
									target: string;
								};
								feedbackEndpoint?: {
									feedbackToken: string;
									uiActions: {
										hideEnclosingContainer: boolean;
									};
								};
							}[];
						};
					};
					serviceEndpoint?: {
						clickTrackingParams: string;
						feedbackEndpoint: {
							feedbackToken: string;
							uiActions: {
								hideEnclosingContainer: boolean;
							};
						};
					};
					navigationEndpoint?: NavigationEndpoint;
				};
			};
			dismissButton: {
				buttonRenderer: {
					style?: string;
					size: string;
					text: TextRenderer;
					trackingParams: string;
					command?: {
						clickTrackingParams: string;
						commandExecutorCommand: {
							commands: {
								clickTrackingParams: string;
								commandMetadata: {
									webCommandMetadata: {
										sendPost: boolean;
										apiUrl: string;
									};
								};
								feedbackEndpoint: {
									feedbackToken: string;
									uiActions: {
										hideEnclosingContainer: boolean;
									};
								};
							}[];
						};
					};
					serviceEndpoint?: {
						clickTrackingParams: string;
						feedbackEndpoint: {
							feedbackToken: string;
							uiActions: {
								hideEnclosingContainer: boolean;
							};
						};
					};
				};
			};
			triggerCondition: string;
			style: string;
			trackingParams: string;
			impressionEndpoints: {
				clickTrackingParams: string;
				commandMetadata?: {
					webCommandMetadata: {
						sendPost: boolean;
						apiUrl: string;
					};
				};
				feedbackEndpoint: {
					feedbackToken: string;
					uiActions: {
						hideEnclosingContainer: boolean;
					};
				};
			}[];
			isVisible: boolean;
			messageTitle: TextRenderer;
			logo?: Thumbnail;
			logoDark?: Thumbnail;
		};
	}[];
	adPlacements?: {
		adPlacementRenderer: {
			config: {
				adPlacementConfig: {
					kind: string;
					adTimeOffset: {
						offsetStartMilliseconds: string;
						offsetEndMilliseconds: string;
					};
					hideCueRangeMarker: boolean;
				};
			};
			renderer: {
				clientForecastingAdRenderer?: {};
				instreamVideoAdRenderer?: {
					playerOverlay: {
						instreamAdPlayerOverlayRenderer: {
							skipOrPreviewRenderer?: {
								adPreviewRenderer?: {
									thumbnail: {
										thumbnail: Thumbnail;
										trackingParams: string;
									};
									trackingParams: string;
									staticPreview: {
										text: string;
										isTemplated: boolean;
										trackingParams: string;
									};
								};
								skipAdRenderer?: {
									preskipRenderer: {
										adPreviewRenderer: {
											thumbnail: {
												thumbnail: Thumbnail;
												trackingParams: string;
											};
											trackingParams: string;
											templatedCountdown: {
												templatedAdText: {
													text: string;
													isTemplated: boolean;
													trackingParams: string;
												};
											};
											durationMilliseconds: number;
										};
									};
									skippableRenderer: {
										skipButtonRenderer: {
											message: {
												text: string;
												isTemplated: boolean;
												trackingParams: string;
											};
											trackingParams: string;
										};
									};
									trackingParams: string;
									skipOffsetMilliseconds: number;
								};
							};
							trackingParams: string;
							visitAdvertiserRenderer: {
								buttonRenderer: {
									style: string;
									text: TextRenderer;
									icon: Icon;
									navigationEndpoint: NavigationEndpoint
									trackingParams: string;
								};
							};
							adBadgeRenderer: {
								simpleAdBadgeRenderer: {
									text: {
										text: string;
										isTemplated: boolean;
										trackingParams: string;
									};
									trackingParams: string;
								};
							};
							adDurationRemaining: {
								adDurationRemainingRenderer: {
									templatedCountdown: {
										templatedAdText: {
											text: string;
											isTemplated: boolean;
											trackingParams: string;
										};
									};
									trackingParams: string;
								};
							};
							adInfoRenderer: {
								adHoverTextButtonRenderer: {
									button: {
										buttonRenderer: {
											style: string;
											size: string;
											isDisabled: boolean;
											serviceEndpoint: {
												clickTrackingParams: string;
												openPopupAction?: {
													popup: {
														aboutThisAdRenderer: {
															url: {
																privateDoNotAccessOrElseTrustedResourceUrlWrappedValue: string;
															};
															trackingParams: string;
														};
													};
													popupType: string;
												};
												commandMetadata?: {
													webCommandMetadata: {
														ignoreNavigation: boolean;
													};
												};
												adInfoDialogEndpoint?: {
													dialog: {
														adInfoDialogRenderer: {
															dialogMessage: TextRenderer;
															confirmLabel: TextRenderer;
															trackingParams: string;
															closeOverlayRenderer: {
																buttonRenderer: {
																	style: string;
																	size: string;
																	isDisabled: boolean;
																	icon: Icon;
																	trackingParams: string;
																};
															};
															title: TextRenderer;
															adReasons: TextRenderer[];
														};
													};
												};
											};
											icon: Icon;
											trackingParams: string;
											accessibilityData: Accessibility;
										};
									};
									hoverText?: TextRenderer;
									trackingParams: string;
								};
							};
							adLayoutLoggingData: {
								serializedAdServingDataEntry: string;
							};
							elementId: string;
							inPlayerSlotId: string;
							inPlayerLayoutId: string;
						};
					};
					trackingParams: string;
					layoutId: string;
					associatedPlayerBytesLayoutId: string;
				};
			};
			adSlotLoggingData: {
				serializedSlotAdServingDataEntry: string;
			};
		};
	}[];
	adSlots?: {
		adSlotRenderer: {
			adSlotMetadata: {
				slotId: string;
				slotType: string;
				adSlotLoggingData: {
					serializedSlotAdServingDataEntry: string;
				};
				triggerEvent: string;
			};
			fulfillmentContent: {
				fulfilledLayout: {
					playerBytesAdLayoutRenderer: {
						adLayoutMetadata: {
							layoutId: string;
							layoutType: string;
							adLayoutLoggingData: {
								serializedAdServingDataEntry: string;
							};
						};
						renderingContent: {
							instreamVideoAdRenderer: {
								pings: {
									impressionPings: LoggingURL;
									errorPings: LoggingURL[];
									mutePings: LoggingURL[];
									unmutePings: LoggingURL[];
									pausePings: LoggingURL[];
									rewindPings: LoggingURL[];
									resumePings: LoggingURL[];
									closePings: LoggingURL[];
									fullscreenPings: LoggingURL[];
									activeViewViewablePings?: LoggingURL[];
									endFullscreenPings: LoggingURL[];
									activeViewMeasurablePings?: LoggingURL[];
									abandonPings: LoggingURL[];
									activeViewFullyViewableAudibleHalfDurationPings?: LoggingURL[];
									startPings?: LoggingURL[];
									firstQuartilePings?: LoggingURL[];
									secondQuartilePings?: LoggingURL[];
									thirdQuartilePings?: LoggingURL[];
									completePings?: LoggingURL[];
									activeViewTracking?: {
										trafficType: string;
									};
									progressPings?: LoggingURL[];
									skipPings?: LoggingURL[];
									clickthroughPings?: LoggingURL[];
								};
								clickthroughEndpoint: NavigationEndpoint;
								csiParameters: Parameter[];
								playerVars: string;
								elementId: string;
								trackingParams: string;
								legacyInfoCardVastExtension?: string;
								sodarExtensionData: {
									siub: string;
									bgub: string;
									scs: string;
									bgp: string;
								};
								externalVideoId: string;
								adLayoutLoggingData: {
									serializedAdServingDataEntry: string;
								};
								layoutId: string;
								skipOffsetMilliseconds?: number;
							};
						};
						layoutExitNormalTriggers: {
							id: string;
							onLayoutSelfExitRequestedTrigger: {
								triggeringLayoutId: string;
							};
						}[];
						layoutExitMuteTriggers: {
							id: string;
							skipRequestedTrigger: {
								triggeringLayoutId: string;
							};
						}[];
						layoutExitSkipTriggers?: {
							id: string;
							skipRequestedTrigger: {
								triggeringLayoutId: string;
							};
						}[];
					};
				};
			};
			slotEntryTrigger: {
				id: string;
				beforeContentVideoIdStartedTrigger: {};
			};
			slotFulfillmentTriggers: {
				id: string;
				slotIdEnteredTrigger: {
					triggeringSlotId: string;
				};
			}[];
			slotExpirationTriggers: {
				id: string;
				slotIdExitedTrigger?: {
					triggeringSlotId: string;
				};
				onNewPlaybackAfterContentVideoIdTrigger?: {};
			}[];
		};
	}[];
	adBreakHeartbeatParams?: string;
	frameworkUpdates?: {
		entityBatchUpdate: {
			mutations: {
				entityKey: string;
				type: string;
				payload: {
					offlineabilityEntity: {
						key: string;
						addToOfflineButtonState: string;
					};
				};
			}[];
			timestamp: {
				seconds: string;
				nanos: number;
			};
		};
	};
	captions?: {
		playerCaptionsTracklistRenderer: {
			captionTracks: {
				baseUrl: string;
				name: TextRenderer;
				vssId: string;
				languageCode: string;
				kind?: string;
				isTranslatable: boolean;
				trackName: string;
				rtl?: boolean;
			}[];
			audioTracks: {
				captionTrackIndices: number[];
				defaultCaptionTrackIndex?: number;
				visibility?: string;
				hasDefaultTrack?: boolean;
				audioTrackId?: string;
				captionsInitialState?: string;
			}[];
			translationLanguages: {
				languageCode: string;
				languageName: TextRenderer;
			}[];
			defaultAudioTrackIndex: number;
			openTranscriptCommand?: {
				clickTrackingParams: string;
				changeEngagementPanelVisibilityAction: {
					targetId: string;
					visibility: string;
				};
			};
		};
	};
	endscreen?: {
		endscreenRenderer: {
			elements: {
				endscreenElementRenderer: {
					style: string;
					image: Thumbnail;
					left: number;
					width: number;
					top: number;
					aspectRatio: number;
					startMs: string;
					endMs: string;
					title: TextRenderer;
					metadata: TextRenderer;
					endpoint: NavigationEndpoint;
					trackingParams: string;
					id: string;
					thumbnailOverlays: {
						thumbnailOverlayTimeStatusRenderer: OverlayRenderer;
					}[];
				};
			}[];
			startMs: string;
			trackingParams: string;
		};
	};
	paidContentOverlay?: {
		paidContentOverlayRenderer: {
			text: TextRenderer;
			durationMs: string;
			navigationEndpoint: {
				clickTrackingParams: string;
				urlEndpoint: {
					url: string;
					grwOpenInOverride: string;
				};
				commandMetadata?: {
					webCommandMetadata: {
						url: string;
						webPageType: string;
						rootVe: number;
					};
				};
			};
			icon: Icon;
			showInPip: boolean;
			trackingParams: string;
		};
	};
	adParams?: string;
	cpnInfo?: {
		cpn: string;
		cpnSource: string;
	};
};

export type RawSearchData = {
	responseContext: {
		visitorData: string;
		serviceTrackingParams: {
			service: string;
			params: Parameter[];
		}[];
		mainAppWebResponseContext: {
			loggedOut: boolean;
			trackingParam: string;
		};
		webResponseContextExtensionData: {
			hasDecorated: boolean;
		};
	};
	estimatedResults: string;
	contents?: {
		twoColumnSearchResultsRenderer: {
			primaryContents: {
				sectionListRenderer: {
					contents: {
						itemSectionRenderer?: {
							contents: {
								searchPyvRenderer?: {
									ads: {
										adSlotRenderer: {
											adSlotMetadata: {
												slotId: string;
												slotType: string;
												slotPhysicalPosition: number;
											};
											fulfillmentContent: {
												fulfilledLayout: {
													inFeedAdLayoutRenderer: {
														adLayoutMetadata: {
															layoutId: string;
															layoutType: string;
															adLayoutLoggingData: {
																serializedAdServingDataEntry: string;
															};
														};
														renderingContent: {
															promotedVideoRenderer: {
																videoId: string;
																thumbnail: {
																	thumbnails: {
																		url: string;
																	}[];
																};
																title: TextRenderer;
																description: TextRenderer;
																longBylineText: TextRenderer;
																shortBylineText: TextRenderer;
																lengthText: TextRenderer;
																navigationEndpoint: {
																	clickTrackingParams: string;
																	loggingUrls: LoggingURL[];
																	commandMetadata: {
																		webCommandMetadata: {
																			url: string;
																			webPageType: string;
																			rootVe: number;
																		};
																	};
																	watchEndpoint: {
																		videoId: string;
																		playerParams: string;
																		watchEndpointSupportedOnesieConfig: {
																			html5PlaybackOnesieConfig: {
																				commonConfig: {
																					url: string;
																				};
																			};
																		};
																	};
																};
																ctaRenderer: {
																	buttonRenderer: {
																		style: string;
																		text: TextRenderer;
																		icon: Icon;
																		trackingParams: string;
																		command: {
																			clickTrackingParams: string;
																			commandMetadata: {
																				webCommandMetadata: {
																					url: string;
																					webPageType: string;
																					rootVe: number;
																				};
																			};
																			urlEndpoint: {
																				url: string;
																				target: string;
																			};
																		};
																		iconPosition: string;
																	};
																};
																impressionUrls: string[];
																clickTrackingUrls: string[];
																trackingParams: string;
																menu: {
																	menuRenderer: {
																		trackingParams: string;
																		isDisabled: boolean;
																		disabledCommand: {
																			clickTrackingParams: string;
																			openPopupAction: {
																				popup: {
																					aboutThisAdRenderer: {
																						url: {
																							privateDoNotAccessOrElseTrustedResourceUrlWrappedValue: string;
																						};
																						trackingParams: string;
																					};
																				};
																				popupType: string;
																			};
																		};
																	};
																};
																thumbnailOverlays: {
																	thumbnailOverlayTimeStatusRenderer?: OverlayRenderer;
																	thumbnailOverlayToggleButtonRenderer?: {
																		isToggled: boolean;
																		untoggledIcon: Icon;
																		toggledIcon: Icon;
																		untoggledTooltip: string;
																		toggledTooltip: string;
																		untoggledServiceEndpoint: NavigationEndpoint;
																		toggledServiceEndpoint: NavigationEndpoint;
																		untoggledAccessibility: Accessibility;
																		toggledAccessibility: Accessibility;
																		trackingParams: string;
																	};
																}[];
																activeView: {
																	viewableCommands: NavigationEndpoint[];
																	endOfSessionCommands: NavigationEndpoint[];
																	regexUriMacroValidator: {
																		emptyMap: boolean;
																	};
																};
																adPlaybackContextParams: string;
																adBadge: {
																	metadataBadgeRenderer: {
																		style: string;
																		label: string;
																		trackingParams: string;
																	};
																};
															};
														};
													};
												};
											};
											enablePacfLoggingWeb: boolean;
										};
									}[];
									trackingParams: string;
								};
								channelRenderer?: {
									channelId: string;
									title: TextRenderer;
									navigationEndpoint: NavigationEndpoint;
									thumbnail: Thumbnail;
									descriptionSnippet: TextRenderer;
									shortBylineText: TextRenderer;
									videoCountText: TextRenderer;
									subscriptionButton: {
										subscribed: boolean;
									};
									ownerBadges: {
										metadataBadgeRenderer: {
											icon: Icon;
											style: string;
											tooltip: string;
											trackingParams: string;
											accessibilityData: {
												label: string;
											};
										};
									}[];
									subscriberCountText: TextRenderer;
									subscribeButton: {
										buttonRenderer: {
											style: string;
											size: string;
											isDisabled: boolean;
											text: TextRenderer;
											navigationEndpoint: {
												clickTrackingParams: string;
												commandMetadata: {
													webCommandMetadata: {
														url: string;
														webPageType: string;
														rootVe: number;
													};
												};
												signInEndpoint: {
													nextEndpoint: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																url: string;
																webPageType: string;
																rootVe: number;
															};
														};
														searchEndpoint: {
															query: string;
														};
													};
													continueAction: string;
												};
											};
											trackingParams: string;
										};
									};
									trackingParams: string;
									longBylineText: TextRenderer;
								};
								shelfRenderer?: {
									title: TextRenderer;
									content: {
										verticalListRenderer: {
											items: {
												videoRenderer: {
													videoId: string;
													thumbnail: Thumbnail;
													title: TextRenderer;
													longBylineText: TextRenderer;
													publishedTimeText?: TextRenderer;
													lengthText?: TextRenderer;
													viewCountText: TextRenderer;
													navigationEndpoint: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																url: string;
																webPageType: string;
																rootVe: number;
															};
														};
														watchEndpoint: {
															videoId: string;
															params?: string;
															playerParams: string;
															watchEndpointSupportedOnesieConfig: {
																html5PlaybackOnesieConfig: {
																	commonConfig: {
																		url: string;
																	};
																};
															};
														};
													};
													badges?: {
														metadataBadgeRenderer: {
															style: string;
															label: string;
															trackingParams: string;
															accessibilityData?: {
																label: string;
															};
															icon?: Icon;
														};
													}[];
													ownerBadges?: {
														metadataBadgeRenderer: {
															icon: Icon;
															style: string;
															tooltip: string;
															trackingParams: string;
															accessibilityData: {
																label: string;
															};
														};
													}[];
													ownerText: TextRenderer;
													shortBylineText: TextRenderer;
													trackingParams: string;
													showActionMenu: boolean;
													shortViewCountText: TextRenderer;
													menu: {
														menuRenderer: {
															items: {
																menuServiceItemRenderer: {
																	text: TextRenderer;
																	icon: Icon;
																	serviceEndpoint: {
																		clickTrackingParams: string;
																		commandMetadata: {
																			webCommandMetadata: {
																				sendPost: boolean;
																				apiUrl?: string;
																			};
																		};
																		signalServiceEndpoint?: {
																			signal: string;
																			actions: {
																				clickTrackingParams: string;
																				addToPlaylistCommand: {
																					openMiniplayer: boolean;
																					videoId: string;
																					listType: string;
																					onCreateListCommand: NavigationEndpoint;
																					videoIds: string[];
																				};
																			}[];
																		};
																		shareEntityServiceEndpoint?: {
																			serializedShareEntity: string;
																			commands: {
																				clickTrackingParams: string;
																				openPopupAction: {
																					popup: {
																						unifiedSharePanelRenderer: {
																							trackingParams: string;
																							showLoadingSpinner: boolean;
																						};
																					};
																					popupType: string;
																					beReused: boolean;
																				};
																			}[];
																		};
																	};
																	trackingParams: string;
																	hasSeparator?: boolean;
																};
															}[];
															trackingParams: string;
															accessibility: Accessibility;
														};
													};
													channelThumbnailSupportedRenderers: {
														channelThumbnailWithLinkRenderer: {
															thumbnail: Thumbnail;
															navigationEndpoint: {
																clickTrackingParams: string;
																commandMetadata: {
																	webCommandMetadata: {
																		url: string;
																		webPageType: string;
																		rootVe: number;
																		apiUrl: string;
																	};
																};
																browseEndpoint: {
																	browseId: string;
																	canonicalBaseUrl?: string;
																};
															};
															accessibility: Accessibility;
														};
													};
													thumbnailOverlays: {
														thumbnailOverlayTimeStatusRenderer?: OverlayRenderer;
														thumbnailOverlayToggleButtonRenderer?: {
															untoggledIcon: Icon;
															toggledIcon: Icon;
															untoggledTooltip: string;
															toggledTooltip: string;
															untoggledServiceEndpoint: {
																clickTrackingParams: string;
																commandMetadata: {
																	webCommandMetadata: {
																		sendPost: boolean;
																		apiUrl?: string;
																	};
																};
																signalServiceEndpoint?: {
																	signal: string;
																	actions: {
																		clickTrackingParams: string;
																		addToPlaylistCommand: {
																			openMiniplayer: boolean;
																			videoId: string;
																			listType: string;
																			onCreateListCommand: NavigationEndpoint;
																			videoIds: string[];
																		};
																	}[];
																};
																playlistEditEndpoint?: {
																	playlistId: string;
																	actions: {
																		addedVideoId: string;
																		action: string;
																	}[];
																};
															};
															untoggledAccessibility: Accessibility;
															toggledAccessibility: Accessibility;
															trackingParams: string;
															isToggled?: boolean;
															toggledServiceEndpoint?: NavigationEndpoint;
														};
														thumbnailOverlayNowPlayingRenderer?: OverlayRenderer;
														thumbnailOverlayLoadingPreviewRenderer?: OverlayRenderer;
														thumbnailOverlayInlineUnplayableRenderer?: OverlayRenderer;
													}[];
													detailedMetadataSnippets?: {
														snippetText: TextRenderer;
														snippetHoverText: TextRenderer;
														maxOneLine: boolean;
													}[];
													inlinePlaybackEndpoint?: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																url: string;
																webPageType: string;
																rootVe: number;
															};
														};
														watchEndpoint: {
															videoId: string;
															playerParams: string;
															playerExtraUrlParams: Parameter[];
															watchEndpointSupportedOnesieConfig: {
																html5PlaybackOnesieConfig: {
																	commonConfig: {
																		url: string;
																	};
																};
															};
															params?: string;
														};
													};
													searchVideoResultEntityKey: string;
													expandableMetadata?: {
														expandableMetadataRenderer: {
															header: {
																collapsedTitle: TextRenderer;
																collapsedThumbnail: Thumbnail;
																collapsedLabel: TextRenderer;
																expandedTitle: TextRenderer;
															};
															expandedContent: {
																horizontalCardListRenderer: {
																	cards: {
																		macroMarkersListItemRenderer: {
																			title: TextRenderer;
																			timeDescription: TextRenderer;
																			thumbnail: Thumbnail;
																			onTap: {
																				clickTrackingParams: string;
																				commandExecutorCommand?: {
																					commands: {
																						clickTrackingParams: string;
																						commandMetadata?: {
																							webCommandMetadata: {
																								url: string;
																								webPageType: string;
																								rootVe: number;
																							};
																						};
																						watchEndpoint?: {
																							videoId: string;
																							startTimeSeconds: number;
																							watchEndpointSupportedOnesieConfig: {
																								html5PlaybackOnesieConfig: {
																									commonConfig: {
																										url: string;
																									};
																								};
																							};
																						};
																						entityUpdateCommand?: {
																							entityBatchUpdate: {
																								mutations: {
																									entityKey: string;
																									type: string;
																									payload: {
																										markersVisibilityOverrideEntity: {
																											key: string;
																											videoId: string;
																											visibilityOverrideMarkersKey: string[];
																										};
																									};
																								}[];
																							};
																						};
																					}[];
																				};
																				commandMetadata?: {
																					webCommandMetadata: {
																						url: string;
																						webPageType: string;
																						rootVe: number;
																					};
																				};
																				watchEndpoint?: {
																					videoId: string;
																					watchEndpointSupportedOnesieConfig: {
																						html5PlaybackOnesieConfig: {
																							commonConfig: {
																								url: string;
																							};
																						};
																					};
																					startTimeSeconds?: number;
																				};
																			};
																			trackingParams: string;
																			layout: string;
																			isHighlighted: boolean;
																		};
																	}[];
																	trackingParams: string;
																	style: {
																		type: string;
																	};
																	previousButton: {
																		buttonRenderer: {
																			style: string;
																			size: string;
																			isDisabled: boolean;
																			icon: Icon;
																			trackingParams: string;
																		};
																	};
																	nextButton: {
																		buttonRenderer: {
																			style: string;
																			size: string;
																			isDisabled: boolean;
																			icon: Icon;
																			trackingParams: string;
																		};
																	};
																};
															};
															expandButton: {
																buttonRenderer: {
																	style: string;
																	size: string;
																	isDisabled: boolean;
																	icon: Icon;
																	trackingParams: string;
																	accessibilityData: Accessibility;
																};
															};
															collapseButton: {
																buttonRenderer: {
																	style: string;
																	size: string;
																	isDisabled: boolean;
																	icon: Icon;
																	trackingParams: string;
																	accessibilityData: Accessibility;
																};
															};
															trackingParams: string;
															colorData: {
																lightColorPalette: {
																	section1Color: number;
																	section2Color: number;
																	section3Color: number;
																	primaryTitleColor: number;
																	secondaryTitleColor: number;
																	iconActivatedColor: number;
																	iconInactiveColor: number;
																	section4Color: number;
																	iconDisabledColor: number;
																};
																darkColorPalette: {
																	section1Color: number;
																	section2Color: number;
																	section3Color: number;
																	primaryTitleColor: number;
																	secondaryTitleColor: number;
																	iconActivatedColor: number;
																	iconInactiveColor: number;
																	section4Color: number;
																	iconDisabledColor: number;
																};
																vibrantColorPalette: {
																	section1Color: number;
																	section2Color: number;
																	section3Color: number;
																	primaryTitleColor: number;
																	secondaryTitleColor: number;
																	iconActivatedColor: number;
																	iconInactiveColor: number;
																	section4Color: number;
																	iconDisabledColor: number;
																};
															};
															useCustomColors: boolean;
															loggingDirectives: {
																trackingParams: string;
																visibility: {
																	types: string;
																};
																enableDisplayloggerExperiment: boolean;
															};
														};
													};
												};
											}[];
											collapsedItemCount: number;
											collapsedStateButtonText: TextRenderer;
											trackingParams: string;
										};
									};
									trackingParams: string;
								};
								videoRenderer?: {
									videoId: string;
									thumbnail: Thumbnail;
									title: TextRenderer;
									longBylineText: TextRenderer;
									publishedTimeText?: TextRenderer;
									lengthText?: TextRenderer;
									viewCountText: TextRenderer;
									navigationEndpoint: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												url: string;
												webPageType: string;
												rootVe: number;
											};
										};
										watchEndpoint?: {
											videoId: string;
											params: string;
											playerParams: string;
											watchEndpointSupportedOnesieConfig: {
												html5PlaybackOnesieConfig: {
													commonConfig: {
														url: string;
													};
												};
											};
										};
										reelWatchEndpoint?: {
											videoId: string;
											playerParams: string;
											thumbnail: {
												thumbnails: {
													url: string;
													width: number;
													height: number;
												}[];
												isOriginalAspectRatio: boolean;
											};
											overlay: {
												reelPlayerOverlayRenderer: {
													style: string;
													trackingParams: string;
													reelPlayerNavigationModel: string;
												};
											};
											params: string;
											sequenceProvider: string;
											sequenceParams: string;
											loggingContext: {
												vssLoggingContext: {
													serializedContextData: string;
												};
												qoeLoggingContext: {
													serializedContextData: string;
												};
											};
											ustreamerConfig: string;
										};
									};
									badges?: {
										metadataBadgeRenderer: {
											style: string;
											label: string;
											trackingParams: string;
											accessibilityData?: {
												label: string;
											};
											icon?: Icon;
										};
									}[];
									ownerBadges?: {
										metadataBadgeRenderer: {
											icon: Icon;
											style: string;
											tooltip: string;
											trackingParams: string;
											accessibilityData: {
												label: string;
											};
										};
									}[];
									ownerText: TextRenderer;
									shortBylineText: TextRenderer;
									trackingParams: string;
									showActionMenu: boolean;
									shortViewCountText: TextRenderer;
									menu: {
										menuRenderer: {
											items: {
												menuServiceItemRenderer: {
													text: TextRenderer;
													icon: Icon;
													serviceEndpoint: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																sendPost: boolean;
																apiUrl?: string;
															};
														};
														signalServiceEndpoint?: {
															signal: string;
															actions: {
																clickTrackingParams: string;
																addToPlaylistCommand: {
																	openMiniplayer: boolean;
																	videoId: string;
																	listType: string;
																	onCreateListCommand: NavigationEndpoint;
																	videoIds: string[];
																};
															}[];
														};
														shareEntityServiceEndpoint?: {
															serializedShareEntity: string;
															commands: {
																clickTrackingParams: string;
																openPopupAction: {
																	popup: {
																		unifiedSharePanelRenderer: {
																			trackingParams: string;
																			showLoadingSpinner: boolean;
																		};
																	};
																	popupType: string;
																	beReused: boolean;
																};
															}[];
														};
													};
													trackingParams: string;
													hasSeparator?: boolean;
												};
											}[];
											trackingParams: string;
											accessibility: Accessibility;
										};
									};
									channelThumbnailSupportedRenderers: {
										channelThumbnailWithLinkRenderer: {
											thumbnail: Thumbnail;
											navigationEndpoint: {
												clickTrackingParams: string;
												commandMetadata: {
													webCommandMetadata: {
														url: string;
														webPageType: string;
														rootVe: number;
														apiUrl: string;
													};
												};
												browseEndpoint: {
													browseId: string;
													canonicalBaseUrl?: string;
												};
											};
											accessibility: Accessibility;
										};
									};
									thumbnailOverlays: {
										thumbnailOverlayToggleButtonRenderer?: {
											untoggledIcon: Icon;
											toggledIcon: Icon;
											untoggledTooltip: string;
											toggledTooltip: string;
											untoggledServiceEndpoint: {
												clickTrackingParams: string;
												commandMetadata: {
													webCommandMetadata: {
														sendPost: boolean;
														apiUrl?: string;
													};
												};
												signalServiceEndpoint?: {
													signal: string;
													actions: {
														clickTrackingParams: string;
														addToPlaylistCommand: {
															openMiniplayer: boolean;
															videoId: string;
															listType: string;
															onCreateListCommand: NavigationEndpoint;
															videoIds: string[];
														};
													}[];
												};
												playlistEditEndpoint?: {
													playlistId: string;
													actions: {
														addedVideoId: string;
														action: string;
													}[];
												};
											};
											untoggledAccessibility: Accessibility;
											toggledAccessibility: Accessibility;
											trackingParams: string;
											isToggled?: boolean;
											toggledServiceEndpoint?: NavigationEndpoint;
										};
										thumbnailOverlayNowPlayingRenderer?: OverlayRenderer;
										thumbnailOverlayLoadingPreviewRenderer?: OverlayRenderer;
										thumbnailOverlayTimeStatusRenderer?: OverlayRenderer;
										thumbnailOverlayInlineUnplayableRenderer?: OverlayRenderer;
									}[];
									detailedMetadataSnippets?: {
										snippetText: TextRenderer;
										snippetHoverText: TextRenderer;
										maxOneLine: boolean;
									}[];
									inlinePlaybackEndpoint?: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												url: string;
												webPageType: string;
												rootVe: number;
											};
										};
										watchEndpoint: {
											videoId: string;
											params: string;
											playerParams: string;
											playerExtraUrlParams: Parameter[];
											watchEndpointSupportedOnesieConfig: {
												html5PlaybackOnesieConfig: {
													commonConfig: {
														url: string;
													};
												};
											};
										};
									};
									searchVideoResultEntityKey: string;
									expandableMetadata?: {
										expandableMetadataRenderer: {
											header: {
												collapsedTitle: TextRenderer;
												collapsedThumbnail: Thumbnail;
												collapsedLabel: TextRenderer;
												expandedTitle: TextRenderer;
											};
											expandedContent: {
												horizontalCardListRenderer: {
													cards: {
														macroMarkersListItemRenderer: {
															title: TextRenderer;
															timeDescription: TextRenderer;
															thumbnail: Thumbnail;
															onTap: {
																clickTrackingParams: string;
																commandMetadata?: {
																	webCommandMetadata: {
																		url: string;
																		webPageType: string;
																		rootVe: number;
																	};
																};
																watchEndpoint?: {
																	videoId: string;
																	watchEndpointSupportedOnesieConfig: {
																		html5PlaybackOnesieConfig: {
																			commonConfig: {
																				url: string;
																			};
																		};
																	};
																	startTimeSeconds?: number;
																};
																commandExecutorCommand?: {
																	commands: {
																		clickTrackingParams: string;
																		commandMetadata?: {
																			webCommandMetadata: {
																				url: string;
																				webPageType: string;
																				rootVe: number;
																			};
																		};
																		watchEndpoint?: {
																			videoId: string;
																			startTimeSeconds: number;
																			watchEndpointSupportedOnesieConfig: {
																				html5PlaybackOnesieConfig: {
																					commonConfig: {
																						url: string;
																					};
																				};
																			};
																		};
																		entityUpdateCommand?: {
																			entityBatchUpdate: {
																				mutations: {
																					entityKey: string;
																					type: string;
																					payload: {
																						markersVisibilityOverrideEntity: {
																							key: string;
																							videoId: string;
																							visibilityOverrideMarkersKey: string[];
																						};
																					};
																				}[];
																			};
																		};
																	}[];
																};
															};
															trackingParams: string;
															layout: string;
															isHighlighted: boolean;
														};
													}[];
													trackingParams: string;
													style: {
														type: string;
													};
													previousButton: {
														buttonRenderer: {
															style: string;
															size: string;
															isDisabled: boolean;
															icon: Icon;
															trackingParams: string;
														};
													};
													nextButton: {
														buttonRenderer: {
															style: string;
															size: string;
															isDisabled: boolean;
															icon: Icon;
															trackingParams: string;
														};
													};
												};
											};
											expandButton: {
												buttonRenderer: {
													style: string;
													size: string;
													isDisabled: boolean;
													icon: Icon;
													trackingParams: string;
													accessibilityData: Accessibility;
												};
											};
											collapseButton: {
												buttonRenderer: {
													style: string;
													size: string;
													isDisabled: boolean;
													icon: Icon;
													trackingParams: string;
													accessibilityData: Accessibility;
												};
											};
											trackingParams: string;
											colorData: {
												lightColorPalette: {
													section1Color: number;
													section2Color: number;
													section3Color: number;
													primaryTitleColor: number;
													secondaryTitleColor: number;
													iconActivatedColor: number;
													iconInactiveColor: number;
													section4Color: number;
													iconDisabledColor: number;
												};
												darkColorPalette: {
													section1Color: number;
													section2Color: number;
													section3Color: number;
													primaryTitleColor: number;
													secondaryTitleColor: number;
													iconActivatedColor: number;
													iconInactiveColor: number;
													section4Color: number;
													iconDisabledColor: number;
												};
												vibrantColorPalette: {
													section1Color: number;
													section2Color: number;
													section3Color: number;
													primaryTitleColor: number;
													secondaryTitleColor: number;
													iconActivatedColor: number;
													iconInactiveColor: number;
													section4Color: number;
													iconDisabledColor: number;
												};
											};
											useCustomColors: boolean;
											loggingDirectives: {
												trackingParams: string;
												visibility: {
													types: string;
												};
												enableDisplayloggerExperiment: boolean;
											};
										};
									};
									descriptionSnippet?: TextRenderer;
								};
								reelShelfRenderer?: {
									title: TextRenderer;
									button: {
										menuRenderer: {
											items: {
												menuNavigationItemRenderer: {
													text: TextRenderer;
													icon: Icon;
													navigationEndpoint: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																ignoreNavigation: boolean;
															};
														};
														userFeedbackEndpoint: {
															additionalDatas: {
																userFeedbackEndpointProductSpecificValueData: Parameter;
															}[];
														};
													};
													trackingParams: string;
													accessibility: Accessibility;
												};
											}[];
											trackingParams: string;
											accessibility: Accessibility;
										};
									};
									items: {
										reelItemRenderer: {
											videoId: string;
											headline: TextRenderer;
											thumbnail: {
												thumbnails: {
													url: string;
													width: number;
													height: number;
												}[];
												isOriginalAspectRatio: boolean;
											};
											viewCountText: TextRenderer;
											navigationEndpoint: {
												clickTrackingParams: string;
												commandMetadata: {
													webCommandMetadata: {
														url: string;
														webPageType: string;
														rootVe: number;
													};
												};
												reelWatchEndpoint: {
													videoId: string;
													playerParams: string;
													thumbnail: {
														thumbnails: {
															url: string;
															width: number;
															height: number;
														}[];
														isOriginalAspectRatio: boolean;
													};
													overlay: {
														reelPlayerOverlayRenderer: {
															style: string;
															trackingParams: string;
															reelPlayerNavigationModel: string;
														};
													};
													params: string;
													sequenceProvider: string;
													sequenceParams: string;
													loggingContext: {
														vssLoggingContext: {
															serializedContextData: string;
														};
														qoeLoggingContext: {
															serializedContextData: string;
														};
													};
													ustreamerConfig: string;
												};
											};
											menu: {
												menuRenderer: {
													items: {
														menuNavigationItemRenderer: {
															text: TextRenderer;
															icon: Icon;
															navigationEndpoint: {
																clickTrackingParams: string;
																commandMetadata: {
																	webCommandMetadata: {
																		ignoreNavigation: boolean;
																	};
																};
																userFeedbackEndpoint: {
																	additionalDatas: {
																		userFeedbackEndpointProductSpecificValueData: Parameter;
																	}[];
																};
															};
															trackingParams: string;
															accessibility: Accessibility;
														};
													}[];
													trackingParams: string;
													accessibility: Accessibility;
												};
											};
											trackingParams: string;
											accessibility: Accessibility;
											style: string;
											videoType: string;
											inlinePlaybackEndpoint: {
												clickTrackingParams: string;
												commandMetadata: {
													webCommandMetadata: {
														url: string;
														webPageType: string;
														rootVe: number;
													};
												};
												watchEndpoint: {
													videoId: string;
													playerParams: string;
													playerExtraUrlParams: Parameter[];
													watchEndpointSupportedOnesieConfig: {
														html5PlaybackOnesieConfig: {
															commonConfig: {
																url: string;
															};
														};
													};
												};
											};
											loggingDirectives: {
												trackingParams: string;
												visibility: {
													types: string;
												};
												enableDisplayloggerExperiment: boolean;
											};
										};
									}[];
									trackingParams: string;
									icon: Icon;
								};
								radioRenderer?: {
									playlistId: string;
									title: TextRenderer;
									thumbnail: {
										thumbnails: {
											url: string;
											width: number;
											height: number;
										}[];
										sampledThumbnailColor: {
											red: number;
											green: number;
											blue: number;
										};
										darkColorPalette: {
											section2Color: number;
											iconInactiveColor: number;
											iconDisabledColor: number;
										};
										vibrantColorPalette: {
											iconInactiveColor: number;
										};
									};
									videoCountText: TextRenderer;
									navigationEndpoint: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												url: string;
												webPageType: string;
												rootVe: number;
											};
										};
										watchEndpoint: {
											videoId: string;
											playlistId: string;
											params: string;
											continuePlayback: boolean;
											loggingContext: {
												vssLoggingContext: {
													serializedContextData: string;
												};
											};
											watchEndpointSupportedOnesieConfig: {
												html5PlaybackOnesieConfig: {
													commonConfig: {
														url: string;
													};
												};
											};
										};
									};
									trackingParams: string;
									videos: {
										childVideoRenderer: {
											title: TextRenderer;
											navigationEndpoint: {
												clickTrackingParams: string;
												commandMetadata: {
													webCommandMetadata: {
														url: string;
														webPageType: string;
														rootVe: number;
													};
												};
												watchEndpoint: {
													videoId: string;
													playlistId: string;
													params: string;
													loggingContext: {
														vssLoggingContext: {
															serializedContextData: string;
														};
													};
													watchEndpointSupportedOnesieConfig: {
														html5PlaybackOnesieConfig: {
															commonConfig: {
																url: string;
															};
														};
													};
												};
											};
											lengthText: TextRenderer;
											videoId: string;
										};
									}[];
									thumbnailText: TextRenderer;
									longBylineText: TextRenderer;
									thumbnailOverlays: {
										thumbnailOverlayBottomPanelRenderer?: {
											icon: Icon;
										};
										thumbnailOverlayHoverTextRenderer?: OverlayRenderer;
										thumbnailOverlayNowPlayingRenderer?: OverlayRenderer;
									}[];
									videoCountShortText: TextRenderer;
								};
								horizontalCardListRenderer?: {
									cards: {
										searchRefinementCardRenderer: {
											thumbnail: Thumbnail;
											query: TextRenderer;
											searchEndpoint: {
												clickTrackingParams: string;
												commandMetadata: {
													webCommandMetadata: {
														url: string;
														webPageType: string;
														rootVe: number;
													};
												};
												searchEndpoint: {
													query: string;
													params: string;
												};
											};
											trackingParams: string;
										};
									}[];
									trackingParams: string;
									header: {
										richListHeaderRenderer: {
											title: TextRenderer;
											trackingParams: string;
											icon: Icon;
										};
									};
									style: {
										type: string;
									};
									previousButton: {
										buttonRenderer: {
											style: string;
											size: string;
											isDisabled: boolean;
											icon: Icon;
											trackingParams: string;
										};
									};
									nextButton: {
										buttonRenderer: {
											style: string;
											size: string;
											isDisabled: boolean;
											icon: Icon;
											trackingParams: string;
										};
									};
								};
								backgroundPromoRenderer?: {
									title: TextRenderer;
									bodyText: TextRenderer;
									icon: Icon;
									trackingParams: string;
									style: {
										value: string;
									};
								};
								playlistRenderer?: {
									playlistId: string;
									title: TextRenderer;
									thumbnails: Thumbnail[];
									videoCount: string;
									navigationEndpoint: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												url: string;
												webPageType: string;
												rootVe: number;
											};
										};
										watchEndpoint: {
											videoId: string;
											playlistId: string;
											params: string;
											loggingContext: {
												vssLoggingContext: {
													serializedContextData: string;
												};
											};
											watchEndpointSupportedOnesieConfig: {
												html5PlaybackOnesieConfig: {
													commonConfig: {
														url: string;
													};
												};
											};
										};
									};
									viewPlaylistText: TextRenderer;
									shortBylineText: TextRenderer;
									videos: {
										childVideoRenderer: {
											title: TextRenderer;
											navigationEndpoint: {
												clickTrackingParams: string;
												commandMetadata: {
													webCommandMetadata: {
														url: string;
														webPageType: string;
														rootVe: number;
													};
												};
												watchEndpoint: {
													videoId: string;
													playlistId: string;
													loggingContext: {
														vssLoggingContext: {
															serializedContextData: string;
														};
													};
													watchEndpointSupportedOnesieConfig: {
														html5PlaybackOnesieConfig: {
															commonConfig: {
																url: string;
															};
														};
													};
												};
											};
											lengthText: TextRenderer;
											videoId: string;
										};
									}[];
									videoCountText: TextRenderer;
									trackingParams: string;
									thumbnailText: TextRenderer;
									longBylineText: TextRenderer;
									ownerBadges?: {
										metadataBadgeRenderer: {
											icon: Icon;
											style: string;
											tooltip: string;
											trackingParams: string;
											accessibilityData: {
												label: string;
											};
										};
									}[];
									thumbnailRenderer: {
										playlistVideoThumbnailRenderer?: {
											thumbnail: {
												thumbnails: {
													url: string;
													width: number;
													height: number;
												}[];
												sampledThumbnailColor: {
													red: number;
													green: number;
													blue: number;
												};
												darkColorPalette: {
													section2Color: number;
													iconInactiveColor: number;
													iconDisabledColor: number;
												};
												vibrantColorPalette: {
													iconInactiveColor: number;
												};
											};
											trackingParams: string;
										};
										playlistCustomThumbnailRenderer?: {
											thumbnail: {
												thumbnails: {
													url: string;
													width: number;
													height: number;
												}[];
												sampledThumbnailColor: {
													red: number;
													green: number;
													blue: number;
												};
												darkColorPalette: {
													section2Color: number;
													iconInactiveColor: number;
													iconDisabledColor: number;
												};
												vibrantColorPalette: {
													iconInactiveColor: number;
												};
											};
										};
									};
									thumbnailOverlays: {
										thumbnailOverlayBottomPanelRenderer?: OverlayRenderer;
										thumbnailOverlayHoverTextRenderer?: OverlayRenderer;
										thumbnailOverlayNowPlayingRenderer?: OverlayRenderer;
									}[];
									publishedTimeText?: TextRenderer;
								};
							}[];
							trackingParams: string;
						};
						continuationItemRenderer?: {
							trigger: string;
							continuationEndpoint: NavigationEndpoint;
							loggingDirectives: {
								trackingParams: string;
							};
						};
					}[];
					trackingParams: string;
					subMenu: {
						searchSubMenuRenderer: {
							trackingParams: string;
						};
					};
					hideBottomSeparator: boolean;
					targetId: string;
				};
			};
			secondaryContents?: {
				secondarySearchContainerRenderer: {
					contents: {
						universalWatchCardRenderer: {
							header: {
								watchCardRichHeaderRenderer: {
									title: TextRenderer;
									titleNavigationEndpoint: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												url: string;
												webPageType: string;
												rootVe: number;
												apiUrl: string;
											};
										};
										browseEndpoint: {
											browseId: string;
										};
									};
									subtitle: TextRenderer;
									colorSupportedDatas: {
										basicColorPaletteData: {
											backgroundColor: number;
											foregroundTitleColor: number;
											foregroundBodyColor: number;
										};
									};
									trackingParams: string;
									darkThemeColorSupportedDatas: {
										basicColorPaletteData: {
											backgroundColor: number;
											foregroundTitleColor: number;
											foregroundBodyColor: number;
										};
									};
									style: string;
									avatar?: {
										thumbnails: {
											url: string;
											width: number;
											height: number;
										}[];
										placeholderColor: number;
									};
									titleBadge?: {
										metadataBadgeRenderer: {
											icon: Icon;
											style: string;
											tooltip: string;
											trackingParams: string;
											accessibilityData: {
												label: string;
											};
										};
									};
									callToActionButtons?: {
										buttonRenderer: {
											style: string;
											size: string;
											isDisabled: boolean;
											text: TextRenderer;
											navigationEndpoint: {
												clickTrackingParams: string;
												commandMetadata: {
													webCommandMetadata: {
														url: string;
														webPageType: string;
														rootVe: number;
													};
												};
												signInEndpoint: {
													nextEndpoint: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																url: string;
																webPageType: string;
																rootVe: number;
															};
														};
														searchEndpoint: {
															query: string;
														};
													};
													continueAction: string;
												};
											};
											trackingParams: string;
										};
									}[];
								};
							};
							callToAction: {
								watchCardHeroVideoRenderer: {
									navigationEndpoint: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												url: string;
												webPageType: string;
												rootVe: number;
											};
										};
										watchEndpoint?: {
											videoId: string;
											playlistId: string;
											loggingContext: {
												vssLoggingContext: {
													serializedContextData: string;
												};
											};
											watchEndpointSupportedOnesieConfig: {
												html5PlaybackOnesieConfig: {
													commonConfig: {
														url: string;
													};
												};
											};
											params?: string;
										};
										watchPlaylistEndpoint?: {
											playlistId: string;
										};
									};
									trackingParams: string;
									callToActionButton: {
										callToActionButtonRenderer: {
											label: TextRenderer;
											icon: Icon;
											style: string;
										};
									};
									heroImage: {
										singleHeroImageRenderer?: {
											thumbnail: Thumbnail;
											style: string;
										};
										collageHeroImageRenderer?: {
											leftThumbnail: Thumbnail;
											topRightThumbnail: Thumbnail;
											bottomRightThumbnail: Thumbnail;
										};
									};
									accessibility: Accessibility;
								};
							};
							sections: {
								watchCardSectionSequenceRenderer: {
									lists: {
										verticalWatchCardListRenderer?: {
											items: {
												watchCardCompactVideoRenderer: {
													title: TextRenderer;
													subtitle: TextRenderer;
													lengthText: TextRenderer;
													navigationEndpoint: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																url: string;
																webPageType: string;
																rootVe: number;
															};
														};
														watchEndpoint: {
															videoId: string;
															playlistId?: string;
															playerParams: string;
															loggingContext?: {
																vssLoggingContext: {
																	serializedContextData: string;
																};
															};
															watchEndpointSupportedOnesieConfig: {
																html5PlaybackOnesieConfig: {
																	commonConfig: {
																		url: string;
																	};
																};
															};
															params?: string;
														};
													};
													trackingParams: string;
													style: string;
													byline?: TextRenderer;
												};
											}[];
											viewAllEndpoint?: {
												clickTrackingParams: string;
												commandMetadata: {
													webCommandMetadata: {
														url: string;
														webPageType: string;
														rootVe: number;
														apiUrl: string;
													};
												};
												browseEndpoint: {
													browseId: string;
												};
											};
											viewAllText?: TextRenderer;
											trackingParams: string;
										};
										horizontalCardListRenderer?: {
											cards: {
												searchRefinementCardRenderer: {
													thumbnail: Thumbnail;
													query: TextRenderer;
													searchEndpoint: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																url: string;
																webPageType: string;
																rootVe: number;
															};
														};
														watchPlaylistEndpoint: {
															playlistId: string;
														};
													};
													trackingParams: string;
													searchRefinementCardRendererStyle: {
														value: string;
													};
												};
											}[];
											trackingParams: string;
											header: {
												titleAndButtonListHeaderRenderer: {
													title: TextRenderer;
													trackingParams: string;
												};
											};
											previousButton: {
												buttonRenderer: {
													style: string;
													size: string;
													isDisabled: boolean;
													icon: Icon;
													trackingParams: string;
												};
											};
											nextButton: {
												buttonRenderer: {
													style: string;
													size: string;
													isDisabled: boolean;
													icon: Icon;
													trackingParams: string;
												};
											};
										};
									}[];
									trackingParams: string;
									listTitles?: TextRenderer[];
								};
							}[];
							collapsedLabel: TextRenderer;
							trackingParams: string;
						};
					}[];
					trackingParams: string;
				};
			};
		};
	};
	trackingParams: string;
	header: {
		searchHeaderRenderer: {
			chipBar?: {
				chipCloudRenderer: {
					chips: {
						chipCloudChipRenderer: {
							style: {
								styleType: string;
							};
							text: TextRenderer;
							trackingParams: string;
							isSelected: boolean;
							location: string;
							navigationEndpoint?: NavigationEndpoint;
						};
					}[];
					trackingParams: string;
					nextButton: {
						buttonRenderer: {
							style: string;
							size: string;
							isDisabled: boolean;
							icon: Icon;
							accessibility: {
								label: string;
							};
							trackingParams: string;
						};
					};
					previousButton: {
						buttonRenderer: {
							style: string;
							size: string;
							isDisabled: boolean;
							icon: Icon;
							accessibility: {
								label: string;
							};
							trackingParams: string;
						};
					};
					loggingDirectives: {
						trackingParams: string;
						visibility: {
							types: string;
						};
						enableDisplayloggerExperiment: boolean;
					};
				};
			};
			searchFilterButton: {
				buttonRenderer: {
					style: string;
					size: string;
					isDisabled: boolean;
					text: TextRenderer;
					icon: Icon;
					tooltip: string;
					trackingParams: string;
					accessibilityData: Accessibility;
					command: {
						clickTrackingParams: string;
						openPopupAction: {
							popup: {
								searchFilterOptionsDialogRenderer: {
									title: TextRenderer;
									groups: {
										searchFilterGroupRenderer: {
											title: TextRenderer;
											filters: {
												searchFilterRenderer: {
													label: TextRenderer;
													navigationEndpoint?: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																url: string;
																webPageType: string;
																rootVe: number;
															};
														};
														searchEndpoint: {
															query?: string;
															params: string;
														};
													};
													tooltip: string;
													trackingParams: string;
													status?: string;
												};
											}[];
											trackingParams: string;
										};
									}[];
								};
							};
							popupType: string;
						};
					};
					iconPosition: string;
				};
			};
			trackingParams: string;
		};
	};
	topbar: {
		desktopTopbarRenderer: {
			logo: {
				topbarLogoRenderer: {
					iconImage: Icon;
					tooltipText: TextRenderer;
					endpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								url: string;
								webPageType: string;
								rootVe: number;
								apiUrl: string;
							};
						};
						browseEndpoint: {
							browseId: string;
						};
					};
					trackingParams: string;
					overrideEntityKey: string;
				};
			};
			searchbox: {
				fusionSearchboxRenderer: {
					icon: Icon;
					placeholderText: TextRenderer;
					config: {
						webSearchboxConfig: {
							requestLanguage: string;
							requestDomain: string;
							hasOnscreenKeyboard: boolean;
							focusSearchbox: boolean;
						};
					};
					trackingParams: string;
					searchEndpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								url: string;
								webPageType: string;
								rootVe: number;
							};
						};
						searchEndpoint: {
							query: string;
						};
					};
					clearButton: {
						buttonRenderer: {
							style: string;
							size: string;
							isDisabled: boolean;
							icon: Icon;
							trackingParams: string;
							accessibilityData: Accessibility;
						};
					};
				};
			};
			trackingParams: string;
			topbarButtons: {
				topbarMenuButtonRenderer?: {
					icon: Icon;
					menuRequest: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								sendPost: boolean;
								apiUrl: string;
							};
						};
						signalServiceEndpoint: {
							signal: string;
							actions: {
								clickTrackingParams: string;
								openPopupAction: {
									popup: {
										multiPageMenuRenderer: {
											trackingParams: string;
											style: string;
											showLoadingSpinner: boolean;
										};
									};
									popupType: string;
									beReused: boolean;
								};
							}[];
						};
					};
					trackingParams: string;
					accessibility: Accessibility;
					tooltip: string;
					style: string;
				};
				buttonRenderer?: {
					style: string;
					size: string;
					text: TextRenderer;
					icon: Icon;
					navigationEndpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								url: string;
								webPageType: string;
								rootVe: number;
							};
						};
						signInEndpoint: {
							idamTag: string;
						};
					};
					trackingParams: string;
					targetId: string;
				};
			}[];
			hotkeyDialog: {
				hotkeyDialogRenderer: {
					title: TextRenderer;
					sections: {
						hotkeyDialogSectionRenderer: {
							title: TextRenderer;
							options: {
								hotkeyDialogSectionOptionRenderer: {
									label: TextRenderer;
									hotkey: string;
									hotkeyAccessibilityLabel?: Accessibility;
								};
							}[];
						};
					}[];
					dismissButton: {
						buttonRenderer: {
							style: string;
							size: string;
							isDisabled: boolean;
							text: TextRenderer;
							trackingParams: string;
						};
					};
					trackingParams: string;
				};
			};
			backButton: {
				buttonRenderer: {
					trackingParams: string;
					command: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								sendPost: boolean;
							};
						};
						signalServiceEndpoint: {
							signal: string;
							actions: {
								clickTrackingParams: string;
								signalAction: {
									signal: string;
								};
							}[];
						};
					};
				};
			};
			forwardButton: {
				buttonRenderer: {
					trackingParams: string;
					command: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								sendPost: boolean;
							};
						};
						signalServiceEndpoint: {
							signal: string;
							actions: {
								clickTrackingParams: string;
								signalAction: {
									signal: string;
								};
							}[];
						};
					};
				};
			};
			a11ySkipNavigationButton: {
				buttonRenderer: {
					style: string;
					size: string;
					isDisabled: boolean;
					text: TextRenderer;
					trackingParams: string;
					command: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								sendPost: boolean;
							};
						};
						signalServiceEndpoint: {
							signal: string;
							actions: {
								clickTrackingParams: string;
								signalAction: {
									signal: string;
								};
							}[];
						};
					};
				};
			};
			voiceSearchButton: {
				buttonRenderer: {
					style: string;
					size: string;
					isDisabled: boolean;
					serviceEndpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								sendPost: boolean;
							};
						};
						signalServiceEndpoint: {
							signal: string;
							actions: {
								clickTrackingParams: string;
								openPopupAction: {
									popup: {
										voiceSearchDialogRenderer: {
											placeholderHeader: TextRenderer;
											promptHeader: TextRenderer;
											exampleQuery1: TextRenderer;
											exampleQuery2: TextRenderer;
											promptMicrophoneLabel: TextRenderer;
											loadingHeader: TextRenderer;
											connectionErrorHeader: TextRenderer;
											connectionErrorMicrophoneLabel: TextRenderer;
											permissionsHeader: TextRenderer;
											permissionsSubtext: TextRenderer;
											disabledHeader: TextRenderer;
											disabledSubtext: TextRenderer;
											microphoneButtonAriaLabel: TextRenderer;
											exitButton: {
												buttonRenderer: {
													style: string;
													size: string;
													isDisabled: boolean;
													icon: Icon;
													trackingParams: string;
													accessibilityData: Accessibility;
												};
											};
											trackingParams: string;
											microphoneOffPromptHeader: TextRenderer;
										};
									};
									popupType: string;
								};
							}[];
						};
					};
					icon: Icon;
					tooltip: string;
					trackingParams: string;
					accessibilityData: Accessibility;
				};
			};
		};
	};
	refinements?: string[];
	targetId?: string;
	onResponseReceivedCommands?: {
		clickTrackingParams: string;
		adsControlFlowOpportunityReceivedCommand?: {
			opportunityType: string;
			isInitialLoad: boolean;
			adSlotAndLayoutMetadata: {
				adSlotMetadata: {
					slotId: string;
					slotType: string;
					slotPhysicalPosition: number;
					adSlotLoggingData: {
						serializedSlotAdServingDataEntry: string;
					};
				};
				adLayoutMetadata: {
					layoutId: string;
					layoutType: string;
					adLayoutLoggingData: {
						serializedAdServingDataEntry: string;
					};
				}[];
			}[];
			enablePacfLoggingWeb: boolean;
		};
		appendContinuationItemsAction?: {
			continuationItems?: {
				itemSectionRenderer?: {
					contents: {
						videoRenderer?: {
							videoId: string;
							thumbnail: Thumbnail;
							title: TextRenderer;
							longBylineText: TextRenderer;
							publishedTimeText: TextRenderer;
							lengthText: TextRenderer;
							viewCountText: TextRenderer;
							navigationEndpoint: {
								clickTrackingParams: string;
								commandMetadata: {
									webCommandMetadata: {
										url: string;
										webPageType: string;
										rootVe: number;
									};
								};
								watchEndpoint: {
									videoId: string;
									params: string;
									playerParams: string;
									watchEndpointSupportedOnesieConfig: {
										html5PlaybackOnesieConfig: {
											commonConfig: {
												url: string;
											};
										};
									};
								};
							};
							badges?: {
								metadataBadgeRenderer: {
									style: string;
									label: string;
									trackingParams: string;
									accessibilityData: {
										label: string;
									};
								};
							}[];
							ownerBadges?: {
								metadataBadgeRenderer: {
									icon: Icon;
									style: string;
									tooltip: string;
									trackingParams: string;
									accessibilityData: {
										label: string;
									};
								};
							}[];
							ownerText: TextRenderer;
							shortBylineText: TextRenderer;
							trackingParams: string;
							showActionMenu: boolean;
							shortViewCountText: TextRenderer;
							menu: {
								menuRenderer: {
									items: {
										menuServiceItemRenderer: {
											text: TextRenderer;
											icon: Icon;
											serviceEndpoint: {
												clickTrackingParams: string;
												commandMetadata: {
													webCommandMetadata: {
														sendPost: boolean;
														apiUrl?: string;
													};
												};
												signalServiceEndpoint?: {
													signal: string;
													actions: {
														clickTrackingParams: string;
														addToPlaylistCommand: {
															openMiniplayer: boolean;
															videoId: string;
															listType: string;
															onCreateListCommand: NavigationEndpoint;
															videoIds: string[];
														};
													}[];
												};
												shareEntityServiceEndpoint?: {
													serializedShareEntity: string;
													commands: {
														clickTrackingParams: string;
														openPopupAction: {
															popup: {
																unifiedSharePanelRenderer: {
																	trackingParams: string;
																	showLoadingSpinner: boolean;
																};
															};
															popupType: string;
															beReused: boolean;
														};
													}[];
												};
											};
											trackingParams: string;
											hasSeparator?: boolean;
										};
									}[];
									trackingParams: string;
									accessibility: Accessibility;
								};
							};
							channelThumbnailSupportedRenderers: {
								channelThumbnailWithLinkRenderer: {
									thumbnail: Thumbnail;
									navigationEndpoint: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												url: string;
												webPageType: string;
												rootVe: number;
												apiUrl: string;
											};
										};
										browseEndpoint: {
											browseId: string;
											canonicalBaseUrl?: string;
										};
									};
									accessibility: Accessibility;
								};
							};
							thumbnailOverlays: {
								thumbnailOverlayTimeStatusRenderer?: OverlayRenderer;
								thumbnailOverlayToggleButtonRenderer?: {
									untoggledIcon: Icon;
									toggledIcon: Icon;
									untoggledTooltip: string;
									toggledTooltip: string;
									untoggledServiceEndpoint: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												sendPost: boolean;
												apiUrl?: string;
											};
										};
										signalServiceEndpoint?: {
											signal: string;
											actions: {
												clickTrackingParams: string;
												addToPlaylistCommand: {
													openMiniplayer: boolean;
													videoId: string;
													listType: string;
													onCreateListCommand: NavigationEndpoint;
													videoIds: string[];
												};
											}[];
										};
										playlistEditEndpoint?: {
											playlistId: string;
											actions: {
												addedVideoId: string;
												action: string;
											}[];
										};
									};
									untoggledAccessibility: Accessibility;
									toggledAccessibility: Accessibility;
									trackingParams: string;
									isToggled?: boolean;
									toggledServiceEndpoint?: NavigationEndpoint;
								};
								thumbnailOverlayNowPlayingRenderer?: OverlayRenderer;
								thumbnailOverlayLoadingPreviewRenderer?: OverlayRenderer;
							}[];
							detailedMetadataSnippets?: {
								snippetText: TextRenderer;
								snippetHoverText: TextRenderer;
								maxOneLine: boolean;
							}[];
							inlinePlaybackEndpoint: {
								clickTrackingParams: string;
								commandMetadata: {
									webCommandMetadata: {
										url: string;
										webPageType: string;
										rootVe: number;
									};
								};
								watchEndpoint: {
									videoId: string;
									params: string;
									playerParams: string;
									playerExtraUrlParams: Parameter[];
									watchEndpointSupportedOnesieConfig: {
										html5PlaybackOnesieConfig: {
											commonConfig: {
												url: string;
											};
										};
									};
								};
							};
							searchVideoResultEntityKey: string;
						};
						playlistRenderer?: {
							playlistId: string;
							title: TextRenderer;
							thumbnails: Thumbnail[];
							videoCount: string;
							navigationEndpoint: {
								clickTrackingParams: string;
								commandMetadata: {
									webCommandMetadata: {
										url: string;
										webPageType: string;
										rootVe: number;
									};
								};
								watchEndpoint: {
									videoId: string;
									playlistId: string;
									params: string;
									loggingContext: {
										vssLoggingContext: {
											serializedContextData: string;
										};
									};
									watchEndpointSupportedOnesieConfig: {
										html5PlaybackOnesieConfig: {
											commonConfig: {
												url: string;
											};
										};
									};
								};
							};
							viewPlaylistText: TextRenderer;
							shortBylineText: TextRenderer;
							videos: {
								childVideoRenderer: {
									title: TextRenderer;
									navigationEndpoint: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												url: string;
												webPageType: string;
												rootVe: number;
											};
										};
										watchEndpoint: {
											videoId: string;
											playlistId: string;
											loggingContext: {
												vssLoggingContext: {
													serializedContextData: string;
												};
											};
											watchEndpointSupportedOnesieConfig: {
												html5PlaybackOnesieConfig: {
													commonConfig: {
														url: string;
													};
												};
											};
										};
									};
									lengthText: TextRenderer;
									videoId: string;
								};
							}[];
							videoCountText: TextRenderer;
							trackingParams: string;
							thumbnailText: TextRenderer;
							longBylineText: TextRenderer;
							thumbnailRenderer: {
								playlistVideoThumbnailRenderer: {
									thumbnail: {
										thumbnails: {
											url: string;
											width: number;
											height: number;
										}[];
										sampledThumbnailColor: {
											red: number;
											green: number;
											blue: number;
										};
										darkColorPalette: {
											section2Color: number;
											iconInactiveColor: number;
											iconDisabledColor: number;
										};
										vibrantColorPalette: {
											iconInactiveColor: number;
										};
									};
									trackingParams: string;
								};
							};
							thumbnailOverlays: {
								thumbnailOverlayBottomPanelRenderer?: OverlayRenderer;
								thumbnailOverlayHoverTextRenderer?: OverlayRenderer;
								thumbnailOverlayNowPlayingRenderer?: OverlayRenderer;
							}[];
						};
						reelShelfRenderer?: {
							title: TextRenderer;
							button: {
								menuRenderer: {
									items: {
										menuNavigationItemRenderer: {
											text: TextRenderer;
											icon: Icon;
											navigationEndpoint: {
												clickTrackingParams: string;
												commandMetadata: {
													webCommandMetadata: {
														ignoreNavigation: boolean;
													};
												};
												userFeedbackEndpoint: {
													additionalDatas: {
														userFeedbackEndpointProductSpecificValueData: Parameter;
													}[];
												};
											};
											trackingParams: string;
											accessibility: Accessibility;
										};
									}[];
									trackingParams: string;
									accessibility: Accessibility;
								};
							};
							items: {
								reelItemRenderer: {
									videoId: string;
									headline: TextRenderer;
									thumbnail: {
										thumbnails: {
											url: string;
											width: number;
											height: number;
										}[];
										isOriginalAspectRatio: boolean;
									};
									viewCountText: TextRenderer;
									navigationEndpoint: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												url: string;
												webPageType: string;
												rootVe: number;
											};
										};
										reelWatchEndpoint: {
											videoId: string;
											playerParams: string;
											thumbnail: {
												thumbnails: {
													url: string;
													width: number;
													height: number;
												}[];
												isOriginalAspectRatio: boolean;
											};
											overlay: {
												reelPlayerOverlayRenderer: {
													style: string;
													trackingParams: string;
													reelPlayerNavigationModel: string;
												};
											};
											params: string;
											sequenceProvider: string;
											sequenceParams: string;
											loggingContext: {
												vssLoggingContext: {
													serializedContextData: string;
												};
												qoeLoggingContext: {
													serializedContextData: string;
												};
											};
											ustreamerConfig: string;
										};
									};
									menu: {
										menuRenderer: {
											items: {
												menuNavigationItemRenderer: {
													text: TextRenderer;
													icon: Icon;
													navigationEndpoint: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																ignoreNavigation: boolean;
															};
														};
														userFeedbackEndpoint: {
															additionalDatas: {
																userFeedbackEndpointProductSpecificValueData: Parameter;
															}[];
														};
													};
													trackingParams: string;
													accessibility: Accessibility;
												};
											}[];
											trackingParams: string;
											accessibility: Accessibility;
										};
									};
									trackingParams: string;
									accessibility: Accessibility;
									style: string;
									videoType: string;
									inlinePlaybackEndpoint: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												url: string;
												webPageType: string;
												rootVe: number;
											};
										};
										watchEndpoint: {
											videoId: string;
											playerParams: string;
											playerExtraUrlParams: Parameter[];
											watchEndpointSupportedOnesieConfig: {
												html5PlaybackOnesieConfig: {
													commonConfig: {
														url: string;
													};
												};
											};
										};
									};
									loggingDirectives: {
										trackingParams: string;
										visibility: {
											types: string;
										};
										enableDisplayloggerExperiment: boolean;
									};
								};
							}[];
							trackingParams: string;
							icon: Icon;
						};
					}[];
					trackingParams: string;
				};
				continuationItemRenderer?: {
					trigger: string;
					continuationEndpoint: NavigationEndpoint;
					loggingDirectives: {
						trackingParams: string;
					};
				};
			}[];
			targetId: string;
		};
	}[];
};

export type RawSearchResultData = {
	channelRenderer: {
		channelId: string;
		title: TextRenderer;
		navigationEndpoint: {
			clickTrackingParams: string;
			commandMetadata: {
				webCommandMetadata: {
					url: string;
					webPageType: string;
					rootVe: number;
					apiUrl: string;
				};
			};
			browseEndpoint: {
				browseId: string;
				canonicalBaseUrl: string;
			};
		};
		thumbnail: Thumbnail;
		descriptionSnippet?: TextRenderer;
		shortBylineText: TextRenderer;
		videoCountText: TextRenderer;
		subscriptionButton: {
			subscribed: boolean;
		};
		ownerBadges: {
			metadataBadgeRenderer: {
				icon: Icon;
				style: string;
				tooltip: string;
				trackingParams: string;
				accessibilityData: {
					label: string;
				};
			};
		}[];
		subscriberCountText: TextRenderer;
		subscribeButton: {
			buttonRenderer: {
				style: string;
				size: string;
				isDisabled: boolean;
				text: TextRenderer;
				navigationEndpoint: {
					clickTrackingParams: string;
					commandMetadata: {
						webCommandMetadata: {
							url: string;
							webPageType: string;
							rootVe: number;
						};
					};
					signInEndpoint: {
						nextEndpoint: {
							clickTrackingParams: string;
							commandMetadata: {
								webCommandMetadata: {
									url: string;
									webPageType: string;
									rootVe: number;
								};
							};
							searchEndpoint: {
								query: string;
							};
						};
						continueAction: string;
					};
				};
				trackingParams: string;
			};
		};
		trackingParams: string;
		longBylineText: TextRenderer;
	};
}
	|
{
	videoRenderer: {
		videoId: string;
		thumbnail: Thumbnail;
		title: TextRenderer;
		longBylineText: TextRenderer;
		publishedTimeText?: TextRenderer;
		lengthText?: TextRenderer;
		viewCountText: TextRenderer;
		navigationEndpoint: {
			clickTrackingParams: string;
			commandMetadata: {
				webCommandMetadata: {
					url: string;
					webPageType: string;
					rootVe: number;
				};
			};
			watchEndpoint?: {
				videoId: string;
				params: string;
				playerParams: string;
				watchEndpointSupportedOnesieConfig: {
					html5PlaybackOnesieConfig: {
						commonConfig: {
							url: string;
						};
					};
				};
			};
			reelWatchEndpoint?: {
				videoId: string;
				playerParams: string;
				thumbnail: {
					thumbnails: {
						url: string;
						width: number;
						height: number;
					}[];
					isOriginalAspectRatio: boolean;
				};
				overlay: {
					reelPlayerOverlayRenderer: {
						style: string;
						trackingParams: string;
						reelPlayerNavigationModel: string;
					};
				};
				params: string;
				sequenceProvider: string;
				sequenceParams: string;
				loggingContext: {
					vssLoggingContext: {
						serializedContextData: string;
					};
					qoeLoggingContext: {
						serializedContextData: string;
					};
				};
				ustreamerConfig: string;
			};
		};
		badges?: {
			metadataBadgeRenderer: {
				style: string;
				label: string;
				trackingParams: string;
				accessibilityData?: {
					label: string;
				};
				icon?: Icon;
			};
		}[];
		ownerBadges?: {
			metadataBadgeRenderer: {
				icon: Icon;
				style: string;
				tooltip: string;
				trackingParams: string;
				accessibilityData: {
					label: string;
				};
			};
		}[];
		ownerText: TextRenderer;
		shortBylineText: TextRenderer;
		trackingParams: string;
		showActionMenu: boolean;
		shortViewCountText: TextRenderer;
		menu: {
			menuRenderer: {
				items: {
					menuServiceItemRenderer: {
						text: TextRenderer;
						icon: Icon;
						serviceEndpoint: {
							clickTrackingParams: string;
							commandMetadata: {
								webCommandMetadata: {
									sendPost: boolean;
									apiUrl?: string;
								};
							};
							signalServiceEndpoint?: {
								signal: string;
								actions: {
									clickTrackingParams: string;
									addToPlaylistCommand: {
										openMiniplayer: boolean;
										videoId: string;
										listType: string;
										onCreateListCommand: NavigationEndpoint;
										videoIds: string[];
									};
								}[];
							};
							shareEntityServiceEndpoint?: {
								serializedShareEntity: string;
								commands: {
									clickTrackingParams: string;
									openPopupAction: {
										popup: {
											unifiedSharePanelRenderer: {
												trackingParams: string;
												showLoadingSpinner: boolean;
											};
										};
										popupType: string;
										beReused: boolean;
									};
								}[];
							};
						};
						trackingParams: string;
						hasSeparator?: boolean;
					};
				}[];
				trackingParams: string;
				accessibility: Accessibility;
			};
		};
		channelThumbnailSupportedRenderers: {
			channelThumbnailWithLinkRenderer: {
				thumbnail: Thumbnail;
				navigationEndpoint: {
					clickTrackingParams: string;
					commandMetadata: {
						webCommandMetadata: {
							url: string;
							webPageType: string;
							rootVe: number;
							apiUrl: string;
						};
					};
					browseEndpoint: {
						browseId: string;
						canonicalBaseUrl?: string;
					};
				};
				accessibility: Accessibility;
			};
		};
		thumbnailOverlays: {
			thumbnailOverlayToggleButtonRenderer?: {
				untoggledIcon: Icon;
				toggledIcon: Icon;
				untoggledTooltip: string;
				toggledTooltip: string;
				untoggledServiceEndpoint: {
					clickTrackingParams: string;
					commandMetadata: {
						webCommandMetadata: {
							sendPost: boolean;
							apiUrl?: string;
						};
					};
					signalServiceEndpoint?: {
						signal: string;
						actions: {
							clickTrackingParams: string;
							addToPlaylistCommand: {
								openMiniplayer: boolean;
								videoId: string;
								listType: string;
								onCreateListCommand: NavigationEndpoint;
								videoIds: string[];
							};
						}[];
					};
					playlistEditEndpoint?: {
						playlistId: string;
						actions: {
							addedVideoId: string;
							action: string;
						}[];
					};
				};
				untoggledAccessibility: Accessibility;
				toggledAccessibility: Accessibility;
				trackingParams: string;
				isToggled?: boolean;
				toggledServiceEndpoint?: NavigationEndpoint;
			};
			thumbnailOverlayNowPlayingRenderer?: OverlayRenderer;
			thumbnailOverlayLoadingPreviewRenderer?: OverlayRenderer;
			thumbnailOverlayTimeStatusRenderer?: OverlayRenderer;
			thumbnailOverlayInlineUnplayableRenderer?: OverlayRenderer;
		}[];
		detailedMetadataSnippets?: {
			snippetText: TextRenderer;
			snippetHoverText: TextRenderer;
			maxOneLine: boolean;
		}[];
		inlinePlaybackEndpoint?: {
			clickTrackingParams: string;
			commandMetadata: {
				webCommandMetadata: {
					url: string;
					webPageType: string;
					rootVe: number;
				};
			};
			watchEndpoint: {
				videoId: string;
				params: string;
				playerParams: string;
				playerExtraUrlParams: Parameter[];
				watchEndpointSupportedOnesieConfig: {
					html5PlaybackOnesieConfig: {
						commonConfig: {
							url: string;
						};
					};
				};
			};
		};
		searchVideoResultEntityKey: string;
		expandableMetadata?: {
			expandableMetadataRenderer: {
				header: {
					collapsedTitle: TextRenderer;
					collapsedThumbnail: Thumbnail;
					collapsedLabel: TextRenderer;
					expandedTitle: TextRenderer;
				};
				expandedContent: {
					horizontalCardListRenderer: {
						cards: {
							macroMarkersListItemRenderer: {
								title: TextRenderer;
								timeDescription: TextRenderer;
								thumbnail: Thumbnail;
								onTap: {
									clickTrackingParams: string;
									commandMetadata?: {
										webCommandMetadata: {
											url: string;
											webPageType: string;
											rootVe: number;
										};
									};
									watchEndpoint?: {
										videoId: string;
										watchEndpointSupportedOnesieConfig: {
											html5PlaybackOnesieConfig: {
												commonConfig: {
													url: string;
												};
											};
										};
										startTimeSeconds?: number;
									};
									commandExecutorCommand?: {
										commands: {
											clickTrackingParams: string;
											commandMetadata?: {
												webCommandMetadata: {
													url: string;
													webPageType: string;
													rootVe: number;
												};
											};
											watchEndpoint?: {
												videoId: string;
												startTimeSeconds: number;
												watchEndpointSupportedOnesieConfig: {
													html5PlaybackOnesieConfig: {
														commonConfig: {
															url: string;
														};
													};
												};
											};
											entityUpdateCommand?: {
												entityBatchUpdate: {
													mutations: {
														entityKey: string;
														type: string;
														payload: {
															markersVisibilityOverrideEntity: {
																key: string;
																videoId: string;
																visibilityOverrideMarkersKey: string[];
															};
														};
													}[];
												};
											};
										}[];
									};
								};
								trackingParams: string;
								layout: string;
								isHighlighted: boolean;
							};
						}[];
						trackingParams: string;
						style: {
							type: string;
						};
						previousButton: {
							buttonRenderer: {
								style: string;
								size: string;
								isDisabled: boolean;
								icon: Icon;
								trackingParams: string;
							};
						};
						nextButton: {
							buttonRenderer: {
								style: string;
								size: string;
								isDisabled: boolean;
								icon: Icon;
								trackingParams: string;
							};
						};
					};
				};
				expandButton: {
					buttonRenderer: {
						style: string;
						size: string;
						isDisabled: boolean;
						icon: Icon;
						trackingParams: string;
						accessibilityData: Accessibility;
					};
				};
				collapseButton: {
					buttonRenderer: {
						style: string;
						size: string;
						isDisabled: boolean;
						icon: Icon;
						trackingParams: string;
						accessibilityData: Accessibility;
					};
				};
				trackingParams: string;
				colorData: {
					lightColorPalette: {
						section1Color: number;
						section2Color: number;
						section3Color: number;
						primaryTitleColor: number;
						secondaryTitleColor: number;
						iconActivatedColor: number;
						iconInactiveColor: number;
						section4Color: number;
						iconDisabledColor: number;
					};
					darkColorPalette: {
						section1Color: number;
						section2Color: number;
						section3Color: number;
						primaryTitleColor: number;
						secondaryTitleColor: number;
						iconActivatedColor: number;
						iconInactiveColor: number;
						section4Color: number;
						iconDisabledColor: number;
					};
					vibrantColorPalette: {
						section1Color: number;
						section2Color: number;
						section3Color: number;
						primaryTitleColor: number;
						secondaryTitleColor: number;
						iconActivatedColor: number;
						iconInactiveColor: number;
						section4Color: number;
						iconDisabledColor: number;
					};
				};
				useCustomColors: boolean;
				loggingDirectives: {
					trackingParams: string;
					visibility: {
						types: string;
					};
					enableDisplayloggerExperiment: boolean;
				};
			};
		};
		descriptionSnippet?: TextRenderer;
	};
}
	|
{
	playlistRenderer: {
		playlistId: string;
		title: TextRenderer;
		thumbnails: Thumbnail[];
		videoCount: string;
		navigationEndpoint: {
			clickTrackingParams: string;
			commandMetadata: {
				webCommandMetadata: {
					url: string;
					webPageType: string;
					rootVe: number;
				};
			};
			watchEndpoint: {
				videoId: string;
				playlistId: string;
				params: string;
				loggingContext: {
					vssLoggingContext: {
						serializedContextData: string;
					};
				};
				watchEndpointSupportedOnesieConfig: {
					html5PlaybackOnesieConfig: {
						commonConfig: {
							url: string;
						};
					};
				};
			};
		};
		viewPlaylistText: TextRenderer;
		shortBylineText: TextRenderer;
		videos: {
			childVideoRenderer: {
				title: TextRenderer;
				navigationEndpoint: {
					clickTrackingParams: string;
					commandMetadata: {
						webCommandMetadata: {
							url: string;
							webPageType: string;
							rootVe: number;
						};
					};
					watchEndpoint: {
						videoId: string;
						playlistId: string;
						loggingContext: {
							vssLoggingContext: {
								serializedContextData: string;
							};
						};
						watchEndpointSupportedOnesieConfig: {
							html5PlaybackOnesieConfig: {
								commonConfig: {
									url: string;
								};
							};
						};
					};
				};
				lengthText: TextRenderer;
				videoId: string;
			};
		}[];
		videoCountText: TextRenderer;
		trackingParams: string;
		thumbnailText: TextRenderer;
		longBylineText: TextRenderer;
		ownerBadges?: {
			metadataBadgeRenderer: {
				icon: Icon;
				style: string;
				tooltip: string;
				trackingParams: string;
				accessibilityData: {
					label: string;
				};
			};
		}[];
		thumbnailRenderer: {
			playlistVideoThumbnailRenderer?: {
				thumbnail: {
					thumbnails: {
						url: string;
						width: number;
						height: number;
					}[];
					sampledThumbnailColor: {
						red: number;
						green: number;
						blue: number;
					};
					darkColorPalette: {
						section2Color: number;
						iconInactiveColor: number;
						iconDisabledColor: number;
					};
					vibrantColorPalette: {
						iconInactiveColor: number;
					};
				};
				trackingParams: string;
			};
			playlistCustomThumbnailRenderer?: {
				thumbnail: {
					thumbnails: {
						url: string;
						width: number;
						height: number;
					}[];
					sampledThumbnailColor: {
						red: number;
						green: number;
						blue: number;
					};
					darkColorPalette: {
						section2Color: number;
						iconInactiveColor: number;
						iconDisabledColor: number;
					};
					vibrantColorPalette: {
						iconInactiveColor: number;
					};
				};
			};
		};
		thumbnailOverlays: {
			thumbnailOverlayBottomPanelRenderer?: OverlayRenderer;
			thumbnailOverlayHoverTextRenderer?: OverlayRenderer;
			thumbnailOverlayNowPlayingRenderer?: OverlayRenderer;
		}[];
		publishedTimeText?: TextRenderer;
	};
}
	|
{
	universalWatchCardRenderer: {
		header: {
			watchCardRichHeaderRenderer: {
				title: TextRenderer;
				titleNavigationEndpoint: {
					clickTrackingParams: string;
					commandMetadata: {
						webCommandMetadata: {
							url: string;
							webPageType: string;
							rootVe: number;
							apiUrl: string;
						};
					};
					browseEndpoint: {
						browseId: string;
					};
				};
				subtitle: TextRenderer;
				colorSupportedDatas: {
					basicColorPaletteData: {
						backgroundColor: number;
						foregroundTitleColor: number;
						foregroundBodyColor: number;
					};
				};
				trackingParams: string;
				darkThemeColorSupportedDatas: {
					basicColorPaletteData: {
						backgroundColor: number;
						foregroundTitleColor: number;
						foregroundBodyColor: number;
					};
				};
				style: string;
				avatar?: {
					thumbnails: {
						url: string;
						width: number;
						height: number;
					}[];
					placeholderColor: number;
				};
				titleBadge?: {
					metadataBadgeRenderer: {
						icon: Icon;
						style: string;
						tooltip: string;
						trackingParams: string;
						accessibilityData: {
							label: string;
						};
					};
				};
				callToActionButtons?: {
					buttonRenderer: {
						style: string;
						size: string;
						isDisabled: boolean;
						text: TextRenderer;
						navigationEndpoint: {
							clickTrackingParams: string;
							commandMetadata: {
								webCommandMetadata: {
									url: string;
									webPageType: string;
									rootVe: number;
								};
							};
							signInEndpoint: {
								nextEndpoint: {
									clickTrackingParams: string;
									commandMetadata: {
										webCommandMetadata: {
											url: string;
											webPageType: string;
											rootVe: number;
										};
									};
									searchEndpoint: {
										query: string;
									};
								};
								continueAction: string;
							};
						};
						trackingParams: string;
					};
				}[];
			};
		};
		callToAction: {
			watchCardHeroVideoRenderer: {
				navigationEndpoint: {
					clickTrackingParams: string;
					commandMetadata: {
						webCommandMetadata: {
							url: string;
							webPageType: string;
							rootVe: number;
						};
					};
					watchEndpoint?: {
						videoId: string;
						playlistId: string;
						loggingContext: {
							vssLoggingContext: {
								serializedContextData: string;
							};
						};
						watchEndpointSupportedOnesieConfig: {
							html5PlaybackOnesieConfig: {
								commonConfig: {
									url: string;
								};
							};
						};
						params?: string;
					};
					watchPlaylistEndpoint?: {
						playlistId: string;
					};
				};
				trackingParams: string;
				callToActionButton: {
					callToActionButtonRenderer: {
						label: TextRenderer;
						icon: Icon;
						style: string;
					};
				};
				heroImage: {
					singleHeroImageRenderer?: {
						thumbnail: Thumbnail;
						style: string;
					};
					collageHeroImageRenderer?: {
						leftThumbnail: Thumbnail;
						topRightThumbnail: Thumbnail;
						bottomRightThumbnail: Thumbnail;
					};
				};
				accessibility: Accessibility;
			};
		};
		sections: {
			watchCardSectionSequenceRenderer: {
				lists: {
					verticalWatchCardListRenderer?: {
						items: {
							watchCardCompactVideoRenderer: {
								title: TextRenderer;
								subtitle: TextRenderer;
								lengthText: TextRenderer;
								navigationEndpoint: {
									clickTrackingParams: string;
									commandMetadata: {
										webCommandMetadata: {
											url: string;
											webPageType: string;
											rootVe: number;
										};
									};
									watchEndpoint: {
										videoId: string;
										playlistId?: string;
										playerParams: string;
										loggingContext?: {
											vssLoggingContext: {
												serializedContextData: string;
											};
										};
										watchEndpointSupportedOnesieConfig: {
											html5PlaybackOnesieConfig: {
												commonConfig: {
													url: string;
												};
											};
										};
										params?: string;
									};
								};
								trackingParams: string;
								style: string;
								byline?: TextRenderer;
							};
						}[];
						viewAllEndpoint?: {
							clickTrackingParams: string;
							commandMetadata: {
								webCommandMetadata: {
									url: string;
									webPageType: string;
									rootVe: number;
									apiUrl: string;
								};
							};
							browseEndpoint: {
								browseId: string;
							};
						};
						viewAllText?: TextRenderer;
						trackingParams: string;
					};
					horizontalCardListRenderer?: {
						cards: {
							searchRefinementCardRenderer: {
								thumbnail: Thumbnail;
								query: TextRenderer;
								searchEndpoint: {
									clickTrackingParams: string;
									commandMetadata: {
										webCommandMetadata: {
											url: string;
											webPageType: string;
											rootVe: number;
										};
									};
									watchPlaylistEndpoint: {
										playlistId: string;
									};
								};
								trackingParams: string;
								searchRefinementCardRendererStyle: {
									value: string;
								};
							};
						}[];
						trackingParams: string;
						header: {
							titleAndButtonListHeaderRenderer: {
								title: TextRenderer;
								trackingParams: string;
							};
						};
						previousButton: {
							buttonRenderer: {
								style: string;
								size: string;
								isDisabled: boolean;
								icon: Icon;
								trackingParams: string;
							};
						};
						nextButton: {
							buttonRenderer: {
								style: string;
								size: string;
								isDisabled: boolean;
								icon: Icon;
								trackingParams: string;
							};
						};
					};
				}[];
				trackingParams: string;
				listTitles?: TextRenderer[];
			};
		}[];
		collapsedLabel: TextRenderer;
		trackingParams: string;
	};
};

export type RawBrowseData = {
	error?: {
		code: number;
		message: string;
		errors: {
			message: string;
			domain: string;
			reason: string;
		}[];
		status: string;
	};
	responseContext?: {
		visitorData: string;
		serviceTrackingParams: {
			service: string;
			params: Parameter[];
		}[];
		mainAppWebResponseContext: {
			loggedOut: boolean;
			trackingParam: string;
		};
		webResponseContextExtensionData: {
			hasDecorated: boolean;
		};
	};
	alerts?: {
		alertWithButtonRenderer?: {
			type: string;
			text: TextRenderer;
			dismissButton: {
				buttonRenderer: {
					style: string;
					size: string;
					isDisabled: boolean;
					icon: Icon;
					trackingParams: string;
					accessibilityData: Accessibility;
				};
			};
		};
		alertRenderer?: {
			type: string;
			text: TextRenderer;
		};
	}[];
	trackingParams?: string;
	microformat?: {
		microformatDataRenderer: {
			urlCanonical?: string;
			title?: string;
			description?: string;
			thumbnail?: Thumbnail;
			siteName?: string;
			appName?: string;
			androidPackage?: string;
			iosAppStoreId?: string;
			iosAppArguments?: string;
			ogType?: string;
			urlApplinksWeb?: string;
			urlApplinksIos?: string;
			urlApplinksAndroid?: string;
			urlTwitterIos?: string;
			urlTwitterAndroid?: string;
			twitterCardType?: string;
			twitterSiteHandle?: string;
			schemaDotOrgType?: string;
			noindex: boolean;
			unlisted?: boolean;
			linkAlternates?: {
				hrefUrl: string;
			}[];
		};
	};
	contents?: {
		twoColumnBrowseResultsRenderer: {
			tabs: {
				tabRenderer: {
					selected: boolean;
					content: {
						sectionListRenderer: {
							contents: {
								itemSectionRenderer: {
									contents: {
										playlistVideoListRenderer: {
											contents: {
												playlistVideoRenderer?: {
													videoId: string;
													thumbnail: Thumbnail;
													title: TextRenderer;
													index: TextRenderer;
													shortBylineText: TextRenderer;
													lengthText: TextRenderer;
													navigationEndpoint: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																url: string;
																webPageType: string;
																rootVe: number;
															};
														};
														watchEndpoint: {
															videoId: string;
															playlistId: string;
															index: number;
															params: string;
															playerParams: string;
															loggingContext: {
																vssLoggingContext: {
																	serializedContextData: string;
																};
															};
															watchEndpointSupportedOnesieConfig: {
																html5PlaybackOnesieConfig: {
																	commonConfig: {
																		url: string;
																	};
																};
															};
														};
													};
													lengthSeconds: string;
													trackingParams: string;
													isPlayable: boolean;
													menu: {
														menuRenderer: {
															items: {
																menuServiceItemRenderer: {
																	text: TextRenderer;
																	icon: Icon;
																	serviceEndpoint: {
																		clickTrackingParams: string;
																		commandMetadata: {
																			webCommandMetadata: {
																				sendPost: boolean;
																				apiUrl?: string;
																			};
																		};
																		signalServiceEndpoint?: {
																			signal: string;
																			actions: {
																				clickTrackingParams: string;
																				addToPlaylistCommand: {
																					openMiniplayer: boolean;
																					videoId: string;
																					listType: string;
																					onCreateListCommand: NavigationEndpoint;
																					videoIds: string[];
																				};
																			}[];
																		};
																		shareEntityServiceEndpoint?: {
																			serializedShareEntity: string;
																			commands: {
																				clickTrackingParams: string;
																				openPopupAction: {
																					popup: {
																						unifiedSharePanelRenderer: {
																							trackingParams: string;
																							showLoadingSpinner: boolean;
																						};
																					};
																					popupType: string;
																					beReused: boolean;
																				};
																			}[];
																		};
																	};
																	trackingParams: string;
																	hasSeparator?: boolean;
																};
															}[];
															trackingParams: string;
															accessibility: Accessibility;
														};
													};
													thumbnailOverlays: {
														thumbnailOverlayTimeStatusRenderer?: OverlayRenderer;
														thumbnailOverlayNowPlayingRenderer?: OverlayRenderer;
													}[];
													videoInfo: TextRenderer;
												};
												continuationItemRenderer?: {
													trigger: string;
													continuationEndpoint: NavigationEndpoint;
												};
											}[];
											playlistId: string;
											isEditable: boolean;
											canReorder: boolean;
											trackingParams: string;
											targetId: string;
										};
									}[];
									trackingParams: string;
								};
							}[];
							trackingParams: string;
						};
					};
					trackingParams: string;
				};
			}[];
		};
	};
	header?: {
		playlistHeaderRenderer?: {
			playlistId: string;
			title: TextRenderer;
			numVideosText: TextRenderer;
			descriptionText?: TextRenderer;
			ownerText?: TextRenderer;
			viewCountText: TextRenderer;
			shareData: {
				canShare: boolean;
			};
			isEditable: boolean;
			privacy: string;
			ownerEndpoint?: {
				clickTrackingParams: string;
				commandMetadata: {
					webCommandMetadata: {
						url: string;
						webPageType: string;
						rootVe: number;
						apiUrl: string;
					};
				};
				browseEndpoint: {
					browseId: string;
					canonicalBaseUrl?: string;
				};
			};
			editableDetails: {
				canDelete: boolean;
			};
			trackingParams: string;
			serviceEndpoints: NavigationEndpoint[];
			stats: TextRenderer[];
			briefStats: TextRenderer[];
			playlistHeaderBanner: {
				heroPlaylistThumbnailRenderer: {
					thumbnail: Thumbnail;
					maxRatio: number;
					trackingParams: string;
					onTap: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								url: string;
								webPageType: string;
								rootVe: number;
							};
						};
						watchEndpoint: {
							videoId: string;
							playlistId: string;
							playerParams: string;
							loggingContext: {
								vssLoggingContext: {
									serializedContextData: string;
								};
							};
							watchEndpointSupportedOnesieConfig: {
								html5PlaybackOnesieConfig: {
									commonConfig: {
										url: string;
									};
								};
							};
						};
					};
					thumbnailOverlays: {
						thumbnailOverlayHoverTextRenderer: OverlayRenderer;
					};
				};
			};
			saveButton: {
				toggleButtonRenderer: {
					style: {
						styleType: string;
					};
					size: {
						sizeType: string;
					};
					isToggled: boolean;
					isDisabled: boolean;
					defaultIcon: Icon;
					toggledIcon: Icon;
					trackingParams: string;
					defaultTooltip: string;
					toggledTooltip: string;
					toggledStyle: {
						styleType: string;
					};
					defaultNavigationEndpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								ignoreNavigation: boolean;
							};
						};
						modalEndpoint: {
							modal: {
								modalWithTitleAndButtonRenderer: {
									title: TextRenderer;
									content: TextRenderer;
									button: {
										buttonRenderer: {
											style: string;
											size: string;
											isDisabled: boolean;
											text: TextRenderer;
											navigationEndpoint: {
												clickTrackingParams: string;
												commandMetadata: {
													webCommandMetadata: {
														url: string;
														webPageType: string;
														rootVe: number;
													};
												};
												signInEndpoint: {
													nextEndpoint: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																url: string;
																webPageType: string;
																rootVe: number;
																apiUrl: string;
															};
														};
														browseEndpoint: {
															browseId: string;
														};
													};
													idamTag: string;
												};
											};
											trackingParams: string;
										};
									};
								};
							};
						};
					};
					accessibilityData: Accessibility;
					toggledAccessibilityData: Accessibility;
				};
			};
			shareButton: {
				buttonRenderer: {
					style: string;
					size: string;
					isDisabled: boolean;
					serviceEndpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								sendPost: boolean;
								apiUrl: string;
							};
						};
						shareEntityServiceEndpoint: {
							serializedShareEntity: string;
							commands: {
								clickTrackingParams: string;
								openPopupAction: {
									popup: {
										unifiedSharePanelRenderer: {
											trackingParams: string;
											showLoadingSpinner: boolean;
										};
									};
									popupType: string;
									beReused: boolean;
								};
							}[];
						};
					};
					icon: Icon;
					tooltip: string;
					trackingParams: string;
					accessibilityData: Accessibility;
				};
			};
			moreActionsMenu: {
				menuRenderer: {
					items?: {
						menuNavigationItemRenderer: {
							text: TextRenderer;
							icon: Icon;
							navigationEndpoint: {
								clickTrackingParams: string;
								commandMetadata: {
									webCommandMetadata: {
										url: string;
										webPageType: string;
										rootVe: number;
										apiUrl: string;
									};
								};
								browseEndpoint: {
									browseId: string;
									params: string;
									nofollow: boolean;
									navigationType: string;
								};
							};
							trackingParams: string;
						};
					}[];
					trackingParams: string;
					accessibility: Accessibility;
					targetId?: string;
				};
			};
			playButton: {
				buttonRenderer: {
					style: string;
					size: string;
					isDisabled: boolean;
					text: TextRenderer;
					icon: Icon;
					navigationEndpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								url: string;
								webPageType: string;
								rootVe: number;
							};
						};
						watchEndpoint: {
							videoId: string;
							playlistId: string;
							playerParams: string;
							loggingContext: {
								vssLoggingContext: {
									serializedContextData: string;
								};
							};
							watchEndpointSupportedOnesieConfig: {
								html5PlaybackOnesieConfig: {
									commonConfig: {
										url: string;
									};
								};
							};
						};
					};
					trackingParams: string;
				};
			};
			shufflePlayButton: {
				buttonRenderer: {
					style: string;
					size: string;
					isDisabled: boolean;
					text: TextRenderer;
					icon: Icon;
					navigationEndpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								url: string;
								webPageType: string;
								rootVe: number;
							};
						};
						watchEndpoint: {
							videoId: string;
							playlistId: string;
							params: string;
							playerParams: string;
							loggingContext: {
								vssLoggingContext: {
									serializedContextData: string;
								};
							};
							watchEndpointSupportedOnesieConfig: {
								html5PlaybackOnesieConfig: {
									commonConfig: {
										url: string;
									};
								};
							};
						};
					};
					trackingParams: string;
				};
			};
			onDescriptionTap?: {
				clickTrackingParams: string;
				openPopupAction: {
					popup: {
						fancyDismissibleDialogRenderer: {
							dialogMessage: {};
							title: TextRenderer;
							confirmLabel: TextRenderer;
							trackingParams: string;
						};
					};
					popupType: string;
				};
			};
			cinematicContainer: {
				cinematicContainerRenderer: {
					backgroundImageConfig: {
						thumbnail: Thumbnail;
					};
					gradientColorConfig: {
						lightThemeColor: number;
						darkThemeColor: number;
						startLocation: number;
					}[];
					config: {
						lightThemeBackgroundColor: number;
						darkThemeBackgroundColor: number;
						colorSourceSizeMultiplier: number;
						applyClientImageBlur: boolean;
					};
				};
			};
			byline: {
				playlistBylineRenderer: OverlayRenderer;
			}[];
			descriptionTapText?: TextRenderer;
			subtitle?: TextRenderer;
		};
	};
	metadata?: {
		playlistMetadataRenderer: {
			title: string;
			androidAppindexingLink: string;
			iosAppindexingLink: string;
		};
	};
	topbar?: {
		desktopTopbarRenderer: {
			logo: {
				topbarLogoRenderer: {
					iconImage: Icon;
					tooltipText: TextRenderer;
					endpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								url: string;
								webPageType: string;
								rootVe: number;
								apiUrl: string;
							};
						};
						browseEndpoint: {
							browseId: string;
						};
					};
					trackingParams: string;
					overrideEntityKey: string;
				};
			};
			searchbox: {
				fusionSearchboxRenderer: {
					icon: Icon;
					placeholderText: TextRenderer;
					config: {
						webSearchboxConfig: {
							requestLanguage: string;
							requestDomain: string;
							hasOnscreenKeyboard: boolean;
							focusSearchbox: boolean;
						};
					};
					trackingParams: string;
					searchEndpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								url: string;
								webPageType: string;
								rootVe: number;
							};
						};
						searchEndpoint: {
							query: string;
						};
					};
					clearButton: {
						buttonRenderer: {
							style: string;
							size: string;
							isDisabled: boolean;
							icon: Icon;
							trackingParams: string;
							accessibilityData: Accessibility;
						};
					};
				};
			};
			trackingParams: string;
			topbarButtons: {
				topbarMenuButtonRenderer?: {
					icon: Icon;
					menuRequest: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								sendPost: boolean;
								apiUrl: string;
							};
						};
						signalServiceEndpoint: {
							signal: string;
							actions: {
								clickTrackingParams: string;
								openPopupAction: {
									popup: {
										multiPageMenuRenderer: {
											trackingParams: string;
											style: string;
											showLoadingSpinner: boolean;
										};
									};
									popupType: string;
									beReused: boolean;
								};
							}[];
						};
					};
					trackingParams: string;
					accessibility: Accessibility;
					tooltip: string;
					style: string;
				};
				buttonRenderer?: {
					style: string;
					size: string;
					text: TextRenderer;
					icon: Icon;
					navigationEndpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								url: string;
								webPageType: string;
								rootVe: number;
							};
						};
						signInEndpoint: {
							idamTag: string;
						};
					};
					trackingParams: string;
					targetId: string;
				};
			}[];
			hotkeyDialog: {
				hotkeyDialogRenderer: {
					title: TextRenderer;
					sections: {
						hotkeyDialogSectionRenderer: {
							title: TextRenderer;
							options: {
								hotkeyDialogSectionOptionRenderer: {
									label: TextRenderer;
									hotkey: string;
									hotkeyAccessibilityLabel?: Accessibility;
								};
							}[];
						};
					}[];
					dismissButton: {
						buttonRenderer: {
							style: string;
							size: string;
							isDisabled: boolean;
							text: TextRenderer;
							trackingParams: string;
						};
					};
					trackingParams: string;
				};
			};
			backButton: {
				buttonRenderer: {
					trackingParams: string;
					command: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								sendPost: boolean;
							};
						};
						signalServiceEndpoint: {
							signal: string;
							actions: {
								clickTrackingParams: string;
								signalAction: {
									signal: string;
								};
							}[];
						};
					};
				};
			};
			forwardButton: {
				buttonRenderer: {
					trackingParams: string;
					command: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								sendPost: boolean;
							};
						};
						signalServiceEndpoint: {
							signal: string;
							actions: {
								clickTrackingParams: string;
								signalAction: {
									signal: string;
								};
							}[];
						};
					};
				};
			};
			a11ySkipNavigationButton: {
				buttonRenderer: {
					style: string;
					size: string;
					isDisabled: boolean;
					text: TextRenderer;
					trackingParams: string;
					command: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								sendPost: boolean;
							};
						};
						signalServiceEndpoint: {
							signal: string;
							actions: {
								clickTrackingParams: string;
								signalAction: {
									signal: string;
								};
							}[];
						};
					};
				};
			};
			voiceSearchButton: {
				buttonRenderer: {
					style: string;
					size: string;
					isDisabled: boolean;
					serviceEndpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								sendPost: boolean;
							};
						};
						signalServiceEndpoint: {
							signal: string;
							actions: {
								clickTrackingParams: string;
								openPopupAction: {
									popup: {
										voiceSearchDialogRenderer: {
											placeholderHeader: TextRenderer;
											promptHeader: TextRenderer;
											exampleQuery1: TextRenderer;
											exampleQuery2: TextRenderer;
											promptMicrophoneLabel: TextRenderer;
											loadingHeader: TextRenderer;
											connectionErrorHeader: TextRenderer;
											connectionErrorMicrophoneLabel: TextRenderer;
											permissionsHeader: TextRenderer;
											permissionsSubtext: TextRenderer;
											disabledHeader: TextRenderer;
											disabledSubtext: TextRenderer;
											microphoneButtonAriaLabel: TextRenderer;
											exitButton: {
												buttonRenderer: {
													style: string;
													size: string;
													isDisabled: boolean;
													icon: Icon;
													trackingParams: string;
													accessibilityData: Accessibility;
												};
											};
											trackingParams: string;
											microphoneOffPromptHeader: TextRenderer;
										};
									};
									popupType: string;
								};
							}[];
						};
					};
					icon: Icon;
					tooltip: string;
					trackingParams: string;
					accessibilityData: Accessibility;
				};
			};
		};
	};
	sidebar?: {
		playlistSidebarRenderer: {
			items: {
				playlistSidebarPrimaryInfoRenderer?: {
					thumbnailRenderer: {
						playlistVideoThumbnailRenderer?: {
							thumbnail: Thumbnail;
							trackingParams: string;
						};
						playlistCustomThumbnailRenderer?: {
							thumbnail: Thumbnail;
						};
					};
					title: TextRenderer;
					stats: TextRenderer[];
					menu: {
						menuRenderer: {
							items: {
								menuNavigationItemRenderer: {
									text: TextRenderer;
									icon: Icon;
									navigationEndpoint: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												ignoreNavigation?: boolean;
												url?: string;
												webPageType?: string;
												rootVe?: number;
												apiUrl?: string;
											};
										};
										modalEndpoint?: {
											modal: {
												modalWithTitleAndButtonRenderer: {
													title: TextRenderer;
													content: TextRenderer;
													button: {
														buttonRenderer: {
															style: string;
															size: string;
															isDisabled: boolean;
															text: TextRenderer;
															navigationEndpoint: {
																clickTrackingParams: string;
																commandMetadata: {
																	webCommandMetadata: {
																		url: string;
																		webPageType: string;
																		rootVe: number;
																	};
																};
																signInEndpoint: {
																	nextEndpoint: {
																		clickTrackingParams: string;
																		commandMetadata: {
																			webCommandMetadata: {
																				url: string;
																				webPageType: string;
																				rootVe: number;
																				apiUrl: string;
																			};
																		};
																		browseEndpoint: {
																			browseId: string;
																		};
																	};
																};
															};
															trackingParams: string;
														};
													};
												};
											};
										};
										browseEndpoint?: {
											browseId: string;
											params: string;
											nofollow: boolean;
											navigationType: string;
										};
									};
									trackingParams: string;
								};
							}[];
							trackingParams: string;
							topLevelButtons: {
								toggleButtonRenderer?: {
									style: {
										styleType: string;
									};
									size: {
										sizeType: string;
									};
									isToggled: boolean;
									isDisabled: boolean;
									defaultIcon: Icon;
									toggledIcon: Icon;
									trackingParams: string;
									defaultTooltip: string;
									toggledTooltip: string;
									defaultNavigationEndpoint: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												ignoreNavigation: boolean;
											};
										};
										modalEndpoint: {
											modal: {
												modalWithTitleAndButtonRenderer: {
													title: TextRenderer;
													content: TextRenderer;
													button: {
														buttonRenderer: {
															style: string;
															size: string;
															isDisabled: boolean;
															text: TextRenderer;
															navigationEndpoint: {
																clickTrackingParams: string;
																commandMetadata: {
																	webCommandMetadata: {
																		url: string;
																		webPageType: string;
																		rootVe: number;
																	};
																};
																signInEndpoint: {
																	nextEndpoint: {
																		clickTrackingParams: string;
																		commandMetadata: {
																			webCommandMetadata: {
																				url: string;
																				webPageType: string;
																				rootVe: number;
																				apiUrl: string;
																			};
																		};
																		browseEndpoint: {
																			browseId: string;
																		};
																	};
																	idamTag: string;
																};
															};
															trackingParams: string;
														};
													};
												};
											};
										};
									};
									accessibilityData: Accessibility;
									toggledAccessibilityData: Accessibility;
								};
								buttonRenderer?: {
									style: string;
									size: string;
									isDisabled: boolean;
									serviceEndpoint?: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												sendPost: boolean;
												apiUrl: string;
											};
										};
										shareEntityServiceEndpoint: {
											serializedShareEntity: string;
											commands: {
												clickTrackingParams: string;
												openPopupAction: {
													popup: {
														unifiedSharePanelRenderer: {
															trackingParams: string;
															showLoadingSpinner: boolean;
														};
													};
													popupType: string;
													beReused: boolean;
												};
											}[];
										};
									};
									icon: Icon;
									accessibility: {
										label: string;
									};
									tooltip: string;
									trackingParams: string;
									navigationEndpoint?: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												url: string;
												webPageType: string;
												rootVe: number;
											};
										};
										watchEndpoint: {
											videoId: string;
											playlistId: string;
											params: string;
											playerParams: string;
											loggingContext: {
												vssLoggingContext: {
													serializedContextData: string;
												};
											};
											watchEndpointSupportedOnesieConfig: {
												html5PlaybackOnesieConfig: {
													commonConfig: {
														url: string;
													};
												};
											};
										};
									};
								};
							}[];
							accessibility: Accessibility;
							targetId?: string;
						};
					};
					thumbnailOverlays: {
						thumbnailOverlaySidePanelRenderer: OverlayRenderer;
					}[];
					navigationEndpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								url: string;
								webPageType: string;
								rootVe: number;
							};
						};
						watchEndpoint: {
							videoId: string;
							playlistId: string;
							playerParams: string;
							loggingContext: {
								vssLoggingContext: {
									serializedContextData: string;
								};
							};
							watchEndpointSupportedOnesieConfig: {
								html5PlaybackOnesieConfig: {
									commonConfig: {
										url: string;
									};
								};
							};
						};
					};
					badges?: {
						metadataBadgeRenderer: {
							icon: Icon;
							style: string;
							label: string;
							trackingParams: string;
						};
					}[];
					description?: {};
					showMoreText: TextRenderer;
				};
				playlistSidebarSecondaryInfoRenderer?: {
					videoOwner: {
						videoOwnerRenderer: {
							thumbnail: Thumbnail;
							title: TextRenderer;
							navigationEndpoint: {
								clickTrackingParams: string;
								commandMetadata: {
									webCommandMetadata: {
										url: string;
										webPageType: string;
										rootVe: number;
										apiUrl: string;
									};
								};
								browseEndpoint: {
									browseId: string;
									canonicalBaseUrl?: string;
								};
							};
							trackingParams: string;
						};
					};
					button: {
						buttonRenderer: {
							style: string;
							size: string;
							isDisabled: boolean;
							text: TextRenderer;
							navigationEndpoint: {
								clickTrackingParams: string;
								commandMetadata: {
									webCommandMetadata: {
										ignoreNavigation: boolean;
									};
								};
								modalEndpoint: {
									modal: {
										modalWithTitleAndButtonRenderer: {
											title: TextRenderer;
											content: TextRenderer;
											button: {
												buttonRenderer: {
													style: string;
													size: string;
													isDisabled: boolean;
													text: TextRenderer;
													navigationEndpoint: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																url: string;
																webPageType: string;
																rootVe: number;
															};
														};
														signInEndpoint: {
															nextEndpoint: {
																clickTrackingParams: string;
																commandMetadata: {
																	webCommandMetadata: {
																		url: string;
																		webPageType: string;
																		rootVe: number;
																		apiUrl: string;
																	};
																};
																browseEndpoint: {
																	browseId: string;
																};
															};
															continueAction: string;
															idamTag: string;
														};
													};
													trackingParams: string;
												};
											};
										};
									};
								};
							};
							trackingParams: string;
						};
					};
				};
			}[];
			trackingParams: string;
		};
	};
};

export type RawBrowseContinuationData = {
	responseContext: {
		visitorData: string;
		serviceTrackingParams: {
			service: string;
			params: Parameter[];
		}[];
		mainAppWebResponseContext: {
			loggedOut: boolean;
			trackingParam: string;
		};
		webResponseContextExtensionData: {
			hasDecorated: boolean;
		};
	};
	contents: {
		twoColumnBrowseResultsRenderer: {
			tabs: {
				tabRenderer: {
					selected: boolean;
					trackingParams: string;
				};
			}[];
		};
	};
	alerts: {
		alertWithButtonRenderer: {
			type: string;
			text: TextRenderer;
			dismissButton: {
				buttonRenderer: {
					style: string;
					size: string;
					isDisabled: boolean;
					icon: Icon;
					trackingParams: string;
					accessibilityData: Accessibility;
				};
			};
		};
	}[];
	metadata: {
		playlistMetadataRenderer: {
			title: string;
			androidAppindexingLink: string;
			iosAppindexingLink: string;
		};
	};
	trackingParams: string;
	microformat: {
		microformatDataRenderer: {
			urlCanonical: string;
			title: string;
			description: string;
			thumbnail: Thumbnail;
			siteName: string;
			appName: string;
			androidPackage: string;
			iosAppStoreId: string;
			iosAppArguments: string;
			ogType: string;
			urlApplinksWeb: string;
			urlApplinksIos: string;
			urlApplinksAndroid: string;
			urlTwitterIos: string;
			urlTwitterAndroid: string;
			twitterCardType: string;
			twitterSiteHandle: string;
			schemaDotOrgType: string;
			noindex: boolean;
			unlisted: boolean;
			linkAlternates: {
				hrefUrl: string;
			}[];
		};
	};
	onResponseReceivedActions: {
		clickTrackingParams: string;
		appendContinuationItemsAction: {
			continuationItems: {
				playlistVideoRenderer?: {
					videoId: string;
					thumbnail: Thumbnail;
					title: TextRenderer;
					index: TextRenderer;
					shortBylineText: TextRenderer;
					lengthText: TextRenderer;
					navigationEndpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								url: string;
								webPageType: string;
								rootVe: number;
							};
						};
						watchEndpoint: {
							videoId: string;
							playlistId: string;
							index: number;
							params: string;
							playerParams: string;
							loggingContext: {
								vssLoggingContext: {
									serializedContextData: string;
								};
							};
							watchEndpointSupportedOnesieConfig: {
								html5PlaybackOnesieConfig: {
									commonConfig: {
										url: string;
									};
								};
							};
						};
					};
					lengthSeconds: string;
					trackingParams: string;
					isPlayable: boolean;
					menu: {
						menuRenderer: {
							items: {
								menuServiceItemRenderer: {
									text: TextRenderer;
									icon: Icon;
									serviceEndpoint: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												sendPost: boolean;
												apiUrl?: string;
											};
										};
										signalServiceEndpoint?: {
											signal: string;
											actions: {
												clickTrackingParams: string;
												addToPlaylistCommand: {
													openMiniplayer: boolean;
													videoId: string;
													listType: string;
													onCreateListCommand: NavigationEndpoint;
													videoIds: string[];
												};
											}[];
										};
										shareEntityServiceEndpoint?: {
											serializedShareEntity: string;
											commands: {
												clickTrackingParams: string;
												openPopupAction: {
													popup: {
														unifiedSharePanelRenderer: {
															trackingParams: string;
															showLoadingSpinner: boolean;
														};
													};
													popupType: string;
													beReused: boolean;
												};
											}[];
										};
									};
									trackingParams: string;
									hasSeparator?: boolean;
								};
							}[];
							trackingParams: string;
							accessibility: Accessibility;
						};
					};
					thumbnailOverlays: {
						thumbnailOverlayTimeStatusRenderer?: OverlayRenderer;
						thumbnailOverlayNowPlayingRenderer?: OverlayRenderer;
					}[];
					videoInfo: TextRenderer;
				};
				continuationItemRenderer?: {
					trigger: string;
					continuationEndpoint: NavigationEndpoint;
				};
			}[];
			targetId: string;
		};
	}[];
	sidebar: {
		playlistSidebarRenderer: {
			items: {
				playlistSidebarPrimaryInfoRenderer?: {
					thumbnailRenderer: {
						playlistVideoThumbnailRenderer: {
							thumbnail: Thumbnail;
							trackingParams: string;
						};
					};
					title: TextRenderer;
					stats: TextRenderer[];
					menu: {
						menuRenderer: {
							items: {
								menuNavigationItemRenderer: {
									text: TextRenderer;
									icon: Icon;
									navigationEndpoint: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												url?: string;
												webPageType?: string;
												rootVe?: number;
												apiUrl?: string;
												ignoreNavigation?: boolean;
											};
										};
										browseEndpoint?: {
											browseId: string;
											params: string;
											nofollow: boolean;
											navigationType: string;
										};
										modalEndpoint?: {
											modal: {
												modalWithTitleAndButtonRenderer: {
													title: TextRenderer;
													content: TextRenderer;
													button: {
														buttonRenderer: {
															style: string;
															size: string;
															isDisabled: boolean;
															text: TextRenderer;
															navigationEndpoint: {
																clickTrackingParams: string;
																commandMetadata: {
																	webCommandMetadata: {
																		url: string;
																		webPageType: string;
																		rootVe: number;
																	};
																};
																signInEndpoint: {
																	nextEndpoint: {
																		clickTrackingParams: string;
																		commandMetadata: {
																			webCommandMetadata: {
																				url: string;
																				webPageType: string;
																				rootVe: number;
																				apiUrl: string;
																			};
																		};
																		browseEndpoint: {
																			browseId: string;
																		};
																	};
																};
															};
															trackingParams: string;
														};
													};
												};
											};
										};
									};
									trackingParams: string;
								};
							}[];
							trackingParams: string;
							topLevelButtons: {
								toggleButtonRenderer?: {
									style: {
										styleType: string;
									};
									size: {
										sizeType: string;
									};
									isToggled: boolean;
									isDisabled: boolean;
									defaultIcon: Icon;
									toggledIcon: Icon;
									trackingParams: string;
									defaultTooltip: string;
									toggledTooltip: string;
									defaultNavigationEndpoint: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												ignoreNavigation: boolean;
											};
										};
										modalEndpoint: {
											modal: {
												modalWithTitleAndButtonRenderer: {
													title: TextRenderer;
													content: TextRenderer;
													button: {
														buttonRenderer: {
															style: string;
															size: string;
															isDisabled: boolean;
															text: TextRenderer;
															navigationEndpoint: {
																clickTrackingParams: string;
																commandMetadata: {
																	webCommandMetadata: {
																		url: string;
																		webPageType: string;
																		rootVe: number;
																	};
																};
																signInEndpoint: {
																	nextEndpoint: {
																		clickTrackingParams: string;
																		commandMetadata: {
																			webCommandMetadata: {
																				url: string;
																				webPageType: string;
																				rootVe: number;
																				apiUrl: string;
																			};
																		};
																		browseEndpoint: {
																			browseId: string;
																		};
																	};
																	idamTag: string;
																};
															};
															trackingParams: string;
														};
													};
												};
											};
										};
									};
									accessibilityData: Accessibility;
									toggledAccessibilityData: Accessibility;
								};
								buttonRenderer?: {
									style: string;
									size: string;
									isDisabled: boolean;
									serviceEndpoint?: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												sendPost: boolean;
												apiUrl: string;
											};
										};
										shareEntityServiceEndpoint: {
											serializedShareEntity: string;
											commands: {
												clickTrackingParams: string;
												openPopupAction: {
													popup: {
														unifiedSharePanelRenderer: {
															trackingParams: string;
															showLoadingSpinner: boolean;
														};
													};
													popupType: string;
													beReused: boolean;
												};
											}[];
										};
									};
									icon: Icon;
									accessibility: {
										label: string;
									};
									tooltip: string;
									trackingParams: string;
									navigationEndpoint?: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												url: string;
												webPageType: string;
												rootVe: number;
											};
										};
										watchEndpoint: {
											videoId: string;
											playlistId: string;
											params: string;
											playerParams: string;
											loggingContext: {
												vssLoggingContext: {
													serializedContextData: string;
												};
											};
											watchEndpointSupportedOnesieConfig: {
												html5PlaybackOnesieConfig: {
													commonConfig: {
														url: string;
													};
												};
											};
										};
									};
								};
							}[];
							accessibility: Accessibility;
							targetId: string;
						};
					};
					thumbnailOverlays: {
						thumbnailOverlaySidePanelRenderer: OverlayRenderer;
					}[];
					navigationEndpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								url: string;
								webPageType: string;
								rootVe: number;
							};
						};
						watchEndpoint: {
							videoId: string;
							playlistId: string;
							playerParams: string;
							loggingContext: {
								vssLoggingContext: {
									serializedContextData: string;
								};
							};
							watchEndpointSupportedOnesieConfig: {
								html5PlaybackOnesieConfig: {
									commonConfig: {
										url: string;
									};
								};
							};
						};
					};
					badges: {
						metadataBadgeRenderer: {
							icon: Icon;
							style: string;
							label: string;
							trackingParams: string;
						};
					}[];
					description: {};
					showMoreText: TextRenderer;
				};
				playlistSidebarSecondaryInfoRenderer?: {
					videoOwner: {
						videoOwnerRenderer: {
							thumbnail: Thumbnail;
							title: TextRenderer;
							navigationEndpoint: {
								clickTrackingParams: string;
								commandMetadata: {
									webCommandMetadata: {
										url: string;
										webPageType: string;
										rootVe: number;
										apiUrl: string;
									};
								};
								browseEndpoint: {
									browseId: string;
									canonicalBaseUrl: string;
								};
							};
							trackingParams: string;
						};
					};
					button: {
						buttonRenderer: {
							style: string;
							size: string;
							isDisabled: boolean;
							text: TextRenderer;
							navigationEndpoint: {
								clickTrackingParams: string;
								commandMetadata: {
									webCommandMetadata: {
										ignoreNavigation: boolean;
									};
								};
								modalEndpoint: {
									modal: {
										modalWithTitleAndButtonRenderer: {
											title: TextRenderer;
											content: TextRenderer;
											button: {
												buttonRenderer: {
													style: string;
													size: string;
													isDisabled: boolean;
													text: TextRenderer;
													navigationEndpoint: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																url: string;
																webPageType: string;
																rootVe: number;
															};
														};
														signInEndpoint: {
															nextEndpoint: {
																clickTrackingParams: string;
																commandMetadata: {
																	webCommandMetadata: {
																		url: string;
																		webPageType: string;
																		rootVe: number;
																		apiUrl: string;
																	};
																};
																browseEndpoint: {
																	browseId: string;
																};
															};
															continueAction: string;
															idamTag: string;
														};
													};
													trackingParams: string;
												};
											};
										};
									};
								};
							};
							trackingParams: string;
						};
					};
				};
			}[];
			trackingParams: string;
		};
	};
};

export type RawPlaylistItemData = {
	videoId: string;
	thumbnail: Thumbnail;
	title: TextRenderer;
	index: TextRenderer;
	shortBylineText: TextRenderer;
	lengthText: TextRenderer;
	navigationEndpoint: NavigationEndpoint;
	lengthSeconds: string;
	trackingParams: string;
	isPlayable: boolean;
	menu: {
		menuRenderer: {
			items: {
				menuServiceItemRenderer: {
					text: TextRenderer;
					icon: Icon;
					serviceEndpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								sendPost: boolean;
								apiUrl?: string;
							};
						};
						signalServiceEndpoint?: {
							signal: string;
							actions: {
								clickTrackingParams: string;
								addToPlaylistCommand: {
									openMiniplayer: boolean;
									videoId: string;
									listType: string;
									onCreateListCommand: NavigationEndpoint;
									videoIds: string[];
								};
							}[];
						};
						shareEntityServiceEndpoint?: {
							serializedShareEntity: string;
							commands: {
								clickTrackingParams: string;
								openPopupAction: {
									popup: {
										unifiedSharePanelRenderer: {
											trackingParams: string;
											showLoadingSpinner: boolean;
										};
									};
									popupType: string;
									beReused: boolean;
								};
							}[];
						};
					};
					trackingParams: string;
					hasSeparator?: boolean;
				};
			}[];
			trackingParams: string;
			accessibility: Accessibility;
		};
	};
	thumbnailOverlays: {
		thumbnailOverlayTimeStatusRenderer?: OverlayRenderer;
		thumbnailOverlayNowPlayingRenderer?: OverlayRenderer;
	}[];
	videoInfo: TextRenderer;
};

export {
	StereoLayout,
	ProjectionType,
	VideoQuality,
	ColorTransferCharacteristics,
	ColorPrimaries,
	StreamType,
	Range,
	AudioTrack,
	ColorInfo,
	Format,
	VideoFormat,
	AudioFormat,
	Thumbnail,
	NavigationEndpoint,
	Accessibility,
	TextRenderer
}