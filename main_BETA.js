import { AudioPlayer, AudioPlayerStatus, AudioResource, StreamType, VoiceConnection, VoiceConnectionStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { ChannelType, ChatInputCommandInteraction, Client, Colors, CommandInteraction, EmbedBuilder, Events, Partials, PermissionFlagsBits, Routes, VoiceChannel, formatEmoji, parseEmoji } from "discord.js";
import { readFileSync, writeFileSync } from "fs";
import { Readable } from "stream";
import { Playlist, SearchResultTypes, Video, getPlaylist, getVideo, listSearchResults } from "./innertube/index.js";
import { Duration } from "./innertube/utils.js";
import { getMusicSearchSuggestions } from "./innertube/videos.js";

// Global Constants

process.env.TOKEN = JSON.parse(readFileSync("./env_TEST.json")).TOKEN;
const CLIENT = new Client({
    intents: [((1 << 17) - 1) | (1 << 20) | (1 << 21)],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});
/**
 * @type {{[guildId:string]:{audioPlayer:AudioPlayer;voiceConnection:VoiceConnection;}}}
 */
const PLAYERS = {};
/**
 * @type {{[guildId:string]:{[channelId:string]:{[messageId:string]:{[emoji:string]:string}}}}}
 */
const REACTION_ROLES = JSON.parse(readFileSync("./reactionRoles.json"));

// Audio

/**
 * Represents an audio player and it associated queue and properties for a particular guild.
 */
class Player {
    /**
     * The audio player this player uses to play audio
     * @type {AudioPlayer}
     */
    audioPlayer;
    /**
     * The voice connection which audio should play to
     * @type {VoiceConnection | undefined}
     */
    voiceConnection;
    /**
     * The subscription represting this player's voice connection's subscription to this player's audio player
     * @type {PlayerSubscription | undefined}
     */
    playerSubscription;
    /**
     * The currently playing track if there is one
     * @type {Track | null}
     */
    nowPlaying;
    /**
     * The audio resource of the currently playing track
     * @type {AudioResource<null> | null}
     */
    audioResource;
    /**
     * An array of tracks represting the queue
     * @type {Track[]}
     */
    queue;
    /**
     * Whether the now playing track should be looped
     * @type {boolean}
     */
    loop;
    /**
     * The volume percentage
     * @type {number}
     */
    volume;

    /**
     * Creates a new player for the given guild ID.
     * 
     * @param {string} guildId The guild ID for which the player should be created
     */
    constructor(guildId) {
        this.audioPlayer = createAudioPlayer();
        this.audioPlayer.once(AudioPlayerStatus.Playing, () => {
            this.voiceConnection = getVoiceConnection(guildId);
            this.playerSubscription = this.voiceConnection.subscribe(this.audioPlayer);
        });
        this.nowPlaying = null;
        this.audioResource = null;
        this.queue = [];
        this.loop = false;
        this.volume = 1;
        this.audioPlayer.on(AudioPlayerStatus.Idle, async () => {
            if (this.nowPlaying !== null) {
                // Something is playing
                if (this.nowPlaying.skipped || !this.loop) {
                    // Current track was skipped or is over
                    if (this.queue.length > 0) {
                        // Play next track in the queue
                        this.nowPlaying = null;
                        await this.play(this.queue.shift());
                    } else {
                        // Queue is finished
                        this.nowPlaying = null;
                    }
                } else {
                    // Current track is being looped
                    await this.play(this.nowPlaying);
                }
            }
        });
        this.audioPlayer.on("error", (error) => {
            console.error(error);
            console.log(`The player has terminated unexpectedly. The track ${this.nowPlaying.video.title} has been skipped.`);
            this.skip();
        });
    }

    /**
     * Plays the given track in this player.
     * 
     * @param {Track} track The track to play
     */
    async play(track) {
        this.nowPlaying = track;
        // Since the audio url can theoretically expire if it's been queued for a few hours, refresh it if so
        if (Date.now() / 1000 > new URL(track.url).searchParams.get("expire")) {
            this.nowPlaying = new Track(await getVideo(track.video.id));
        }
        const stream = Readable.fromWeb((await fetch(await track.url)).body);
        // Bot needs to retry network requests that fail, not yet implemented because I can't find a nice way to do it :(
        this.audioResource = createAudioResource(stream, { inlineVolume: true, inputType: StreamType.WebmOpus });
        this.audioResource.volume.setVolume(this.volume);
        this.audioPlayer.play(this.audioResource);
        this.nowPlaying.startTime = Date.now();
    }

    /**
     * Plays or queues the given track depending on whether `nowPlaying` is null or not.
     * 
     * @param {Track} track The track
     * @returns `true` if the track is played immediately, otherwise `false`
     */
    async playOrQueue(track) {
        if (this.nowPlaying === null) {
            // Nothing is playing
            await this.play(track);
            return true;
        } else {
            // Add the track to the queue
            this.queue.push(track);
            return false;
        }
    }

    pause() {
        return this.audioPlayer.pause();
    }

    resume() {
        return this.audioPlayer.unpause();
    }

    /**
     * Skips the currently playing track if there is one.
     * 
     * @returns `true` if the track was successfully skipped, otherwise `false`
     */
    skip() {
        if (this.nowPlaying) {
            this.nowPlaying.skipped = true;
            this.resume();
            return this.audioPlayer.stop();
        } else {
            return false;
        }
    }

    /**
     * Set the volume percentage
     * @param {number} volume the new volume
     */
    setVolume(volume) {
        this.volume = volume;
        if (this.audioResource) {
            this.audioResource.volume.setVolume(volume);
        }
    }
}

/**
 * Represents a YouTube video's audio as a track which can played by a player
 */
class Track {
    /**
     * The video which the track corrresponds to
     * @type {Video}
     */
    video;
    /**
     * Whether the track has been skipped
     * @type {boolean}
     */
    skipped;
    /**
     * The start time of track if it is currently playing
     * @type {?number}
     */
    startTime;
    /**
     * The url of this track's file
     * @type {Promise<URL>}
     */
    url;

    /**
     * Creates a new track representing the given video.
     * 
     * @param {Video} video The video which this track should represent
     */
    constructor(video) {
        this.video = video;
        this.startTime = null;
        this.skipped = false;
        this.url = ((streams) => {
            // Find the highest bitrate audio stream
            var best;
            for (var stream of streams) {
                if (!best) {
                    best = stream;
                } else if (stream.codec != "opus") {
                    continue;
                } else if (stream.bitrateBps > best.bitrateBps) {
                    best = stream;
                }
            }
            return best.url;
        })(video.fileDetails.audioStreams);
    }
}

/**
 * Gets the player for the specified guild ID. If one does not yet exists, creates one.
 * 
 * @param {string} guildId The guild ID to get the player of
 * @returns {Player} The player for the specified guild ID
 */
function getPlayer(guildId) {
    if (PLAYERS[guildId] === undefined) {
        PLAYERS[guildId] = new Player(guildId);
    }
    return PLAYERS[guildId];
}

// Reaction Roles

/**
 * Get the emoji identifier for the specified emoji.
 * @param {{animated: boolean;name: string;id: string | null;}} emoji The emoji
 */
function getEmojiIdentifier(emoji) {
    if (!emoji.id) {
        // emoji is unicode
        return encodeURIComponent(emoji.name);
    } else {
        // emoji is custom
        const format = formatEmoji(emoji.id, emoji.animated).substring(1);
        return format.substring(format.startsWith(":") ? 1 : 0, format.length - 1);
    }
}

/**
 * Deletes the specified reaction role or part of the reaction role.
 * @param {string} guildId The guild ID
 * @param {string | undefined} channelId The channel ID
 * @param {string | undefined} messageId The message ID
 * @param {string | undefined} emoji The emoji identifier
 */
function deleteReactionRole(guildId, channelId, messageId, emoji) {
    if (emoji) {
        delete REACTION_ROLES[guildId][channelId][messageId][emoji];
        if (Object.keys(REACTION_ROLES[guildId][channelId][messageId]).length === 0) {
            deleteReactionRole(guildId, channelId, messageId);
        }
    } else if (messageId) {
        delete REACTION_ROLES[guildId][channelId][messageId];
        if (Object.keys(REACTION_ROLES[guildId][channelId]).length === 0) {
            deleteReactionRole(guildId, channelId);
        }
    } else if (channelId) {
        delete REACTION_ROLES[guildId][channelId];
        if (Object.keys(REACTION_ROLES[guildId]).length === 0) {
            deleteReactionRole(guildId);
        }
    } else {
        delete REACTION_ROLES[guildId];
    }
    writeFileSync("./reactionRoles.json", JSON.stringify(REACTION_ROLES));
}

/**
 * Adds the specified reaction role to the `REACTION_ROLES` object and saves it to the cache.
 * @param {string} guildId The guild ID
 * @param {string} channelId The channel ID
 * @param {string} messageId The message ID
 * @param {string} emoji The emoji identifier
 * @param {string} roleId The role ID
 */
function createReactionRole(guildId, channelId, messageId, emoji, roleId) {
    if (!REACTION_ROLES[guildId]) {
        REACTION_ROLES[guildId] = {};
    }
    if (!REACTION_ROLES[guildId][channelId]) {
        REACTION_ROLES[guildId][channelId] = {};
    }
    if (!REACTION_ROLES[guildId][channelId][messageId]) {
        REACTION_ROLES[guildId][channelId][messageId] = {};
    }
    REACTION_ROLES[guildId][channelId][messageId][emoji] = roleId;
    writeFileSync("./reactionRoles.json", JSON.stringify(REACTION_ROLES));
}

// Utility Functions

/**
 * Returns a parsed URL object for the given string only if the given string is a valid URL.
 * 
 * @param {string} s The string to parse
 * @returns The URL object for given string if it is a valid URL, otherwise `null`.
 */
function getUrl(s) {
    if (/^[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(s) && !s.startsWith("http")) {
        // String is (probably) a valid URL without a protocol
        s = "https://" + s;
    }
    if (URL.canParse(s) && /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(s)) {
        // String is a valid URL
        return new URL(s);
    } else {
        // String is not a valid URL
        return null;
    }
}

/**
 * Extracts the video ID from a YouTube video URL and returns it.
 * 
 * @param {URL} url A YouTube video URL.
 * @returns The video ID if the url is valid, otherwise `null`.
 */
function extractVideoId(url) {
    if (/^https?:\/\/((www|music)\.)?youtube\.com\/watch\?[A-Za-z0-9-._~&=]+$/.test(url.toString())) {
        // URL is a regular video link
        return url.searchParams.get("v");
    } else if (/^https?:\/\/(youtu\.be|(www\.)?youtube\.com\/shorts)\/[A-Za-z0-9_-]{11}(\?[A-Za-z0-9-._~&=]+)?$/.test(url.toString())) {
        // URL is a short link or YouTube short
        return url.pathname.substring(url.pathname.lastIndexOf("/") + 1);
    } else {
        // URL is not a YouTube video link
        return null;
    }
}

/**
 * Extracts the playlist ID from a YouTube playlist URL and returns it.
 * 
 * @param {URL} url A YouTube playlist URL.
 * @returns The playlist ID if the url is valid, otherwise `null`.
 */
function extractPlaylistId(url) {
    if (/^https?:\/\/((www|music)\.)?youtube\.com\/playlist\?[A-Za-z0-9-._~&=]+$/.test(url.toString())) {
        // URL is a YouTube playlist link
        return url.searchParams.get("list");
    } else {
        // URL does not correspond to a YouTube playlist
        return null;
    }
}

/**
 * Creates an embed for the specified video object
 * 
 * @param {Video} video A YouTube video object for which to create an embed
 * @param {number | undefined} startTime The at which the video started playing
 * @returns An embed representing the video object
 */
function createVideoEmbed(video, startTime) {
    const eb = new EmbedBuilder();
    if (!video.id) {
        // Video is unavailable error
        eb
            .setColor(Colors.Red)
            .setTitle("Unavailable Video")
            .setDescription("The video is unavailable.");
    } else if (video.privacyStatus === "private") {
        // Video is private error
        eb
            .setColor(Colors.Red)
            .setTitle("Private Video")
            .setDescription("The video is private.");
    } else {
        if (video.ageRestricted) {
            // Video is age restricted error, but we can still display the video info
            eb
                .setColor(Colors.Red)
                .setDescription("The video is age restricted.");
        }
        // Video is playable
        eb
            .setTitle(video.title)
            .setURL("https://www.youtube.com/watch?v=" + video.id)
            .setAuthor({ name: video.channelTitle, url: "https://www.youtube.com/channel/" + video.channelId })
            .setThumbnail(video.thumbnails.maxres.url)
            .addFields({ name: "Duration", value: (startTime ? new Duration(Math.floor((Date.now() - startTime) / 1000)).format() + "/" : "") + new Duration(video.duration.total).format() });
    }
    return eb.data;
}

/**
 * Creates an embed for the specified playlist object
 * 
 * @param {Playlist} playlist A YouTube playlist object for which to create an embed
 * @returns An embed representing the playlist object
 */
function createPlaylistEmbed(playlist) {
    return new EmbedBuilder()
        .setTitle(playlist.title)
        .setURL("https://www.youtube.com/playlist?list=" + playlist.id)
        .setAuthor({ name: playlist.channelTitle, url: playlist.channelId ? "https://www.youtube.com/channel/" + playlist.channelId : undefined })
        .setThumbnail(playlist.thumbnails.maxres.url).data;
}

// Commands

/**
 * Plays or queues every playable track in a playlist to the player for the given interaction's guild ID
 * 
 * @param {ChatInputCommandInteraction} interaction The interaction
 * @param {string} listId The list ID of the YouTube playlist to play.
 */
async function playPlaylist(interaction, listId) {
    const playlist = await getPlaylist(listId);
    if (playlist === null) {
        return { content: "That is not a valid YouTube playlist link.", ephemeral: true };
    };
    const player = getPlayer(interaction.guildId);
    // Defer reply to show "thinking"
    interaction.deferReply();
    var total = 0;
    for (const listItem of await playlist.listItems()) {
        const video = await getVideo(listItem.id);
        if (video === null || video.privacyStatus === "private") {
            // Video is private or unavailable
            continue;
        } else if (video.ageRestricted) {
            // Video is age restricted
            continue;
        }
        const track = new Track(video);
        await player.playOrQueue(track);
        total++;
    }
    // Edit deferred reply
    interaction.editReply({ content: "**Added " + total + " tracks to the queue:**", embeds: [createPlaylistEmbed(playlist)] });
    return null;
}

/**
 * Makes the bot join the voice channel of the member of the command, or the specified voice channel.
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @param {VoiceChannel | null} channel 
 */
async function joinCommand(interaction, channel) {
    if (channel === null) {
        // Channel was not provided
        channel = interaction.member.voice.channel
        if (channel === null) {
            // Member is not in a voice channel
            return { content: "You are not in a voice channel.", ephemeral: true };
        }
    }
    if (channel !== channel.guild.members.me.voice.channel) {
        // Bot is not connected to member's voice channel
        if (!channel.guild.members.me.permissionsIn(channel).has(PermissionFlagsBits.Connect | PermissionFlagsBits.ViewChannel)) {
            return { content: "I do not have sufficient permissions to execute this command.\n**Required**:\n • `Connect`\n • `View Channel`", ephemeral: true };
        }
        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false
        });
        return { content: `Connected to <#${channel.id}>.`, ephemeral: true };
    } else {
        return { content: `I am already connected to <#${channel.id}>.`, ephemeral: true };
    }
}

