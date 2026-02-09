import { BrowserWindow } from "electron";

export class Windowmanager {
    windows: {[key: string]: BrowserWindow} = {};

    register(windowname: string, window: BrowserWindow) {
        this.windows[windowname] = window;
    }

    getWindow(windowname: string) {
        return this.windows[windowname];
    }
}

export const windowManager = new Windowmanager();