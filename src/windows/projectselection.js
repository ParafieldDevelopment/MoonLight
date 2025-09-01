const electron = require('electron');
const windowmanager = require('../windowmanager');
const rendering = require('../rendering');
const path = require("node:path");
const {ipcMain} = require("electron");

async function openprojectselection() {
    const isMac = process.platform === 'darwin';

    window = new electron.BrowserWindow({
        titleBarOverlay: isMac,
        trafficLightPosition: isMac ? { x: 15, y: 13 } : undefined,
        titleBarStyle: isMac ? 'hidden' : undefined,
        autoHideMenuBar: true,

        minWidth: 800,
        minHeight: 800,
        width: 1200,
        height: 800,
        icon: rendering.getIcon(),
        show: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(global.srcpath, "preloads", "projectselection.js")
        }
    });

    await windowmanager.windowmanagerins.register("login",window);

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


    await window.loadURL("moonlight://projectselection");

    window.show();
    window.setMenu(null);

    window.webContents.openDevTools();
}

module.exports = {
    openprojectselection,
}