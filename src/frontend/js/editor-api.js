/**
 * MoonLight Editor API
 * Provides a high-level interface to interact with the editor.
 */
(function() {
    const events = {};

    window.moonlightEditor = {
        // Event System
        on(event, callback) {
            if (!events[event]) events[event] = [];
            events[event].push(callback);
            return () => {
                events[event] = events[event].filter(cb => cb !== callback);
            };
        },

        emit(event, ...args) {
            if (events[event]) {
                events[event].forEach(cb => cb(...args));
            }
        },

        // Tab Management
        tabs: {
            open(name, id, content) {
                if (content !== undefined && window.testFileData) {
                    window.testFileData[id] = content;
                }
                window.editorTabs.addTab(name, id);
            },
            close(id) {
                window.editorTabs.closeTab(id);
            },
            setActive(id) {
                window.editorTabs.setActiveTab(id);
            },
            getActive() {
                const activeTab = document.querySelector('.tab.active');
                return activeTab ? activeTab.dataset.id : null;
            }
        },

        // Explorer Management
        explorer: {
            refresh() {
                if (window.renderExplorer && window.testStructure && window.projectList) {
                    window.renderExplorer(window.testStructure.children, window.projectList, 0, document.getElementById('explorer-search-input').value);
                    window.moonlightEditor.emit('explorer-refreshed');
                }
            },
            getStructure() {
                return window.testStructure;
            },
            setStructure(structure) {
                window.testStructure = structure;
                this.refresh();
                window.moonlightEditor.emit('explorer-updated', structure);
            }
        },

        // Editor Content
        content: {
            get() {
                return document.getElementById('editor-textarea').value;
            },
            set(value) {
                document.getElementById('editor-textarea').value = value;
                const activeTab = document.querySelector('.tab.active');
                if (activeTab && window.testFileData) {
                    window.testFileData[activeTab.dataset.id] = value;
                }
                window.moonlightEditor.emit('content-changed', value);
            }
        },

        // Settings
        settings: {
            async get(key, defaultValue) {
                return await window.moonlight.getSetting(key, defaultValue);
            },
            async set(key, value) {
                return await window.moonlight.saveSetting(key, value);
            }
        },
        
        // Electron / IPC Helpers
        electron: {
            send(channel, ...args) {
                window.moonlight.send(channel, ...args);
            },
            async invoke(channel, ...args) {
                return await window.moonlight.invoke(channel, ...args);
            },
            on(channel, callback) {
                return window.moonlight.on(channel, callback);
            }
        }
    };

    console.log("MoonLight Editor API Loaded");
})();
