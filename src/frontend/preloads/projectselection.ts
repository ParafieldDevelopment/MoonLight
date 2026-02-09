const { contextBridge, ipcRenderer } = require('electron')

console.log("Project Selection Preload Script Loading...");

contextBridge.exposeInMainWorld('moonlight', {
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
  newProject: () => ipcRenderer.send('new-project'),
  openProject: () => ipcRenderer.send('open-project'),
  vcsProject: () => ipcRenderer.send('vcs-project'),
  openSettings: () => ipcRenderer.send('open-settings'),
  openCollab: () => ipcRenderer.send('open-collab'),
  openExternalLink: (url: string) => ipcRenderer.send('open-external-link', url),
  updateSelectionPage: (callback: (arg0: any) => any) => ipcRenderer.on("moonlight-frontend:updateSelectionPage", (_event: any, data: any) => callback(data))
});