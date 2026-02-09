import electron = require("electron");

export class UrlRegistery {
    registeries: {[key: string]: (request: Request) => Promise<string>};

    constructor() {
        this.registeries = {};
    }

    registerUrl(path: string, callback: (request: Request) => Promise<string>) {
        this.registeries[path] = callback;
    }

    // Handles any requests from the application to show the correct html data
    async request(request: Request) {
        const url = new URL(request.url);

        try {
            const handler = this.registeries[url.hostname];
            const pathSegments = url.pathname.split('/').filter(segment => segment);

            if (!handler) {
                return new Response("<h1>Not found</h1>", {status: 404});
            }

            const returndata = await handler(request);

            return new Response(returndata, {
                status: 200,
                headers: {
                    "Content-Type": "text/html"
                }
            })
            // Error Catcher
        } catch (error) {
            console.error(error);
            return new Response("<h1>An error occurred</h1>", {
                status: 404,
                headers: {
                    "Content-Type": "text/html"
                }
            });
        }
    }
}