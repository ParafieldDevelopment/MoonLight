const os = require('os');
const path = require('path');

function getIcon() {
    if (os.platform() === 'darwin') {
        return path.join(__dirname, 'assets', 'icon.icns');
    } else if (os.platform() === 'win32') {
        return path.join(__dirname, 'assets', 'icon.ico');
    } else {
        return path.join(__dirname, 'assets', 'icon.ico');
    }
}

function getSplashScreen() {
    return path.join(__dirname, 'assets', 'splashscreen.png');
}

module.exports = { getIcon };
