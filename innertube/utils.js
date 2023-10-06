import { writeFileSync } from "fs";
import { request } from "https";

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
        if (this.days > 0) {
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

export function now() {
    const now = new Date(Date.now());
    return `${zFill(now.getMonth(), 2)}/${zFill(now.getDate(), 2)}/${now.getFullYear()} ${zFill(now.getHours(), 2)}:${zFill(now.getMinutes(), 2)}:${zFill(now.getSeconds(), 2)}`;
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
    const response = await httpsRequest(
        {
            hostname: "music.youtube.com",
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
                    clientName: "WEB_REMIX",
                    clientVersion: "1.20230829.05.00",
                }
            },
            ...body
        }));
    response.body = JSON.parse(response.body);
    return response;
}

export async function download(url, path, method = "GET", headers = {}) {
    const contentLength = (await httpsRequest({ host: url.hostname, path: `${url.pathname}?${url.searchParams}`, method: "HEAD" })).headers["content-length"];
    if (contentLength == 0) {
        return null;
    }
    const n = Math.floor(contentLength / 100);
    const data = new Array(100);
    for (var i = 0; i < data.length; i++) {
        data[i] = httpsRequest({ hostname: url.hostname, path: `${url.pathname}?${url.searchParams}`, method: method, headers: { range: `bytes=${n * i}-${i < 99 ? n * (i + 1) - 1 : contentLength}`, ...headers } });
    }
    for (var i = 0; i < data.length; i++) {
        data[i] = (await data[i]).body;
    }
    writeFileSync(path, Buffer.concat(data));
    return path;
}