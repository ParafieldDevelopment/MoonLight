import electron = require('electron');
import {windowManager} from '../windowmanager';
import rendering = require('../rendering');
import path = require("node:path");
import {ipcMain} from "electron";

export function openprojectselection() {
    return new Promise<void>((resolve) => {
        const isMac = process.platform === 'darwin';

        const window = new electron.BrowserWindow({
            titleBarOverlay: isMac,
            trafficLightPosition: isMac ? { x: 15, y: 13 } : undefined,
            titleBarStyle: isMac ? 'hidden' : undefined,
            autoHideMenuBar: true,

            minWidth: 1200,
            minHeight: 800,
            width: 1200,
            height: 800,
            icon: rendering.getIcon(),
            show: false,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: true,
                preload: path.join((global as any).srcpath, "../dist/preloads", "projectselection.js")
            }
        });
        windowManager.register("projectselection",window);

        window.once('ready-to-show', () => {
            window.show();
            window.setMenu(null);
            window.webContents.openDevTools();
            resolve();
        });

        window.loadURL("moonlight://projectselection");
    });
}
