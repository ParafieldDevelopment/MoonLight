document.getElementById('min-btn').addEventListener('click', () => window.moonlight.minimize());
document.getElementById('max-btn').addEventListener('click', () => window.moonlight.maximize());
document.getElementById('close-btn').addEventListener('click', () => window.moonlight.close());

// Menu dropdown logic
const menuButtons = document.querySelectorAll('.topbar-buttons p');
const dropdowns = document.querySelectorAll('.dropdown-menu');

menuButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = btn.nextElementSibling;
        const isShowing = menu.classList.contains('show');

        // Hide all first
        dropdowns.forEach(d => d.classList.remove('show'));
        menuButtons.forEach(b => b.classList.remove('active'));

        if (!isShowing) {
            menu.classList.add('show');
            btn.classList.add('active');
        }
    });

    btn.addEventListener('mouseenter', () => {
        // If another menu is already open, switch to this one
        const anyOpen = Array.from(dropdowns).some(d => d.classList.contains('show'));
        if (anyOpen) {
            dropdowns.forEach(d => d.classList.remove('show'));
            menuButtons.forEach(b => b.classList.remove('active'));
            btn.nextElementSibling.classList.add('show');
            btn.classList.add('active');
        }
    });
});

// Close menus when clicking outside
document.addEventListener('click', () => {
    dropdowns.forEach(d => d.classList.remove('show'));
    menuButtons.forEach(b => b.classList.remove('active'));
});

// Handle menu item actions
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        console.log("Menu Action:", action);

        if (window.moonlight && window.moonlight.menuAction) {
            window.moonlight.menuAction(action);
        }

        dropdowns.forEach(d => d.classList.remove('show'));
        menuButtons.forEach(b => b.classList.remove('active'));
    });
});

// Tab Management
const tabsContainer = document.getElementById('editor-tabs');
const editorTextarea = document.getElementById('editor-textarea');

editorTextarea.addEventListener('input', () => {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        testFileData[activeTab.dataset.id] = editorTextarea.value;
    }
    if (window.moonlightEditor) window.moonlightEditor.emit('content-changed', editorTextarea.value);
});

// Test Content Map
const testFileData = {
    'default-script': 'print("Hello from ServerScript!")',
    'client-script': 'print("Hello from ClientScript!")',
    'utils-module': 'module.exports = { \n    greet: () => console.log("Hello from Utils!") \n};',
    'styles-css': 'body { background-color: #2b2b2b; color: #dcdcdc; }',
    'index-html': '<!DOCTYPE html>\n<html>\n<head>\n    <title>Test Page</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n</body>\n</html>'
};

window.editorTabs = {
    addTab(name, id) {
        // Check if tab already exists
        const existingTab = document.querySelector(`.tab[data-id="${id}"]`);
        if (existingTab) {
            this.setActiveTab(id);
            return;
        }

        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.setAttribute('data-id', id);
        tab.innerHTML = `<span>${name}</span><button class="close-tab">×</button>`;

        tab.addEventListener('click', () => {
            this.setActiveTab(id);
        });

        tab.querySelector('.close-tab').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(id);
        });

        tabsContainer.appendChild(tab);
        this.setActiveTab(id);
        document.querySelector('.editor-area').classList.remove('is-hidden');
        if (window.moonlightEditor) window.moonlightEditor.emit('tab-opened', { name, id });
    },

    closeTab(id) {
        const tab = document.querySelector(`.tab[data-id="${id}"]`);
        if (!tab) return;

        const wasActive = tab.classList.contains('active');
        const nextTab = tab.nextElementSibling || tab.previousElementSibling;

        tab.remove();

        if (wasActive && nextTab) {
            const nextId = nextTab.getAttribute('data-id');
            this.setActiveTab(nextId);
        } else if (wasActive) {
            // If no more tabs, clear editor or show something
            editorTextarea.value = '';
        }

        if (tabsContainer.children.length === 0) {
            document.querySelector('.editor-area').classList.add('is-hidden');
            const breadcrumb = document.querySelector('.breadcrumb span');
            if (breadcrumb) {
                breadcrumb.textContent = testStructure.name;
            }
        }
        if (window.moonlightEditor) window.moonlightEditor.emit('tab-closed', id);
    },

    setActiveTab(id) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        const tab = document.querySelector(`.tab[data-id="${id}"]`);
        if (tab) {
            tab.classList.add('active');

            // Update editor content with test data
            if (testFileData[id] !== undefined) {
                editorTextarea.value = testFileData[id];
            }

            // Update breadcrumb
            const breadcrumb = document.querySelector('.breadcrumb span');
            if (breadcrumb) {
                const fileName = tab.querySelector('span').textContent;
                // For demo, we just show project name > Workspace > filename
                breadcrumb.textContent = `${testStructure.name} > Workspace > ${fileName}`;
            }
            if (window.moonlightEditor) window.moonlightEditor.emit('tab-changed', id);
        }
    }
};

