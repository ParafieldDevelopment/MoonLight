import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('moonlight', {
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window'),
    close: () => ipcRenderer.send('close-window')
});

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