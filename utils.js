import { Colors, EmbedBuilder } from "discord.js";
import ytdl from "ytdl-core";

class Duration {
    total;
    seconds;
    minutes;
    hours;
    days;

    constructor(seconds) {
        this.total = seconds;
        this.days = Math.floor(seconds / 86400);
        this.hours = Math.floor(seconds % 86400 / 3600);
        this.minutes = Math.floor(seconds % 3600 / 60);
        this.seconds = seconds % 60;
    }

    format() {
        if (this.days > 0) {
            return `${this.days}:${zFill(this.hours, 2)}:${zFill(this.minutes, 2)}:${zFill(this.seconds, 2)}`;
        } else if (this.hours > 0) {
            return `${this.hours}:${zFill(this.minutes, 2)}:${zFill(this.seconds, 2)}`;
        } else {
            return `${zFill(this.minutes, 2)}:${zFill(this.seconds, 2)}`;
        }
    }
}

function zFill(arg, length) {
    return `${("00" + arg).slice(-1 * length)}`;
}

function createReadOnlyObject(properties) {
    const obj = Object.create(null);

    for (const entry of Object.entries(properties)) {
        Object.defineProperty(obj, entry[0], { value: entry[1] });
    }

    return obj;
}

function formatDuration(seconds) {
    return new Duration(seconds).format();
}

function formatDurationMillis(millis) {
    return new Duration(Math.floor(millis / 1000)).format();
}

export {
    Duration,
    formatDuration,
    formatDurationMillis,
    createErrorEmbed
}