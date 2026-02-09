import {contextBridge, ipcRenderer} from "electron";

contextBridge.exposeInMainWorld('moonlight', {
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window'),
    close: () => ipcRenderer.send('close-window'),
    openExternalLink: (url: string) => ipcRenderer.send('open-external-link', url)
});