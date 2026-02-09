import { BrowserWindow } from "electron";

export class Windowmanager {
    windows: {[key: string]: BrowserWindow} = {};

    addWindow(windowname: string, window: BrowserWindow) {
        this.windows[windowname] = window;
    }

    getWindow(windowname: string) {
        return this.windows[windowname];
    }

    isWindowOpen(windowname: string) {
        return this.windows[windowname] !== undefined;
    }

    closeWindow(windowname: string) {
        this.windows[windowname].close();
        delete this.windows[windowname];
    }

    deregisterWindow(windowname: string) {
        delete this.windows[windowname];
    }
}

export const windowManager = new Windowmanager();