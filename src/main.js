//     /$$      /$$  /$$$$$$   /$$$$$$  /$$   /$$ /$$       /$$$$$$  /$$$$$$  /$$   /$$ /$$$$$$$$        /$$$$$$   /$$$$$$  /$$       /$$   /$$ /$$$$$$$$ /$$$$$$  /$$$$$$  /$$   /$$  /$$$$$$
//    | $$$    /$$$ /$$__  $$ /$$__  $$| $$$ | $$| $$      |_  $$_/ /$$__  $$| $$  | $$|__  $$__/       /$$__  $$ /$$__  $$| $$      | $$  | $$|__  $$__/|_  $$_/ /$$__  $$| $$$ | $$ /$$__  $$
//    | $$$$  /$$$$| $$  \ $$| $$  \ $$| $$$$| $$| $$        | $$  | $$  \__/| $$  | $$   | $$         | $$  \__/| $$  \ $$| $$      | $$  | $$   | $$     | $$  | $$  \ $$| $$$$| $$| $$  \__/
//    | $$ $$/$$ $$| $$  | $$| $$  | $$| $$ $$ $$| $$        | $$  | $$ /$$$$| $$$$$$$$   | $$         |  $$$$$$ | $$  | $$| $$      | $$  | $$   | $$     | $$  | $$  | $$| $$ $$ $$|  $$$$$$
//    | $$  $$$| $$| $$  | $$| $$  | $$| $$  $$$$| $$        | $$  | $$|_  $$| $$__  $$   | $$          \____  $$| $$  | $$| $$      | $$  | $$   | $$     | $$  | $$  | $$| $$  $$$$ \____  $$
//    | $$\  $ | $$| $$  | $$| $$  | $$| $$\  $$$| $$        | $$  | $$  \ $$| $$  | $$   | $$          /$$  \ $$| $$  | $$| $$      | $$  | $$   | $$     | $$  | $$  | $$| $$\  $$$ /$$  \ $$
//    | $$ \/  | $$|  $$$$$$/|  $$$$$$/| $$ \  $$| $$$$$$$$ /$$$$$$|  $$$$$$/| $$  | $$   | $$         |  $$$$$$/|  $$$$$$/| $$$$$$$$|  $$$$$$/   | $$    /$$$$$$|  $$$$$$/| $$ \  $$|  $$$$$$/
//    |__/     |__/ \______/  \______/ |__/  \__/|________/|______/ \______/ |__/  |__/   |__/          \______/  \______/ |________/ \______/    |__/   |______/ \______/ |__/  \__/ \______/

// MOONLIGHT SOLUTIONS | LAST UPDATED: N/A | Main.js
// Main.js


// Requirements
const electron = require("electron");
const dialog = electron.dialog;
const path = require("path");
const fs = require("fs");
const rendering = require("./rendering");
const utils = require("./utils");
const {spawn} = require('child_process');
const {UrlRegistery} = require("./urlregistery");
const {Windowmanager} = require("./windowmanager");
const windowmanager = require("./windowmanager");
const {getOperatingSystem} = require("./utils");

let loadingwindow = null;

console.log("Starting MoonLight...");
console.log(__dirname);

global.srcpath = __dirname;

