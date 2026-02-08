import electron = require('electron');
import {windowManager} from '../windowmanager';
import rendering = require('../rendering');
import path = require("node:path");
import {ipcMain} from "electron";
import {openprojectselection} from "./projectselection";
import utils = require('../utils');

export async function openloginpage() {
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
            preload: path.join((global as any).srcpath, "../dist/preloads", "login.js")
        }
    });

    await windowManager.register("login",window);

    ipcMain.on('minimize-window', (event) => {
        const win = electron.BrowserWindow.fromWebContents(event.sender);

        if (win) win.minimize();
    });

    ipcMain.on('maximize-window', (event) => {
        const win = electron.BrowserWindow.fromWebContents(event.sender);

        if (win) {
            if (win.isMaximized()) win.unmaximize();
            else win.maximize();
        }
    });

    ipcMain.on('close-window', (event) => {
        const win = electron.BrowserWindow.fromWebContents(event.sender);
        if (win) win.close();
    });

    ipcMain.on('choose-account', async (event) => {
        const win = electron.BrowserWindow.fromWebContents(event.sender);

        window.webContents.send('loadingmenu-open');

        window.webContents.send('loadingmenu-message',"Continuing with no account...");

        await openprojectselection();

        win!.close();
    });

    await window.loadURL("moonlight://login");

    window.show();
    window.setMenu(null);

    // Should be disabled in production builds
    window.webContents.openDevTools();
}