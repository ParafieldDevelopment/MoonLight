const electron = require("electron");
const dialog = electron.dialog;
const path = require("path");
const fs = require("fs");
const rendering = require("./rendering");
const utils = require("./utils");

let loadingwindow = null;

console.log("Starting MoonLight...");
console.log(__dirname);

async function main() {
    loadingwindow = new electron.BrowserWindow({
        width: 800,
        height: 450,
        frame: false,
        transparent: true,
        resizable: false,
        fullscreenable: false,
        autoHideMenuBar: true,
        show: false,
        title: 'MoonLight - '+electron.app.getVersion(),
        icon: rendering.getIcon(),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    loadingwindow.removeMenu();
    loadingwindow.setMenuBarVisibility(false);
    loadingwindow.focus();

    await loadingwindow.loadFile(path.join(__dirname,"templates","starting.html"));

    loadingwindow.show();

    loadingwindow.setOpacity(0);
    let opacity = 0;
    const fadeIn = setInterval(() => {
        opacity += 0.5;
        loadingwindow.setOpacity(opacity);
        if(opacity >= 1) clearInterval(fadeIn);
    }, 16);

    await utils.sleep(300);

    await dialog.showMessageBox({
        title: "MoonLight - Alpha Build Warning",
        type: "info",
        icon: rendering.getIcon(),
        message: "Alpha Build Warning:\n\n" +
            "Thank you for downloading MoonLight!\n" +
            "Since this is a Alpha build (very early stage of this IDE), not everything is completed and there will be some major bugs!\n\n" +
            "If you do encounter any bugs. Please create a issue in https://github.com/ParafieldDevelopment/MoonLight\n\n" +
            "In the meantime please enjoy MoonLight\n" +
            "\n"+
            "Developed by Parafield Studios!"
    })

    loadingwindow.hide();
    loadingwindow.destroy();
}

electron.app.on('ready', async() => {
    try {
        await main();
    } catch (error) {
        loadingwindow.hide();
        await dialog.showMessageBox(loadingwindow,{
                title: "MoonLight - Crashed",
                type: "error",
                icon: rendering.getIcon(),
                message: "Uh oh.\nMoonLight has crashed!\n\n\nFull log provided below\n\n"+error.stack
            }
        ).then(() => {
            process.exit(1);
        });
    }
});