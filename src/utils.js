const { exec } = require('child_process');
const ejs = require('ejs');
const mime = require('mime-types');
const path = require('path');
const fs = require('fs').promises;
const os = require('os')
const { protocol, ipcMain} = require('electron');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const OperatingSystem = Object.freeze({
    WINDOWS: 'win32',
    MACOS: 'darwin',
    OSUNSUPPORTED: 'unknown'
})

function getAppDataPath() {
    const platform = process.platform;

    if (platform === 'win32') {
        return process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData');
    }
    if (platform === 'darwin') {
        return path.join(os.homedir(), 'Library', 'Application Support');
    }
    throw new Error('Unsupported platform: Roblox Studio does not support Linux.');
}

function getAppDataPathRoaming() {
    const platform = process.platform;

    if (platform === 'win32') {
        return process.env.APPDATA || path.join(os.homedir(), 'AppData');
    }
    if (platform === 'darwin') {
        return path.join(os.homedir(), 'Library', 'Application Support');
    }
    throw new Error('Unsupported platform: Roblox Studio does not support Linux.');
}

async function downloadToTemp(url, filename) {
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, filename);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download: ${res.statusText}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);

    return filePath;
}


async function openDMG(filePath) {
    return new Promise((resolve, reject) => {
        exec(`open "${filePath}"`, (err) => {
            if (err) return reject(err);

            const volumeName = path.basename(filePath, '.dmg');
            exec(`open /Volumes/${volumeName}`, (err2) => {
                if (err2) return reject(err2);
                resolve();
            });
        });
    });
}

function getOperatingSystem() {
    const platform = process.platform;

    if (platform === 'win32') {
        return OperatingSystem.WINDOWS;
    }

    if (platform === 'darwin') {
        return OperatingSystem.MACOS;
    }

    return OperatingSystem.OSUNSUPPORTED;
}

const homepath = os.homedir();

module.exports = {
    sleep,
    getAppDataPath,
    getOperatingSystem,
    OperatingSystem,
    homepath,
    downloadToTemp,
    openDMG
}