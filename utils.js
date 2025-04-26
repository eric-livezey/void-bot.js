import { joinVoiceChannel } from '@discordjs/voice';
class Duration {
    #milliseconds;
    /**
     * Construct a new {@link Duration} with `milliseconds` milliseconds.
     *
     * @param milliseconds The total number of milliseconds.
     */
    constructor(milliseconds) {
        this.#milliseconds = milliseconds;
    }
    /**
     * Returns the formatted version of a duration with `milliseconds` milliseconds.
     *
     * Equivalent to:
     * ```js
     * new Duration(milliseconds).format(includeMillis);
     * ```
     *
     * @param milliseconds The total number of milliseconds.
     * @param includeMillis Whether the millisecond should be included.
     */
    static format(milliseconds, includeMillis) {
        return new Duration(milliseconds).format(includeMillis);
    }
    /**
     * Returns the total number of milliseconds.
     */
    getMilliseconds() {
        return this.#milliseconds;
    }
    /**
     * Sets the total number of milliseconds.
     *
     * @param milliseconds The total number of milliseconds.
     */
    setMilliseconds(milliseconds) {
        this.#milliseconds = Math.floor(milliseconds);
    }
    /**
     * Returns the total number of seconds.
     */
    getSeconds() {
        return this.getMilliseconds() / 1000;
    }
    /**
     * Sets the total number of seconds.
     *
     * @param seconds The total number of seconds.
     */
    setSeconds(seconds) {
        this.setMilliseconds(seconds * 1000);
    }
    /**
     * Returns the total number of minutes.
     */
    getMinutes() {
        return this.getMilliseconds() / 60000;
    }
    /**
     * Sets the total number of minutes.
     *
     * @param minutes The total number of minutes.
     */
    setMinutes(minutes) {
        this.setMilliseconds(minutes * 60000);
    }
    /**
     * Returns the total number of hours.
     */
    getHours() {
        return this.getMilliseconds() / 3.6e+6;
    }
    /**
     * Sets the total number of hours.
     *
     * @param hours The total number of hours.
     */
    setHours(hours) {
        this.setMilliseconds(hours * 3.6e+6);
    }
    /**
     * Returns the total number of days.
     */
    getDays() {
        return this.getMilliseconds() / 8.64e+7;
    }
    /**
     * Sets the total number of days.
     *
     * @param days The total number of days.
     */
    setDays(days) {
        this.setMilliseconds(days * 8.64e+7);
    }
    /**
     * Returns the total number of weeks.
     */
    getWeeks() {
        return this.getMilliseconds() / 6.048e+8;
    }
    /**
     * Sets the total number of weeks.
     *
     * @param weeks The total number of weeks.
     */
    setWeeks(weeks) {
        this.setMilliseconds(weeks * 6.048e+8);
    }
    /**
     * Returns the millisecond.
     */
    getMillisecond() {
        return this.getMilliseconds() % 1000;
    }
    /**
     * Sets the millisecond.
     *
     * @param millisecond The millisecond.
     */
    setMillisecond(millisecond) {
        this.setDay(this.getDay(), this.getHour(), this.getMinute(), this.getSecond(), millisecond);
    }
    /**
     * Returns the second.
     */
    getSecond() {
        return Math.floor(this.getMilliseconds() % 60000 / 1000);
    }
    /**
     * Sets the second.
     *
     * @param second The second.
     * @param millisecond The millisecond.
     */
    setSecond(second, millisecond) {
        this.setDay(this.getDay(), this.getHour(), this.getMinute(), second, millisecond);
    }
    /**
     * Returns the minute.
     */
    getMinute() {
        return Math.floor(this.getMilliseconds() % 3.6e+6 / 60000);
    }
    /**
     * Sets the minute.
     *
     * @param minute The minute.
     * @param second The second.
     * @param millisecond The millisecond.
     */
    setMinute(minute, second, millisecond) {
        this.setDay(this.getDay(), this.getHour(), minute, second, millisecond);
    }
    /**
     * Returns the hour.
     */
    getHour() {
        return Math.floor(this.getMilliseconds() % 8.64e+7 / 3.6e+6);
    }
    /**
     * Sets the hour.
     *
     * @param hour The hour.
     * @param minute The minute.
     * @param second The second.
     * @param millisecond The millisecond.
     */
    setHour(hour, minute, second, millisecond) {
        this.setDay(this.getDay(), hour, minute, second, millisecond);
    }
    /**
     * Returns the day.
     */
    getDay() {
        return Math.floor(this.getMilliseconds() % 6.048e+8 / 8.64e+7);
    }
    /**
     * Sets the day.
     *
     * @param day The day.
     * @param hour The hour.
     * @param minute The minute.
     * @param second The second.
     * @param millisecond The millisecond.
     */
    setDay(day, hour, minute, second, millisecond) {
        this.setWeek(this.getWeek(), day, hour, minute, second, millisecond);
    }
    /**
     * Returns the week.
     */
    getWeek() {
        return Math.floor(this.getWeeks());
    }
    /**
     * Sets the week.
     *
     * @param week The week.
     * @param day The day.
     * @param hour The hour.
     * @param minute The minute.
     * @param second The second.
     * @param millisecond The millisecond.
     */
    setWeek(week, day, hour, minute, second, millisecond) {
        if (day === undefined) {
            day = this.getDay();
        }
        if (hour === undefined) {
            hour = this.getHour();
        }
        if (minute === undefined) {
            minute = this.getMinute();
        }
        if (second === undefined) {
            second = this.getSecond();
        }
        if (millisecond === undefined) {
            millisecond = this.getMillisecond();
        }
        this.setMilliseconds(week * 6.048e+8 + day * 8.64e+7 + hour * 3.6e+6 + minute * 60000 + second * 1000 + millisecond);
    }
    /**
     * Returns the formatted duration.
     *
     * @param includeMillis Whether the millisecond should be included.
     */
    format(includeMillis) {
        const second = zeroFill(this.getSecond());
        const parts = [zeroFill(this.getMinute()), includeMillis ? `${second}.${this.getMillisecond()}` : second];
        const prefix = [];
        for (const value of [this.getWeek(), this.getDay(), this.getHour()]) {
            const hasPrefix = prefix.length > 0;
            if (hasPrefix || value) {
                prefix.push(hasPrefix ? zeroFill(value) : value.toString());
            }
        }
        return [...prefix, ...parts].join(':');
    }
    toString() {
        return this.format();
    }
}
function zeroFill(value, maxLength = 2) {
    return value.toString().padStart(maxLength, '0');
}
function nullify(value, ...keys) {
    if (value !== null && typeof value === 'object') {
        const result = {};
        if (keys === undefined) {
            keys = Object.keys(value);
        }
        for (const key of keys) {
            Object.defineProperty(result, key, { value: nullify(value[key]), enumerable: true });
        }
        return result;
    }
    else {
        return value === undefined ? null : value;
    }
}
function nullifyValue(value) {
    return value === undefined ? null : value;
}
function timelog(msg) {
    console.log(`[${new Date().toLocaleString()}]`, msg);
}
function createVoiceConnection(channel) {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false
    });
    connection.on('error', e => {
        timelog('A voice connection error occurred.\nAttempting to rejoin...');
        while (connection.rejoinAttempts < 5) {
            if (connection.rejoin()) {
                timelog('Rejoin was successful.');
                return;
            }
        }
        timelog('Rejoin failed after 5 attempts with the following error:');
        connection.destroy();
        console.error(e);
    });
    return connection;
}
export { Duration, nullify, nullifyValue, timelog, createVoiceConnection };