// Explorer Logic
const projectList = document.querySelector('.project-list');
const openEditorsList = document.querySelector('.open-editors-list');
const searchInput = document.getElementById('explorer-search-input');
const contextMenu = document.getElementById('explorer-context-menu');
let contextTargetItem = null;

let testStructure = {
    name: 'MyProject',
    type: 'folder',
    metadata: {},
    children: [
        { name: 'Workspace', type: 'folder', metadata: { created: '2026-02-09' }, children: [
                { name: 'ServerScript.js', type: 'file', id: 'default-script', metadata: { language: 'javascript' } },
                { name: 'ClientScript.js', type: 'file', id: 'client-script', metadata: { language: 'javascript' } },
                { name: 'Modules', type: 'folder', metadata: { description: 'Utility modules' }, children: [
                        { name: 'Utils.js', type: 'file', id: 'utils-module', metadata: { language: 'javascript' } }
                    ]}
            ]},
        { name: 'Assets', type: 'folder', metadata: { theme: 'dark' }, children: [
                { name: 'styles.css', type: 'file', id: 'styles-css', metadata: { type: 'stylesheet' } },
                { name: 'index.html', type: 'file', id: 'index-html', metadata: { type: 'entrypoint' } }
            ]},
        { name: 'README.md', type: 'file', id: 'readme', metadata: { priority: 'high' } }
    ]
};

const expandedFolders = new Set(['Workspace', 'Assets', 'Modules']);

