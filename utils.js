import { joinVoiceChannel } from '@discordjs/voice';
/**
 * Represents a unit of time.
 */
var TimeUnit;
(function (TimeUnit) {
    TimeUnit[TimeUnit["MILLISECOND"] = 0] = "MILLISECOND";
    TimeUnit[TimeUnit["SECOND"] = 1] = "SECOND";
    TimeUnit[TimeUnit["MINUTE"] = 2] = "MINUTE";
    TimeUnit[TimeUnit["HOUR"] = 3] = "HOUR";
    TimeUnit[TimeUnit["DAY"] = 4] = "DAY";
    TimeUnit[TimeUnit["WEEK"] = 5] = "WEEK";
})(TimeUnit || (TimeUnit = {}));
const TimeUnitKeys = {
    millisecond: TimeUnit.MILLISECOND,
    second: TimeUnit.SECOND,
    minute: TimeUnit.MINUTE,
    hour: TimeUnit.HOUR,
    day: TimeUnit.DAY,
    week: TimeUnit.WEEK
};
const TimeUnitDurations = {
    [TimeUnit.MILLISECOND]: 1,
    [TimeUnit.SECOND]: 1000,
    [TimeUnit.MINUTE]: 60000,
    [TimeUnit.HOUR]: 3.6e+6,
    [TimeUnit.DAY]: 8.64e+7,
    [TimeUnit.WEEK]: 6.048e+8
};
/**
 * Represents a duration.
 */
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
     * Returns the total duration in the specified {@link TimeUnit}.
     *
     * @param unit The time unit.
     */
    getTotal(unit) {
        return this.#milliseconds / TimeUnitDurations[unit];
    }
    /**
     * Sets the total duration in the specified {@link TimeUnit}.
     *
     * @param unit The time unit.
     * @param value The total duration in the specified {@link TimeUnit}.
     */
    setTotal(unit, value) {
        return this.#milliseconds = Math.round(value * TimeUnitDurations[unit]);
    }
    /**
     * Returns the total number of milliseconds.
     */
    getMilliseconds() {
        return this.getTotal(TimeUnit.MILLISECOND);
    }
    /**
     * Sets the total number of milliseconds.
     *
     * @param milliseconds The total number of milliseconds.
     */
    setMilliseconds(milliseconds) {
        this.setTotal(TimeUnit.MILLISECOND, milliseconds);
    }
    /**
     * Returns the total number of seconds.
     */
    getSeconds() {
        return this.getTotal(TimeUnit.SECOND);
    }
    /**
     * Sets the total number of seconds.
     *
     * @param seconds The total number of seconds.
     */
    setSeconds(seconds) {
        this.setTotal(TimeUnit.SECOND, seconds);
    }
    /**
     * Returns the total number of minutes.
     */
    getMinutes() {
        return this.getTotal(TimeUnit.MINUTE);
    }
    /**
     * Sets the total number of minutes.
     *
     * @param minutes The total number of minutes.
     */
    setMinutes(minutes) {
        this.setTotal(TimeUnit.MINUTE, minutes);
    }
    /**
     * Returns the total number of hours.
     */
    getHours() {
        return this.getTotal(TimeUnit.HOUR);
    }
    /**
     * Sets the total number of hours.
     *
     * @param hours The total number of hours.
     */
    setHours(hours) {
        this.setTotal(TimeUnit.HOUR, hours);
    }
    /**
     * Returns the total number of days.
     */
    getDays() {
        return this.getTotal(TimeUnit.DAY);
    }
    /**
     * Sets the total number of days.
     *
     * @param days The total number of days.
     */
    setDays(days) {
        this.setTotal(TimeUnit.DAY, days);
    }
    /**
     * Returns the total number of weeks.
     */
    getWeeks() {
        return this.getTotal(TimeUnit.WEEK);
    }
    /**
     * Sets the total number of weeks.
     *
     * @param weeks The total number of weeks.
     */
    setWeeks(weeks) {
        this.setTotal(TimeUnit.WEEK, weeks);
    }
    /**
     * Returns the component of duration that corresponds to the specified {@link TimeUnit}.
     *
     * @param unit The time unit.
     */
    getComponent(unit) {
        return Math.floor(unit + 1 in TimeUnit ? this.getMilliseconds() % TimeUnitDurations[unit + 1] / TimeUnitDurations[unit] : this.getTotal(unit));
    }
    /**
     * Sets the components of duration that correspond to the specified {@link TimeUnit TimeUnits}.
     *
     * @param components Components to set.
     */
    setComponents(components) {
        this.setMilliseconds(Object.entries(components).reduce((prev, [key, value]) => {
            if (value !== undefined) {
                const unit = TimeUnitKeys[key];
                const duration = TimeUnitDurations[unit];
                return prev - this.getComponent(unit) * duration + value * duration;
            }
            else {
                return prev;
            }
        }, this.getMilliseconds()));
    }
    /**
     * Returns the millisecond.
     */
    getMillisecond() {
        return this.getComponent(TimeUnit.MILLISECOND);
    }
    /**
     * Sets the millisecond.
     *
     * @param millisecond The millisecond.
     */
    setMillisecond(millisecond) {
        this.setSecond(this.getSecond(), millisecond);
    }
    /**
     * Returns the second.
     */
    getSecond() {
        return this.getComponent(TimeUnit.SECOND);
    }
    /**
     * Sets the second.
     *
     * @param second The second.
     * @param millisecond The millisecond.
     */
    setSecond(second, millisecond) {
        this.setMinute(this.getMinute(), second, millisecond);
    }
    /**
     * Returns the minute.
     */
    getMinute() {
        return this.getComponent(TimeUnit.MINUTE);
    }
    /**
     * Sets the minute.
     *
     * @param minute The minute.
     * @param second The second.
     * @param millisecond The millisecond.
     */
    setMinute(minute, second, millisecond) {
        this.setHour(this.getHour(), minute, second, millisecond);
    }
    /**
     * Returns the hour.
     */
    getHour() {
        return this.getComponent(TimeUnit.HOUR);
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
        return this.getComponent(TimeUnit.DAY);
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
        return this.getComponent(TimeUnit.WEEK);
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
        this.setComponents({ week, day, hour, minute, second, millisecond });
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
export { TimeUnit, Duration, nullify, nullifyValue, timelog, createVoiceConnection };