/**
 * Makes the bot leave it's current channel.
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function leaveCommand(interaction) {
    const vc = getVoiceConnection(interaction.guildId);
    if (vc !== undefined && vc.state.status !== VoiceConnectionStatus.Disconnected) {
        const channel = interaction.guild.members.me.voice.channel;
        vc.disconnect();
        return { content: `Disconnected from <#${channel.id}>.`, ephemeral: true }
    } else {
        return { content: `I am not connected to a voice channel.`, ephemeral: true };
    }
}

/**
 * Plays the audio of a YouTube corresponding to the query in the specified voice channel.
 * 
 * @param {ChatInputCommandInteraction} interaction The interaction
 * @param {string} query YouTube video or playlist URL or search query
 */
async function playCommand(interaction, query) {
    if (interaction.member.voice.channel === null) {
        // Member is not in a voice channel
        return { content: "You are not in a voice channel.", ephemeral: true };
    } else if (interaction.member.voice.channel != interaction.guild.members.me.voice.channel) {
        // Bot is not connected to member's voice channel
        joinVoiceChannel({
            channelId: interaction.member.voice.channelId,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
            selfDeaf: false
        });
    }
    var videoId;
    const url = getUrl(query);
    if (url !== null) {
        // Query is a URL
        videoId = extractVideoId(url);
        if (videoId === null) {
            // URL does not correspond to a YouTube video, try it as a playlist
            const listId = extractPlaylistId(url);
            if (listId !== null) {
                // URL corresponds to a playlist
                return await playPlaylist(interaction, listId);
            }
            // URL does not correspond to a YouTube video or playlist
            return { content: "That URL does not correspond to a YouTube video or playlist.", ephemeral: true };
        }
    } else {
        // Query is a search query
        var search = await listSearchResults(query, SearchResultTypes.VIDEO);
        // Check if there are 0 total results
        if (search.totalResults === 0) {
            return { content: "There were no results for your query.", ephemeral: true };
        }
        var attempts = 1;
        while (search.items.length === 0) {
            if (attempts === 10) {
                return { content: "Something went wrong with your search.", ephemeral: true };
            }
            // If the items list is still empty, try again
            search = await listSearchResults(query, SearchResultTypes.VIDEO);
            attempts++;
        }
        videoId = search.items[0].id.videoId;
    }
    const video = await getVideo(videoId);
    const player = getPlayer(interaction.guildId);
    var content;
    if (video === null || video.privacyStatus === "private" || video.ageRestricted) {
        // Track cannot be played
        content = "**Issue Playing Track:**";
    } else {
        content = await player.playOrQueue(new Track(video)) ? "**Now playing:**" : "**Added to the queue:**";
    }
    return { content: content, embeds: [createVideoEmbed(video)] };
}