function getIconForFile(name, type) {
    if (type === 'folder') {
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg>`;
    }
    const ext = name.split('.').pop().toLowerCase();
    switch(ext) {
        case 'js': return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f7df1e"><path d="M3 3h18v18H3V3zm11.235 12.353c0 .17.02.341.06.511.04.17.1.32.181.45.08.131.18.24.301.321.12.08.26.12.421.12.16 0 .3-.04.421-.12a.85.85 0 0 0 .301-.321c.08-.13.14-.28.181-.45.04-.17.06-.341.06-.511v-3.715h1.363v3.715c0 .361-.05.691-.151.992a2.44 2.44 0 0 1-.44 1.101 2.3 2.3 0 0 1-.803.742c-.341.2-.741.301-1.202.301-.461 0-.861-.1-1.202-.301a2.3 2.3 0 0 1-.803-.742 2.44 2.44 0 0 1-.44-1.101c-.101-.301-.151-.631-.151-.992h1.363zm-4.148-2.67c.08.131.18.24.301.321.12.08.26.12.421.12.16 0 .3-.04.421-.12a.85.85 0 0 0 .301-.321.84.84 0 0 0 .181-.45c.04-.17.06-.341.06-.511 0-.17-.02-.341-.06-.511a.84.84 0 0 0-.181-.45.85.85 0 0 0-.301-.321.82.82 0 0 0-.421-.12c-.16 0-.3.04-.421.12a.85.85 0 0 0-.301.321.84.84 0 0 0-.181.45.82.82 0 0 0-.06.511c0 .17.02.341.06.511.04.17.1.32.181.45zM8.33 17.5h1.363c0 .361.05.691.151.992.1.301.24.6.44 1.101.2.5.46.85.803 1.05.34.2.74.3 1.2.3.46 0 .86-.1 1.2-.3a2.3 2.3 0 0 0 .8-.74c.15-.3.26-.6.33-.9a2.44 2.44 0 0 0 .12-.99h-1.36c0 .17-.02.34-.06.51-.04.17-.1.32-.18.45a.85.85 0 0 1-.3.32c-.12.08-.26.12-.42.12-.16 0-.3-.04-.42-.12a.85.85 0 0 1-.3-.32.84.84 0 0 1-.18-.45.82.82 0 0 1-.06-.51v-3.71h-1.36v3.71z"/></svg>`;
        case 'css': return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#264de4"><path d="M3 2l1.596 17.196L12 22l7.404-2.804L21 2H3zm13.917 11.536l-.286 3.127-5.631 2.128-5.631-2.128-.153-1.68h2.008l.068.742 3.708 1.401 3.708-1.401.189-2.063H6.81l-.142-1.554h10.435l-.186-2.037H6.526l-.142-1.554h12.47l.142 1.554-.189 2.063h-2.01z"/></svg>`;
        case 'html': return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e34c26"><path d="M3 2l1.596 17.196L12 22l7.404-2.804L21 2H3zm13.917 11.536l-.286 3.127-5.631 2.128-5.631-2.128-.153-1.68h2.008l.068.742 3.708 1.401 3.708-1.401.189-2.063H6.81l-.142-1.554h10.435l-.186-2.037H6.526l-.142-1.554h12.47l.142 1.554-.189 2.063h-2.01z"/></svg>`;
        case 'md': return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" /></svg>`;
        default: return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>`;
    }
}

function renderExplorer(items, container, depth = 0, searchTerm = '') {
    container.innerHTML = '';
    const term = searchTerm.toLowerCase();

    // Sort items: folders first, then by name length
    const sortedItems = [...items].sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        if (a.name.length !== b.name.length) return a.name.length - b.name.length;
        return a.name.localeCompare(b.name);
    });

    sortedItems.forEach(item => {
        let matches = item.name.toLowerCase().includes(term);
        if (!matches && item.type === 'folder' && item.children) {
            const hasMatchingChild = (children) => children.some(c => c.name.toLowerCase().includes(term) || (c.type === 'folder' && c.children && hasMatchingChild(c.children)));
            matches = hasMatchingChild(item.children);
        }
        if (term && !matches) return;
        const li = document.createElement('li');
        const itemEl = document.createElement('div');
        itemEl.className = 'file-item';
        const itemId = item.id || item.name;
        itemEl.dataset.id = itemId;
        itemEl.dataset.name = item.name;
        itemEl.dataset.type = item.type;
        itemEl.style.paddingLeft = `${depth * 28 + 12}px`;

        // Drag and Drop
        itemEl.draggable = !item.isNaming;
        itemEl.addEventListener('dragstart', (e) => {
            e.stopPropagation();
            e.dataTransfer.setData('text/plain', itemId);
            e.dataTransfer.effectAllowed = 'move';
            itemEl.classList.add('dragging');
        });
        itemEl.addEventListener('dragend', () => itemEl.classList.remove('dragging'));
        itemEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (item.type === 'folder') {
                itemEl.classList.add('drag-over');
            }
        });
        itemEl.addEventListener('dragleave', () => itemEl.classList.remove('drag-over'));
        itemEl.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            itemEl.classList.remove('drag-over');
            const draggedId = e.dataTransfer.getData('text/plain');
            if (draggedId !== itemId) {
                moveItemInStructure(testStructure.children, draggedId, item.type === 'folder' ? itemId : null);
                renderExplorer(testStructure.children, projectList, 0, searchInput.value);
            }
        });

        if (item.type === 'folder') {
            const arrow = document.createElement('div');
            arrow.className = 'arrow-icon';
            const isExpanded = expandedFolders.has(item.name) || (term !== '');
            if (isExpanded) arrow.classList.add('expanded');
            arrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>`;
            itemEl.appendChild(arrow);
            const folderIcon = document.createElement('div');
            folderIcon.innerHTML = getIconForFile(item.name, 'folder');
            itemEl.appendChild(folderIcon);

            if (item.isNaming) {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'explorer-rename-input';
                input.value = item.name;
                itemEl.appendChild(input);
                setTimeout(() => { input.focus(); input.select(); }, 0);
                handleNamingInput(input, item);
            } else {
                const name = document.createElement('span');
                name.textContent = item.name;
                itemEl.appendChild(name);
            }

            li.appendChild(itemEl);
            const childContainer = document.createElement('ul');
            childContainer.className = 'file-list folder-content';
            if (isExpanded) childContainer.classList.add('show');
            li.appendChild(childContainer);
            itemEl.addEventListener('click', (e) => {
                if (item.isNaming) return;
                e.stopPropagation();
                document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
                itemEl.classList.add('active');
                const expanded = arrow.classList.toggle('expanded');
                childContainer.classList.toggle('show', expanded);
                if (expanded) expandedFolders.add(item.name);
                else expandedFolders.delete(item.name);
            });
            renderExplorer(item.children, childContainer, depth + 1, term);
        } else {
            const fileIcon = document.createElement('div');
            fileIcon.innerHTML = getIconForFile(item.name, 'file');
            itemEl.appendChild(fileIcon);

            if (item.isNaming) {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'explorer-rename-input';
                input.value = item.name;
                itemEl.appendChild(input);
                setTimeout(() => { input.focus(); input.select(); }, 0);
                handleNamingInput(input, item);
            } else {
                const name = document.createElement('span');
                name.textContent = item.name;
                itemEl.appendChild(name);
            }

            itemEl.addEventListener('click', (e) => {
                if (item.isNaming) return;
                e.stopPropagation();
                document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
                itemEl.classList.add('active');
                window.editorTabs.addTab(item.name, item.id);
            });
            li.appendChild(itemEl);
        }
        itemEl.addEventListener('contextmenu', (e) => {
            e.preventDefault(); e.stopPropagation();
            document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
            itemEl.classList.add('active');
            contextTargetItem = item;
            showContextMenu(e.clientX, e.clientY);
        });
        container.appendChild(li);
    });
}

