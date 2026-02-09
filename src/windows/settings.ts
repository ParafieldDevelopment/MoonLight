import electron = require('electron');
import {windowManager} from '../libraries/windowmanager';
import rendering = require('../libraries/rendering');
import path = require("node:path");

async function openSettings() {
    if (windowManager.getWindow("settings")) {
        windowManager.getWindow("settings").focus();
        return
    }

    const isMac = process.platform === 'darwin';

    const window = new electron.BrowserWindow({
        titleBarOverlay: isMac,
        trafficLightPosition: isMac ? { x: 15, y: 13 } : undefined,
        titleBarStyle: isMac ? 'hidden' : undefined,
        autoHideMenuBar: true,

        minWidth: 800,
        minHeight: 800,
        width: 800,
        height: 800,
        icon: rendering.getIcon(),
        show: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join((global as any).srcpath, "frontend/preloads", "settings.js")
        }
    });
    windowManager.addWindow("settings",window);

    window.once('ready-to-show', () => {
        window.show();
        window.setMenu(null);
        window.webContents.openDevTools();
    });

    window.once('closed', () => {
        windowManager.deregisterWindow("settings");
        window.destroy();
    })

    await window.loadURL("moonlight://settings");
}

export {openSettings};