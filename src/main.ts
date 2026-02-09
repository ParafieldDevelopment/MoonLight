//     /$$      /$$  /$$$$$$   /$$$$$$  /$$   /$$ /$$       /$$$$$$  /$$$$$$  /$$   /$$ /$$$$$$$$        /$$$$$$   /$$$$$$  /$$       /$$   /$$ /$$$$$$$$ /$$$$$$  /$$$$$$  /$$   /$$  /$$$$$$
//    | $$$    /$$$ /$$__  $$ /$$__  $$| $$$ | $$| $$      |_  $$_/ /$$__  $$| $$  | $$|__  $$__/       /$$__  $$ /$$__  $$| $$      | $$  | $$|__  $$__/|_  $$_/ /$$__  $$| $$$ | $$ /$$__  $$
//    | $$$$  /$$$$| $$  \ $$| $$  \ $$| $$$$| $$| $$        | $$  | $$  \__/| $$  | $$   | $$         | $$  \__/| $$  \ $$| $$      | $$  | $$   | $$     | $$  | $$  \ $$| $$$$| $$| $$  \__/
//    | $$ $$/$$ $$| $$  | $$| $$  | $$| $$ $$ $$| $$        | $$  | $$ /$$$$| $$$$$$$$   | $$         |  $$$$$$ | $$  | $$| $$      | $$  | $$   | $$     | $$  | $$  | $$| $$ $$ $$|  $$$$$$
//    | $$  $$$| $$| $$  | $$| $$  | $$| $$  $$$$| $$        | $$  | $$|_  $$| $$__  $$   | $$          \____  $$| $$  | $$| $$      | $$  | $$   | $$     | $$  | $$  | $$| $$  $$$$ \____  $$
//    | $$\  $ | $$| $$  | $$| $$  | $$| $$\  $$$| $$        | $$  | $$  \ $$| $$  | $$   | $$          /$$  \ $$| $$  | $$| $$      | $$  | $$   | $$     | $$  | $$  | $$| $$\  $$$ /$$  \ $$
//    | $$ \/  | $$|  $$$$$$/|  $$$$$$/| $$ \  $$| $$$$$$$$ /$$$$$$|  $$$$$$/| $$  | $$   | $$         |  $$$$$$/|  $$$$$$/| $$$$$$$$|  $$$$$$/   | $$    /$$$$$$|  $$$$$$/| $$ \  $$|  $$$$$$/
//    |__/     |__/ \______/  \______/ |__/  \__/|________/|______/ \______/ |__/  \__/   |__/          \______/  \______/ |________/ \______/    |__/   |______/ \______/ |__/  \__/ \______/

// MOONLIGHT SOLUTIONS | LAST UPDATED: N/A | Main.js
// Main.js


// Requirements
import electron = require("electron");
const dialog = electron.dialog;
import path = require("path");
import { promises as fs } from "fs";
import rendering = require("./libraries/rendering");
import utils = require("./libraries/utils");
import {spawn} from 'child_process';
import {UrlRegistery} from "./libraries/urlregistery";
import {openprojectselection} from "./windows/projectselection";
import {MoonlightWebsocketServer} from "./roblox/MoonlightWebsocketServer";
import EventEmitter from "node:events";

let loadingwindow: electron.BrowserWindow | null = null;
declare global {
    var ideEvents: EventEmitter;
}

if (!global.ideEvents) {
    global.ideEvents = new EventEmitter();
}

console.log("Starting MoonLight...");

(global as any).srcpath = __dirname;

let robloxstudio_location: string | null = null;

