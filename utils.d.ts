import { VoiceBasedChannel } from 'discord.js';
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
     * Returns the total number of milliseconds.
     */
    getMilliseconds(): number;
    /**
     * Set the total number of milliseconds.
     *
     * @param milliseconds The total number of milliseconds.
     */
    setMilliseconds(milliseconds: number): void;
    /**
     * Returns the total number of seconds.
     */
    getSeconds(): number;
    /**
     * Set the total number of seconds.
     *
     * @param seconds The total number of seconds.
     */
    setSeconds(seconds: number): void;
    /**
     * Returns the total number of minutes.
     */
    getMinutes(): number;
    /**
     * Set the total number of minutes.
     *
     * @param minutes The total number of minutes.
     */
    setMinutes(minutes: number): void;
    /**
     * Returns the total number of hours.
     */
    getHours(): number;
    /**
     * Set the total number of hours.
     *
     * @param hours The total number of hours.
     */
    setHours(hours: number): void;
    /**
     * Returns the total number of days.
     */
    getDays(): number;
    /**
     * Set the total number of days.
     *
     * @param days The total number of days.
     */
    setDays(days: number): void;
    /**
     * Returns the millisecond.
     */
    getMillisecond(): number;
    /**
     * Set the millisecond.
     *
     * @param millisecond The millisecond.
     */
    setMillisecond(millisecond: number): void;
    /**
     * Returns the second.
     */
    getSecond(): number;
    /**
     * Set the second.
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
     * Set the minute.
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
     * Set the hour.
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
     * Set the day.
     *
     * @param day The day.
     * @param hour The hour.
     * @param minute The minute.
     * @param second The second.
     * @param millisecond The millisecond.
     */
    setDay(day: number, hour?: number, minute?: number, second?: number, millisecond?: number): void;
    /**
     * Returns the formatted duration.
     *
     * @param includeMillis Whether the millisecond should be included.
     */
    format(includeMillis?: boolean): string;
    toString(): string;
}
type Nullify<T, U extends Extract<keyof T, any> = keyof T> = T extends object ? T & {
    readonly [P in U]: T[P] extends undefined ? null : Nullify<T[P]>;
} : NullifyValue<T>;
type NullifyValue<T> = Exclude<T, undefined> | null;
declare function nullify<T extends Exclude<any, object>>(value: T): Nullify<T>;
declare function nullify<T extends object, U extends keyof T>(obj: T, ...keys: U[]): Nullify<T, U>;
declare function nullifyValue<T extends Exclude<any, object>>(value: T): NullifyValue<T>;
declare function timelog(msg: string): void;
declare function createVoiceConnection(channel: VoiceBasedChannel): import("@discordjs/voice").VoiceConnection;
export { Duration, Nullify, NullifyValue, nullify, nullifyValue, timelog, createVoiceConnection };