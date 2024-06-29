import { IncomingHttpHeaders, OutgoingHttpHeaders } from "http";
import { RequestOptions } from "https";
import { TextRenderer } from "./rawTypes";

declare class MimeType {
    readonly type: string;
    readonly subtype: string;
    readonly parameters: Map<string, string>;

    constructor(type: string, subtype: string, parameters: { [key: string]: string });

    static parse(str: string): MimeType;
}

declare function getRenderedText(text: TextRenderer): string;

export class Duration {
    total: number;
    seconds: number;
    minutes: number;
    hours: number;
    days: number;

    constructor(seconds: number);

    format(): string;
}

export function zFill(arg: any, length: number): string;

export function now(): string;

/**
 * 
 * @param options 
 * @param body 
 * @deprecated use {@link fetch}
 */
export function httpsRequest(options: string | RequestOptions | URL, body: string): Promise<{
    statusCode: number,
    statusMessage: string,
    headers: IncomingHttpHeaders,
    body: Buffer
}>;

export function requestAPI(path: string, body: any): Promise<{
    statusCode: number,
    statusMessage: string,
    headers: IncomingHttpHeaders,
    body: any
}>;

export function requestMusicAPI(path: string, body: any): Promise<Response>;

export function download(url: URL, path: string, method?: string, headers?: OutgoingHttpHeaders): Promise<string | null>;

export {
    MimeType,
    getRenderedText
}