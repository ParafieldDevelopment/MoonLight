import {exec} from 'child_process';
import ejs = require('ejs');
import mime = require('mime-types');
import path = require('path');
import fs = require('fs/promises');
import os = require('os');
import {protocol} from 'electron';

export function getIcon() {
    if (os.platform() === 'darwin') {
        return path.join(__dirname, '../src/assets', 'icon.icns');
    } else if (os.platform() === 'win32') {
        return path.join(__dirname, '../src/assets', 'icon.ico');
    } else {
        return path.join(__dirname, '../src/assets', 'icon.ico');
    }
}

export function getSplashScreen() {
    return path.join(__dirname, '../src/assets', 'splashscreen.png');
}

export async function registerAppProtocol(basePath = __dirname) {
    console.log("Started content protocol");
    await protocol.handle('app', async (request) => {
        const urlPath = request.url.replace('app://', '');
        const filePath = path.join(basePath, urlPath);

        try {
            const data = await fs.readFile(filePath);
            let mimeType = mime.contentType(path.basename(filePath)) || 'text/plain';

            if (filePath.endsWith('.ttf')) mimeType = 'font/ttf';

            console.log("[" + request.url + "] " + filePath + " [" + mimeType + "]");

            return new Response(data, {
                headers: {'Content-Type': mimeType}
            });
        } catch (err) {
            console.error('[Protocol Error]', filePath, err);

            return new Response('404 Not Found', {
                status: 404,
                headers: {'Content-Type': 'text/plain'}
            });
        }
    });
}

export async function renderDirectTemplate(templatePath: string, data: any = {}) {
    const rendered = await ejs.renderFile(templatePath, {
        ...data,
        urlFor: (relativePath: string) => `app://${relativePath.replace(/\\/g, '/')}`
    });

    return `data:text/html;charset=utf-8,${encodeURIComponent(rendered as string)}`;
}

export async function renderTemplate(templatePath: string, data: any = {}) {
    return await ejs.renderFile(templatePath, {
        ...data,
        urlFor: (relativePath: string) => `app://${relativePath.replace(/\\/g, '/')}`
    });
}