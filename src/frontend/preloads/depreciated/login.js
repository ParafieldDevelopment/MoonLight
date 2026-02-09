const {contextBridge, ipcRenderer} = require('electron');

api = {
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window'),
    close: () => ipcRenderer.send('close-window'),

    chooseAccount: (account) => ipcRenderer.send('choose-account',account),
    addNewAccount: () => ipcRenderer.send('new-account'),

    onMessageUpdate: (callback) => ipcRenderer.on('loadingmenu-message', (_event,message) => callback(message)),
    onLoadingMenuCancel: (callback) => ipcRenderer.on('loadingmenu-cancel', (_event) => callback()),
    onOpenLoading: (callback) => ipcRenderer.on('loadingmenu-open', (_event) => callback()),
}

contextBridge.exposeInMainWorld('moonlight', api);

window.addEventListener('DOMContentLoaded', () => {
    const minButton = document.getElementById('min-btn');
    const maxButton = document.getElementById('max-btn');
    const closeButton = document.getElementById('close-btn');

    if (minButton) {
        minButton.addEventListener('click', () => {
            ipcRenderer.send('minimize-window');
        });
    }

    if (maxButton) {
        maxButton.addEventListener('click', () => {
            ipcRenderer.send('maximize-window');
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            ipcRenderer.send('close-window');
        });
    }
});

/**
 * @typedef {typeof api} MoonlightAPI
 */

/**
 * @type {MoonlightAPI}
 */
window.moonlight;