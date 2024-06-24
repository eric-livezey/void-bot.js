import { VoiceConnectionStatus, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { ChannelType, Client, EmbedBuilder, Events, Guild, GuildMember, Message, MessageFlags, Partials, PermissionsBitField } from "discord.js";
import { readFileSync } from "fs";
import { now } from "./innertube/utils.js";
import { SearchResultType, getPlaylist, listSearchResults } from "./innertube/index.js";
import { evaluate } from "./math.js";
import { Player, Track, getPlayer } from "./player.js";
import ytdl from "ytdl-core";
import { formatDuration, formatDurationMillis } from "./utils.js";

process.env.TOKEN = JSON.parse(readFileSync("./env.json")).TOKEN;

// Global Variables
const PREFIX = ".";

const CLIENT = new Client({
    intents: [((1 << 17) - 1) | (1 << 20) | (1 << 21)],
    partials: [Partials.Channel]
});

const YT_HEADERS = {
    "Cookie": "GPS=1; YSC=Y3luw7uGfnI; VISITOR_INFO1_LIVE=EIHHCh_n-Mg; VISITOR_PRIVACY_METADATA=CgJVUxIEGgAgLQ%3D%3D; __Secure-1PSIDTS=sidts-CjIB3EgAEuWdW0K8-m8ocDVBqFzJVn3_C4kD96JG4ZBbd5UN9YUHOvE2vKHCFp8vq3SZ6RAA; __Secure-3PSIDTS=sidts-CjIB3EgAEuWdW0K8-m8ocDVBqFzJVn3_C4kD96JG4ZBbd5UN9YUHOvE2vKHCFp8vq3SZ6RAA; HSID=AJLEpxUldX71qbVjH; SSID=A0MemZy_gtUcTRpnF; APISID=Q3cCxcDtRgnSpVRr/Aqy84vpwhj8P3LWE4; SAPISID=pSNQt0Sl9i_V19Ol/Aa2Fv41svPWXmE6HD; __Secure-1PAPISID=pSNQt0Sl9i_V19Ol/Aa2Fv41svPWXmE6HD; __Secure-3PAPISID=pSNQt0Sl9i_V19Ol/Aa2Fv41svPWXmE6HD; SID=g.a000lAhh8j9D68nuneCVUsr7HFG0JB9vPioCtldU5IIzovSjtq5Asvzd4bLYxSTKIBtoI7eklQACgYKAQMSARMSFQHGX2MivO84D2nurf58rTfsXoIlNRoVAUF8yKolpR30KTxoDElSliQnaTsQ0076; __Secure-1PSID=g.a000lAhh8j9D68nuneCVUsr7HFG0JB9vPioCtldU5IIzovSjtq5AH1wyu22vqio3vgunUz7HvQACgYKAUQSARMSFQHGX2MiqoBXZ4nFc4JgHzCwI419-hoVAUF8yKq40ueyB4tF4AWcsPyEdd9K0076; __Secure-3PSID=g.a000lAhh8j9D68nuneCVUsr7HFG0JB9vPioCtldU5IIzovSjtq5AZaxYFGRVqUYqPP2SJociiQACgYKAakSARMSFQHGX2MiKfhH3C4_JnwNg7Mmc0P3PBoVAUF8yKq0Cj7cyQLk9_EZtGjbMgkO0076; LOGIN_INFO=AFmmF2swRQIhAPHvsI2dhvUBVVp5ptvKcMLxD3l-J2T55oF_wXnyTkGvAiBddnJp_yiI3zSkQsT9trh8b4zqaI55Xvx8sp6HNdi7Bw:QUQ3MjNmeWtDc2ZSLWJyVlNUQlNSR19mQng1OWRiWngzZHE0d2FlWnltMllTbi01bzNWcDlSV0hhcGNhaUhrMUp2Ul9HNkw4WXB5dVlFcW9GbENkekhlYVpqZTVmZUd2N2JIcTI5X3JzY1hNVHA4Q1NHal9QZWdGekFWOUgzWWRrMWpZMVk4MDlOSVZ4QXNrZHVVTEFnUDFwcWdfN2stcWdB; PREF=tz=America.New_York&f5=30000&f7=100; SIDCC=AKEyXzUFKjb1WSX6lnYzU0Iq13Ye9150PuzFtP0v9yEQ2JaXVkcZYPh0pJd_goUOsxaa1Ui_; __Secure-1PSIDCC=AKEyXzVeW5tU1-s1X7IjgU3ySn27BMbohmj7VHIG4QiKPZImRgvUtXk8NYn1G70P0ra1ZM7W6g; __Secure-3PSIDCC=AKEyXzU3olmGR3Y2K0Cl7dGy0WSsxXyoq_hh4Miuu12U5ChaPMgU63-waWWgYztJ6Q5VqxIZ",
    "X-Youtube-Identity-Token": "QUFFLUhqbHV6QjVDVHFQSHloaHJORHZLamNFXzAxWTZxd3w\u003d"
};

// Utility Functions

/**
 * Returns a parsed URL object for the given string only if the given string is a valid URL.
 * 
 * @param {string} s The string to parse
 * @returns The URL object for given string if it is a valid URL, otherwise `null`.
 */
function parseURL(s) {
    if (/^[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(s) && !s.startsWith("http")) {
        // String is a valid URL without a protocol
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
function extractVideoID(url) {
    const str = url.host + url.pathname;
    if (/^((www|music)\.)?youtube\.com\/watch$/.test(str) && url.searchParams.has("v")) {
        // URL is a regular video link
        return url.searchParams.get("v");
    } else if (/^(youtu\.be|(www\.)?youtube\.com\/shorts)\/[A-Za-z0-9_-]{11}?$/.test(str)) {
        // URL is a short link or YouTube short
        if (url.pathname.startsWith("/shorts/")) {
            // URL is a YouTube short
            return url.pathname.substring(8);
        } else {
            // URL is a short link
            return url.pathname.substring(1);
        }
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
function extractPlaylistID(url) {
    if (/^((www|music)\.)?youtube\.com\/playlist$/.test(url.host + url.pathname) && url.searchParams.has("list")) {
        // URL is a YouTube playlist link
        return url.searchParams.get("list");
    } else {
        // URL does not correspond to a YouTube playlist
        return null;
    }
}

function timelog(msg) {
    console.log(`[${now()}]`, msg);
}

/**
 * @param {import("discord.js").VoiceBasedChannel} channel 
 */
function createVoiceConnection(channel) {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false
    });
    connection.on("error", () => {
        timelog("A voice connection error occurred.\nAttempting to rejoin...");
        connection.rejoinAttempts = 0;
        while (connection.rejoinAttempts < 5) {
            if (connection.rejoin()) {
                timelog("Rejoin was successful.");
                return;
            }
        }
        timelog("Rejoin failed after 5 attempts with the following error:");
        connection.destroy();
        console.error(e);
    });
    return connection;
}

// Commands

/**
 * 
 * 
 * @param {GuildMember | null} member the member who issued the command
 * @param {string} query a search query or URL to play
 */
async function play(member, query) {
    // Voice connection
    if (member === null)
        return "This command must be used in a server.";
    if (member.voice.channel === null)
        return "You must be in a voice channel to use the command."
    if ((await member.guild.members.fetchMe()) === null)
        await member.guild.members.fetchMe();
    if ((await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        if ((await member.guild.members.fetchMe()).permissionsIn(member.voice.channel).has(PermissionsBitField.Flags.Connect | PermissionsBitField.Flags.Speak))
            createVoiceConnection(member.voice.channel);
        else
            return "I lack sufficient permission to execute this command.";
    // Retrieve video ID from query
    const player = getPlayer(member.guild.id);
    let id = null;
    // Check if the query is a URL
    let url = parseURL(query);
    if (url !== null) {
        // Attempt to extract the video ID
        id = extractVideoID(url);
        if (id === null) {
            // Attempt to extract a playlist ID
            const listId = extractPlaylistID(url);
            if (listId !== null)
                return await playPlaylist(player, listId);
            // Invalid URL
            return "That URL does not correspond to a YouTube video or playlist.";
        }
    } else {
        // Search
        let search = await listSearchResults(query, SearchResultType.VIDEO);
        if (search.totalResults === 0)
            // No results
            return "There were no valid results for your query.";
        // Retry the search in case innertube returns an incorrect response
        for (let attempts = 0; search.items.length === 0 && attempts < 10; attempts++)
            search = await listSearchResults(query, SearchResultType.VIDEO);
        if (search.items.length === 0)
            // Innertube returned an invalid response 10 times
            return "Something went wrong whilst trying to search for your query.";
        // Retrieve the id of the first search result
        id = search.items[0].id.videoId;
    }
    // Get the video info
    let info;
    try {
        info = await ytdl.getInfo(id, { requestOptions: { headers: YT_HEADERS } });
    } catch (e) {
        return "An error occurred whilst trying to retrieve the requested video.\n" + e.message;
    }
    const track = Track.fromVideoInfo(info);
    return { content: player.enqueue(track) ? "**Now Playing:**" : "**Added to the Queue:**", embeds: [track.toEmbed()] };
}

/**
 * @param {GuildMember | null} member the member who issued the command;
 */
async function skip(member) {
    if (member === null)
        return "This command must be used in a server.";
    if (member.voice.channel === null || (await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        return "You must be in the same voice channel as the bot to use the command."
    const player = getPlayer(member.guild.id);
    if (!player.isPlaying)
        return "Nothing is playing."
    const track = player.nowPlaying;
    player.skip();
    return { content: "**Skipped:**", embeds: [track.toEmbed()] };
}

/**
 * @param {GuildMember} member 
 * @returns 
 */
async function stop(member) {
    if (member === null)
        return "This command must be used in a server.";
    if (member.voice.channel === null || (await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        return "You must be in the same voice channel as the bot to use the command."
    const player = getPlayer(member.guild.id);
    if (!player.isPlaying)
        return "Nothing is playing."
    player.stop();
    return "Playback stopped.";
}

/**
 * @param {GuildMember} member 
 * @returns 
 */
async function pause(member) {
    if (member === null)
        return "This command must be used in a server.";
    if (member.voice.channel === null || (await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        return "You must be in the same voice channel as the bot to use the command."
    const player = getPlayer(member.guild.id);
    if (!player.isPlaying)
        return "Nothing is playing."
    if (player.isPaused) {
        unpause(member);
        return "Playback resumed."
    }
    player.pause();
    return "Playback paused."
}

/**
 * @param {GuildMember | null} member 
 * @returns 
 */
async function unpause(member) {
    if (member === null)
        return "This command must be used in a server.";
    const player = getPlayer(member.guild.id);
    if (!player.isPlaying)
        return "Nothing is playing."
    if (member.voice.channel === null || (await member.guild.members.fetchMe()).voice.channelId !== member.voice.channelId)
        return "You must be in the same voice channel as the bot to use the command."
    if (!player.isPaused)
        return "Playback is not paused.";
    player.unpause();
    return "Playback paused."
}

/**
 * 
 * @param {Player} player 
 * @param {string} listId 
 * @returns 
 */
async function playPlaylist(player, listId) {
    // Get the playlist by id
    const playlist = await getPlaylist(listId);
    if (playlist === null) {
        "That is not a valid YouTube playlist link.";
        return;
    };
    let totalAdded = 0;
    for (const listItem of await playlist.listItems()) {
        if (!player.isReady) {
            player.stop();
            return "A voice connection error occurred whilst adding the playlist.";
        }
        if (listItem.playable) {
            try {
                // const info = await ytdl.getInfo(listItem.id, { requestOptions: { headers: YT_HEADERS } })
                player.enqueue(Track.fromPlaylistItem(listItem));
            } catch {
                continue;
            }
            totalAdded++;
        }
    }
    return {
        content: "**Added " + totalAdded + " tracks to the queue:**",
        embeds: [new EmbedBuilder()
            .setTitle(playlist.title)
            .setURL("https://www.youtube.com/playlist?list=" + listId)
            .setThumbnail(playlist.thumbnails.maxres ? playlist.thumbnails.maxres.url : playlist.thumbnails.high.url)
            .setAuthor({ name: playlist.channelTitle, url: playlist.channelId ? "https://www.youtube.com/channel/" + playlist.channelId : undefined }).data]
    };
}

/**
 * @param {GuildMember} member 
 * @param {string | undefined} channelId 
 */
async function connect(member, channelId) {
    if (!channelId) {
        // No channel ID provided
        if (member.voice.channelId !== null) {
            // Get member's currently connected voice channel
            channelId = member.voice.channelId;
        } else {
            // Member is not connected to voice
            return "You are not in a voice channel.";
        }
    }
    if (channelId.startsWith("<#") && channelId.endsWith(">")) {
        // Channel ID is a mention
        channelId = channelId.substring(2, channelId.length - 1);
    }
    if ((await member.guild.members.fetchMe()).voice.channelId === channelId) {
        // Bot is already connected to specified channel
        return "I am already connected to <#" + channelId + ">.";
    }
    const channel = await new Promise((resolve) => {
        resolve(member.guild.channels.fetch(channelId).catch(() => { return null }));
    })
    if (channel === null)
        return "*" + channelId + "* is not a valid channel ID.";
    if (channel.type != ChannelType.GuildVoice)
        return "<#" + channelId + "> is not a voice channel.";
    // Join specified channel
    const vc = createVoiceConnection(channel);
    return new Promise(async (resolve) => {
        vc.once(VoiceConnectionStatus.Ready, () => {
            // Successful connection
            resolve("Connected to <#" + channelId + ">.");
        });
    })
}

/**
 * @param {Guild} guild 
 */
async function disconnect(guild) {
    // Get voice connection for guild
    var vc = getVoiceConnection(guild.id) || null;
    if (vc === null)
        // Bot is not connected to a voice channel
        return "I am not connected to a voice channel.";
    var channelId = (await guild.members.fetchMe()).voice.channelId;
    vc.disconnect();
    vc.destroy();
    // Successful disconnection
    return "Disconnected from <#" + channelId + ">";
}

/**
 * @param {Guild} guild 
 */
function nowPlaying(guild) {
    const player = getPlayer(guild.id);
    if (!player.isPlaying)
        return "Nothing is playing.";
    return { content: "**Now playing:**", embeds: [player.nowPlaying.toEmbed()] };
}

/**
 * @param {Message} message 
 */
function queue(message) {
    const player = getPlayer(message.guild.id);
    if (player.queue.length === 0)
        return nowPlaying(message.guild);
    let total = player.nowPlaying.duration / 1000;
    for (let i = 0; i < player.queue.length; i++)
        total += player.queue[i].duration / 1000;
    const eb = new EmbedBuilder()
        .setAuthor({ name: "Now Playing:" })
        .setTitle(player.nowPlaying.title)
        .setURL(player.nowPlaying.url)
        .setDescription(formatDurationMillis(player.nowPlaying.resource.playbackDuration) + "/" + formatDurationMillis(player.nowPlaying.duration))
        .setFooter({ text: `${player.queue.length + 1} items (${formatDuration(Math.floor(total))})` });
    for (let i = 0; i < player.queue.length && i < 25; i++)
        eb.addFields({ name: i + 1 + ": " + player.queue[i].title, value: formatDurationMillis(player.queue[i].duration) });
    let response = { embeds: [eb.toJSON()] }
    if (player.queue.length > 25)
        response.components = [{ type: 1, components: [{ type: 2, emoji: { id: null, name: "➡️", animated: false }, style: 2, custom_id: message.id + ".2" }] }];
    return response;
}

/**
 * @param {Guild} guild
 * @param {number} index 
 */
function remove(guild, index) {
    const player = getPlayer(guild.id);
    if (player.queue.length === 0)
        return "The queue is empty.";
    if (index < 1 | index > player.queue.length)
        return `${index} is not a valid index in the queue.`;
    const track = player.queue.splice(index - 1, 1)[0];
    return { content: "**Removed:**", embeds: [track.toEmbed()] };
}


/**
 * @param {Guild} guild
 * @param {number} source 
 * @param {number} destination 
 */
function move(guild, source, destination) {
    const player = getPlayer(guild.id);
    if (player.queue.length == 0)
        return "The queue is empty.";
    if (source < 1 | source > player.queue.length)
        return `${source} is not a valid index in the queue.`;
    if (destination < 1 | destination > player.queue.length)
        return `${destination} is not a valid index in the queue.`;
    if (source == destination)
        return "Indices must not be equal.";
    const track = player.queue.splice(source - 1, 1)[0];
    player.queue.splice(destination - 1, 0, track);
    return `Moved \`${track.title}\` to index ${destination} in the queue.`;
}

/**
 * @param {Guild} guild 
 */
function loop(guild) {
    const player = getPlayer(guild.id);
    player.loop = !player.loop;
    return "Loop " + (player.loop ? "enabled." : "disabled.")
}

/**
 * @param {Guild} guild 
 * @param {number} index 
 */
function info(guild, index) {
    const player = getPlayer(guild.id);
    if (player.queue.length == 0)
        return "The queue is empty.";
    if (index < 1 || index > player.queue.length)
        return `${index} is not a valid index in the queue.`;
    return { embeds: [player.queue[index - 1].toEmbed()] };
}

/**
 * @param {Guild} guild 
 */
function shuffle(guild) {
    let player = getPlayer(guild.id);
    if (player.queue.length == 0) {
        return "The queue is empty";
    }
    let currentIndex = player.queue.length, randomIndex;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [player.queue[currentIndex], player.queue[randomIndex]] = [
            player.queue[randomIndex], player.queue[currentIndex]];
    }
    return "Queue shuffled.";
}

/**
 * 
 * @param {Guild} guild 
 * @param {number} percentage 
 */
async function volume(guild, percentage) {
    const player = getPlayer(guild.id);
    player.volume = percentage / 100;
    return `Volume set to ${percentage}%.`;
}

// Events

CLIENT.once(Events.ClientReady, async (client) => {
    // Ready
    timelog(`Logged in as ${client.user.tag}`);
    // Update voice connections
    for (const guild of CLIENT.guilds.cache.values()) {
        const channel = (await guild.members.fetch(CLIENT.user.id)).voice.channel;
        if (channel !== null) {
            createVoiceConnection(channel);
        }
    }
});

CLIENT.on(Events.InteractionCreate, (interaction) => {
    if (interaction.isButton()) {
        // Page update interaction for queue
        var page = Number(interaction.customId.split(".")[1]);
        var player = getPlayer(interaction.guild.id);
        // Decrease page number until it is valid
        while (player.queue.length <= (page - 1) * 25) {
            page--;
        }
        if (player.queue.length == 0) {
            // The queue is empty
            var response = nowPlaying(interaction.guild)
            if (typeof response == "string") {
                // Clear embeds
                response = { content: response, embeds: [] };
            }
            // Clear components
            response.components = [];
            interaction.update(response);
            return;
        }
        var total = player.nowPlaying.duration / 1000;
        for (var i = 0; i < player.queue.length; i++)
            total += player.queue[i].duration / 1000;
        var eb = new EmbedBuilder()
            .setFooter({ text: `${player.queue.length + 1} items (${formatDuration(Math.floor(total / 1000))})` });
        if (page == 1) {
            // Include now playing if on first page
            eb.setAuthor({ name: "Now Playing:" })
                .setTitle(player.nowPlaying.title)
                .setURL(player.nowPlaying.url)
                .setDescription(formatDurationMillis(player.nowPlaying.resource.playbackDuration) + "/" + formatDurationMillis(player.nowPlaying.duration))
        }
        // Append up to 25 tracks to the queue message
        for (var i = (page - 1) * 25; i < player.queue.length && i < page * 25; i++) {
            eb.addFields({ name: i + 1 + ": " + player.queue[i].title, value: formatDurationMillis(player.queue[i].duration) });
        }
        var response = { embeds: [eb.data], components: [{ type: 1, components: [] }] }
        if (page > 1) {
            // Add a last page button
            response.components[0].components.push({ type: 2, emoji: { id: null, name: "⬅️", animated: false }, style: 2, custom_id: interaction.customId.split(".")[0] + "." + (page - 1) });
        }
        if (player.queue.length > 25 * page) {
            // Add a next page button
            response.components[0].components.push({ type: 2, emoji: { id: null, name: "➡️", animated: false }, style: 2, custom_id: interaction.customId.split(".")[0] + "." + (page + 1) })
        }
        if (response.components[0].components.length == 0) {
            // No components
            response.components = [];
        }
        interaction.update(response);
    }
});

CLIENT.on(Events.MessageCreate, async (message) => {
    if (message.channel.isDMBased()) {
        const channel = await CLIENT.channels.fetch("1008484508200357929");
        if (channel !== null && channel.isTextBased())
            channel.send(`From DM of <@${message.author.id}>:`);
        channel.send({
            content: message.content,
            embeds: message.embeds.map(value => value.toJSON()),
            files: message.attachments.map(value => value),
            components: message.components.map(value => value.toJSON()),
            poll: message.poll || undefined,
            tts: false,
            nonce: undefined,
            enforceNonce: false,
            reply: undefined,
            stickers: message.stickers.map((value) => value),
            flags: message.flags.remove(MessageFlags.Crossposted, MessageFlags.IsCrosspost, MessageFlags.SourceMessageDeleted, MessageFlags.Urgent, MessageFlags.HasThread, MessageFlags.Ephemeral, MessageFlags.Loading, MessageFlags.FailedToMentionSomeRolesInThread, MessageFlags.ShouldShowLinkNotDiscordWarning, MessageFlags.IsVoiceMessage)
        });
    } else if (message.content.startsWith(PREFIX)) {
        // Parse command name and arguments
        const args = message.content.split(" ");
        const cmd = args.shift().substring(PREFIX.length);
        try {
            var response;
            // Handle Command
            switch (cmd) {
                case "cookie":
                    if (message.author.id === "420741651804323843") {
                        if (args.length < 1) {
                            if ("cookie" in YT_HEADERS)
                                delete YT_HEADERS["cookie"];
                            response = "Cookie unset.";
                        } else {
                            YT_HEADERS["cookie"] = args[0];
                            response = "Cookie set.";
                        }
                    } else {
                        response = "You can't use this command."
                    }
                    break;
                case "id":
                    if (message.author.id === "420741651804323843") {
                        if (args.length < 1) {
                            if ("X-Youtube-Identity-Token" in YT_HEADERS)
                                delete YT_HEADERS["X-Youtube-Identity-Token"];
                            response = "ID unset.";
                        } else {
                            YT_HEADERS["X-Youtube-Identity-Token"] = args[0];
                            response = "ID set.";
                        }
                    } else {
                        response = "You can't use this command."
                    }
                    break;
                case "join":
                case "connect":
                    // Connect
                    response = await connect(message.member, args.length <= 1 ? args[0] : undefined);
                    break;
                case "leave":
                case "disconnect":
                    // Disconnect
                    response = await disconnect(message.guild);
                    break;
                case "play":
                    // Play
                    if (args.length < 1) {
                        // Resume
                        response = await unpause(message.member);
                    } else {
                        response = await play(message.member, message.content.substring(cmd.length + 1).trim());
                    }
                    break;
                case "pause":
                    // Pause
                    response = await pause(message.member);
                    break;
                case "unpause":
                case "resume":
                    // Resume
                    response = await unpause(message.member);
                    break;
                case "stop":
                    // Stop
                    response = await stop(message.member);
                    break;
                case "skip":
                    // Skip
                    response = await skip(message.member);
                    break;
                case "now-playing":
                case "np":
                    // Now Playing
                    response = nowPlaying(message.guild);
                    break;
                case "queue":
                case "q":
                    // Queue
                    response = queue(message);
                    break;
                case "remove":
                    // Remove
                    if (args.length < 1) {
                        response = "You must provide an index.";
                    }
                    else if (!/^[0-9]+$/.test(args[0])) {
                        response = "Index must be a integer.";
                    } else {
                        response = remove(message.guild, Number(args[0]));
                    }
                    break;
                case "move":
                    // Move
                    if (args.length < 1)
                        response = "You must provide source and destination indexes.";
                    else if (args.length < 2)
                        response = "You must provide a destination index";
                    else if (!/^[0-9]+$/.test(args[0]) || !/^[0-9]+$/.test(args[1]))
                        response = "Both indexes must be integers.";
                    else
                        response = move(message.guild, Number(args[0]), Number(args[1]))
                    break;
                case "shuffle":
                    response = shuffle(message.guild);
                    break;
                case "loop":
                    // Loop
                    response = loop(message.guild);
                    break;
                case "info":
                case "i":
                    // Info
                    if (args.length < 1) {
                        response = "You must provide an index.";
                    }
                    else if (!/^[0-9]+$/.test(args[0])) {
                        response = "Index must be an integer.";
                    } else {
                        response = info(message.guild, Number(args[0]));
                    }
                    break;
                case "volume":
                    if (args.length < 1) {
                        response = "You must provide a percentage.";
                    }
                    else if (!/^[0-9]+(\.[0-9]+)?$/.test(args[0])) {
                        response = "percentage must be a number.";
                    } else {
                        response = await volume(message.guild, Number(args[0]));
                    }
                    break;
                case "evaluate":
                case "eval":
                    // Evaluate
                    try {
                        response = String(evaluate(args.join(" ")));
                    } catch (e) {
                        response = e.message;
                    }
                    break;
                case "help":
                    response = {
                        embeds: [new EmbedBuilder().addFields(
                            { name: "play *[query]", value: "Plays something from YouTube using the [query] as a link or search query. If no query is provided, attempts resume." },
                            { name: "pause", value: "Resumes the currently playing track." },
                            { name: "resume", value: "Pauses the currently playing track." },
                            { name: "skip", value: "Skips the currently playing track." },
                            { name: "stop", value: "Stops the currently playing track and clears the queue." },
                            { name: "nowPlaying|np", value: "Displays the currently playing track." },
                            { name: "queue|q", value: "Displays the queue." },
                            { name: "connect|join *[voice_channel]", value: "Makes the bot join a voice channel, either [voice_channel] or your current voice channel." },
                            { name: "disconnect|leave", value: "Makes the bot leave it's current voice channel." },
                            { name: "remove [index]", value: "Remove track [index] from the queue." },
                            { name: "move [source_index] [destination index]", value: "Move the track at [source_index] to [destination_index]" },
                            { name: "shuffle", value: "Shuffles the queue." },
                            { name: "loop", value: "Loops the currently playing track." },
                            { name: "info|i [index]", value: "Display info about a queued track at [index] in the queue." },
                            { name: "evaluate|eval [expression]", value: "Evaluate a mathematical expression." },
                            { name: "volume [percentage]", value: "Set the volume to the specified percentage." },
                            { name: "help", value: "Display this message." }).data]
                    };
                    break;
                case "exec":
                    if (message.author.id === '420741651804323843') {
                        response = "Code executed";
                        try {
                            eval(args.join(" "));
                        } catch (e) {
                            response = "Error:\n" + e.message;
                        }
                        break;
                    }
                default:
                    response = "Unrecognized command.\nUse `.help` for a list of commands.";
                    break;
            }
            await message.channel.send(response);
        } catch (e) {
            console.error(`[${now()}] Uncaught Error on "${cmd}":`);
            console.error(e);
            try {
                await message.channel.send("An error occurred whist processing your command.");
            } catch (e) {
                console.error(`[${now()}] Failed to send response message:\n`);
                console.error(e);
            }
        }
    }
});

CLIENT.login(process.env.TOKEN);