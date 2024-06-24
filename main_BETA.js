import { AudioPlayer, AudioPlayerStatus, AudioResource, StreamType, VoiceConnection, VoiceConnectionStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { AttachmentBuilder, ChannelType, ChatInputCommandInteraction, Client, Colors, EmbedBuilder, Events, Partials, PermissionFlagsBits, Routes, formatEmoji, parseEmoji } from "discord.js";
import { createWriteStream, readFileSync, rmSync, writeFileSync } from "fs";
import { Playlist, SearchResultType, Video, getPlaylist, getVideo, listSearchResults, getMusicSearchSuggestions } from "./innertube/index.js";
import { Duration } from "./innertube/utils.js";
import { spawn } from "child_process";
import * as Tracks from "./innertube/music/tracks.js";
import * as Albums from "./innertube/music/albums.js";
import ytdl from "ytdl-core";

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
    play(track) {
        this.nowPlaying = track;
        const stream = track.stream;
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
    playOrQueue(track) {
        if (this.nowPlaying === null) {
            // Nothing is playing
            this.play(track);
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
     */
    video;
    /**
     * Whether the track has been skipped
     */
    skipped;
    /**
     * The start time of track if it is currently playing
     * @type {?number}
     */
    startTime;
    // /**
    //  * The url of this track's file
    //  */
    // url;
    /**
     * The stream to read this track's audio from
     */
    stream;

    /**
     * Creates a new track representing the given video.
     * 
     * @param {Video} video The video which this track should represent
     */
    constructor(video) {
        this.video = video;
        this.startTime = null;
        this.skipped = false;
        // this.url = ((streams) => {
        //     // Find the highest bitrate audio stream
        //     var best;
        //     for (var stream of streams) {
        //         if (!best) {
        //             best = stream;
        //         } else if (stream.codec != "opus") {
        //             continue;
        //         } else if (stream.bitrateBps > best.bitrateBps) {
        //             best = stream;
        //         }
        //     }
        //     return new URL(best.url);
        // })(video.fileDetails.audioStreams);
        this.stream = ytdl(`https://www.youtube.com/watch?v=${video.id}`, { "quality": "highestaudio" });
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
function emojiToEmojiIdentifier(emoji) {
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
 */
function joinCommand(interaction) {
    var channel = interaction.options.getChannel("channel", false, [ChannelType.GuildVoice]);
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
        joinVoiceChannel({ channelId: channel.id, guildId: channel.guildId, adapterCreator: channel.guild.voiceAdapterCreator, selfDeaf: false });
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
 * Plays the audio of a YouTube video corresponding to the query in the specified voice channel.
 * 
 * @param {ChatInputCommandInteraction} interaction The interaction
 */
async function playCommand(interaction) {
    const query = interaction.options.getString("query", true);
    const channel = interaction.member.voice.channel;
    if (channel === null) {
        // Member is not in a voice channel
        return { content: "You must be in a voice channel to use this command.", ephemeral: true };
    } else if (channel != interaction.guild.members.me.voice.channel) {
        if (!interaction.guild.members.me.permissionsIn(channel).has(PermissionFlagsBits.Connect | PermissionFlagsBits.ViewChannel)) {
            return { content: "I do not have sufficient permissions to execute this command.\n**Required**:\n • `Connect`\n • `View Channel`", ephemeral: true };
        }
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
        let search = await listSearchResults(query, SearchResultType.VIDEO);
        // Check if there are 0 total results
        if (search.totalResults === 0) {
            return { content: "There were no results for your query.", ephemeral: true };
        }
        for (let attempts = 1; search.items.length === 0; attempts++) {
            if (attempts === 10) {
                return { content: "Something went wrong with your search.", ephemeral: true };
            }
            // If the items list is still empty, try again
            search = await listSearchResults(query, SearchResultType.VIDEO);
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
        content = player.playOrQueue(new Track(video)) ? "**Now playing:**" : "**Added to the queue:**";
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
 */
async function volumeCommand(interaction) {
    const percentage = interaction.options.getInteger("percentage", true);
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
        return "Nothing is playing";
    } else {
        return { content: "**Now playing:**", embeds: [createVideoEmbed(player.nowPlaying.video, player.nowPlaying.startTime)] };
    }
}

/**
 * Displays the Audio Streams for a specified YouTube video.
 * 
 * @param {ChatInputCommandInteraction} interaction The interaction
 */
async function streamsCommand(interaction) {
    const link = interaction.options.getString("link", true);
    const url = getUrl(link);
    if (url === null) {
        return { content: "That is not a valid URL.", ephemeral: true };
    }
    const videoId = extractVideoId(url);
    if (videoId === null) {
        // URL does not correspond to a YouTube video
        return { content: "That URL does not correspond to a YouTube video.", ephemeral: true };
    }
    await interaction.deferReply();
    const video = await getVideo(videoId);
    const embeds = [createVideoEmbed(video)];
    if (video === null || video.privacyStatus === "private" || video.ageRestricted) {
        await interaction.editReply({ content: "**Error getting audio streams:**", embeds: embeds });
        return null;
    }

    let i = 0;
    for (const audioStream of (await ytdl.getInfo(video.id)).formats.filter((format) => format.hasAudio && !format.hasVideo)) {
        if (i == 25)
            break;
        embeds.push(new EmbedBuilder()
            .setTitle("Audio Stream")
            .setURL(audioStream.url)
            .addFields(
                { name: "Codec", value: audioStream.audioCodec, inline: true },
                { name: "Bitrate", value: audioStream.audioBitrate.toString(), inline: true },
                { name: "Audio Channels", value: audioStream.audioChannels.toString(), inline: true },
                {
                    name: "Size", value: audioStream.contentLength < 1024 ? audioStream.contentLength.toFixed(2) + "B" :
                        audioStream.contentLength < 1024 * 1024 ? (audioStream.contentLength / 1024).toFixed(2) + "kB" :
                            (audioStream.contentLength / 1024 / 1024).toFixed(2) + "MB"
                })
            .setFooter({ text: "Expires " + new Date(Number(new URL(audioStream.url).searchParams.get("expire") * 1000)).toLocaleString() })
            .toJSON());
        i++;
    }
    await interaction.editReply({ content: "**Audio streams:**", embeds: embeds });
    return null;
}

/**
 * Download the video as an MP3.
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
async function downloadCommand(interaction) {
    const link = interaction.options.getString("link", true);
    const url = getUrl(link);
    var videoId;
    if (url !== null) {
        videoId = extractVideoId(url);
        if (videoId === null) {
            // URL does not correspond to a YouTube video
            return { content: "That URL does not correspond to a YouTube video.", ephemeral: true };
        }
    } else {
        return { content: "That is not a valid URL.", ephemeral: true };
    }
    interaction.deferReply();
    const video = await getVideo(videoId);
    if (video === null || video.privacyStatus === "private" || video.ageRestricted || video.id === undefined) {
        // Track cannot be played
        interaction.editReply({ content: "**Issue Getting Track:**", embeds: [createVideoEmbed(video)] });
        return null;
    }
    // const vidPath = await download(new Track(video).url, `${videoId}.webm`);
    const vidPath = `${videoId}.webm`;
    try {
        await new Promise((resolve, reject) => {
            const writeStream = createWriteStream(vidPath);
            writeStream.once("error", (e) => { reject(e) });
            writeStream.once("finish", () => { resolve() });
            ytdl(`https://www.youtube.com/watch?v=${video.id}`, { quality: "highestaudio" }).pipe(writeStream);
        })
    } catch (e) {
        interaction.editReply("Something went wrong.");
        return null;
    }
    const args = ["-i", vidPath]
    if (url.hostname.startsWith("music.")) {
        const track = await Tracks.get(video.id); // Fetch YouTube Music track info
        const artists = track.artists.map(artist => artist.title); // Map artists to only the title of the artists
        const playlist = await getPlaylist((await Albums.get(track.album.browseId)).playlistId); // Get the YouTube playlist associated with the album
        var pos;
        for (const listItem of await playlist.listItems()) { // Find the position of the track
            if (video.id == listItem.id) {
                pos = listItem.position;
                break;
            }
        }
        const channelTitle = playlist.channelTitle.replace(" • Album", ""); // Remove " • Album" from playlist channel title
        const albumArtists = channelTitle.split(", "); // Get list of artists
        var albumArtistsText = albumArtists[0];
        for (var i = 1; i < albumArtists.length; i++) { // Append additional artists
            if (i < albumArtists.length - 1) {
                albumArtistsText += ", " + albumArtists[i];
            } else {
                albumArtistsText += " & " + albumArtists[i];
            }
        }
        // Execute ffmpeg command to download it as an mp3
        args.push("-i", playlist.thumbnails.maxres.url, "-map", "0:0", "-map", "1:0", "-id3v2_version", '3', "-metadata:s:v", "title=Album cover", "-metadata:s:v", "comment=Cover (front)", "-metadata", `title=${track.title}`, "-metadata", `artist=${artists.join(";")}`, "-metadata", `album=${playlist.title.replace("Album - ", "")}`, "-metadata", `track=${pos}/${playlist.itemCount}`, "-metadata", `date=${track.year}`, "-metadata", `album_artist=${albumArtistsText}`);
    }
    const path = `${videoId}.mp3`;
    args.push(path);
    const proc = spawn("./node_modules/ffmpeg-static/ffmpeg.exe", args);
    proc.stderr.on("data", (chunk) => {
        if (String(chunk).trimEnd().endsWith("[y/N]")) {
            proc.stdin.write("y\n");
        }
    });
    await new Promise((resolve) => {
        proc.on("close", () => {
            rmSync(vidPath);
            resolve();
        })
    });
    interaction.editReply({ files: [new AttachmentBuilder(readFileSync(path)).setName(path)] });
    rmSync(path);
    return null;
}

/**
 * @param {ChatInputCommandInteraction} interaction 
 */
async function reactionRolesCommand(interaction) {
    const subcommand = interaction.options.getSubcommand();
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
    const emoji = interaction.options.getString("reaction") !== null ? parseEmoji(interaction.options.getString("reaction", true)) : null;
    switch (subcommand) {
        case "add":
            if (!emoji || emoji.id && !interaction.guild.emojis.cache.has(emoji.id)) {
                // Emoji is not unicode and does not exist in the guild or could not be parsed
                return { content: "Invalid `reaction`.", ephemeral: true };
            }
            // Get the role
            const role = interaction.options.getRole("role", true);
            if (REACTION_ROLES[interaction.guildId]?.[interaction.channelId]?.[message.id]?.[emojiToEmojiIdentifier(emoji)]) {
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
            createReactionRole(interaction.guildId, interaction.channelId, message.id, emojiToEmojiIdentifier(emoji), role.id);
            // Reaction role creation was successful
            return { content: "Reaction role successfully created.", ephemeral: true };
        case "remove":
            // Store emojis to remove bot's reactions for
            const emojis = [];
            if (emoji === null) {
                if (!REACTION_ROLES[interaction.guildId]?.[interaction.channelId]?.[message.id]) {
                    // No reaction roles on the specified message
                    return { content: "There are no reaction roles on that message.", ephemeral: true };
                }
                for (const key in REACTION_ROLES[interaction.guildId][interaction.channelId][message.id]) {
                    // Push emojis
                    emojis.push(parseEmoji(key));
                }
            } else {
                if (!REACTION_ROLES[interaction.guildId]?.[interaction.channelId]?.[message.id]?.[emojiToEmojiIdentifier(emoji)]) {
                    // Reaction role does not exist
                    return { content: "Reaction role does not exist.", ephemeral: true };
                }
                // Only one emoji to push
                emojis.push(emoji);
            }
            // Remove bot reaction's
            for (const e of emojis) {
                if (e !== null)
                    CLIENT.rest.delete(Routes.channelMessageOwnReaction(interaction.channelId, message.id, emojiToEmojiIdentifier(e)));
            }
            // Delete the reaction role
            deleteReactionRole(interaction.guildId, interaction.channelId, message.id, emoji ? emojiToEmojiIdentifier(emoji) : undefined);
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
                response = joinCommand(interaction);
                break;
            case "1069697352593584138":
                // Leave command
                response = await leaveCommand(interaction);
                break;
            case "1080503738264997908":
                // Play command
                response = await playCommand(interaction);
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
                response = await volumeCommand(interaction);
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
                response = await streamsCommand(interaction);
                break;
            case "1227503333971988520":
                // Download command
                response = await downloadCommand(interaction);
                break;
            case "1038664021987033229":
                // Reaction-Roles command
                response = await reactionRolesCommand(interaction);
                break;
            case "1038320425312198696":
                // Clear command
                break;
        }
        if (response) {
            await interaction.reply(response).catch(async () => {
                response.content = "*An error occurred whist trying to respond to the interaction in the channel. Make sure the bot has the proper permissions to respond.*\n\n" + response.content;
                await interaction.user.send(response).catch((e) => console.error(e))
            });
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

CLIENT.on(Events.VoiceStateUpdate, (oldState, newState) => {
    if (oldState.member.id == CLIENT.user.id && oldState.channelId !== null && newState.channelId === null) {
        // Bot left a voice channel
        var player = getPlayer(oldState.guild.id);
        if (player.nowPlaying !== null) {
            player.queue.splice(0, player.queue.length);
            player.nowPlaying = null;
            player.audioPlayer.stop();
        }
        player.voiceConnection = getVoiceConnection(oldState.guild.id);
        if (player.voiceConnection !== undefined) {
            player.voiceConnection.destroy();
        }
    }
});

CLIENT.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (user.bot) return;
    // Handle reaction roles
    const roleId = REACTION_ROLES[reaction.message.guildId]?.[reaction.message.channelId]?.[reaction.message.id]?.[emojiToEmojiIdentifier(reaction.emoji)];
    if (roleId && !(await reaction.message.guild.members.fetch(user.id)).roles.cache.has(roleId)) {
        await CLIENT.rest.put(Routes.guildMemberRole(reaction.message.guildId, user.id, roleId));
    }
});

CLIENT.on(Events.MessageReactionRemove, async (reaction, user) => {
    if (user.bot) return;
    // Handle reaction roles
    const roleId = REACTION_ROLES[reaction.message.guildId]?.[reaction.message.channelId]?.[reaction.message.id]?.[emojiToEmojiIdentifier(reaction.emoji)];
    if (roleId && (await reaction.message.guild.members.fetch(user.id)).roles.cache.has(roleId)) {
        await CLIENT.rest.delete(Routes.guildMemberRole(reaction.message.guildId, user.id, roleId));
    }
});

CLIENT.on(Events.MessageReactionRemoveEmoji, (reaction) => {
    if (REACTION_ROLES[reaction.message.guildId]?.[reaction.message.channelId]?.[reaction.message.id]?.[emojiToEmojiIdentifier(reaction.emoji)]) {
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
    if (guild.id in REACTION_ROLES) {
        deleteReactionRole(guild.id);
    }
});

// Code

await CLIENT.login(process.env.TOKEN);