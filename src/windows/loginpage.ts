import electron = require('electron');
import {windowManager} from '../libraries/windowmanager';
import rendering = require('../libraries/rendering');
import path = require("node:path");
import {ipcMain} from "electron";
import {openprojectselection} from "./projectselection";
import utils = require('../libraries/utils');

export async function openLoginPage() {
    if (windowManager.getWindow("login")) {
        windowManager.getWindow("login").focus();
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
        width: 1000,
        height: 800,
        icon: rendering.getIcon(),
        show: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join((global as any).srcpath, "frontend/preloads", "login.js")
        }
    });

    windowManager.addWindow("login", window);

    ipcMain.on('choose-account', async (event) => {
        const win = electron.BrowserWindow.fromWebContents(event.sender);

        window.webContents.send('loadingmenu-open');

        window.webContents.send('loadingmenu-message',"Continuing with no account...");

        await openprojectselection();

        windowManager.closeWindow("login");
    });

    await window.loadURL("moonlight://login");

    window.show();
    window.setMenu(null);

    // Should be disabled in production builds
    window.webContents.openDevTools();

    window.once('closed', () => {
        windowManager.deregisterWindow("login");
        window.destroy();
    })
}