/**
 * Pauses the currently playing track.
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
function pauseCommand(interaction) {
    const player = getPlayer(interaction.guildId);
    if (player.nowPlaying === null) {
        return "Nothing is playing";
    }
    return player.pause() ? "Audio paused." : "The player is already paused.";
}

/**
 * Resumes the currently playing audio track.
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @returns 
 */
function resumeCommand(interaction) {
    const player = getPlayer(interaction.guildId);
    if (player.nowPlaying === null) {
        return "Nothing is playing";
    }
    return player.resume() ? "Audio resumed." : "The player is not paused.";
}

/**
 * Skips the currently playing audio track
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function skipCommand(interaction) {
    const player = getPlayer(interaction.guildId);
    if (player.nowPlaying === null) {
        return "Nothing is playing";
    } else {
        const track = player.nowPlaying;
        player.skip();
        return { content: "**Skipped:**", embeds: [createVideoEmbed(track.video)] };
    }
}

/**
 * Set the volume of the player
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @param {number} percentage 
 */
async function volumeCommand(interaction, percentage) {
    const player = getPlayer(interaction.guildId);
    player.setVolume(percentage / 100);
    return `Volume set to ${percentage}%.`;
}

/**
 * Displays the currently playing audio track
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function nowPlayingCommand(interaction) {
    const player = getPlayer(interaction.guildId);
    if (player.nowPlaying === null) {
        return interaction.reply("Nothing is playing");
    } else {
        return interaction.reply({ content: "**Now playing:**", embeds: [createVideoEmbed(player.nowPlaying.video, player.nowPlaying.startTime)] });
    }
}

/**
 * Displays the Audio Streams for a specified YouTube video.
 * 
 * @param {CommandInteraction} interaction The interaction
 * @param {string} link A link to a YouTube video
 */