function updateOpenEditors() {
    openEditorsList.innerHTML = '';
    document.querySelectorAll('.tab').forEach(tab => {
        const id = tab.dataset.id;
        const name = tab.querySelector('span').textContent;
        const li = document.createElement('li');
        const itemEl = document.createElement('div');
        itemEl.className = 'file-item';
        if (tab.classList.contains('active')) itemEl.classList.add('active');
        itemEl.style.paddingLeft = '15px';
        const fileIcon = document.createElement('div');
        fileIcon.innerHTML = getIconForFile(name, 'file');
        itemEl.appendChild(fileIcon);
        const nameSpan = document.createElement('span');
        nameSpan.textContent = name;
        itemEl.appendChild(nameSpan);
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-tab-explorer';
        closeBtn.innerHTML = '×';
        closeBtn.style.marginLeft = 'auto';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.editorTabs.closeTab(id);
        });
        itemEl.appendChild(closeBtn);
        itemEl.addEventListener('click', () => window.editorTabs.setActiveTab(id));
        li.appendChild(itemEl);
        openEditorsList.appendChild(li);
    });
}

function showContextMenu(x, y) {
    contextMenu.style.display = 'block';
    const menuWidth = contextMenu.offsetWidth, menuHeight = contextMenu.offsetHeight;
    const windowWidth = window.innerWidth, windowHeight = window.innerHeight;
    if (x + menuWidth > windowWidth) x -= menuWidth;
    if (y + menuHeight > windowHeight) y -= menuHeight;
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
}

document.addEventListener('click', () => { contextMenu.style.display = 'none'; });

document.querySelectorAll('.section-header').forEach(header => {
    header.addEventListener('click', (e) => {
        if (e.target.closest('.panel-actions')) return;
        const content = header.nextElementSibling;
        const arrow = header.querySelector('.arrow-icon');
        const isShown = content.classList.toggle('show');
        arrow.classList.toggle('expanded', isShown);
    });
});

function handleNamingInput(input, item) {
    let finished = false;
    const finish = (cancel = false) => {
        if (finished) return;
        finished = true;
        delete item.isNaming;
        if (cancel) {
            if (item.isNew) {
                removeItemFromStructure(testStructure.children, item.id || item.name);
            }
        } else {
            const newName = input.value.trim();
            if (newName) {
                if (item.type === 'folder' && expandedFolders.has(item.name)) {
                    expandedFolders.delete(item.name);
                    expandedFolders.add(newName);
                }
                item.name = newName;
                if (item.isNew) delete item.isNew;
            } else if (item.isNew) {
                removeItemFromStructure(testStructure.children, item.id || item.name);
            }
        }
        renderExplorer(testStructure.children, projectList, 0, searchInput.value);
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') finish();
        if (e.key === 'Escape') finish(true);
    });
    input.addEventListener('blur', () => finish());
}

