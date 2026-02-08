import { exec } from 'child_process';
import ejs = require('ejs');
import mime = require('mime-types');
import path = require('path');
import fs = require('fs/promises');
import os = require('os');
import { protocol, ipcMain} from 'electron';

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const OperatingSystem = Object.freeze({
    WINDOWS: 'win32',
    MACOS: 'darwin',
    OSUNSUPPORTED: 'unknown'
})

export function getAppDataPath() {
    const platform = process.platform;

    if (platform === 'win32') {
        return process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData');
    }
    if (platform === 'darwin') {
        return path.join(os.homedir(), 'Library', 'Application Support');
    }
    throw new Error('Unsupported platform: Roblox Studio does not support Linux.');
}

export function getAppDataPathRoaming() {
    const platform = process.platform;

    if (platform === 'win32') {
        return process.env.APPDATA || path.join(os.homedir(), 'AppData');
    }
    if (platform === 'darwin') {
        return path.join(os.homedir(), 'Library', 'Application Support');
    }
    throw new Error('Unsupported platform: Roblox Studio does not support Linux.');
}

export async function downloadToTemp(url: string, filename: string) {
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, filename);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download: ${res.statusText}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return filePath;
}

export async function openDMG(filePath: string) {
    return new Promise<void>((resolve, reject) => {
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

export function getOperatingSystem() {
    const platform = process.platform;

    if (platform === 'win32') {
        return OperatingSystem.WINDOWS;
    }

    if (platform === 'darwin') {
        return OperatingSystem.MACOS;
    }

    return OperatingSystem.OSUNSUPPORTED;
}

export const homepath = os.homedir();