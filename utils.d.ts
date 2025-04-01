import { VoiceBasedChannel } from 'discord.js';
declare class Duration {
    #private;
    /**
     * Construct a new {@link Duration} with `milliseconds` milliseconds.
     *
     * @param milliseconds the total number of milliseconds
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
     * @param milliseconds the total number of milliseconds
     * @param includeMillis whether the millisecond should be included
     */
    static format(milliseconds: number, includeMillis?: boolean): string;
    /**
     * Returns the total number of milliseconds.
     */
    getMilliseconds(): number;
    /**
     * Set the total number of milliseconds.
     *
     * @param milliseconds the total number of milliseconds
     */
    setMilliseconds(milliseconds: number): void;
    /**
     * Returns the total number of seconds.
     */
    getSeconds(): number;
    /**
     * Set the total number of seconds.
     *
     * @param seconds the total number of seconds
     */
    setSeconds(seconds: number): void;
    /**
     * Returns the total number of minutes.
     */
    getMinutes(): number;
    /**
     * Set the total number of minutes.
     *
     * @param minutes the total number of minutes
     */
    setMinutes(minutes: number): void;
    /**
     * Returns the total number of hours.
     */
    getHours(): number;
    /**
     * Set the total number of hours.
     *
     * @param hours the total number of hours
     */
    setHours(hours: number): void;
    /**
     * Returns the total number of days.
     */
    getDays(): number;
    /**
     * Set the total number of days.
     *
     * @param days the total number of days
     */
    setDays(days: number): void;
    /**
     * Returns the millisecond.
     */
    getMillisecond(): number;
    /**
     * Set the millisecond.
     *
     * @param millisecond the millisecond
     */
    setMillisecond(millisecond: number): void;
    /**
     * Returns the second.
     */
    getSecond(): number;
    /**
     * Set the second.
     *
     * @param second the second
     * @param millisecond the millisecond
     */
    setSecond(second: number, millisecond?: number): void;
    /**
     * Returns the minute.
     */
    getMinute(): number;
    /**
     * Set the minute.
     *
     * @param minute the minute
     * @param second the second
     * @param millisecond the millisecond
     */
    setMinute(minute: number, second?: number, millisecond?: number): void;
    /**
     * Returns the hour.
     */
    getHour(): number;
    /**
     * Set the hour.
     *
     * @param hour the hour
     * @param minute the minute
     * @param second the second
     * @param millisecond the millisecond
     */
    setHour(hour: number, minute?: number, second?: number, millisecond?: number): void;
    /**
     * Returns the day.
     */
    getDay(): number;
    /**
     * Set the day.
     *
     * @param day the day
     * @param hour the hour
     * @param minute this minute
     * @param second the second
     * @param millisecond the millisecond
     */
    setDay(day: number, hour?: number, minute?: number, second?: number, millisecond?: number): void;
    /**
     * Returns the formatted duration.
     *
     * @param includeMillis weather the millisecond should be included
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
