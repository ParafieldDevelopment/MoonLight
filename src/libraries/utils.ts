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
    LINUX: 'linux',
    OSUNSUPPORTED: 'unknown'
})

export function getRobloxStudioPath(): string | string[] {
    const platform = process.platform;
    const home = os.homedir();

    if (platform === 'win32') {
        return process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Roblox') : path.join(home, 'AppData', 'Local', 'Roblox');
    }
    if (platform === 'darwin') {
        return path.join(home, 'Documents', 'Roblox');
    }
    if (platform === 'linux') {
        const VINEGAR_PATHS = {
            flatpak: path.join(home, '.var/app/org.vinegarhq.Vinegar/data/vinegar/prefixes/studio'),
            standalone: path.join(home, '.local/share/vinegar/prefixes/studio')
        };
        return [VINEGAR_PATHS.flatpak, VINEGAR_PATHS.standalone];
    }
    throw new Error('Unsupported platform: Roblox Studio does not support this OS.');
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

    if (platform === 'linux') {
        return OperatingSystem.LINUX;
    }

    return OperatingSystem.OSUNSUPPORTED;
}

export const homepath = os.homedir();