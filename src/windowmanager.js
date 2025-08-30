let windowmanagerins = null;

class Windowmanager {
    constructor() {
        this.windows = {}
    }

    async register(windowname, window) {
        this.windows[windowname] = window;
    }

    async getWindow(windowname) {
        return this.windows[windowname];
    }
}

module.exports = {
    Windowmanager,
    windowmanagerins
};