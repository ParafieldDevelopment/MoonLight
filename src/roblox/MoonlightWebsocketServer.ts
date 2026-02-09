import WebSocket, {WebSocketServer} from "ws";
import {RequestBuffer} from "./RequestBuffer";
import {BaseRequest} from "./Requests";



export class MoonlightWebsocketServer {
    private static _instance: MoonlightWebsocketServer | null = null;

    public static init(port: number): MoonlightWebsocketServer {
        if (MoonlightWebsocketServer._instance) {
            throw new Error("MoonlightWebsocketServer is already initialized.");
        }
        MoonlightWebsocketServer._instance = new MoonlightWebsocketServer(port);
        return MoonlightWebsocketServer._instance;
    }

    public static get(): MoonlightWebsocketServer {
        if (!MoonlightWebsocketServer._instance) {
            throw new Error(
                "MoonlightWebsocketServer not initialized yet. Call init(port) first."
            );
        }
        return MoonlightWebsocketServer._instance;
    }

    public static exists(): boolean {
        return MoonlightWebsocketServer._instance !== null;
    }

    wss: WebSocketServer;
    roblox_client: WebSocket | undefined = undefined;
    requestbuffer: RequestBuffer = new RequestBuffer(undefined);
    private connectionWaiters: { resolve: () => void, reject: (reason: any) => void }[] = [];

    constructor(port: number) {
        this.wss = new WebSocketServer({ port: port });

        this.wss.on('connection', (ws: WebSocket) => {
            if (!this.roblox_client) {
                this.roblox_client = ws;
                this.requestbuffer.setClient(ws);
                console.log("Client connected. Waiting 0.5s for setup...");

                setTimeout(() => {
                    if (this.roblox_client === ws) {
                        while (this.connectionWaiters.length > 0) {
                            const waiter = this.connectionWaiters.shift();
                            if (waiter) waiter.resolve();
                        }
                    }
                }, 500);

                ws.on('close', () => {
                    console.log("Client disconnected.");
                    this.roblox_client = undefined;
                    this.requestbuffer.setClient(undefined);
                    this.requestbuffer.clearBuffer("Client disconnected.");
                });

                ws.on('error', (err) => {
                    console.warn("Client error:", err);
                    this.roblox_client = undefined;
                    this.requestbuffer.setClient(undefined);
                    this.requestbuffer.clearBuffer(`Client error: ${err.message}`);
                });

                ws.on('message', (msg: WebSocket.RawData, isBinary: boolean) => {
                    this.requestbuffer.processData(msg, isBinary);
                });

            } else {
                console.log("Rejected connection: already a client connected.");
                ws.close(1000, "Client already connected to Moonlight.");
            }
        });

        this.wss.on('close', () => {
            console.log("Server closed.");
            if (this.roblox_client) {
                this.roblox_client.close(1000, "Server shutting down.");
            }
            this.roblox_client = undefined;
        });
    }

    submitRequest(request: BaseRequest) {
        this.requestbuffer.submitRequest(request);
        return this.requestbuffer.waitUntilRequestFinished(request);
    }

    waitForConnection(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.roblox_client) {
                resolve();
            } else {
                this.connectionWaiters.push({ resolve, reject });
            }
        });
    }

    shutdown(): void {
        this.wss.close();
        
        if (this.roblox_client) {
            this.roblox_client.close(1000, "Moonlight Shutting down");
            this.roblox_client = undefined;
        }

        this.requestbuffer.setClient(undefined);
        this.requestbuffer.clearBuffer("Moonlight Shutting down");

        while (this.connectionWaiters.length > 0) {
            const waiter = this.connectionWaiters.shift();
            if (waiter) waiter.reject(new Error("Moonlight Shutting down"));
        }
        MoonlightWebsocketServer._instance = null;
    }
}