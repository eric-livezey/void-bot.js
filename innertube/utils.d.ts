import { IncomingHttpHeaders, OutgoingHttpHeaders } from "http";
import { RequestOptions } from "https";

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
 * @deprecated {@link fetch}
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

export function requestMusicAPI(path: string, body: any): Promise<{
    statusCode: number,
    statusMessage: string,
    headers: IncomingHttpHeaders,
    body: any
}>;

export function download(url: URL, path: string, method?: string, headers?: OutgoingHttpHeaders): Promise<string | null>;