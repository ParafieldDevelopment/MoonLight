const electron = require('electron');
const windowmanager = require('../windowmanager');
const rendering = require('../rendering');
const path = require("node:path");
const {ipcMain} = require("electron");

async function openloginpage() {
    const isMac = process.platform === 'darwin';

    window = new electron.BrowserWindow({
        titleBarOverlay: isMac,
        trafficLightPosition: isMac ? { x: 15, y: 13 } : undefined,
        titleBarStyle: isMac ? 'hidden' : undefined,
        autoHideMenuBar: true,

        minWidth: 600,
        minHeight: 600,
        width: 600,
        height: 600,
        icon: rendering.getIcon(),
        show: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(global.srcpath, "preloads", "login.js")
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

    ipcMain.on('choose-account', (event) => {
        window.webContents.send('loadingmenu-open');

        window.webContents.send('loadingmenu-message',"Continuing with no account...");
    });

    await window.loadURL("moonlight://manual/login");

    window.show();
    window.setMenu(null);

    window.webContents.openDevTools();
}

module.exports = {
    openloginpage,
}