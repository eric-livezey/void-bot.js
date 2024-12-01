import { writeFileSync } from "fs";
import { request } from "https";

class MimeType {
    constructor(type, subtype, parameters) {
        if (typeof type !== "string")
            throw new TypeError("type must be an instance of string");
        if (typeof subtype !== "string")
            throw new TypeError("subtype must be an instance of string");
        if (parameters === undefined)
            parameters = {};
        if (typeof parameters !== "object" || parameters === null)
            throw new TypeError("parameters must be an instance of a non-null object");
        for (const value of Object.values(parameters))
            if (typeof value !== "string")
                throw new TypeError("parameters must be a dict of strings");
        Object.defineProperties(this, {
            "type": {
                value: type
            },
            "subtype": {
                value: subtype
            },
            "parameters": {
                value: new Map(Object.entries(parameters))
            }
        });
    }

    static parse(str) {
        if (typeof str !== "string")
            throw new TypeError("str must be an instance of string");
        if (!/^[A-Za-z0-9][A-Za-z0-9!#$&-^_]{0,126}\/[A-Za-z0-9][A-Za-z0-9!#$&-^_]{0,126}(; *[A-Za-z0-9][A-Za-z0-9!#$&-^_]{0,126}=[^;]+)+$/.test(str))
            throw new Error(`could not parse "${str.replaceAll('"', '\\"')}"`);
        let i = str.indexOf('/');
        const type = str.substring(0, i);
        const subtype = str.substring(i + 1, (i = str.indexOf(';')) !== -1 ? i : undefined).trimEnd();
        const parameters = {};
        let k, v;
        while (i !== -1) {
            k = str.substring(i + 1, i = str.indexOf('=', i + 1)).trim();
            v = str.substring(i + 1, (i = str.indexOf(';', i + 1)) !== -1 ? i : undefined).trim();
            if (v.length > 1 && v.charAt(0) === '"' && v.charAt(v.length - 1) === '"')
                v = v.substring(1, v.length - 1);
            parameters[k] = v;
        }
        return new MimeType(type, subtype, parameters);
    }
}

function getRenderedText(textRenderer) {
    if (textRenderer.simpleText)
        return textRenderer.simpleText;
    if (textRenderer.runs)
        return textRenderer.runs.map(run => run.text).join();
    return "";
}

export class Duration {
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
        if (isNaN(this.total)) {
            return "NaN";
        } else if (this.days > 0) {
            return `${this.days}:${zFill(this.hours, 2)}:${zFill(this.minutes, 2)}:${zFill(this.seconds, 2)}`;
        } else if (this.hours > 0) {
            return `${this.hours}:${zFill(this.minutes, 2)}:${zFill(this.seconds, 2)}`;
        } else {
            return `${zFill(this.minutes, 2)}:${zFill(this.seconds, 2)}`;
        }
    }
}

export function zFill(arg, length) {
    return `${("00" + arg).slice(-1 * length)}`;
}

export function typeify(data) {
    var string = "{";
    for (var key of Object.keys(data)) {
        if (Array.isArray(data[key])) {
            string += `${key}:${data[key].length == 0 ? "\"any\"" : typeof data[key][0] == "object" ? (() => {
                const arr = [];
                for (var i = 0; i < data[key].length; i++) {
                    const type = typeify(data[key][i]);
                    if (i == 0 || !arr.includes(type)) {
                        arr.push(type);
                    }
                }
                return arr.length > 1 ? `(${arr.join("|")})` : arr[0];
            })() : typeof data[key][0]}[],`
        } else if (data[key] == null) {
            string += `${key}:${null},`
        } else if (typeof data[key] == "object") {
            string += `${key}:${typeify(data[key])},`
        } else {
            string += `${key}:${typeof data[key]},`
        }
    }
    return (string + "}").replace(",}", "}")
}

/**
 * 
 * @param {*} options 
 * @param {*} body 
 * @deprecated Use {@link fetch}
 */
export async function httpsRequest(options, body) {
    return new Promise((resolve, reject) => {
        const req = request(options, (res) => {
            const buffer = [];
            res.on("data", (chunk) => {
                buffer.push(chunk);
            });
            res.on("end", () => {
                resolve({
                    statusCode: res.statusCode,
                    statusMessage: res.statusMessage,
                    headers: res.headers,
                    body: Buffer.concat(buffer)
                });
            });
        });
        req.on("error", (e) => {
            reject(e);
        });
        if (body) {
            req.write(body);
        }
        req.end();
    });
}

export async function requestAPI(path, body) {
    const response = await httpsRequest(
        {
            hostname: "www.youtube.com",
            path: `/youtubei/v1/${path}?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8`,
            method: "POST",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
                "Content-Type": "application/json"
            }
        },
        JSON.stringify({
            context: {
                client: {
                    clientName: "WEB",
                    clientVersion: "2.20230216.01.00",
                    clientFormFactor: "UNKNOWN_FORM_FACTOR",
                    clientScreen: "WATCH"
                }
            },
            ...body
        }));
    response.body = JSON.parse(response.body);
    return response;
}

export async function requestMusicAPI(path, body) {
    const response = await fetch(
        `https://music.youtube.com/youtubei/v1/${path}?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8`,
        {
            method: "POST",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                context: {
                    client: {
                        clientName: "WEB_REMIX",
                        clientVersion: "1.20230829.05.00",
                    }
                },
                ...body
            })
        }
    );
    return response;
}

const downloads = [];
const busy = null;

export async function download(url, path) {
    const contentLength = (await fetch(url, { method: "HEAD" })).headers.get("content-length");
    if (contentLength === null || contentLength === 0) {
        return null;
    }
    /* sending 100 asynchronous HTTP requests is somehow faster than downloading it all at once due to YouTube's throttling */
    const data = new Array(100);
    const n = Math.floor(contentLength / data.length);
    for (var i = 0; i < data.length; i++) {
        data[i] = fetch(url, { headers: { range: `bytes=${n * i}-${i < (data.length - 1) ? n * (i + 1) - 1 : contentLength}` } }).catch(() => {
            return null;
        });
    }
    for (var i = 0; i < data.length; i++) {
        data[i] = await data[i];
        if (data[i] == null)
            return null;
        const arrayBuffer = await data[i].arrayBuffer();
        if (!(arrayBuffer instanceof ArrayBuffer))
            return null;
        data[i] = Buffer.from(arrayBuffer);
    }
    const buffer = Buffer.concat(data);
    if (buffer.length == 0) {
        return null;
    }
    writeFileSync(path, Buffer.concat(data));
    return path;
}

export {
    MimeType,
    getRenderedText
}