async function checkRobloxStudio() {
    const osType = utils.getOperatingSystem();
    if (osType === utils.OperatingSystem.OSUNSUPPORTED) {
        console.error('Unsupported operating system!');
        await dialog.showMessageBox({
            title: "MoonLight - Unsupported Operating System",
            type: "error",
            icon: rendering.getIcon(),
            message: "Sorry!\n\n" +
                "Your current OS isn't fully supported by MoonLight. Roblox Studio features may be limited.\n" +
                "Please consider using Windows or macOS for full functionality, or ensure Roblox Studio is installed via Vinegar on Linux."
        });
        return;
    }

    let foundRobloxStudio = false;
    const potentialPaths = utils.getRobloxStudioPath();

    if (Array.isArray(potentialPaths)) {
        for (const pPath of potentialPaths) {
            console.log(`Checking for Roblox Studio at: ${pPath}`);
            try {
                await fs.access(pPath);
                console.log(`Roblox Studio Located at ${pPath}`);
                robloxstudio_location = pPath;
                foundRobloxStudio = true;
                break;
            } catch {
                // Continue to the next path
            }
        }
    } else {
        console.log(`Checking for Roblox Studio at: ${potentialPaths}`);
        try {
            await fs.access(potentialPaths);
            console.log(`Roblox Studio Located at ${potentialPaths}`);
            robloxstudio_location = potentialPaths;
            foundRobloxStudio = true;
        } catch {
            // Not found, proceed to install/dialog logic
        }
    }

    if (!foundRobloxStudio) {
        console.error('Could not find Roblox Studio!');
        if (osType === utils.OperatingSystem.LINUX) {
            await dialog.showMessageBox({
                title: "MoonLight - Could not find Roblox Studio",
                type: "info",
                icon: rendering.getIcon(),
                message: "MoonLight could not find a Roblox Studio installation via Vinegar.\n\n" +
                    "Please ensure Roblox Studio is installed via Vinegar (Flatpak or Standalone) for full functionality.\n" +
                    "You can continue using MoonLight without Roblox Studio, but some features will be disabled."
            });
            return;
        }

        const {response} = await dialog.showMessageBox({
            type: "question",
            buttons: ["Install", "Just Download the Installer", "Cancel"],
            defaultId: 0,
            cancelId: 2,
            title: "MoonLight - Could not find Roblox Studio",
            message: "Oops!\n\nMoonLight cannot find Roblox Studio!\nWould you like to automagically install Roblox Studio?",
            icon: rendering.getIcon()
        });

        if (response === 0) {
            console.log("Starting automatic install.");
            if (osType === utils.OperatingSystem.MACOS) {
                await utils.openDMG(await utils.downloadToTemp("https://roblox.com/download/studio", "robloxstudioinstaller.dmg"));
                await dialog.showMessageBox({
                    title: "MoonLight - Opened",
                    type: "info",
                    icon: rendering.getIcon(),
                    message: "A new finder window has been opened with the Roblox Studio Installer app" +
                        "\nDouble Click the \"RobloxStudioInstaller\" to launch the app and start the install.\n\n" +
                        "Once completed please relaunch MoonLight."
                });
                process.exit();
            } else if (osType === utils.OperatingSystem.WINDOWS) {
                try {
                    const exePath = await utils.downloadToTemp(
                        "https://roblox.com/download/studio",
                        "robloxstudioinstaller.exe"
                    );

                    const child = spawn(exePath, [], {
                        detached: true,
                        stdio: 'ignore'
                    });
                    child.unref();
                } catch (err: any) {
                    console.error(err.stack);
                    console.error('Error during download or launch:', err);
                    await dialog.showMessageBox({
                        title: "MoonLight - Error",
                        type: "error",
                        icon: rendering.getIcon(),
                        message: "A problem occurred while downloading and launching the installer."
                    });
                }
                await dialog.showMessageBox({
                    title: "MoonLight - Opened",
                    type: "info",
                    icon: rendering.getIcon(),
                    message: "The Roblox Studio Installer has been opened and should now be installing Roblox Studio!\n\n" +
                        "Once completed please relaunch MoonLight."
                });
                process.exit();
            }
        } else if (response === 1) {
            console.log("Starting download.");
            // await openURL("https://roblox.com/download/studio"); // openURL is not defined in the original file
            await dialog.showMessageBox({
                type: "info",
                title: "MoonLight - Download Started",
                message: "Download Started\n\n" +
                    "Please run the installer to install Roblox Studio. Once completed please relaunch MoonLight.",
                icon: rendering.getIcon()
            });
            process.exit();
        } else {
            process.exit();
        }
    }
}

