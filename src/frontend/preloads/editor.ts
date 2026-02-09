const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('moonlight', {
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
  menuAction: (action: string) => ipcRenderer.send('menu-action', action),
  saveSetting: (key: string, value: any, filename?: string) => ipcRenderer.send('save-setting', key, value, filename),
  getSetting: (key: string, defaultValue: any, filename?: string) => ipcRenderer.invoke('get-setting', key, defaultValue, filename),
  
  // Generic communication
  send: (channel: string, ...data: any[]) => {
    const validChannels = ['editor-event', 'menu-action', 'save-file', 'open-external-link'];
    if (validChannels.includes(channel) || channel.startsWith('window-')) {
        ipcRenderer.send(channel, ...data);
    }
  },
  invoke: (channel: string, ...data: any[]) => {
    const validChannels = ['read-file', 'write-file', 'list-files', 'get-setting'];
    if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...data);
    }
    return Promise.reject(new Error(`Invalid channel: ${channel}`));
  },
  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = ['menu-action', 'editor-command', 'file-changed'];
    if (validChannels.includes(channel)) {
        const subscription = (_event: any, ...args: any[]) => callback(...args);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
    }
    return () => {};
  }
})

export {};
