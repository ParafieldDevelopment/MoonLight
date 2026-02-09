import electron = require('electron');
import {windowManager} from '../libraries/windowmanager';
import rendering = require('../libraries/rendering');
import path = require("node:path");
import {ipcMain} from "electron";
import * as fs from "node:fs/promises";

export function openprojectselection() {
    return new Promise<void>(async (resolve) => {
        if (windowManager.getWindow("projectselection")) {
            windowManager.getWindow("projectselection").focus();
            return
        }
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
                preload: path.join((global as any).srcpath, "frontend/preloads", "projectselection.js")
            }
        });
        windowManager.addWindow("projectselection",window);

        window.once('ready-to-show', () => {
            window.show();
            window.setMenu(null);
            window.webContents.openDevTools();
            resolve();
        });

        await window.loadURL("moonlight://projectselection");
        let project_json_path = path.join(electron.app.getPath('userData'), 'MoonlightIDE','projects.json');

        try {
            await fs.access(project_json_path);
        } catch {
            await fs.writeFile(project_json_path, "[]");
            return;
        }
        let projects = JSON.parse(await fs.readFile(project_json_path, 'utf-8'));
        window.webContents.send('moonlight-frontend:updateSelectionPage',projects);
    });
}
