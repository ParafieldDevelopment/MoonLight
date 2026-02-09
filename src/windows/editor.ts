import electron = require('electron');
import {windowManager} from '../libraries/windowmanager';
import rendering = require('../libraries/rendering');
import path = require("node:path");
import {ipcMain} from "electron";

export async function openeditor() {
    const isMac = process.platform === 'darwin';

    const window = new electron.BrowserWindow({
        titleBarOverlay: isMac,
        trafficLightPosition: isMac ? { x: 15, y: 13 } : undefined,
        titleBarStyle: isMac ? 'hidden' : undefined,
        autoHideMenuBar: true,

        minWidth: 600,
        minHeight: 600,
        width: 1920,
        height: 1080,
        icon: rendering.getIcon(),
        show: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join((global as any).srcpath, "frontend/preloads", "editor.js")
        }
    });

    windowManager.addWindow("editor", window);

    await window.loadURL("moonlight://editor");

    window.show();
    window.setMenu(null);

    window.webContents.openDevTools();
}
