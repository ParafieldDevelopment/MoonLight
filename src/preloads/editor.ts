const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('moonlight', {
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
  menuAction: (action: string) => ipcRenderer.send('menu-action', action),
  saveSetting: (key: string, value: any) => ipcRenderer.send('save-setting', key, value),
  getSetting: (key: string, defaultValue: any) => ipcRenderer.invoke('get-setting', key, defaultValue)
})

export {};
