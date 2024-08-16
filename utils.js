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
            return `${this.days}:${zFill(this.hours)}:${zFill(this.minutes)}:${zFill(this.seconds)}`;
        } else if (this.hours > 0) {
            return `${this.hours}:${zFill(this.minutes)}:${zFill(this.seconds)}`;
        } else {
            return `${zFill(this.minutes)}:${zFill(this.seconds)}`;
        }
    }
}

function zFill(arg) {
    return arg.toString().padStart(2, "0");
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
    formatDurationMillis
}