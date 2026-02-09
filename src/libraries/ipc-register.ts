import electron = require("electron");
const { ipcMain } = electron;
import { promises as fs } from "fs";
import dialog = electron.dialog;
import rendering = require("./rendering");
import {openeditor} from "../windows/editor";
import path = require("path");

// Centralized IPC handlers for window controls
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

ipcMain.on('open-editor', async () => {
    await openeditor();
});

ipcMain.on('new-project', async (event) => {
    const win = electron.BrowserWindow.fromWebContents(event.sender);
    await dialog.showMessageBox(win!, {
        title: "MoonLight",
        type: "info",
        icon: rendering.getIcon(),
        message: "New Project functionality is coming soon!"
    });
});

ipcMain.on('open-project', async (event) => {
    const win = electron.BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePaths } = await dialog.showOpenDialog(win!, {
        properties: ['openFile', 'openDirectory'],
        filters: [
            { name: 'Roblox Files', extensions: ['rbxl', 'rbxlx'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (!canceled && filePaths.length > 0) {
        console.log("Opening project:", filePaths[0]);
        await openeditor();
    }
});

ipcMain.on('vcs-project', async (event) => {
    const win = electron.BrowserWindow.fromWebContents(event.sender);
    await dialog.showMessageBox(win!, {
        title: "MoonLight",
        type: "info",
        icon: rendering.getIcon(),
        message: "VCS integration is coming soon!"
    });
});

ipcMain.on('open-settings', async (event) => {
    const win = electron.BrowserWindow.fromWebContents(event.sender);
    await dialog.showMessageBox(win!, {
        title: "MoonLight",
        type: "info",
        icon: rendering.getIcon(),
        message: "Settings menu is coming soon!"
    });
});

ipcMain.on('open-collab', async (event) => {
    const win = electron.BrowserWindow.fromWebContents(event.sender);
    await dialog.showMessageBox(win!, {
        title: "MoonLight",
        type: "info",
        icon: rendering.getIcon(),
        message: "Collaboration features are coming soon!"
    });
});

ipcMain.on('open-external-link', async (event, url: string) => {
    await electron.shell.openExternal(url);
});

ipcMain.on('menu-action', async (event, action: string) => {
    const win = electron.BrowserWindow.fromWebContents(event.sender);
    console.log("Menu action received:", action);

    switch (action) {
        case 'exit':
            electron.app.quit();
            break;
        case 'about':
            await dialog.showMessageBox(win!, {
                title: "About MoonLight",
                type: "info",
                icon: rendering.getIcon(),
                message: `MoonLight IDE\nVersion: ${electron.app.getVersion()}\n\nDeveloped by Parafield Studios`
            });
            break;
        case 'documentation':
            await electron.shell.openExternal('https://github.com/ParafieldDevelopment/MoonLight');
            break;
        case 'report-issue':
            await electron.shell.openExternal('https://github.com/ParafieldDevelopment/MoonLight/issues');
            break;
        default:
            await dialog.showMessageBox(win!, {
                title: "MoonLight",
                type: "info",
                icon: rendering.getIcon(),
                message: `${action.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} functionality is coming soon!`
            });
            break;
    }
});

ipcMain.on('save-setting', async (event, key: string, value: any, filename: string = 'editor_window.json') => {
    const settingsPath = path.join(electron.app.getPath('userData'),'MoonlightIDE', filename);
    try {
        let settings: any = {};
        try {
            const data = await fs.readFile(settingsPath, 'utf-8');
            settings = JSON.parse(data);
        } catch (e) {
            // Settings file doesn't exist or is invalid, use empty object
        }
        settings[key] = value;
        await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Failed to save setting:', error);
    }
});

ipcMain.handle('get-setting', async (event, key: string, defaultValue: any, filename: string = 'editor_window.json') => {
    const settingsPath = path.join(electron.app.getPath('userData'),'MoonlightIDE', filename);
    try {
        const data = await fs.readFile(settingsPath, 'utf-8');
        const settings = JSON.parse(data);
        return settings[key] !== undefined ? settings[key] : defaultValue;
    } catch (e) {
        return defaultValue;
    }
});

// File System API
ipcMain.handle('read-file', async (event, filePath: string) => {
    try {
        return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
        console.error('Failed to read file:', error);
        throw error;
    }
});

ipcMain.handle('write-file', async (event, filePath: string, content: string) => {
    try {
        await fs.writeFile(filePath, content, 'utf-8');
        return true;
    } catch (error) {
        console.error('Failed to write file:', error);
        throw error;
    }
});

ipcMain.handle('list-files', async (event, dirPath: string) => {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        return entries.map(entry => ({
            name: entry.name,
            type: entry.isDirectory() ? 'folder' : 'file',
            path: path.join(dirPath, entry.name)
        }));
    } catch (error) {
        console.error('Failed to list files:', error);
        throw error;
    }
});

// Editor Events
ipcMain.on('editor-event', (event, name, data) => {
    console.log(`Editor event [${name}]:`, data);
    // Can be used to broadcast to other windows or handle specific logic
});