function addItemToStructure(items, targetId, newItem) {
    if (!targetId) { items.push(newItem); return true; }
    for (let item of items) {
        if (item.type === 'folder') {
            if ((item.id || item.name) === targetId) { item.children.push(newItem); expandedFolders.add(item.name); return true; }
            if (addItemToStructure(item.children, targetId, newItem)) return true;
        }
    }
    return false;
}

function removeItemFromStructure(items, id) {
    for (let i = 0; i < items.length; i++) {
        if ((items[i].id || items[i].name) === id) { items.splice(i, 1); return true; }
        if (items[i].type === 'folder' && items[i].children) { if (removeItemFromStructure(items[i].children, id)) return true; }
    }
    return false;
}

function renameItemInStructure(items, id, newName) {
    for (let item of items) {
        if ((item.id || item.name) === id) { item.name = newName; return true; }
        if (item.type === 'folder' && item.children) { if (renameItemInStructure(item.children, id, newName)) return true; }
    }
    return false;
}

function moveItemInStructure(items, draggedId, targetFolderId) {
    if (draggedId === targetFolderId) return;

    let draggedItem = null;

    // Find the dragged item and check if target is a descendant
    const isDescendant = (parent, id) => {
        if (!parent.children) return false;
        for (let child of parent.children) {
            if ((child.id || child.name) === id) return true;
            if (child.type === 'folder' && isDescendant(child, id)) return true;
        }
        return false;
    };

    const findItem = (list, id) => {
        for (let item of list) {
            if ((item.id || item.name) === id) return item;
            if (item.type === 'folder' && item.children) {
                const found = findItem(item.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const itemToMove = findItem(items, draggedId);
    if (itemToMove && itemToMove.type === 'folder' && targetFolderId && isDescendant(itemToMove, targetFolderId)) {
        console.warn("Cannot move folder into its own descendant");
        return;
    }

    // Find and remove the dragged item
    const findAndRemove = (list) => {
        for (let i = 0; i < list.length; i++) {
            if ((list[i].id || list[i].name) === draggedId) {
                draggedItem = list.splice(i, 1)[0];
                return true;
            }
            if (list[i].type === 'folder' && list[i].children) {
                if (findAndRemove(list[i].children)) return true;
            }
        }
        return false;
    };

    findAndRemove(items);

    if (draggedItem) {
        addItemToStructure(items, targetFolderId, draggedItem);
    }
}

function collapseAll(items) {
    items.forEach(item => {
        if (item.type === 'folder') { expandedFolders.delete(item.name); if (item.children) collapseAll(item.children); }
    });
}

searchInput.addEventListener('input', (e) => renderExplorer(testStructure.children, projectList, 0, e.target.value));

document.getElementById('new-file-btn').addEventListener('click', () => {
    const activeItem = document.querySelector('.project-list .file-item.active');
    let targetFolderId = activeItem && activeItem.dataset.type === 'folder' ? activeItem.dataset.id : null;
    const id = 'new-file-' + Date.now();
    const newItem = { name: '', type: 'file', id: id, isNaming: true, isNew: true, metadata: {} };
    addItemToStructure(testStructure.children, targetFolderId, newItem);
    renderExplorer(testStructure.children, projectList, 0, searchInput.value);
});

document.getElementById('new-folder-btn').addEventListener('click', () => {
    const activeItem = document.querySelector('.project-list .file-item.active');
    let targetFolderId = activeItem && activeItem.dataset.type === 'folder' ? activeItem.dataset.id : null;
    const id = 'new-folder-' + Date.now();
    const newItem = { name: '', type: 'folder', children: [], id: id, isNaming: true, isNew: true, metadata: {} };
    addItemToStructure(testStructure.children, targetFolderId, newItem);
    renderExplorer(testStructure.children, projectList, 0, searchInput.value);
});

document.getElementById('collapse-all-btn').addEventListener('click', () => {
    collapseAll(testStructure.children);
    renderExplorer(testStructure.children, projectList, 0, searchInput.value);
});

document.getElementById('refresh-explorer-btn').addEventListener('click', () => renderExplorer(testStructure.children, projectList, 0, searchInput.value));

document.getElementById('close-all-tabs-btn').addEventListener('click', () => {
    const tabs = Array.from(document.querySelectorAll('.tab'));
    tabs.forEach(tab => window.editorTabs.closeTab(tab.dataset.id));
});

contextMenu.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (!action) return;

    const id = contextTargetItem ? (contextTargetItem.id || contextTargetItem.name) : null;

    switch(action) {
        case 'new-file':
            const newFileId = 'new-file-' + Date.now();
            addItemToStructure(testStructure.children, (contextTargetItem && contextTargetItem.type === 'folder') ? id : null, { name: '', type: 'file', id: newFileId, isNaming: true, isNew: true, metadata: {} });
            break;
        case 'new-folder':
            const newFolderId = 'new-folder-' + Date.now();
            addItemToStructure(testStructure.children, (contextTargetItem && contextTargetItem.type === 'folder') ? id : null, { name: '', type: 'folder', children: [], id: newFolderId, isNaming: true, isNew: true, metadata: {} });
            break;
        case 'rename':
            if (contextTargetItem) contextTargetItem.isNaming = true;
            break;
        case 'delete':
            if (contextTargetItem && confirm(`Are you sure you want to delete ${contextTargetItem.name}?`)) {
                removeItemFromStructure(testStructure.children, id);
            }
            break;
    }
    renderExplorer(testStructure.children, projectList, 0, searchInput.value);
    contextMenu.style.display = 'none';
});

// Wrap Tab management methods to update explorer
const originalAddTab = window.editorTabs.addTab;
window.editorTabs.addTab = function(name, id) {
    originalAddTab.call(this, name, id);
    updateOpenEditors();
};

const originalCloseTab = window.editorTabs.closeTab;
window.editorTabs.closeTab = function(id) {
    originalCloseTab.call(this, id);
    updateOpenEditors();
};

const originalSetActiveTab = window.editorTabs.setActiveTab;
window.editorTabs.setActiveTab = function(id) {
    originalSetActiveTab.call(this, id);
    updateOpenEditors();
};

// Initialize Explorer
const projectListContainer = document.querySelector('.project-list-container');

projectListContainer.addEventListener('contextmenu', (e) => {
    if (e.target === projectListContainer || e.target === projectList) {
        e.preventDefault();
        contextTargetItem = null; // Target is root
        showContextMenu(e.clientX, e.clientY);
    }
});

projectListContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    projectListContainer.classList.add('drag-over');
});
projectListContainer.addEventListener('dragleave', () => projectListContainer.classList.remove('drag-over'));
projectListContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    projectListContainer.classList.remove('drag-over');
    if (e.target === projectListContainer || e.target === projectList) {
        const draggedId = e.dataTransfer.getData('text/plain');
        moveItemInStructure(testStructure.children, draggedId, null);
        renderExplorer(testStructure.children, projectList, 0, searchInput.value);
    }
});