let robloxstudio_location = null;

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

    await loadingwindow.loadFile(path.join(__dirname, "templates", "starting.html"));

    loadingwindow.show();

    loadingwindow.setOpacity(0);
    let opacity = 0;
    const fadeIn = setInterval(() => {
        opacity += 0.5;
        loadingwindow.setOpacity(opacity);
        if (opacity >= 1) clearInterval(fadeIn);
    }, 16);

    await utils.sleep(300);

    // Alpha Notice Message
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

    // Detects if ur using anything besides Windows or MacOS
    if (utils.getOperatingSystem() === utils.OperatingSystem.OSUNSUPPORTED) {
        console.error("Current OS is unsupported!");

        // Message Box
        await dialog.showMessageBox({
            title: "MoonLight - Unsupported Operating System",
            type: "error",
            icon: rendering.getIcon(),
            message: "Sorry!\n\n" +
                "Your current OS isn't supported by MoonLight yet and it cannot start as Roblox Studio isn't supported here\n" +
                "Please switch to Windows or macOS to continue using MoonLight."
        });
        process.exit();
    }

    console.log("Locating Roblox Studio.");

    // /Users/USERNAME/Documents/Roblox/Plugins
    // C:\Users\USERNAME\AppData\Local\Roblox\Plugins

    const osType = utils.getOperatingSystem();

    let potentialPath;

    console.log(utils.getOperatingSystem());
    console.log("Locating Roblox Studio.");

    // Checks if it's Windows or Mac
    if (osType === utils.OperatingSystem.MACOS) {
        potentialPath = path.join(utils.homepath, 'Documents', 'Roblox');
        console.log("Checking " + path.join(utils.homepath, 'Documents', 'Roblox'));
    } else if (osType === utils.OperatingSystem.WINDOWS) {
        potentialPath = path.join(utils.getAppDataPath(), 'Roblox');
        console.log("Checking " + path.join(utils.getAppDataPath(), 'Roblox'));
    } else {
        console.error('Unsupported operating system!');
    }

    // Installs Studio if not detected
    if (potentialPath) {
        if (fs.existsSync(potentialPath)) {
            console.log(`Roblox Studio Located at ${potentialPath}`);
            robloxstudio_location = potentialPath;
        } else {
            console.error('Could not find Roblox Studio!');

            // Message Box
            const {response} = await dialog.showMessageBox({
                type: "question",
                buttons: ["Install", "Just Download the Installer", "Cancel"],
                defaultId: 0,
                cancelId: 1,
                title: "MoonLight - Could not find Roblox Studio",
                // WHAT IS THIS INTENTIONAL TYPO LMFAO :sob: - batista
                // yes - mas6y6
                message: "Oops!\n\nMoonLight cannot find Roblox Studio!\nWould you like to automagically install Roblox Studio?",
                icon: rendering.getIcon()
            });

            if (response === 0) {
                console.log("Starting automatic install.");
                if (utils.getOperatingSystem() === utils.OperatingSystem.MACOS) {
                    await utils.openDMG(utils.downloadToTemp("https://roblox.com/download/studio", "robloxstudioinstaller.dmg"));

                    await dialog.showMessageBox({
                        title: "MoonLight - Opened",
                        type: "info",
                        icon: rendering.getIcon(),
                        message: "A new finder window has been opened with the Roblox Studio Installer app" +
                            "\nDouble Click the \"RobloxStudioInstaller\" to launch the app and start the install.\n\n" +
                            "Once completed please relaunch MoonLight."
                    });
                    process.exit();
                } else if (utils.getOperatingSystem() === utils.OperatingSystem.WINDOWS) {
                    try {

                        const exePath = await utils.downloadToTemp(
                            "https://roblox.com/download/studio",
                            "robloxstudioinstaller.exe"
                        );

                        if (!fs.existsSync(exePath)) throw new Error("Downloaded installer not found!");

                        const child = spawn(exePath, [], {
                            detached: true,
                            stdio: 'ignore'
                        });

                        child.unref();
                    } catch (err) {
                        console.error(err.stack);
                        console.error('Error during download or launch:', err);
                        await dialog.showMessageBox({
                            title: "MoonLight - Error",
                            type: "error",
                            icon: rendering.getIcon(),
                            message: "A problem occurred while downloading and launching the installer."
                        });
                        process.exit();
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

            }
            if (response === 1) {
                console.log("Starting download.");
                await openURL("https://roblox.com/download/studio");
                const {response} = await dialog.showMessageBox({
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

    global.robloxstudio = robloxstudio_location;

    console.log("Starting Asset Handler");

    await rendering.registerAppProtocol(__dirname);

    console.log("Starting URL Handler");

    global.platform = utils.getOperatingSystem();
    global.urlregistery = new UrlRegistery();
    electron.protocol.handle("moonlight", (request) => global.urlregistery.request(request));

    global.urlregistery.registerUrl("login", async function (request) {
        return await rendering.renderTemplate(path.join(__dirname, "templates", "login.html"))
    });

    global.urlregistery.registerUrl("projectselection", async function (request) {
        return await rendering.renderTemplate(path.join(__dirname, "templates", "projectselection.html"))
    });

    global.urlregistery.registerUrl("manual", async function (request) {
        const url = new URL(request.url);
        const segments = url.pathname.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];

        console.log(lastSegment);

        return await rendering.renderTemplate(path.join(__dirname, "templates", lastSegment+".html"))
    });

    windowmanager.windowmanagerins = new Windowmanager();

    await require("./windows/loginpage").openloginpage();

    loadingwindow.hide();
    loadingwindow.destroy();
}

// Crash Handler
electron.app.on('ready', async () => {
    try {
        await main();
    } catch (error) {
        console.error("[ CRASHED ]\nFull traceback below\n")
        console.error(error.stack);
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
    }
});