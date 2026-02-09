import WebSocket from "ws";
import { BaseRequest } from "./Requests";
import { DataReturnHolder } from "./DataReturnHolder";
import { UnknownRequestException } from "./Exceptions";

export class RequestBuffer {
    roblox_client: WebSocket | undefined;
    constructor(roblox_client: WebSocket | undefined) {
        this.roblox_client = roblox_client;
    }
    requestBuffer: BaseRequest[] = [];
    private resolvers: Map<string, { resolve: (request: BaseRequest) => void, reject: (reason: any) => void }> = new Map();

    setClient(roblox_client: WebSocket | undefined) {
        this.roblox_client = roblox_client;
    }

    submitRequest(request: BaseRequest) {
        if (!this.roblox_client) {
            console.warn("Attempted to submit request while no client is connected.");
            return;
        }
        this.requestBuffer.push(request);
        this.roblox_client.send(request.compileData());
    }

    processData(data: WebSocket.RawData, isBinary: boolean) {
        const request = this.requestBuffer.shift();
        if (request) {
            const callbacks = this.resolvers.get(request.request_id);
            this.resolvers.delete(request.request_id);

            if (callbacks) {
                if (!isBinary) {
                    try {
                        const parsed = JSON.parse(data.toString());
                        if (parsed && parsed.error === true) {
                            callbacks.reject(new UnknownRequestException(parsed.detail || "No details provided"));
                            return;
                        }
                    } catch (e) {
                        // Not JSON or other parsing error, treat as normal data
                    }
                }

                request.result = new DataReturnHolder(data, isBinary);
                callbacks.resolve(request);
            }
        }
    }

    clearBuffer(reason: string) {
        while (this.requestBuffer.length > 0) {
            const request = this.requestBuffer.shift();
            if (request) {
                const callbacks = this.resolvers.get(request.request_id);
                if (callbacks) {
                    this.resolvers.delete(request.request_id);
                    callbacks.reject(new Error(reason));
                }
            }
        }
    }

    waitUntilRequestFinished(request: BaseRequest): Promise<BaseRequest> {
        return new Promise((resolve, reject) => {
            if (request.result) {
                resolve(request);
            } else {
                this.resolvers.set(request.request_id, { resolve, reject });
            }
        });
    }
}