renderExplorer(testStructure.children, projectList);
updateOpenEditors();

// Initialize with a default tab if needed
window.editorTabs.addTab('ServerScript.js', 'default-script');

// Tool window toggling logic
const toolButtons = document.querySelectorAll('.tool-window-button');
const sidePanel = document.getElementById('project-panel');
const resizer = document.getElementById('explorer-resizer');
const bottomResizer = document.getElementById('bottom-resizer');

async function updateBottomResizerVisibility() {
    const anyBottomVisible = !document.getElementById('problems-panel').classList.contains('is-hidden') ||
        !document.getElementById('output-panel').classList.contains('is-hidden');
    bottomResizer.style.display = anyBottomVisible ? 'block' : 'none';
}

async function initExplorerState() {
    if (!window.moonlight || !window.moonlight.getSetting) return;

    const isCollapsed = await window.moonlight.getSetting('collapsed', false, 'sidebar.json');
    const explorerWidth = await window.moonlight.getSetting('width', 250, 'sidebar.json');
    const bottomHeight = await window.moonlight.getSetting('height', 200, 'bottom_bar.json');
    const explorerBtn = document.querySelector('.tool-window-button[data-target="#project-panel"]');

    if (sidePanel) {
        sidePanel.style.width = explorerWidth + 'px';
    }

    document.querySelectorAll('.bottom-panel').forEach(p => {
        p.style.height = bottomHeight + 'px';
    });

    if (isCollapsed) {
        sidePanel.classList.add('collapsed');
        resizer.style.display = 'none';
        if (explorerBtn) explorerBtn.classList.remove('active');
    } else {
        sidePanel.classList.remove('collapsed');
        resizer.style.display = 'block';
        if (explorerBtn) explorerBtn.classList.add('active');
    }
}

