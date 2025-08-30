const { exec } = require('child_process');
const ejs = require('ejs');
const mime = require('mime-types');
const path = require('path');
const fs = require('fs').promises;
const os = require('os')
const { protocol } = require('electron');

function getIcon() {
    if (os.platform() === 'darwin') {
        return path.join(__dirname, 'assets', 'icon.icns');
    } else if (os.platform() === 'win32') {
        return path.join(__dirname, 'assets', 'icon.ico');
    } else {
        return path.join(__dirname, 'assets', 'icon.ico');
    }
}

function getSplashScreen() {
    return path.join(__dirname, 'assets', 'splashscreen.png');
}

async function registerAppProtocol(basePath = __dirname) {
    console.log("Started content protocol");
    await protocol.handle('app', async (request) => {
        const urlPath = request.url.replace('app://', '');
        const filePath = path.join(basePath, urlPath);

        try {
            const data = await fs.readFile(filePath);
            let mimeType = mime.contentType(path.basename(filePath)) || 'text/plain';

            if (filePath.endsWith('.ttf')) mimeType = 'font/ttf';

            console.log("["+request.url+"] "+filePath+ " ["+mimeType+"]");

            return new Response(data, {
                headers: { 'Content-Type': mimeType }
            });
        } catch (err) {
            console.error('[Protocol Error]', filePath, err);

            return new Response('404 Not Found', {
                status: 404,
                headers: { 'Content-Type': 'text/plain' }
            });
        }
    });
}

async function renderDirectTemplate(templatePath, data = {}) {
    const rendered = await ejs.renderFile(templatePath, {
        ...data,
        urlFor: (relativePath) => `app://${relativePath.replace(/\\/g, '/')}`
    });

    return `data:text/html;charset=utf-8,${encodeURIComponent(rendered)}`;
}

async function renderTemplate(templatePath, data = {}) {
    return await ejs.renderFile(templatePath, {
        ...data,
        urlFor: (relativePath) => `app://${relativePath.replace(/\\/g, '/')}`
    });
}

module.exports = { getIcon,
    registerAppProtocol,
    renderTemplate,
    renderDirectTemplate
};