async function streamsCommand(interaction, link) {
    const url = getUrl(link);
    if (url === null) {
        return "That is not a valid URL.";
    }
    const videoId = extractVideoId(url);
    if (videoId === null) {
        // URL does not correspond to a YouTube video
        return "That URL does not correspond to a YouTube video.";
    }
    interaction.deferReply();
    const video = await getVideo(videoId);
    const embeds = [createVideoEmbed(video)];
    if (video === null || video.privacyStatus === "private" || video.ageRestricted) {
        interaction.editReply({ content: "**Error getting audio streams:**", embeds: embeds });
        return null;
    }
    for (const audioStream of video.fileDetails.audioStreams) {
        embeds.push(new EmbedBuilder()
            .setTitle("Audio Stream")
            .setURL(audioStream.url)
            .addFields(
                { name: "Codec", value: audioStream.codec, inline: true },
                { name: "Bitrate", value: audioStream.bitrateBps.toString(), inline: true },
                { name: "Audio Channels", value: audioStream.channelCount.toString(), inline: true },
                {
                    name: "Size", value: audioStream.contentLength < 1024 ? audioStream.contentLength.toFixed(2) + "B" :
                        audioStream.contentLength < 1024 * 1024 ? (audioStream.contentLength / 1024).toFixed(2) + "kB" :
                            (audioStream.contentLength / 1024 / 1024).toFixed(2) + "MB"
                })
            .setFooter({ text: "Expires " + new Date(Number(new URL(audioStream.url).searchParams.get("expire") * 1000)).toLocaleString() })
            .data);
    }
    interaction.editReply({ content: "**Audio streams:**", embeds: embeds });
    return null;
}

