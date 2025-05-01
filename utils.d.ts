import { VoiceBasedChannel } from 'discord.js';
/**
 * Represents a unit of time.
 */
declare enum TimeUnit {
    MILLISECOND = 0,
    SECOND = 1,
    MINUTE = 2,
    HOUR = 3,
    DAY = 4,
    WEEK = 5
}
interface ITimeUnitKeys {
    readonly millisecond: TimeUnit.MILLISECOND;
    readonly second: TimeUnit.SECOND;
    readonly minute: TimeUnit.MINUTE;
    readonly hour: TimeUnit.HOUR;
    readonly day: TimeUnit.DAY;
    readonly week: TimeUnit.WEEK;
}
/**
 * Represents a duration.
 */
declare class Duration {
    #private;
    /**
     * Construct a new {@link Duration} with `milliseconds` milliseconds.
     *
     * @param milliseconds The total number of milliseconds.
     */
    constructor(milliseconds: number);
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
    static format(milliseconds: number, includeMillis?: boolean): string;
    /**
     * Returns the total duration in the specified {@link TimeUnit}.
     *
     * @param unit The time unit.
     */
    getTotal(unit: TimeUnit): number;
    /**
     * Sets the total duration in the specified {@link TimeUnit}.
     *
     * @param unit The time unit.
     * @param value The total duration in the specified {@link TimeUnit}.
     */
    setTotal(unit: TimeUnit, value: number): number;
    /**
     * Returns the total number of milliseconds.
     */
    getMilliseconds(): number;
    /**
     * Sets the total number of milliseconds.
     *
     * @param milliseconds The total number of milliseconds.
     */
    setMilliseconds(milliseconds: number): void;
    /**
     * Returns the total number of seconds.
     */
    getSeconds(): number;
    /**
     * Sets the total number of seconds.
     *
     * @param seconds The total number of seconds.
     */
    setSeconds(seconds: number): void;
    /**
     * Returns the total number of minutes.
     */
    getMinutes(): number;
    /**
     * Sets the total number of minutes.
     *
     * @param minutes The total number of minutes.
     */
    setMinutes(minutes: number): void;
    /**
     * Returns the total number of hours.
     */
    getHours(): number;
    /**
     * Sets the total number of hours.
     *
     * @param hours The total number of hours.
     */
    setHours(hours: number): void;
    /**
     * Returns the total number of days.
     */
    getDays(): number;
    /**
     * Sets the total number of days.
     *
     * @param days The total number of days.
     */
    setDays(days: number): void;
    /**
     * Returns the total number of weeks.
     */
    getWeeks(): number;
    /**
     * Sets the total number of weeks.
     *
     * @param weeks The total number of weeks.
     */
    setWeeks(weeks: number): void;
    /**
     * Returns the component of duration that corresponds to the specified {@link TimeUnit}.
     *
     * @param unit The time unit.
     */
    getComponent(unit: TimeUnit): number;
    /**
     * Sets the components of duration that correspond to the specified {@link TimeUnit TimeUnits}.
     *
     * @param components Components to set.
     */
    setComponents(components: {
        -readonly [K in keyof ITimeUnitKeys]?: number;
    }): void;
    /**
     * Returns the millisecond.
     */
    getMillisecond(): number;
    /**
     * Sets the millisecond.
     *
     * @param millisecond The millisecond.
     */
    setMillisecond(millisecond: number): void;
    /**
     * Returns the second.
     */
    getSecond(): number;
    /**
     * Sets the second.
     *
     * @param second The second.
     * @param millisecond The millisecond.
     */
    setSecond(second: number, millisecond?: number): void;
    /**
     * Returns the minute.
     */
    getMinute(): number;
    /**
     * Sets the minute.
     *
     * @param minute The minute.
     * @param second The second.
     * @param millisecond The millisecond.
     */
    setMinute(minute: number, second?: number, millisecond?: number): void;
    /**
     * Returns the hour.
     */
    getHour(): number;
    /**
     * Sets the hour.
     *
     * @param hour The hour.
     * @param minute The minute.
     * @param second The second.
     * @param millisecond The millisecond.
     */
    setHour(hour: number, minute?: number, second?: number, millisecond?: number): void;
    /**
     * Returns the day.
     */
    getDay(): number;
    /**
     * Sets the day.
     *
     * @param day The day.
     * @param hour The hour.
     * @param minute The minute.
     * @param second The second.
     * @param millisecond The millisecond.
     */
    setDay(day: number, hour?: number, minute?: number, second?: number, millisecond?: number): void;
    /**
     * Returns the week.
     */
    getWeek(): number;
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
    setWeek(week: number, day?: number, hour?: number, minute?: number, second?: number, millisecond?: number): void;
    /**
     * Returns the formatted duration.
     *
     * @param includeMillis Whether the millisecond should be included.
     */
    format(includeMillis?: boolean): string;
    toString(): string;
}
type NullifyValue<T> = T extends undefined ? null : T;
type Nullify<T, U extends Extract<keyof T, any> = keyof T> = T extends object ? T & {
    readonly [P in U]: T[P] extends undefined ? null : Nullify<T[P]>;
} : NullifyValue<T>;
declare function nullify<T extends Exclude<any, object>>(value: T): Nullify<T>;
declare function nullify<T extends object, U extends keyof T>(obj: T, ...keys: U[]): Nullify<T, U>;
declare function nullifyValue<T>(value: T): NullifyValue<T>;
declare function timelog(msg: string): void;
declare function createVoiceConnection(channel: VoiceBasedChannel): import("@discordjs/voice").VoiceConnection;
export { TimeUnit, Duration, Nullify, NullifyValue, nullify, nullifyValue, timelog, createVoiceConnection };