// The starting point for Moonlight
async function main() {
    loadingwindow = new electron.BrowserWindow({
        width: 700,
        height: 394,
        frame: false,
        transparent: true,
        resizable: false,
        fullscreenable: false,
        autoHideMenuBar: true,
        show: false,
        title: 'MoonLight - ' + electron.app.getVersion(),
        icon: rendering.getIcon(),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    loadingwindow.removeMenu();
    loadingwindow.setMenuBarVisibility(false);
    loadingwindow.focus();

    await loadingwindow.loadFile(path.join(__dirname, "frontend/html", "starting.html"));

    loadingwindow.show();

    loadingwindow.setOpacity(0);
    let opacity = 0;
    const fadeIn = setInterval(() => {
        opacity += 0.5;
        loadingwindow!.setOpacity(opacity);
        if (opacity >= 1) clearInterval(fadeIn);
    }, 16);

    await utils.sleep(300);


    // Alpha Notice Message - THIS IS A BLOCKING OPERATION AND WILL DELAY STARTUP
    await dialog.showMessageBox({
        title: "MoonLight - Alpha Build Warning",
        type: "info",
        icon: rendering.getIcon(),
        message: "Alpha Build Warning:\n\n" +
            "Thank you for downloading MoonLight!\n" +
            "Since this is a Alpha build (very early stage of this IDE), not everything is completed and there will be some major bugs!\n\n" +
            "If you do encounter any bugs. Please create a issue in https://github.com/ParafieldDevelopment/MoonLight\n\n" +
            "In the meantime please enjoy MoonLight\n" +
            "\n" +
            "Developed by Parafield Studios!"
    });

    try {
        await fs.mkdir(path.join(electron.app.getPath('userData'), 'MoonlightIDE'));
    } catch (ignored) {}
    console.log(path.join(electron.app.getPath('userData'), 'MoonlightIDE'))

    await checkRobloxStudio();

    (global as any).robloxstudio = robloxstudio_location;

    await rendering.registerAppProtocol(__dirname);

    (global as any).platform = utils.getOperatingSystem();
    (global as any).urlregistery = new UrlRegistery();
    electron.protocol.handle("moonlight", (request) => (global as any).urlregistery.request(request));

    // Register login.html
    (global as any).urlregistery.registerUrl("login", async function (request: Request) {
        return await rendering.renderTemplate(path.join(__dirname, "frontend/html", "login.html"))
    });

    // Register projectselection.html
    (global as any).urlregistery.registerUrl("projectselection", async function (request: Request) {
        return await rendering.renderTemplate(path.join(__dirname, "frontend/html", "projectselection.html"))
    });

    // Register editor.html
    (global as any).urlregistery.registerUrl("editor", async function (request: Request) {
        return await rendering.renderTemplate(path.join(__dirname, "frontend/html", "editor.html"))
    });

    // Register settings.html
    (global as any).urlregistery.registerUrl("settings", async function (request: Request) {
        return await rendering.renderTemplate(path.join(__dirname, "frontend/html", "settings.html"))
    });

    // Register manual file registration
    (global as any).urlregistery.registerUrl("manual", async function (request: Request) {
        const url = new URL(request.url);
        const segments = url.pathname.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];

        console.log(lastSegment);

        return await rendering.renderTemplate(path.join(__dirname, "frontend/html", lastSegment+".html"))
    });

    require("./libraries/ipc-register");

    // await require("./windows/loginpage").openloginpage();
    await openprojectselection();

    loadingwindow!.hide();
    loadingwindow!.destroy();
}

export async function exitIDE() {
    console.log("Exiting MoonLight...");

    ideEvents.emit('ide:exiting');

    if (MoonlightWebsocketServer.exists()) {
        console.log("Shutting down Moonlight Websocket Server...");
        MoonlightWebsocketServer.get().shutdown();
    }

    electron.app.quit();
}

// Crash Handler
electron.app.on('ready', async () => {
    try {
        await main();
    } catch (error: any) {
        console.error("[ CRASHED ]\nFull traceback below\n")
        console.error(error.stack);
        if (loadingwindow) {
            await dialog.showMessageBox(loadingwindow, {
                    title: "MoonLight - Crashed",
                    type: "error",
                    icon: rendering.getIcon(),
                    message: "MoonLight has crashed!\n\n\nFull log provided below\n\n" + error.stack
                }
            ).then(() => {
                process.exit(1);
            });

            loadingwindow.hide();
            loadingwindow.destroy();
        } else {
             process.exit(1);
        }
    }
});

electron.app.on('window-all-closed', async () => {
    await exitIDE();
});