/**
 * @param {ChatInputCommandInteraction} interaction 
 * @param {"add" | "remove"} subcommand 
 */
async function reactionRolesCommand(interaction, subcommand) {
    if (subcommand === "add" && !interaction.guild.members.me.permissionsIn(interaction.channel).has(PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ReadMessageHistory | PermissionFlagsBits.AddReactions)) {
        // Bot does not possess enough permissions for add
        return { content: "I do not have sufficient permissions to execute this command.\n**Required**:\n • `Manage Roles`\n • `Read Message History`\n • `Add Reactions`", ephemeral: true };
    }
    // Fetch the message
    const message = await interaction.channel.messages.fetch(interaction.options.getString("message-id", true)).catch(() => null);
    if (!message) {
        // Message fetch threw an error
        return { content: "Invalid `message-id`.", ephemeral: true };
    }
    // Parse emoji
    const emoji = interaction.options.getString("reaction") ? parseEmoji(interaction.options.getString("reaction")) : undefined;
    switch (subcommand) {
        case "add":
            if (!emoji || emoji.id && !interaction.guild.emojis.cache.has(emoji.id)) {
                // Emoji is not unicode and does not exist in the guild or could not be parsed
                return { content: "Invalid `reaction`.", ephemeral: true };
            }
            // Get the role
            const role = interaction.options.getRole("role", true);
            if (REACTION_ROLES[interaction.guildId]?.[interaction.channelId]?.[message.id]?.[getEmojiIdentifier(emoji)]) {
                // Reaction role already exists
                return { content: "Reaction role already exists.", ephemeral: true };
            }
            if (role.managed) {
                // Role is managed
                return { content: "That role is managed by an integration.", ephemeral: true };
            }
            if (role.position >= interaction.member.roles.highest.position && interaction.member.id !== interaction.guild.ownerId) {
                // Role is higher than member's highest role
                return { content: "You are not high enough in the role heirarchy to add that role.", ephemeral: true };
            }
            if (role.position >= interaction.guild.members.me.roles.highest.position) {
                // Role is higher than bot's highest role
                return { content: "I am not high enough in the role heirarchy to add that role.", ephemeral: true };
            }
            // React to the message
            const reaction = await message.react(emoji).catch(() => null);
            if (!reaction) {
                // Reacting to the message threw an error
                return { content: "Something went wrong.", ephemeral: true };
            }
            // Create the actual reaction role
            createReactionRole(interaction.guildId, interaction.channelId, message.id, getEmojiIdentifier(emoji), role.id);
            // Reaction role creation was successful
            return { content: "Reaction role successfully created.", ephemeral: true };
        case "remove":
            // Store emojis to remove bot's reactions for
            const emojis = [];
            if (!emoji) {
                if (!REACTION_ROLES[interaction.guildId]?.[interaction.channelId]?.[message.id]) {
                    // No reaction roles on the specified message
                    return { content: "There are no reaction roles on that message.", ephemeral: true };
                }
                for (const key of Object.keys(REACTION_ROLES[interaction.guildId][interaction.channelId][message.id])) {
                    // Push emojis
                    emojis.push(parseEmoji(key));
                }
            } else {
                if (emoji && !REACTION_ROLES[interaction.guildId]?.[interaction.channelId]?.[message.id]?.[getEmojiIdentifier(emoji)]) {
                    // Reaction role does not exist
                    return { content: "Reaction role does not exist.", ephemeral: true };
                }
                // Only one emoji to push
                emojis.push(emoji);
            }
            // Remove bot reaction's
            for (const e of emojis) {
                CLIENT.rest.delete(Routes.channelMessageOwnReaction(interaction.channelId, message.id, getEmojiIdentifier(e))).catch(/* catch errors */);
            }
            // Delete the reaction role
            deleteReactionRole(interaction.guildId, interaction.channelId, message.id, emoji ? getEmojiIdentifier(emoji) : undefined);
            // Reaction role deletion was successful
            return { content: `Reaction role${emojis.length > 1 ? "s" : ""} successfully removed.`, ephemeral: true };
    }
}

