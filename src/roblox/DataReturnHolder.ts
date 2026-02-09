import WebSocket from "ws";

export class DataReturnHolder {
    private data: WebSocket.RawData;
    private isBinary: boolean;

    constructor(data: WebSocket.RawData, isBinary: boolean) {
        this.data = data;
        this.isBinary = isBinary;
    }

    getBinary(): Buffer {
        if (!this.isBinary) {
            throw new TypeError("Data is not binary");
        }
        return this.data as Buffer;
    }

    getString(): string {
        if (this.isBinary) {
            throw new TypeError("Data is binary, cannot convert to string");
        }
        return this.data.toString();
    }

    getJson<T = any>(): T {
        try {
            const str = this.getString();
            return JSON.parse(str) as T;
        } catch (err) {
            throw new TypeError("Failed to parse data as JSON: " + (err as Error).message);
        }
    }

    isDataBinary(): boolean {
        return this.isBinary;
    }
}
