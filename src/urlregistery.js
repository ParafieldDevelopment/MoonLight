const electron = require("electron");
let urlregistery;

class UrlRegistery {
    constructor() {
        this.registeries = {};
    }

    registerUrl(path, callback) {
        this.registeries.add(path, callback);
    }

    // Handles any requests from the application to show the correct html data
    async request(request){
        const url = new URL(request.url);

        try {
            const handler = this.registeries[url.hostname];
            const pathSegments = url.pathname.split('/').filter(segment => segment);

            if (!handler) {
                return new Response("<h1>Not found</h1>", { status: 404 });
            }

            const returndata = await handler(pathSegments);

            return new Response(returndata, {
                status: 200,
                headers: {
                    "Content-Type": "text/html"
                }
            })
            // Error Catcher
        } catch(error) {
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

async function startUrlRegistery(){
    urlregistery = new UrlRegistery();
    await electron.protocol.handle("launcher",request => urlregistery.request);
}

module.exports = {
    UrlRegistery,
    urlregistery,
    startUrlRegistery,
}