// Events

CLIENT.once(Events.ClientReady, async (client) => {
    console.log("Logged in as " + client.user.tag);
    // Reestablish connection to any voice channels bot was in before launching
    for (var guild of client.guilds.cache.values()) {
        var channelId = (await guild.members.fetch(client.user.id)).voice.channelId;
        if (channelId) {
            joinVoiceChannel({
                channelId: channelId,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: false
            });
        }
    }
});

CLIENT.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
        // Interaction is an application command
        var response;
        switch (interaction.commandId) {
            case "1069696259042050132":
                // Join command
                response = await joinCommand(interaction, interaction.options.getChannel("channel", false, [ChannelType.GuildVoice]));
                break;
            case "1069697352593584138":
                // Leave command
                response = await leaveCommand(interaction);
                break;
            case "1080503738264997908":
                // Play command
                response = await playCommand(interaction, interaction.options.getString("query", true));
                break;
            case "1168907698163679383":
                // Pause command
                response = pauseCommand(interaction);
                break;
            case "1168907890891964548":
                response = resumeCommand(interaction);
                // Resume command
                break;
            case "1153327771460829184":
                // Skip command
                response = await skipCommand(interaction);
                break;
            case "STOP_PLACEHOLDER":
                // Stop command
                break;
            case "1163880754133090357":
                // Volume command
                response = await volumeCommand(interaction, interaction.options.getInteger("percentage", true));
                break;
            case "1153333937746227313":
                // Now-Playing command
                response = await nowPlayingCommand(interaction)
                break;
            case "QUEUE_PLACEHOLDER":
                // Queue command
                break;
            case "1153099855732940950":
                // Streams command
                response = await streamsCommand(interaction, interaction.options.getString("link", true));
                break;
            case "1038664021987033229":
                // Reaction-Roles command
                response = await reactionRolesCommand(interaction, interaction.options.getSubcommand(true));
                break;
            case "1038320425312198696":
                // Clear command
                break;
        }
        if (response) {
            await interaction.reply(response).catch(async () => await interaction.user.send(response).catch((e) => console.error(e)));
        }
    }
    if (interaction.isAutocomplete()) {
        // Interaction is autocomplete
        const query = interaction.options.getString("query", true);
        const suggestions = await getMusicSearchSuggestions(query);
        const options = suggestions.map((value) => ({ name: value, value: value }));
        interaction.respond(options);
    }
})

