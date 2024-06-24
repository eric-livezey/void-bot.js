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

export type RawPlayerData = {
	responseContext: {
		visitorData: string;
		serviceTrackingParams: {
			service: string;
			params: {
				key: string;
				value: string;
			}[];
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
		status: string;
		playableInEmbed?: boolean;
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
		contextParams: string;
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
		reason?: string;
		errorScreen?: {
			playerErrorMessageRenderer: {
				subreason?: {
					runs?: {
						text: string;
						navigationEndpoint?: {
							clickTrackingParams: string;
							signInEndpoint: {
								nextEndpoint: {
									clickTrackingParams: string;
									urlEndpoint: {
										url: string;
									};
								};
							};
							commandMetadata?: {
								webCommandMetadata: {
									url: string;
									webPageType: string;
									rootVe: number;
								};
							};
						};
					}[];
					simpleText?: string;
				};
				icon?: {
					iconType: string;
				};
				reason?: {
					runs?: {
						text: string;
						navigationEndpoint?: {
							clickTrackingParams: string;
							urlEndpoint: {
								url: string;
								target: string;
							};
						};
					}[];
					simpleText?: string;
				};
				thumbnail?: {
					thumbnails: {
						url: string;
						width: number;
						height: number;
					}[];
				};
				proceedButton?: {
					buttonRenderer: {
						style: string;
						size?: string;
						isDisabled: boolean;
						text: {
							simpleText: string;
						};
						navigationEndpoint: {
							clickTrackingParams: string;
							commandMetadata?: {
								webCommandMetadata: {
									url: string;
									webPageType: string;
									rootVe: number;
								};
							};
							signInEndpoint?: {
								nextEndpoint: {
									clickTrackingParams: string;
									urlEndpoint: {
										url: string;
									};
								};
							};
							urlEndpoint?: {
								url: string;
								target: string;
							};
						};
						trackingParams: string;
					};
				};
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
		videostatsPlaybackUrl: {
			baseUrl: string;
			headers?: {
				headerType: string;
			}[];
		};
		videostatsDelayplayUrl: {
			baseUrl: string;
			headers?: {
				headerType: string;
			}[];
			elapsedMediaTimeSeconds?: number;
		};
		videostatsWatchtimeUrl: {
			baseUrl: string;
			headers?: {
				headerType: string;
			}[];
		};
		ptrackingUrl: {
			baseUrl: string;
			headers?: {
				headerType: string;
			}[];
		};
		qoeUrl: {
			baseUrl: string;
			headers?: {
				headerType: string;
			}[];
		};
		atrUrl: {
			baseUrl: string;
			elapsedMediaTimeSeconds: number;
			headers?: {
				headerType: string;
			}[];
		};
		videostatsScheduledFlushWalltimeSeconds: number[];
		videostatsDefaultFlushIntervalSeconds: number;
		youtubeRemarketingUrl?: {
			baseUrl: string;
			elapsedMediaTimeSeconds: number;
			headers?: {
				headerType: string;
			}[];
		};
	};
	videoDetails?: {
		videoId: string;
		title: string;
		lengthSeconds: string;
		isLive?: boolean;
		keywords?: string[];
		channelId: string;
		isOwnerViewing: boolean;
		shortDescription?: string;
		isCrawlable: boolean;
		isLiveDvrEnabled?: boolean;
		thumbnail: {
			thumbnails: {
				url: string;
				width: number;
				height: number;
			}[];
		};
		liveChunkReadahead?: number;
		allowRatings: boolean;
		viewCount: string;
		author: string;
		isLowLatencyLiveStream?: boolean;
		isPrivate: boolean;
		isUnpluggedCorpus: boolean;
		latencyClass?: string;
		isLiveContent: boolean;
		musicVideoType?: string;
	};
	annotations?: {
		playerAnnotationsExpandedRenderer: {
			featuredChannel: {
				startTimeMs: string;
				endTimeMs: string;
				watermark: {
					thumbnails: {
						url: string;
						width: number;
						height: number;
					}[];
				};
				trackingParams: string;
				navigationEndpoint: {
					clickTrackingParams: string;
					browseEndpoint: {
						browseId: string;
					};
					commandMetadata?: {
						webCommandMetadata: {
							url: string;
							webPageType: string;
							rootVe: number;
							apiUrl: string;
						};
					};
				};
				channelName: string;
				subscribeButton: {
					subscribeButtonRenderer: {
						buttonText: {
							runs: {
								text: string;
							}[];
						};
						subscribed: boolean;
						enabled: boolean;
						type: string;
						channelId: string;
						showPreferences: boolean;
						subscribedButtonText: {
							runs: {
								text: string;
							}[];
						};
						unsubscribedButtonText: {
							runs: {
								text: string;
							}[];
						};
						trackingParams: string;
						unsubscribeButtonText: {
							runs: {
								text: string;
							}[];
						};
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
												dialogMessages: {
													runs: {
														text: string;
													}[];
												}[];
												confirmButton: {
													buttonRenderer: {
														style: string;
														size?: string;
														isDisabled: boolean;
														text: {
															runs: {
																text: string;
															}[];
														};
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
														text: {
															runs: {
																text: string;
															}[];
														};
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
						subscribeAccessibility?: {
							accessibilityData: {
								label: string;
							};
						};
						unsubscribeAccessibility?: {
							accessibilityData: {
								label: string;
							};
						};
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
			thumbnail: {
				thumbnails: {
					url: string;
					width: number;
					height: number;
				}[];
			};
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
			thumbnail: {
				thumbnails: {
					url: string;
					width: number;
					height: number;
				}[];
			};
			embed: {
				iframeUrl: string;
				width: number;
				height: number;
			};
			title: {
				runs?: {
					text: string;
				}[];
				simpleText?: string;
			};
			description: {
				runs?: {
					text: string;
				}[];
				simpleText?: string;
			};
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
							message: {
								simpleText?: string;
								runs?: {
									text: string;
								}[];
							};
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
							videoThumbnail: {
								thumbnails: {
									url: string;
									width: number;
									height: number;
								}[];
							};
							lengthString: {
								runs: {
									text: string;
								}[];
								accessibility: {
									accessibilityData: {
										label: string;
									};
								};
							};
							videoTitle: {
								runs: {
									text: string;
								}[];
							};
							channelName: {
								runs: {
									text: string;
								}[];
							};
							viewCountText: {
								runs: {
									text: string;
								}[];
							};
							action: {
								clickTrackingParams: string;
								watchEndpoint: {
									videoId: string;
								};
							};
							trackingParams: string;
						};
						playlistInfoCardContentRenderer?: {
							playlistThumbnail: {
								thumbnails: {
									url: string;
									width: number;
									height: number;
								}[];
							};
							playlistVideoCount: {
								runs: {
									text: string;
								}[];
							};
							playlistTitle: {
								runs: {
									text: string;
								}[];
							};
							channelName: {
								runs: {
									text: string;
								}[];
							};
							videoCountText: {
								runs: {
									text: string;
								}[];
							};
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
			headerText: {
				simpleText?: string;
				runs?: {
					text: string;
				}[];
			};
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
			text: {
				runs: {
					text: string;
					bold?: boolean;
				}[];
			};
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
					responseText: {
						runs: {
							text: string;
						}[];
					};
					actionButton: {
						buttonRenderer: {
							text: {
								runs: {
									text: string;
								}[];
							};
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
			icon?: {
				thumbnails: {
					url: string;
					width: number;
					height: number;
				}[];
			};
			messageTexts: {
				runs: {
					text: string;
				}[];
			}[];
			actionButton: {
				buttonRenderer: {
					style?: string;
					size: string;
					text: {
						runs: {
							text: string;
						}[];
					};
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
					navigationEndpoint?: {
						clickTrackingParams: string;
						browseEndpoint: {
							browseId: string;
							params: string;
						};
					};
				};
			};
			dismissButton: {
				buttonRenderer: {
					style?: string;
					size: string;
					text: {
						runs: {
							text: string;
						}[];
					};
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
			messageTitle: {
				runs: {
					text: string;
				}[];
			};
			logo?: {
				thumbnails: {
					url: string;
					width: number;
					height: number;
				}[];
			};
			logoDark?: {
				thumbnails: {
					url: string;
					width: number;
					height: number;
				}[];
			};
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
										thumbnail: {
											thumbnails: {
												url: string;
												width: number;
												height: number;
											}[];
										};
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
												thumbnail: {
													thumbnails: {
														url: string;
														width: number;
														height: number;
													}[];
												};
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
									text: {
										simpleText?: string;
										runs?: {
											text: string;
										}[];
									};
									icon: {
										iconType: string;
									};
									navigationEndpoint: {
										clickTrackingParams: string;
										commandMetadata?: {
											webCommandMetadata: {
												url: string;
												webPageType: string;
												rootVe: number;
											};
										};
										urlEndpoint: {
											url: string;
											target: string;
											attributionSrcMode: string;
										};
									};
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
															dialogMessage: {
																runs: {
																	text: string;
																	navigationEndpoint?: {
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
																}[];
															};
															confirmLabel: {
																runs: {
																	text: string;
																}[];
															};
															trackingParams: string;
															closeOverlayRenderer: {
																buttonRenderer: {
																	style: string;
																	size: string;
																	isDisabled: boolean;
																	icon: {
																		iconType: string;
																	};
																	trackingParams: string;
																};
															};
															title: {
																runs: {
																	text: string;
																}[];
															};
															adReasons: {
																runs: {
																	text: string;
																}[];
															}[];
														};
													};
												};
											};
											icon: {
												iconType: string;
											};
											trackingParams: string;
											accessibilityData: {
												accessibilityData: {
													label: string;
												};
											};
										};
									};
									hoverText?: {
										simpleText?: string;
										runs?: {
											text: string;
										}[];
									};
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
									impressionPings: {
										baseUrl: string;
										attributionSrcMode?: string;
										headers?: {
											headerType: string;
										}[];
									}[];
									errorPings: {
										baseUrl: string;
									}[];
									mutePings: {
										baseUrl: string;
									}[];
									unmutePings: {
										baseUrl: string;
									}[];
									pausePings: {
										baseUrl: string;
									}[];
									rewindPings: {
										baseUrl: string;
									}[];
									resumePings: {
										baseUrl: string;
									}[];
									closePings: {
										baseUrl: string;
									}[];
									fullscreenPings: {
										baseUrl: string;
									}[];
									activeViewViewablePings?: {
										baseUrl: string;
									}[];
									endFullscreenPings: {
										baseUrl: string;
									}[];
									activeViewMeasurablePings?: {
										baseUrl: string;
									}[];
									abandonPings: {
										baseUrl: string;
										attributionSrcMode?: string;
									}[];
									activeViewFullyViewableAudibleHalfDurationPings?: {
										baseUrl: string;
									}[];
									startPings?: {
										baseUrl: string;
									}[];
									firstQuartilePings?: {
										baseUrl: string;
									}[];
									secondQuartilePings?: {
										baseUrl: string;
									}[];
									thirdQuartilePings?: {
										baseUrl: string;
									}[];
									completePings?: {
										baseUrl: string;
										attributionSrcMode?: string;
									}[];
									activeViewTracking?: {
										trafficType: string;
									};
									progressPings?: {
										baseUrl: string;
										offsetMilliseconds: number;
										attributionSrcMode?: string;
									}[];
									skipPings?: {
										baseUrl: string;
										attributionSrcMode?: string;
									}[];
									clickthroughPings?: {
										baseUrl: string;
										attributionSrcMode: string;
									}[];
								};
								clickthroughEndpoint: {
									clickTrackingParams: string;
									commandMetadata?: {
										webCommandMetadata: {
											url: string;
											webPageType: string;
											rootVe: number;
										};
									};
									urlEndpoint: {
										url: string;
										target: string;
										attributionSrcMode: string;
									};
								};
								csiParameters: {
									key: string;
									value: string;
								}[];
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
				name: {
					runs?: {
						text: string;
					}[];
					simpleText?: string;
				};
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
				languageName: {
					runs?: {
						text: string;
					}[];
					simpleText?: string;
				};
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
					image: {
						thumbnails: {
							url: string;
							width: number;
							height: number;
						}[];
					};
					left: number;
					width: number;
					top: number;
					aspectRatio: number;
					startMs: string;
					endMs: string;
					title: {
						runs?: {
							text: string;
						}[];
						accessibility: {
							accessibilityData: {
								label: string;
							};
						};
						simpleText?: string;
					};
					metadata: {
						runs?: {
							text: string;
						}[];
						simpleText?: string;
					};
					endpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							interactionLoggingCommandMetadata: {
								loggingExpectations?: {
									screenCreatedLoggingExpectations: {
										expectedParentScreens: {
											screenVeType: number;
										}[];
									};
								};
							};
							webCommandMetadata?: {
								url: string;
								webPageType: string;
								rootVe: number;
							};
						};
						watchEndpoint: {
							videoId: string;
						};
					};
					trackingParams: string;
					id: string;
					thumbnailOverlays: {
						thumbnailOverlayTimeStatusRenderer: {
							text: {
								runs?: {
									text: string;
								}[];
								accessibility: {
									accessibilityData: {
										label: string;
									};
								};
								simpleText?: string;
							};
							style: string;
						};
					}[];
				};
			}[];
			startMs: string;
			trackingParams: string;
		};
	};
	paidContentOverlay?: {
		paidContentOverlayRenderer: {
			text: {
				runs?: {
					text: string;
				}[];
				simpleText?: string;
			};
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
			icon: {
				iconType: string;
			};
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
			params: {
				key: string;
				value: string;
			}[];
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
																title: {
																	simpleText: string;
																};
																description: {
																	runs: {
																		text: string;
																		navigationEndpoint: {
																			clickTrackingParams: string;
																			loggingUrls: {
																				baseUrl: string;
																			}[];
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
																	}[];
																};
																longBylineText: {
																	runs: {
																		text: string;
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
																	}[];
																};
																shortBylineText: {
																	runs: {
																		text: string;
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
																	}[];
																};
																lengthText: {
																	accessibility: {
																		accessibilityData: {
																			label: string;
																		};
																	};
																	simpleText: string;
																};
																navigationEndpoint: {
																	clickTrackingParams: string;
																	loggingUrls: {
																		baseUrl: string;
																	}[];
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
																		text: {
																			simpleText: string;
																		};
																		icon: {
																			iconType: string;
																		};
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
																	thumbnailOverlayTimeStatusRenderer?: {
																		text: {
																			accessibility: {
																				accessibilityData: {
																					label: string;
																				};
																			};
																			simpleText: string;
																		};
																		style: string;
																	};
																	thumbnailOverlayToggleButtonRenderer?: {
																		isToggled: boolean;
																		untoggledIcon: {
																			iconType: string;
																		};
																		toggledIcon: {
																			iconType: string;
																		};
																		untoggledTooltip: string;
																		toggledTooltip: string;
																		untoggledServiceEndpoint: {
																			clickTrackingParams: string;
																			commandMetadata: {
																				webCommandMetadata: {
																					sendPost: boolean;
																					apiUrl: string;
																				};
																			};
																			playlistEditEndpoint: {
																				playlistId: string;
																				actions: {
																					addedVideoId: string;
																					action: string;
																				}[];
																			};
																		};
																		toggledServiceEndpoint: {
																			clickTrackingParams: string;
																			commandMetadata: {
																				webCommandMetadata: {
																					sendPost: boolean;
																					apiUrl: string;
																				};
																			};
																			playlistEditEndpoint: {
																				playlistId: string;
																				actions: {
																					action: string;
																					removedVideoId: string;
																				}[];
																			};
																		};
																		untoggledAccessibility: {
																			accessibilityData: {
																				label: string;
																			};
																		};
																		toggledAccessibility: {
																			accessibilityData: {
																				label: string;
																			};
																		};
																		trackingParams: string;
																	};
																}[];
																activeView: {
																	viewableCommands: {
																		clickTrackingParams: string;
																		loggingUrls: {
																			baseUrl: string;
																		}[];
																		pingingEndpoint: {
																			hack: boolean;
																		};
																	}[];
																	endOfSessionCommands: {
																		clickTrackingParams: string;
																		loggingUrls: {
																			baseUrl: string;
																		}[];
																		pingingEndpoint: {
																			hack: boolean;
																		};
																	}[];
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
									title: {
										simpleText: string;
									};
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
									thumbnail: {
										thumbnails: {
											url: string;
											width: number;
											height: number;
										}[];
									};
									descriptionSnippet: {
										runs: {
											text: string;
											bold?: boolean;
										}[];
									};
									shortBylineText: {
										runs: {
											text: string;
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
										}[];
									};
									videoCountText: {
										accessibility: {
											accessibilityData: {
												label: string;
											};
										};
										simpleText: string;
									};
									subscriptionButton: {
										subscribed: boolean;
									};
									ownerBadges: {
										metadataBadgeRenderer: {
											icon: {
												iconType: string;
											};
											style: string;
											tooltip: string;
											trackingParams: string;
											accessibilityData: {
												label: string;
											};
										};
									}[];
									subscriberCountText: {
										simpleText: string;
									};
									subscribeButton: {
										buttonRenderer: {
											style: string;
											size: string;
											isDisabled: boolean;
											text: {
												runs: {
													text: string;
												}[];
											};
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
									longBylineText: {
										runs: {
											text: string;
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
										}[];
									};
								};
								shelfRenderer?: {
									title: {
										simpleText: string;
									};
									content: {
										verticalListRenderer: {
											items: {
												videoRenderer: {
													videoId: string;
													thumbnail: {
														thumbnails: {
															url: string;
															width: number;
															height: number;
														}[];
													};
													title: {
														runs: {
															text: string;
														}[];
														accessibility: {
															accessibilityData: {
																label: string;
															};
														};
													};
													longBylineText: {
														runs: {
															text: string;
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
														}[];
													};
													publishedTimeText?: {
														simpleText: string;
													};
													lengthText?: {
														accessibility: {
															accessibilityData: {
																label: string;
															};
														};
														simpleText: string;
													};
													viewCountText: {
														simpleText?: string;
														runs?: {
															text: string;
														}[];
													};
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
															icon?: {
																iconType: string;
															};
														};
													}[];
													ownerBadges?: {
														metadataBadgeRenderer: {
															icon: {
																iconType: string;
															};
															style: string;
															tooltip: string;
															trackingParams: string;
															accessibilityData: {
																label: string;
															};
														};
													}[];
													ownerText: {
														runs: {
															text: string;
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
														}[];
													};
													shortBylineText: {
														runs: {
															text: string;
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
														}[];
													};
													trackingParams: string;
													showActionMenu: boolean;
													shortViewCountText: {
														accessibility?: {
															accessibilityData: {
																label: string;
															};
														};
														simpleText?: string;
														runs?: {
															text: string;
														}[];
													};
													menu: {
														menuRenderer: {
															items: {
																menuServiceItemRenderer: {
																	text: {
																		runs: {
																			text: string;
																		}[];
																	};
																	icon: {
																		iconType: string;
																	};
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
																					onCreateListCommand: {
																						clickTrackingParams: string;
																						commandMetadata: {
																							webCommandMetadata: {
																								sendPost: boolean;
																								apiUrl: string;
																							};
																						};
																						createPlaylistServiceEndpoint: {
																							videoIds: string[];
																							params: string;
																						};
																					};
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
															accessibility: {
																accessibilityData: {
																	label: string;
																};
															};
														};
													};
													channelThumbnailSupportedRenderers: {
														channelThumbnailWithLinkRenderer: {
															thumbnail: {
																thumbnails: {
																	url: string;
																	width: number;
																	height: number;
																}[];
															};
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
															accessibility: {
																accessibilityData: {
																	label: string;
																};
															};
														};
													};
													thumbnailOverlays: {
														thumbnailOverlayTimeStatusRenderer?: {
															text: {
																accessibility: {
																	accessibilityData: {
																		label: string;
																	};
																};
																simpleText: string;
															};
															style: string;
														};
														thumbnailOverlayToggleButtonRenderer?: {
															untoggledIcon: {
																iconType: string;
															};
															toggledIcon: {
																iconType: string;
															};
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
																			onCreateListCommand: {
																				clickTrackingParams: string;
																				commandMetadata: {
																					webCommandMetadata: {
																						sendPost: boolean;
																						apiUrl: string;
																					};
																				};
																				createPlaylistServiceEndpoint: {
																					videoIds: string[];
																					params: string;
																				};
																			};
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
															untoggledAccessibility: {
																accessibilityData: {
																	label: string;
																};
															};
															toggledAccessibility: {
																accessibilityData: {
																	label: string;
																};
															};
															trackingParams: string;
															isToggled?: boolean;
															toggledServiceEndpoint?: {
																clickTrackingParams: string;
																commandMetadata: {
																	webCommandMetadata: {
																		sendPost: boolean;
																		apiUrl: string;
																	};
																};
																playlistEditEndpoint: {
																	playlistId: string;
																	actions: {
																		action: string;
																		removedVideoId: string;
																	}[];
																};
															};
														};
														thumbnailOverlayNowPlayingRenderer?: {
															text: {
																runs: {
																	text: string;
																}[];
															};
														};
														thumbnailOverlayLoadingPreviewRenderer?: {
															text: {
																runs: {
																	text: string;
																}[];
															};
														};
														thumbnailOverlayInlineUnplayableRenderer?: {
															text: {
																runs: {
																	text: string;
																}[];
															};
															icon: {
																iconType: string;
															};
														};
													}[];
													detailedMetadataSnippets?: {
														snippetText: {
															runs: {
																text: string;
																bold?: boolean;
															}[];
														};
														snippetHoverText: {
															runs: {
																text: string;
															}[];
														};
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
															playerExtraUrlParams: {
																key: string;
																value: string;
															}[];
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
																collapsedTitle: {
																	runs: {
																		text: string;
																	}[];
																};
																collapsedThumbnail: {
																	thumbnails: {
																		url: string;
																		width: number;
																		height: number;
																	}[];
																};
																collapsedLabel: {
																	runs: {
																		text: string;
																	}[];
																};
																expandedTitle: {
																	runs: {
																		text: string;
																	}[];
																};
															};
															expandedContent: {
																horizontalCardListRenderer: {
																	cards: {
																		macroMarkersListItemRenderer: {
																			title: {
																				runs: {
																					text: string;
																				}[];
																			};
																			timeDescription: {
																				runs: {
																					text: string;
																				}[];
																			};
																			thumbnail: {
																				thumbnails: {
																					url: string;
																					width: number;
																					height: number;
																				}[];
																			};
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
																			icon: {
																				iconType: string;
																			};
																			trackingParams: string;
																		};
																	};
																	nextButton: {
																		buttonRenderer: {
																			style: string;
																			size: string;
																			isDisabled: boolean;
																			icon: {
																				iconType: string;
																			};
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
																	icon: {
																		iconType: string;
																	};
																	trackingParams: string;
																	accessibilityData: {
																		accessibilityData: {
																			label: string;
																		};
																	};
																};
															};
															collapseButton: {
																buttonRenderer: {
																	style: string;
																	size: string;
																	isDisabled: boolean;
																	icon: {
																		iconType: string;
																	};
																	trackingParams: string;
																	accessibilityData: {
																		accessibilityData: {
																			label: string;
																		};
																	};
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
											collapsedStateButtonText: {
												runs: {
													text: string;
												}[];
												accessibility: {
													accessibilityData: {
														label: string;
													};
												};
											};
											trackingParams: string;
										};
									};
									trackingParams: string;
								};
								videoRenderer?: {
									videoId: string;
									thumbnail: {
										thumbnails: {
											url: string;
											width: number;
											height: number;
										}[];
									};
									title: {
										runs: {
											text: string;
										}[];
										accessibility: {
											accessibilityData: {
												label: string;
											};
										};
									};
									longBylineText: {
										runs: {
											text: string;
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
										}[];
									};
									publishedTimeText?: {
										simpleText: string;
									};
									lengthText?: {
										accessibility: {
											accessibilityData: {
												label: string;
											};
										};
										simpleText: string;
									};
									viewCountText: {
										simpleText?: string;
										runs?: {
											text: string;
										}[];
									};
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
											icon?: {
												iconType: string;
											};
										};
									}[];
									ownerBadges?: {
										metadataBadgeRenderer: {
											icon: {
												iconType: string;
											};
											style: string;
											tooltip: string;
											trackingParams: string;
											accessibilityData: {
												label: string;
											};
										};
									}[];
									ownerText: {
										runs: {
											text: string;
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
										}[];
									};
									shortBylineText: {
										runs: {
											text: string;
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
										}[];
									};
									trackingParams: string;
									showActionMenu: boolean;
									shortViewCountText: {
										accessibility?: {
											accessibilityData: {
												label: string;
											};
										};
										simpleText?: string;
										runs?: {
											text: string;
										}[];
									};
									menu: {
										menuRenderer: {
											items: {
												menuServiceItemRenderer: {
													text: {
														runs: {
															text: string;
														}[];
													};
													icon: {
														iconType: string;
													};
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
																	onCreateListCommand: {
																		clickTrackingParams: string;
																		commandMetadata: {
																			webCommandMetadata: {
																				sendPost: boolean;
																				apiUrl: string;
																			};
																		};
																		createPlaylistServiceEndpoint: {
																			videoIds: string[];
																			params: string;
																		};
																	};
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
											accessibility: {
												accessibilityData: {
													label: string;
												};
											};
										};
									};
									channelThumbnailSupportedRenderers: {
										channelThumbnailWithLinkRenderer: {
											thumbnail: {
												thumbnails: {
													url: string;
													width: number;
													height: number;
												}[];
											};
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
											accessibility: {
												accessibilityData: {
													label: string;
												};
											};
										};
									};
									thumbnailOverlays: {
										thumbnailOverlayToggleButtonRenderer?: {
											untoggledIcon: {
												iconType: string;
											};
											toggledIcon: {
												iconType: string;
											};
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
															onCreateListCommand: {
																clickTrackingParams: string;
																commandMetadata: {
																	webCommandMetadata: {
																		sendPost: boolean;
																		apiUrl: string;
																	};
																};
																createPlaylistServiceEndpoint: {
																	videoIds: string[];
																	params: string;
																};
															};
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
											untoggledAccessibility: {
												accessibilityData: {
													label: string;
												};
											};
											toggledAccessibility: {
												accessibilityData: {
													label: string;
												};
											};
											trackingParams: string;
											isToggled?: boolean;
											toggledServiceEndpoint?: {
												clickTrackingParams: string;
												commandMetadata: {
													webCommandMetadata: {
														sendPost: boolean;
														apiUrl: string;
													};
												};
												playlistEditEndpoint: {
													playlistId: string;
													actions: {
														action: string;
														removedVideoId: string;
													}[];
												};
											};
										};
										thumbnailOverlayNowPlayingRenderer?: {
											text: {
												runs: {
													text: string;
												}[];
											};
										};
										thumbnailOverlayLoadingPreviewRenderer?: {
											text: {
												runs: {
													text: string;
												}[];
											};
										};
										thumbnailOverlayTimeStatusRenderer?: {
											text: {
												accessibility: {
													accessibilityData: {
														label: string;
													};
												};
												simpleText: string;
											};
											style: string;
											icon?: {
												iconType: string;
											};
										};
										thumbnailOverlayInlineUnplayableRenderer?: {
											text: {
												runs: {
													text: string;
												}[];
											};
											icon: {
												iconType: string;
											};
										};
									}[];
									detailedMetadataSnippets?: {
										snippetText: {
											runs: {
												text: string;
												bold?: boolean;
											}[];
										};
										snippetHoverText: {
											runs: {
												text: string;
											}[];
										};
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
											playerExtraUrlParams: {
												key: string;
												value: string;
											}[];
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
												collapsedTitle: {
													runs: {
														text: string;
													}[];
												};
												collapsedThumbnail: {
													thumbnails: {
														url: string;
														width: number;
														height: number;
													}[];
												};
												collapsedLabel: {
													runs: {
														text: string;
													}[];
												};
												expandedTitle: {
													runs: {
														text: string;
													}[];
												};
											};
											expandedContent: {
												horizontalCardListRenderer: {
													cards: {
														macroMarkersListItemRenderer: {
															title: {
																runs: {
																	text: string;
																}[];
															};
															timeDescription: {
																runs: {
																	text: string;
																}[];
															};
															thumbnail: {
																thumbnails: {
																	url: string;
																	width: number;
																	height: number;
																}[];
															};
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
															icon: {
																iconType: string;
															};
															trackingParams: string;
														};
													};
													nextButton: {
														buttonRenderer: {
															style: string;
															size: string;
															isDisabled: boolean;
															icon: {
																iconType: string;
															};
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
													icon: {
														iconType: string;
													};
													trackingParams: string;
													accessibilityData: {
														accessibilityData: {
															label: string;
														};
													};
												};
											};
											collapseButton: {
												buttonRenderer: {
													style: string;
													size: string;
													isDisabled: boolean;
													icon: {
														iconType: string;
													};
													trackingParams: string;
													accessibilityData: {
														accessibilityData: {
															label: string;
														};
													};
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
									descriptionSnippet?: {
										runs: {
											text: string;
											bold?: boolean;
										}[];
									};
								};
								reelShelfRenderer?: {
									title: {
										simpleText: string;
									};
									button: {
										menuRenderer: {
											items: {
												menuNavigationItemRenderer: {
													text: {
														runs: {
															text: string;
														}[];
													};
													icon: {
														iconType: string;
													};
													navigationEndpoint: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																ignoreNavigation: boolean;
															};
														};
														userFeedbackEndpoint: {
															additionalDatas: {
																userFeedbackEndpointProductSpecificValueData: {
																	key: string;
																	value: string;
																};
															}[];
														};
													};
													trackingParams: string;
													accessibility: {
														accessibilityData: {
															label: string;
														};
													};
												};
											}[];
											trackingParams: string;
											accessibility: {
												accessibilityData: {
													label: string;
												};
											};
										};
									};
									items: {
										reelItemRenderer: {
											videoId: string;
											headline: {
												simpleText: string;
											};
											thumbnail: {
												thumbnails: {
													url: string;
													width: number;
													height: number;
												}[];
												isOriginalAspectRatio: boolean;
											};
											viewCountText: {
												accessibility: {
													accessibilityData: {
														label: string;
													};
												};
												simpleText: string;
											};
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
															text: {
																runs: {
																	text: string;
																}[];
															};
															icon: {
																iconType: string;
															};
															navigationEndpoint: {
																clickTrackingParams: string;
																commandMetadata: {
																	webCommandMetadata: {
																		ignoreNavigation: boolean;
																	};
																};
																userFeedbackEndpoint: {
																	additionalDatas: {
																		userFeedbackEndpointProductSpecificValueData: {
																			key: string;
																			value: string;
																		};
																	}[];
																};
															};
															trackingParams: string;
															accessibility: {
																accessibilityData: {
																	label: string;
																};
															};
														};
													}[];
													trackingParams: string;
													accessibility: {
														accessibilityData: {
															label: string;
														};
													};
												};
											};
											trackingParams: string;
											accessibility: {
												accessibilityData: {
													label: string;
												};
											};
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
													playerExtraUrlParams: {
														key: string;
														value: string;
													}[];
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
									icon: {
										iconType: string;
									};
								};
								radioRenderer?: {
									playlistId: string;
									title: {
										simpleText: string;
									};
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
									videoCountText: {
										runs: {
											text: string;
										}[];
									};
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
											title: {
												simpleText: string;
											};
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
											lengthText: {
												accessibility: {
													accessibilityData: {
														label: string;
													};
												};
												simpleText: string;
											};
											videoId: string;
										};
									}[];
									thumbnailText: {
										runs: {
											text: string;
											bold?: boolean;
										}[];
									};
									longBylineText: {
										simpleText: string;
									};
									thumbnailOverlays: {
										thumbnailOverlayBottomPanelRenderer?: {
											icon: {
												iconType: string;
											};
										};
										thumbnailOverlayHoverTextRenderer?: {
											text: {
												runs: {
													text: string;
												}[];
											};
											icon: {
												iconType: string;
											};
										};
										thumbnailOverlayNowPlayingRenderer?: {
											text: {
												runs: {
													text: string;
												}[];
											};
										};
									}[];
									videoCountShortText: {
										runs: {
											text: string;
										}[];
									};
								};
								horizontalCardListRenderer?: {
									cards: {
										searchRefinementCardRenderer: {
											thumbnail: {
												thumbnails: {
													url: string;
													width: number;
													height: number;
												}[];
											};
											query: {
												runs: {
													text: string;
												}[];
											};
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
											title: {
												simpleText: string;
											};
											trackingParams: string;
											icon: {
												iconType: string;
											};
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
											icon: {
												iconType: string;
											};
											trackingParams: string;
										};
									};
									nextButton: {
										buttonRenderer: {
											style: string;
											size: string;
											isDisabled: boolean;
											icon: {
												iconType: string;
											};
											trackingParams: string;
										};
									};
								};
								backgroundPromoRenderer?: {
									title: {
										runs: {
											text: string;
										}[];
									};
									bodyText: {
										runs: {
											text: string;
										}[];
									};
									icon: {
										iconType: string;
									};
									trackingParams: string;
									style: {
										value: string;
									};
								};
								playlistRenderer?: {
									playlistId: string;
									title: {
										simpleText: string;
									};
									thumbnails: {
										thumbnails: {
											url: string;
											width: number;
											height: number;
										}[];
									}[];
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
									viewPlaylistText: {
										runs: {
											text: string;
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
												};
											};
										}[];
									};
									shortBylineText: {
										runs: {
											text: string;
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
										}[];
									};
									videos: {
										childVideoRenderer: {
											title: {
												simpleText: string;
											};
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
											lengthText: {
												accessibility: {
													accessibilityData: {
														label: string;
													};
												};
												simpleText: string;
											};
											videoId: string;
										};
									}[];
									videoCountText: {
										runs: {
											text: string;
										}[];
									};
									trackingParams: string;
									thumbnailText: {
										runs: {
											text: string;
											bold?: boolean;
										}[];
									};
									longBylineText: {
										runs: {
											text: string;
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
										}[];
									};
									ownerBadges?: {
										metadataBadgeRenderer: {
											icon: {
												iconType: string;
											};
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
										thumbnailOverlayBottomPanelRenderer?: {
											text: {
												simpleText: string;
											};
											icon: {
												iconType: string;
											};
										};
										thumbnailOverlayHoverTextRenderer?: {
											text: {
												runs: {
													text: string;
												}[];
											};
											icon: {
												iconType: string;
											};
										};
										thumbnailOverlayNowPlayingRenderer?: {
											text: {
												runs: {
													text: string;
												}[];
											};
										};
									}[];
									publishedTimeText?: {
										simpleText: string;
									};
								};
							}[];
							trackingParams: string;
						};
						continuationItemRenderer?: {
							trigger: string;
							continuationEndpoint: {
								clickTrackingParams: string;
								commandMetadata: {
									webCommandMetadata: {
										sendPost: boolean;
										apiUrl: string;
									};
								};
								continuationCommand: {
									token: string;
									request: string;
								};
							};
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
									title: {
										simpleText: string;
									};
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
									subtitle: {
										simpleText: string;
									};
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
											icon: {
												iconType: string;
											};
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
											text: {
												runs: {
													text: string;
												}[];
											};
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
											label: {
												simpleText: string;
											};
											icon: {
												iconType: string;
											};
											style: string;
										};
									};
									heroImage: {
										singleHeroImageRenderer?: {
											thumbnail: {
												thumbnails: {
													url: string;
													width: number;
													height: number;
												}[];
											};
											style: string;
										};
										collageHeroImageRenderer?: {
											leftThumbnail: {
												thumbnails: {
													url: string;
													width: number;
													height: number;
												}[];
											};
											topRightThumbnail: {
												thumbnails: {
													url: string;
													width: number;
													height: number;
												}[];
											};
											bottomRightThumbnail: {
												thumbnails: {
													url: string;
													width: number;
													height: number;
												}[];
											};
										};
									};
									accessibility: {
										accessibilityData: {
											label: string;
										};
									};
								};
							};
							sections: {
								watchCardSectionSequenceRenderer: {
									lists: {
										verticalWatchCardListRenderer?: {
											items: {
												watchCardCompactVideoRenderer: {
													title: {
														simpleText: string;
													};
													subtitle: {
														runs?: {
															text: string;
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
														}[];
														simpleText?: string;
													};
													lengthText: {
														accessibility: {
															accessibilityData: {
																label: string;
															};
														};
														simpleText: string;
													};
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
													byline?: {
														runs: {
															text: string;
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
														}[];
													};
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
											viewAllText?: {
												runs: {
													text: string;
												}[];
											};
											trackingParams: string;
										};
										horizontalCardListRenderer?: {
											cards: {
												searchRefinementCardRenderer: {
													thumbnail: {
														thumbnails: {
															url: string;
															width: number;
															height: number;
														}[];
													};
													query: {
														runs: {
															text: string;
														}[];
													};
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
													title: {
														accessibility: {
															accessibilityData: {
																label: string;
															};
														};
														simpleText: string;
													};
													trackingParams: string;
												};
											};
											previousButton: {
												buttonRenderer: {
													style: string;
													size: string;
													isDisabled: boolean;
													icon: {
														iconType: string;
													};
													trackingParams: string;
												};
											};
											nextButton: {
												buttonRenderer: {
													style: string;
													size: string;
													isDisabled: boolean;
													icon: {
														iconType: string;
													};
													trackingParams: string;
												};
											};
										};
									}[];
									trackingParams: string;
									listTitles?: {
										accessibility: {
											accessibilityData: {
												label: string;
											};
										};
										simpleText: string;
									}[];
								};
							}[];
							collapsedLabel: {
								simpleText?: string;
								runs?: {
									text: string;
								}[];
							};
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
							text: {
								simpleText: string;
							};
							trackingParams: string;
							isSelected: boolean;
							location: string;
							navigationEndpoint?: {
								clickTrackingParams: string;
								commandMetadata: {
									webCommandMetadata: {
										sendPost: boolean;
										apiUrl: string;
									};
								};
								continuationCommand: {
									token: string;
									request: string;
									command: {
										clickTrackingParams: string;
										showReloadUiCommand: {
											targetId: string;
										};
									};
								};
							};
						};
					}[];
					trackingParams: string;
					nextButton: {
						buttonRenderer: {
							style: string;
							size: string;
							isDisabled: boolean;
							icon: {
								iconType: string;
							};
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
							icon: {
								iconType: string;
							};
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
					text: {
						runs: {
							text: string;
						}[];
					};
					icon: {
						iconType: string;
					};
					tooltip: string;
					trackingParams: string;
					accessibilityData: {
						accessibilityData: {
							label: string;
						};
					};
					command: {
						clickTrackingParams: string;
						openPopupAction: {
							popup: {
								searchFilterOptionsDialogRenderer: {
									title: {
										runs: {
											text: string;
										}[];
									};
									groups: {
										searchFilterGroupRenderer: {
											title: {
												simpleText: string;
											};
											filters: {
												searchFilterRenderer: {
													label: {
														simpleText: string;
													};
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
					iconImage: {
						iconType: string;
					};
					tooltipText: {
						runs: {
							text: string;
						}[];
					};
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
					icon: {
						iconType: string;
					};
					placeholderText: {
						runs: {
							text: string;
						}[];
					};
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
							icon: {
								iconType: string;
							};
							trackingParams: string;
							accessibilityData: {
								accessibilityData: {
									label: string;
								};
							};
						};
					};
				};
			};
			trackingParams: string;
			topbarButtons: {
				topbarMenuButtonRenderer?: {
					icon: {
						iconType: string;
					};
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
					accessibility: {
						accessibilityData: {
							label: string;
						};
					};
					tooltip: string;
					style: string;
				};
				buttonRenderer?: {
					style: string;
					size: string;
					text: {
						runs: {
							text: string;
						}[];
					};
					icon: {
						iconType: string;
					};
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
					title: {
						runs: {
							text: string;
						}[];
					};
					sections: {
						hotkeyDialogSectionRenderer: {
							title: {
								runs: {
									text: string;
								}[];
							};
							options: {
								hotkeyDialogSectionOptionRenderer: {
									label: {
										runs: {
											text: string;
										}[];
									};
									hotkey: string;
									hotkeyAccessibilityLabel?: {
										accessibilityData: {
											label: string;
										};
									};
								};
							}[];
						};
					}[];
					dismissButton: {
						buttonRenderer: {
							style: string;
							size: string;
							isDisabled: boolean;
							text: {
								runs: {
									text: string;
								}[];
							};
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
					text: {
						runs: {
							text: string;
						}[];
					};
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
											placeholderHeader: {
												runs: {
													text: string;
												}[];
											};
											promptHeader: {
												runs: {
													text: string;
												}[];
											};
											exampleQuery1: {
												runs: {
													text: string;
												}[];
											};
											exampleQuery2: {
												runs: {
													text: string;
												}[];
											};
											promptMicrophoneLabel: {
												runs: {
													text: string;
												}[];
											};
											loadingHeader: {
												runs: {
													text: string;
												}[];
											};
											connectionErrorHeader: {
												runs: {
													text: string;
												}[];
											};
											connectionErrorMicrophoneLabel: {
												runs: {
													text: string;
												}[];
											};
											permissionsHeader: {
												runs: {
													text: string;
												}[];
											};
											permissionsSubtext: {
												runs: {
													text: string;
												}[];
											};
											disabledHeader: {
												runs: {
													text: string;
												}[];
											};
											disabledSubtext: {
												runs: {
													text: string;
												}[];
											};
											microphoneButtonAriaLabel: {
												runs: {
													text: string;
												}[];
											};
											exitButton: {
												buttonRenderer: {
													style: string;
													size: string;
													isDisabled: boolean;
													icon: {
														iconType: string;
													};
													trackingParams: string;
													accessibilityData: {
														accessibilityData: {
															label: string;
														};
													};
												};
											};
											trackingParams: string;
											microphoneOffPromptHeader: {
												runs: {
													text: string;
												}[];
											};
										};
									};
									popupType: string;
								};
							}[];
						};
					};
					icon: {
						iconType: string;
					};
					tooltip: string;
					trackingParams: string;
					accessibilityData: {
						accessibilityData: {
							label: string;
						};
					};
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
							thumbnail: {
								thumbnails: {
									url: string;
									width: number;
									height: number;
								}[];
							};
							title: {
								runs: {
									text: string;
								}[];
								accessibility: {
									accessibilityData: {
										label: string;
									};
								};
							};
							longBylineText: {
								runs: {
									text: string;
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
								}[];
							};
							publishedTimeText: {
								simpleText: string;
							};
							lengthText: {
								accessibility: {
									accessibilityData: {
										label: string;
									};
								};
								simpleText: string;
							};
							viewCountText: {
								simpleText: string;
							};
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
									icon: {
										iconType: string;
									};
									style: string;
									tooltip: string;
									trackingParams: string;
									accessibilityData: {
										label: string;
									};
								};
							}[];
							ownerText: {
								runs: {
									text: string;
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
								}[];
							};
							shortBylineText: {
								runs: {
									text: string;
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
								}[];
							};
							trackingParams: string;
							showActionMenu: boolean;
							shortViewCountText: {
								accessibility: {
									accessibilityData: {
										label: string;
									};
								};
								simpleText: string;
							};
							menu: {
								menuRenderer: {
									items: {
										menuServiceItemRenderer: {
											text: {
												runs: {
													text: string;
												}[];
											};
											icon: {
												iconType: string;
											};
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
															onCreateListCommand: {
																clickTrackingParams: string;
																commandMetadata: {
																	webCommandMetadata: {
																		sendPost: boolean;
																		apiUrl: string;
																	};
																};
																createPlaylistServiceEndpoint: {
																	videoIds: string[];
																	params: string;
																};
															};
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
									accessibility: {
										accessibilityData: {
											label: string;
										};
									};
								};
							};
							channelThumbnailSupportedRenderers: {
								channelThumbnailWithLinkRenderer: {
									thumbnail: {
										thumbnails: {
											url: string;
											width: number;
											height: number;
										}[];
									};
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
									accessibility: {
										accessibilityData: {
											label: string;
										};
									};
								};
							};
							thumbnailOverlays: {
								thumbnailOverlayTimeStatusRenderer?: {
									text: {
										accessibility: {
											accessibilityData: {
												label: string;
											};
										};
										simpleText: string;
									};
									style: string;
								};
								thumbnailOverlayToggleButtonRenderer?: {
									untoggledIcon: {
										iconType: string;
									};
									toggledIcon: {
										iconType: string;
									};
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
													onCreateListCommand: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																sendPost: boolean;
																apiUrl: string;
															};
														};
														createPlaylistServiceEndpoint: {
															videoIds: string[];
															params: string;
														};
													};
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
									untoggledAccessibility: {
										accessibilityData: {
											label: string;
										};
									};
									toggledAccessibility: {
										accessibilityData: {
											label: string;
										};
									};
									trackingParams: string;
									isToggled?: boolean;
									toggledServiceEndpoint?: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												sendPost: boolean;
												apiUrl: string;
											};
										};
										playlistEditEndpoint: {
											playlistId: string;
											actions: {
												action: string;
												removedVideoId: string;
											}[];
										};
									};
								};
								thumbnailOverlayNowPlayingRenderer?: {
									text: {
										runs: {
											text: string;
										}[];
									};
								};
								thumbnailOverlayLoadingPreviewRenderer?: {
									text: {
										runs: {
											text: string;
										}[];
									};
								};
							}[];
							detailedMetadataSnippets?: {
								snippetText: {
									runs: {
										text: string;
										bold?: boolean;
									}[];
								};
								snippetHoverText: {
									runs: {
										text: string;
									}[];
								};
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
									playerExtraUrlParams: {
										key: string;
										value: string;
									}[];
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
							title: {
								simpleText: string;
							};
							thumbnails: {
								thumbnails: {
									url: string;
									width: number;
									height: number;
								}[];
							}[];
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
							viewPlaylistText: {
								runs: {
									text: string;
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
										};
									};
								}[];
							};
							shortBylineText: {
								runs: {
									text: string;
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
								}[];
							};
							videos: {
								childVideoRenderer: {
									title: {
										simpleText: string;
									};
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
									lengthText: {
										accessibility: {
											accessibilityData: {
												label: string;
											};
										};
										simpleText: string;
									};
									videoId: string;
								};
							}[];
							videoCountText: {
								runs: {
									text: string;
								}[];
							};
							trackingParams: string;
							thumbnailText: {
								runs: {
									text: string;
									bold?: boolean;
								}[];
							};
							longBylineText: {
								runs: {
									text: string;
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
								}[];
							};
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
								thumbnailOverlayBottomPanelRenderer?: {
									text: {
										simpleText: string;
									};
									icon: {
										iconType: string;
									};
								};
								thumbnailOverlayHoverTextRenderer?: {
									text: {
										runs: {
											text: string;
										}[];
									};
									icon: {
										iconType: string;
									};
								};
								thumbnailOverlayNowPlayingRenderer?: {
									text: {
										runs: {
											text: string;
										}[];
									};
								};
							}[];
						};
						reelShelfRenderer?: {
							title: {
								simpleText: string;
							};
							button: {
								menuRenderer: {
									items: {
										menuNavigationItemRenderer: {
											text: {
												runs: {
													text: string;
												}[];
											};
											icon: {
												iconType: string;
											};
											navigationEndpoint: {
												clickTrackingParams: string;
												commandMetadata: {
													webCommandMetadata: {
														ignoreNavigation: boolean;
													};
												};
												userFeedbackEndpoint: {
													additionalDatas: {
														userFeedbackEndpointProductSpecificValueData: {
															key: string;
															value: string;
														};
													}[];
												};
											};
											trackingParams: string;
											accessibility: {
												accessibilityData: {
													label: string;
												};
											};
										};
									}[];
									trackingParams: string;
									accessibility: {
										accessibilityData: {
											label: string;
										};
									};
								};
							};
							items: {
								reelItemRenderer: {
									videoId: string;
									headline: {
										simpleText: string;
									};
									thumbnail: {
										thumbnails: {
											url: string;
											width: number;
											height: number;
										}[];
										isOriginalAspectRatio: boolean;
									};
									viewCountText: {
										accessibility: {
											accessibilityData: {
												label: string;
											};
										};
										simpleText: string;
									};
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
													text: {
														runs: {
															text: string;
														}[];
													};
													icon: {
														iconType: string;
													};
													navigationEndpoint: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																ignoreNavigation: boolean;
															};
														};
														userFeedbackEndpoint: {
															additionalDatas: {
																userFeedbackEndpointProductSpecificValueData: {
																	key: string;
																	value: string;
																};
															}[];
														};
													};
													trackingParams: string;
													accessibility: {
														accessibilityData: {
															label: string;
														};
													};
												};
											}[];
											trackingParams: string;
											accessibility: {
												accessibilityData: {
													label: string;
												};
											};
										};
									};
									trackingParams: string;
									accessibility: {
										accessibilityData: {
											label: string;
										};
									};
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
											playerExtraUrlParams: {
												key: string;
												value: string;
											}[];
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
							icon: {
								iconType: string;
							};
						};
					}[];
					trackingParams: string;
				};
				continuationItemRenderer?: {
					trigger: string;
					continuationEndpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								sendPost: boolean;
								apiUrl: string;
							};
						};
						continuationCommand: {
							token: string;
							request: string;
						};
					};
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
		title: {
			simpleText: string;
		};
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
		thumbnail: {
			thumbnails: {
				url: string;
				width: number;
				height: number;
			}[];
		};
		descriptionSnippet?: {
			runs: {
				text: string;
				bold?: boolean;
			}[];
		};
		shortBylineText: {
			runs: {
				text: string;
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
			}[];
		};
		videoCountText: {
			accessibility: {
				accessibilityData: {
					label: string;
				};
			};
			simpleText: string;
		};
		subscriptionButton: {
			subscribed: boolean;
		};
		ownerBadges: {
			metadataBadgeRenderer: {
				icon: {
					iconType: string;
				};
				style: string;
				tooltip: string;
				trackingParams: string;
				accessibilityData: {
					label: string;
				};
			};
		}[];
		subscriberCountText: {
			simpleText: string;
		};
		subscribeButton: {
			buttonRenderer: {
				style: string;
				size: string;
				isDisabled: boolean;
				text: {
					runs: {
						text: string;
					}[];
				};
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
		longBylineText: {
			runs: {
				text: string;
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
			}[];
		};
	};
}
	|
{
	videoRenderer: {
		videoId: string;
		thumbnail: {
			thumbnails: {
				url: string;
				width: number;
				height: number;
			}[];
		};
		title: {
			runs: {
				text: string;
			}[];
			accessibility: {
				accessibilityData: {
					label: string;
				};
			};
		};
		longBylineText: {
			runs: {
				text: string;
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
			}[];
		};
		publishedTimeText?: {
			simpleText: string;
		};
		lengthText?: {
			accessibility: {
				accessibilityData: {
					label: string;
				};
			};
			simpleText: string;
		};
		viewCountText: {
			simpleText?: string;
			runs?: {
				text: string;
			}[];
		};
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
				icon?: {
					iconType: string;
				};
			};
		}[];
		ownerBadges?: {
			metadataBadgeRenderer: {
				icon: {
					iconType: string;
				};
				style: string;
				tooltip: string;
				trackingParams: string;
				accessibilityData: {
					label: string;
				};
			};
		}[];
		ownerText: {
			runs: {
				text: string;
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
			}[];
		};
		shortBylineText: {
			runs: {
				text: string;
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
			}[];
		};
		trackingParams: string;
		showActionMenu: boolean;
		shortViewCountText: {
			accessibility?: {
				accessibilityData: {
					label: string;
				};
			};
			simpleText?: string;
			runs?: {
				text: string;
			}[];
		};
		menu: {
			menuRenderer: {
				items: {
					menuServiceItemRenderer: {
						text: {
							runs: {
								text: string;
							}[];
						};
						icon: {
							iconType: string;
						};
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
										onCreateListCommand: {
											clickTrackingParams: string;
											commandMetadata: {
												webCommandMetadata: {
													sendPost: boolean;
													apiUrl: string;
												};
											};
											createPlaylistServiceEndpoint: {
												videoIds: string[];
												params: string;
											};
										};
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
				accessibility: {
					accessibilityData: {
						label: string;
					};
				};
			};
		};
		channelThumbnailSupportedRenderers: {
			channelThumbnailWithLinkRenderer: {
				thumbnail: {
					thumbnails: {
						url: string;
						width: number;
						height: number;
					}[];
				};
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
				accessibility: {
					accessibilityData: {
						label: string;
					};
				};
			};
		};
		thumbnailOverlays: {
			thumbnailOverlayToggleButtonRenderer?: {
				untoggledIcon: {
					iconType: string;
				};
				toggledIcon: {
					iconType: string;
				};
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
								onCreateListCommand: {
									clickTrackingParams: string;
									commandMetadata: {
										webCommandMetadata: {
											sendPost: boolean;
											apiUrl: string;
										};
									};
									createPlaylistServiceEndpoint: {
										videoIds: string[];
										params: string;
									};
								};
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
				untoggledAccessibility: {
					accessibilityData: {
						label: string;
					};
				};
				toggledAccessibility: {
					accessibilityData: {
						label: string;
					};
				};
				trackingParams: string;
				isToggled?: boolean;
				toggledServiceEndpoint?: {
					clickTrackingParams: string;
					commandMetadata: {
						webCommandMetadata: {
							sendPost: boolean;
							apiUrl: string;
						};
					};
					playlistEditEndpoint: {
						playlistId: string;
						actions: {
							action: string;
							removedVideoId: string;
						}[];
					};
				};
			};
			thumbnailOverlayNowPlayingRenderer?: {
				text: {
					runs: {
						text: string;
					}[];
				};
			};
			thumbnailOverlayLoadingPreviewRenderer?: {
				text: {
					runs: {
						text: string;
					}[];
				};
			};
			thumbnailOverlayTimeStatusRenderer?: {
				text: {
					accessibility: {
						accessibilityData: {
							label: string;
						};
					};
					simpleText: string;
				};
				style: string;
				icon?: {
					iconType: string;
				};
			};
			thumbnailOverlayInlineUnplayableRenderer?: {
				text: {
					runs: {
						text: string;
					}[];
				};
				icon: {
					iconType: string;
				};
			};
		}[];
		detailedMetadataSnippets?: {
			snippetText: {
				runs?: {
					text: string;
					bold?: boolean;
				}[];
			};
			snippetHoverText: {
				runs: {
					text: string;
				}[];
			};
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
				playerExtraUrlParams: {
					key: string;
					value: string;
				}[];
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
					collapsedTitle: {
						runs: {
							text: string;
						}[];
					};
					collapsedThumbnail: {
						thumbnails: {
							url: string;
							width: number;
							height: number;
						}[];
					};
					collapsedLabel: {
						runs: {
							text: string;
						}[];
					};
					expandedTitle: {
						runs: {
							text: string;
						}[];
					};
				};
				expandedContent: {
					horizontalCardListRenderer: {
						cards: {
							macroMarkersListItemRenderer: {
								title: {
									runs: {
										text: string;
									}[];
								};
								timeDescription: {
									runs: {
										text: string;
									}[];
								};
								thumbnail: {
									thumbnails: {
										url: string;
										width: number;
										height: number;
									}[];
								};
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
								icon: {
									iconType: string;
								};
								trackingParams: string;
							};
						};
						nextButton: {
							buttonRenderer: {
								style: string;
								size: string;
								isDisabled: boolean;
								icon: {
									iconType: string;
								};
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
						icon: {
							iconType: string;
						};
						trackingParams: string;
						accessibilityData: {
							accessibilityData: {
								label: string;
							};
						};
					};
				};
				collapseButton: {
					buttonRenderer: {
						style: string;
						size: string;
						isDisabled: boolean;
						icon: {
							iconType: string;
						};
						trackingParams: string;
						accessibilityData: {
							accessibilityData: {
								label: string;
							};
						};
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
		descriptionSnippet?: {
			runs: {
				text: string;
				bold?: boolean;
			}[];
		};
	};
}
	|
{
	playlistRenderer: {
		playlistId: string;
		title: {
			simpleText: string;
		};
		thumbnails: {
			thumbnails: {
				url: string;
				width: number;
				height: number;
			}[];
		}[];
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
		viewPlaylistText: {
			runs: {
				text: string;
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
					};
				};
			}[];
		};
		shortBylineText: {
			runs: {
				text: string;
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
			}[];
		};
		videos: {
			childVideoRenderer: {
				title: {
					simpleText: string;
				};
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
				lengthText: {
					accessibility: {
						accessibilityData: {
							label: string;
						};
					};
					simpleText: string;
				};
				videoId: string;
			};
		}[];
		videoCountText: {
			runs: {
				text: string;
			}[];
		};
		trackingParams: string;
		thumbnailText: {
			runs: {
				text: string;
				bold?: boolean;
			}[];
		};
		longBylineText: {
			runs: {
				text: string;
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
			}[];
		};
		ownerBadges?: {
			metadataBadgeRenderer: {
				icon: {
					iconType: string;
				};
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
			thumbnailOverlayBottomPanelRenderer?: {
				text: {
					simpleText: string;
				};
				icon: {
					iconType: string;
				};
			};
			thumbnailOverlayHoverTextRenderer?: {
				text: {
					runs: {
						text: string;
					}[];
				};
				icon: {
					iconType: string;
				};
			};
			thumbnailOverlayNowPlayingRenderer?: {
				text: {
					runs: {
						text: string;
					}[];
				};
			};
		}[];
		publishedTimeText?: {
			simpleText: string;
		};
	};
}
	|
{
	universalWatchCardRenderer: {
		header: {
			watchCardRichHeaderRenderer: {
				title: {
					simpleText: string;
				};
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
				subtitle: {
					simpleText: string;
				};
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
						icon: {
							iconType: string;
						};
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
						text: {
							runs: {
								text: string;
							}[];
						};
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
						label: {
							simpleText: string;
						};
						icon: {
							iconType: string;
						};
						style: string;
					};
				};
				heroImage: {
					singleHeroImageRenderer?: {
						thumbnail: {
							thumbnails: {
								url: string;
								width: number;
								height: number;
							}[];
						};
						style: string;
					};
					collageHeroImageRenderer?: {
						leftThumbnail: {
							thumbnails: {
								url: string;
								width: number;
								height: number;
							}[];
						};
						topRightThumbnail: {
							thumbnails: {
								url: string;
								width: number;
								height: number;
							}[];
						};
						bottomRightThumbnail: {
							thumbnails: {
								url: string;
								width: number;
								height: number;
							}[];
						};
					};
				};
				accessibility: {
					accessibilityData: {
						label: string;
					};
				};
			};
		};
		sections: {
			watchCardSectionSequenceRenderer: {
				lists: {
					verticalWatchCardListRenderer?: {
						items: {
							watchCardCompactVideoRenderer: {
								title: {
									simpleText: string;
								};
								subtitle: {
									runs?: {
										text: string;
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
									}[];
									simpleText?: string;
								};
								lengthText: {
									accessibility: {
										accessibilityData: {
											label: string;
										};
									};
									simpleText: string;
								};
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
								byline?: {
									runs: {
										text: string;
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
									}[];
								};
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
						viewAllText?: {
							runs: {
								text: string;
							}[];
						};
						trackingParams: string;
					};
					horizontalCardListRenderer?: {
						cards: {
							searchRefinementCardRenderer: {
								thumbnail: {
									thumbnails: {
										url: string;
										width: number;
										height: number;
									}[];
								};
								query: {
									runs: {
										text: string;
									}[];
								};
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
								title: {
									accessibility: {
										accessibilityData: {
											label: string;
										};
									};
									simpleText: string;
								};
								trackingParams: string;
							};
						};
						previousButton: {
							buttonRenderer: {
								style: string;
								size: string;
								isDisabled: boolean;
								icon: {
									iconType: string;
								};
								trackingParams: string;
							};
						};
						nextButton: {
							buttonRenderer: {
								style: string;
								size: string;
								isDisabled: boolean;
								icon: {
									iconType: string;
								};
								trackingParams: string;
							};
						};
					};
				}[];
				trackingParams: string;
				listTitles?: {
					accessibility: {
						accessibilityData: {
							label: string;
						};
					};
					simpleText: string;
				}[];
			};
		}[];
		collapsedLabel: {
			simpleText?: string;
			runs?: {
				text: string;
			}[];
		};
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
			params: {
				key: string;
				value: string;
			}[];
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
			text: {
				simpleText: string;
			};
			dismissButton: {
				buttonRenderer: {
					style: string;
					size: string;
					isDisabled: boolean;
					icon: {
						iconType: string;
					};
					trackingParams: string;
					accessibilityData: {
						accessibilityData: {
							label: string;
						};
					};
				};
			};
		};
		alertRenderer?: {
			type: string;
			text: {
				runs: {
					text: string;
				}[];
			};
		};
	}[];
	trackingParams?: string;
	microformat?: {
		microformatDataRenderer: {
			urlCanonical?: string;
			title?: string;
			description?: string;
			thumbnail?: {
				thumbnails: {
					url: string;
					width: number;
					height: number;
				}[];
			};
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
													thumbnail: {
														thumbnails: {
															url: string;
															width: number;
															height: number;
														}[];
													};
													title: {
														runs: {
															text: string;
														}[];
														accessibility: {
															accessibilityData: {
																label: string;
															};
														};
													};
													index: {
														simpleText: string;
													};
													shortBylineText: {
														runs: {
															text: string;
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
														}[];
													};
													lengthText: {
														accessibility: {
															accessibilityData: {
																label: string;
															};
														};
														simpleText: string;
													};
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
																	text: {
																		runs: {
																			text: string;
																		}[];
																	};
																	icon: {
																		iconType: string;
																	};
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
																					onCreateListCommand: {
																						clickTrackingParams: string;
																						commandMetadata: {
																							webCommandMetadata: {
																								sendPost: boolean;
																								apiUrl: string;
																							};
																						};
																						createPlaylistServiceEndpoint: {
																							videoIds: string[];
																							params: string;
																						};
																					};
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
															accessibility: {
																accessibilityData: {
																	label: string;
																};
															};
														};
													};
													thumbnailOverlays: {
														thumbnailOverlayTimeStatusRenderer?: {
															text: {
																accessibility: {
																	accessibilityData: {
																		label: string;
																	};
																};
																simpleText: string;
															};
															style: string;
														};
														thumbnailOverlayNowPlayingRenderer?: {
															text: {
																runs: {
																	text: string;
																}[];
															};
														};
													}[];
													videoInfo: {
														runs: {
															text: string;
														}[];
													};
												};
												continuationItemRenderer?: {
													trigger: string;
													continuationEndpoint: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																sendPost: boolean;
																apiUrl: string;
															};
														};
														continuationCommand: {
															token: string;
															request: string;
														};
													};
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
			title: {
				simpleText: string;
			};
			numVideosText: {
				runs: {
					text: string;
				}[];
			};
			descriptionText?: {
				simpleText: string;
			};
			ownerText?: {
				runs: {
					text: string;
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
				}[];
			};
			viewCountText: {
				simpleText: string;
			};
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
			serviceEndpoints: {
				clickTrackingParams: string;
				commandMetadata: {
					webCommandMetadata: {
						sendPost: boolean;
						apiUrl: string;
					};
				};
				playlistEditEndpoint: {
					actions: {
						action: string;
						sourcePlaylistId: string;
					}[];
				};
			}[];
			stats: {
				runs?: {
					text: string;
				}[];
				simpleText?: string;
			}[];
			briefStats: {
				runs: {
					text: string;
				}[];
			}[];
			playlistHeaderBanner: {
				heroPlaylistThumbnailRenderer: {
					thumbnail: {
						thumbnails: {
							url: string;
							width: number;
							height: number;
						}[];
					};
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
						thumbnailOverlayHoverTextRenderer: {
							text: {
								simpleText: string;
							};
							icon: {
								iconType: string;
							};
						};
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
					defaultIcon: {
						iconType: string;
					};
					toggledIcon: {
						iconType: string;
					};
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
									title: {
										simpleText: string;
									};
									content: {
										simpleText: string;
									};
									button: {
										buttonRenderer: {
											style: string;
											size: string;
											isDisabled: boolean;
											text: {
												simpleText: string;
											};
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
					accessibilityData: {
						accessibilityData: {
							label: string;
						};
					};
					toggledAccessibilityData: {
						accessibilityData: {
							label: string;
						};
					};
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
					icon: {
						iconType: string;
					};
					tooltip: string;
					trackingParams: string;
					accessibilityData: {
						accessibilityData: {
							label: string;
						};
					};
				};
			};
			moreActionsMenu: {
				menuRenderer: {
					items?: {
						menuNavigationItemRenderer: {
							text: {
								simpleText: string;
							};
							icon: {
								iconType: string;
							};
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
					accessibility: {
						accessibilityData: {
							label: string;
						};
					};
					targetId?: string;
				};
			};
			playButton: {
				buttonRenderer: {
					style: string;
					size: string;
					isDisabled: boolean;
					text: {
						simpleText: string;
					};
					icon: {
						iconType: string;
					};
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
					text: {
						simpleText: string;
					};
					icon: {
						iconType: string;
					};
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
							title: {
								runs: {
									text: string;
								}[];
							};
							confirmLabel: {
								runs: {
									text: string;
								}[];
							};
							trackingParams: string;
						};
					};
					popupType: string;
				};
			};
			cinematicContainer: {
				cinematicContainerRenderer: {
					backgroundImageConfig: {
						thumbnail: {
							thumbnails: {
								url: string;
								width: number;
								height: number;
							}[];
						};
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
				playlistBylineRenderer: {
					text: {
						runs?: {
							text: string;
						}[];
						simpleText?: string;
					};
				};
			}[];
			descriptionTapText?: {
				runs: {
					text: string;
				}[];
			};
			subtitle?: {
				simpleText: string;
			};
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
					iconImage: {
						iconType: string;
					};
					tooltipText: {
						runs: {
							text: string;
						}[];
					};
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
					icon: {
						iconType: string;
					};
					placeholderText: {
						runs: {
							text: string;
						}[];
					};
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
							icon: {
								iconType: string;
							};
							trackingParams: string;
							accessibilityData: {
								accessibilityData: {
									label: string;
								};
							};
						};
					};
				};
			};
			trackingParams: string;
			topbarButtons: {
				topbarMenuButtonRenderer?: {
					icon: {
						iconType: string;
					};
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
					accessibility: {
						accessibilityData: {
							label: string;
						};
					};
					tooltip: string;
					style: string;
				};
				buttonRenderer?: {
					style: string;
					size: string;
					text: {
						runs: {
							text: string;
						}[];
					};
					icon: {
						iconType: string;
					};
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
					title: {
						runs: {
							text: string;
						}[];
					};
					sections: {
						hotkeyDialogSectionRenderer: {
							title: {
								runs: {
									text: string;
								}[];
							};
							options: {
								hotkeyDialogSectionOptionRenderer: {
									label: {
										runs: {
											text: string;
										}[];
									};
									hotkey: string;
									hotkeyAccessibilityLabel?: {
										accessibilityData: {
											label: string;
										};
									};
								};
							}[];
						};
					}[];
					dismissButton: {
						buttonRenderer: {
							style: string;
							size: string;
							isDisabled: boolean;
							text: {
								runs: {
									text: string;
								}[];
							};
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
					text: {
						runs: {
							text: string;
						}[];
					};
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
											placeholderHeader: {
												runs: {
													text: string;
												}[];
											};
											promptHeader: {
												runs: {
													text: string;
												}[];
											};
											exampleQuery1: {
												runs: {
													text: string;
												}[];
											};
											exampleQuery2: {
												runs: {
													text: string;
												}[];
											};
											promptMicrophoneLabel: {
												runs: {
													text: string;
												}[];
											};
											loadingHeader: {
												runs: {
													text: string;
												}[];
											};
											connectionErrorHeader: {
												runs: {
													text: string;
												}[];
											};
											connectionErrorMicrophoneLabel: {
												runs: {
													text: string;
												}[];
											};
											permissionsHeader: {
												runs: {
													text: string;
												}[];
											};
											permissionsSubtext: {
												runs: {
													text: string;
												}[];
											};
											disabledHeader: {
												runs: {
													text: string;
												}[];
											};
											disabledSubtext: {
												runs: {
													text: string;
												}[];
											};
											microphoneButtonAriaLabel: {
												runs: {
													text: string;
												}[];
											};
											exitButton: {
												buttonRenderer: {
													style: string;
													size: string;
													isDisabled: boolean;
													icon: {
														iconType: string;
													};
													trackingParams: string;
													accessibilityData: {
														accessibilityData: {
															label: string;
														};
													};
												};
											};
											trackingParams: string;
											microphoneOffPromptHeader: {
												runs: {
													text: string;
												}[];
											};
										};
									};
									popupType: string;
								};
							}[];
						};
					};
					icon: {
						iconType: string;
					};
					tooltip: string;
					trackingParams: string;
					accessibilityData: {
						accessibilityData: {
							label: string;
						};
					};
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
							thumbnail: {
								thumbnails: {
									url: string;
									width: number;
									height: number;
								}[];
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
							};
						};
					};
					title: {
						runs: {
							text: string;
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
						}[];
					};
					stats: {
						runs?: {
							text: string;
						}[];
						simpleText?: string;
					}[];
					menu: {
						menuRenderer: {
							items: {
								menuNavigationItemRenderer: {
									text: {
										simpleText: string;
									};
									icon: {
										iconType: string;
									};
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
													title: {
														simpleText: string;
													};
													content: {
														simpleText: string;
													};
													button: {
														buttonRenderer: {
															style: string;
															size: string;
															isDisabled: boolean;
															text: {
																runs: {
																	text: string;
																}[];
															};
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
									defaultIcon: {
										iconType: string;
									};
									toggledIcon: {
										iconType: string;
									};
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
													title: {
														simpleText: string;
													};
													content: {
														simpleText: string;
													};
													button: {
														buttonRenderer: {
															style: string;
															size: string;
															isDisabled: boolean;
															text: {
																simpleText: string;
															};
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
									accessibilityData: {
										accessibilityData: {
											label: string;
										};
									};
									toggledAccessibilityData: {
										accessibilityData: {
											label: string;
										};
									};
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
									icon: {
										iconType: string;
									};
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
							accessibility: {
								accessibilityData: {
									label: string;
								};
							};
							targetId?: string;
						};
					};
					thumbnailOverlays: {
						thumbnailOverlaySidePanelRenderer: {
							text: {
								simpleText: string;
							};
							icon: {
								iconType: string;
							};
						};
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
							icon: {
								iconType: string;
							};
							style: string;
							label: string;
							trackingParams: string;
						};
					}[];
					description?: {};
					showMoreText: {
						runs: {
							text: string;
						}[];
					};
				};
				playlistSidebarSecondaryInfoRenderer?: {
					videoOwner: {
						videoOwnerRenderer: {
							thumbnail: {
								thumbnails: {
									url: string;
									width: number;
									height: number;
								}[];
							};
							title: {
								runs: {
									text: string;
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
								}[];
							};
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
							text: {
								runs: {
									text: string;
								}[];
							};
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
											title: {
												simpleText: string;
											};
											content: {
												simpleText: string;
											};
											button: {
												buttonRenderer: {
													style: string;
													size: string;
													isDisabled: boolean;
													text: {
														simpleText: string;
													};
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
			params: {
				key: string;
				value: string;
			}[];
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
			text: {
				simpleText: string;
			};
			dismissButton: {
				buttonRenderer: {
					style: string;
					size: string;
					isDisabled: boolean;
					icon: {
						iconType: string;
					};
					trackingParams: string;
					accessibilityData: {
						accessibilityData: {
							label: string;
						};
					};
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
			thumbnail: {
				thumbnails: {
					url: string;
					width: number;
					height: number;
				}[];
			};
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
					thumbnail: {
						thumbnails: {
							url: string;
							width: number;
							height: number;
						}[];
					};
					title: {
						runs: {
							text: string;
						}[];
						accessibility: {
							accessibilityData: {
								label: string;
							};
						};
					};
					index: {
						simpleText: string;
					};
					shortBylineText: {
						runs: {
							text: string;
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
						}[];
					};
					lengthText: {
						accessibility: {
							accessibilityData: {
								label: string;
							};
						};
						simpleText: string;
					};
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
									text: {
										runs: {
											text: string;
										}[];
									};
									icon: {
										iconType: string;
									};
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
													onCreateListCommand: {
														clickTrackingParams: string;
														commandMetadata: {
															webCommandMetadata: {
																sendPost: boolean;
																apiUrl: string;
															};
														};
														createPlaylistServiceEndpoint: {
															videoIds: string[];
															params: string;
														};
													};
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
							accessibility: {
								accessibilityData: {
									label: string;
								};
							};
						};
					};
					thumbnailOverlays: {
						thumbnailOverlayTimeStatusRenderer?: {
							text: {
								accessibility: {
									accessibilityData: {
										label: string;
									};
								};
								simpleText: string;
							};
							style: string;
						};
						thumbnailOverlayNowPlayingRenderer?: {
							text: {
								runs: {
									text: string;
								}[];
							};
						};
					}[];
					videoInfo: {
						runs: {
							text: string;
						}[];
					};
				};
				continuationItemRenderer?: {
					trigger: string;
					continuationEndpoint: {
						clickTrackingParams: string;
						commandMetadata: {
							webCommandMetadata: {
								sendPost: boolean;
								apiUrl: string;
							};
						};
						continuationCommand: {
							token: string;
							request: string;
						};
					};
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
							thumbnail: {
								thumbnails: {
									url: string;
									width: number;
									height: number;
								}[];
							};
							trackingParams: string;
						};
					};
					title: {
						runs: {
							text: string;
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
						}[];
					};
					stats: {
						runs?: {
							text: string;
						}[];
						simpleText?: string;
					}[];
					menu: {
						menuRenderer: {
							items: {
								menuNavigationItemRenderer: {
									text: {
										simpleText: string;
									};
									icon: {
										iconType: string;
									};
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
													title: {
														simpleText: string;
													};
													content: {
														simpleText: string;
													};
													button: {
														buttonRenderer: {
															style: string;
															size: string;
															isDisabled: boolean;
															text: {
																runs: {
																	text: string;
																}[];
															};
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
									defaultIcon: {
										iconType: string;
									};
									toggledIcon: {
										iconType: string;
									};
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
													title: {
														simpleText: string;
													};
													content: {
														simpleText: string;
													};
													button: {
														buttonRenderer: {
															style: string;
															size: string;
															isDisabled: boolean;
															text: {
																simpleText: string;
															};
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
									accessibilityData: {
										accessibilityData: {
											label: string;
										};
									};
									toggledAccessibilityData: {
										accessibilityData: {
											label: string;
										};
									};
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
									icon: {
										iconType: string;
									};
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
							accessibility: {
								accessibilityData: {
									label: string;
								};
							};
							targetId: string;
						};
					};
					thumbnailOverlays: {
						thumbnailOverlaySidePanelRenderer: {
							text: {
								simpleText: string;
							};
							icon: {
								iconType: string;
							};
						};
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
							icon: {
								iconType: string;
							};
							style: string;
							label: string;
							trackingParams: string;
						};
					}[];
					description: {};
					showMoreText: {
						runs: {
							text: string;
						}[];
					};
				};
				playlistSidebarSecondaryInfoRenderer?: {
					videoOwner: {
						videoOwnerRenderer: {
							thumbnail: {
								thumbnails: {
									url: string;
									width: number;
									height: number;
								}[];
							};
							title: {
								runs: {
									text: string;
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
								}[];
							};
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
							text: {
								runs: {
									text: string;
								}[];
							};
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
											title: {
												simpleText: string;
											};
											content: {
												simpleText: string;
											};
											button: {
												buttonRenderer: {
													style: string;
													size: string;
													isDisabled: boolean;
													text: {
														simpleText: string;
													};
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
	thumbnail: {
		thumbnails: {
			url: string;
			width: number;
			height: number;
		}[];
	};
	title: {
		runs: {
			text: string;
		}[];
		accessibility: {
			accessibilityData: {
				label: string;
			};
		};
	};
	index: {
		simpleText: string;
	};
	shortBylineText: {
		runs: {
			text: string;
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
		}[];
	};
	lengthText: {
		accessibility: {
			accessibilityData: {
				label: string;
			};
		};
		simpleText: string;
	};
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
					text: {
						runs: {
							text: string;
						}[];
					};
					icon: {
						iconType: string;
					};
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
									onCreateListCommand: {
										clickTrackingParams: string;
										commandMetadata: {
											webCommandMetadata: {
												sendPost: boolean;
												apiUrl: string;
											};
										};
										createPlaylistServiceEndpoint: {
											videoIds: string[];
											params: string;
										};
									};
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
			accessibility: {
				accessibilityData: {
					label: string;
				};
			};
		};
	};
	thumbnailOverlays: {
		thumbnailOverlayTimeStatusRenderer?: {
			text: {
				accessibility: {
					accessibilityData: {
						label: string;
					};
				};
				simpleText: string;
			};
			style: string;
		};
		thumbnailOverlayNowPlayingRenderer?: {
			text: {
				runs: {
					text: string;
				}[];
			};
		};
	}[];
	videoInfo: {
		runs: {
			text: string;
		}[];
	};
};