// Resizing logic
let isResizing = false;
let isResizingBottom = false;
let startY, startHeight;

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
    resizer.classList.add('resizing');
});

bottomResizer.addEventListener('mousedown', (e) => {
    isResizingBottom = true;
    startY = e.clientY;
    const activePanel = document.querySelector('.bottom-panel:not(.is-hidden)');
    startHeight = activePanel ? activePanel.offsetHeight : 200;
    document.body.style.cursor = 'row-resize';
    bottomResizer.classList.add('resizing');
});

document.addEventListener('mousemove', (e) => {
    if (isResizing) {
        let newWidth = e.clientX - sidePanel.getBoundingClientRect().left;

        // Boundaries (matched with CSS min/max)
        if (newWidth < 150) newWidth = 150;
        if (newWidth > 600) newWidth = 600;

        sidePanel.style.width = newWidth + 'px';
    }

    if (isResizingBottom) {
        let deltaY = startY - e.clientY;
        let newHeight = startHeight + deltaY;

        // Boundaries
        if (newHeight < 100) newHeight = 100;
        if (newHeight > 600) newHeight = 600;

        document.querySelectorAll('.bottom-panel').forEach(p => {
            p.style.height = newHeight + 'px';
        });
    }
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
        resizer.classList.remove('resizing');

        if (window.moonlight && window.moonlight.saveSetting) {
            window.moonlight.saveSetting('width', parseInt(sidePanel.style.width), 'editor_sidebars.json');
        }
    }

    if (isResizingBottom) {
        isResizingBottom = false;
        document.body.style.cursor = 'default';
        bottomResizer.classList.remove('resizing');

        const currentHeight = parseInt(document.querySelector('.bottom-panel').style.height);
        if (window.moonlight && window.moonlight.saveSetting) {
            window.moonlight.saveSetting('height', currentHeight, 'editor_sidebars.json');
        }
    }
});

toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const target = document.querySelector(targetId);
        if (!target) return;

        if (targetId === '#project-panel') {
            const isNowCollapsed = !target.classList.contains('collapsed');
            if (isNowCollapsed) {
                target.classList.add('collapsed');
                resizer.style.display = 'none';
                btn.classList.remove('active');
            } else {
                target.classList.remove('collapsed');
                resizer.style.display = 'block';
                btn.classList.add('active');
            }
            if (window.moonlight && window.moonlight.saveSetting) {
                window.moonlight.saveSetting('collapsed', isNowCollapsed, 'sidebar.json');
            }
        } else {
            // Exclusive toggling for panels in the same position (mainly for bottom panels)
            const position = btn.getAttribute('data-position');
            if (position) {
                document.querySelectorAll(`.tool-window-button[data-position="${position}"]`).forEach(b => {
                    if (b !== btn) {
                        b.classList.remove('active');
                        const otherTarget = document.querySelector(b.getAttribute('data-target'));
                        if (otherTarget) otherTarget.classList.add('is-hidden');
                    }
                });
            }

            const isHidden = target.classList.contains('is-hidden');
            if (isHidden) {
                target.classList.remove('is-hidden');
                btn.classList.add('active');
            } else {
                target.classList.add('is-hidden');
                btn.classList.remove('active');
            }
            updateBottomResizerVisibility();
        }
    });
});

updateBottomResizerVisibility();
initExplorerState();

// Expose globals for Editor API
window.testFileData = testFileData;
window.testStructure = testStructure;
window.projectList = projectList;
window.renderExplorer = renderExplorer;