CLIENT.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (user.bot) return;
    // Handle reaction roles
    const roleId = REACTION_ROLES[reaction.message.guildId]?.[reaction.message.channelId]?.[reaction.message.id]?.[reaction.emoji.identifier];
    if (roleId && !(await reaction.message.guild.members.fetch(user.id)).roles.cache.has(roleId)) {
        await CLIENT.rest.put(Routes.guildMemberRole(reaction.message.guildId, user.id, roleId));
    }
});

CLIENT.on(Events.MessageReactionRemove, async (reaction, user) => {
    if (user.bot) return;
    // Handle reaction roles
    const roleId = REACTION_ROLES[reaction.message.guildId]?.[reaction.message.channelId]?.[reaction.message.id]?.[reaction.emoji.identifier];
    if (roleId && (await reaction.message.guild.members.fetch(user.id)).roles.cache.has(roleId)) {
        await CLIENT.rest.delete(Routes.guildMemberRole(reaction.message.guildId, user.id, roleId));
    }
});

CLIENT.on(Events.MessageReactionRemoveEmoji, (reaction) => {
    if (REACTION_ROLES[reaction.message.guildId]?.[reaction.message.channelId]?.[reaction.message.id]?.[reaction.emoji.identifier]) {
        deleteReactionRole(reaction.message.guildId, reaction.message.channelId, reaction.message.id, reaction.emoji.identifier)
    };
})

CLIENT.on(Events.MessageReactionRemoveAll, (message) => {
    if (REACTION_ROLES[message.guildId]?.[message.channelId]?.[message.id]) {
        deleteReactionRole(message.guildId, message.channelId, message.id);
    }
})

CLIENT.on(Events.MessageDelete, (message) => {
    if (REACTION_ROLES[message.guildId]?.[message.channelId]?.[message.id]) {
        deleteReactionRole(message.guildId, message.channelId, message.id);
    }
});

CLIENT.on(Events.ChannelDelete, (channel) => {
    if (REACTION_ROLES[channel.guildId]?.[channel.id]) {
        deleteReactionRole(channel.guildId, channel.id);
    }
});

CLIENT.on(Events.GuildDelete, (guild) => {
    if (REACTION_ROLES[guild.id]) {
        deleteReactionRole(guild.id);
    }
});

// Code

await CLIENT.login(process.env.TOKEN);
