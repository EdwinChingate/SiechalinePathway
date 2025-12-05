```dataviewjs
/* READERA-LITE: TIME-ANCHOR EDITION
   - Auto-logs file opening with UNIX TIMESTAMP as source.
   - Manual capture uses standard naming "File (Book)".
*/

// --- CONFIGURATION ---
const SOURCE_FOLDER = '"Pool_of_knowledge"'; 
const BOOK_TAG = "#list"; 
const PROJECT_NAME = 'SiechalinePathway';
const LOG_ROOT = 'walking_log'; 
const LOG_CONTENT_FOLDER = `${LOG_ROOT}/log`;
const LOG_META_FOLDER = `${LOG_ROOT}/meta_log`;

// *** STATUS FILE *** (Stores your bookmarks)
const STATUS_FILE = `${LOG_ROOT}/reading_status.json`;

const FIXED_NOTE_PATH = "SiechalinePathway-P.md";

const READER_HEIGHT = "600px"; 
const SECONDARY_HEIGHT = "300px"; 
// ---------------------

// --- STATE MANAGEMENT ---
let highResStart = 0;
let isSelecting = false;
let navigationHistory = []; 
let currentRootBook = null; 

// --- HELPERS ---
const pad = n => String(n).padStart(2, "0");
const now_date = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const now_time = () => {
    const d = new Date();
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const sanitizeForTable = (text) => {
    return text.trim().replace(/\|/g, "&#124;").replace(/\r?\n|\r/g, " "); 
};
async function ensureFolder(path) {
    if (!(await app.vault.adapter.exists(path))) {
        await app.vault.createFolder(path);
    }
}

// --- NAMING HELPER ---
function formatSourceName(currentFileName, rootBookPath) {
    let bookName = "Unspecified";
    if (rootBookPath) {
        bookName = rootBookPath.split("/").pop().replace(".md", "");
    }
    if (currentFileName === bookName) {
        return bookName;
    } else {
        return `${currentFileName} (${bookName})`;
    }
}

// --- BOOKMARK MANAGER ---
async function saveBookmark(rootPath, currentPath) {
    if (!rootPath) return; 
    let data = {};
    if (await app.vault.adapter.exists(STATUS_FILE)) {
        const raw = await app.vault.adapter.read(STATUS_FILE);
        try { data = JSON.parse(raw); } catch(e) {}
    }
    data[rootPath] = currentPath;
    await app.vault.adapter.write(STATUS_FILE, JSON.stringify(data, null, 2));
}

async function getBookmark(rootPath) {
    if (await app.vault.adapter.exists(STATUS_FILE)) {
        const raw = await app.vault.adapter.read(STATUS_FILE);
        try { 
            const data = JSON.parse(raw); 
            return data[rootPath];
        } catch(e) { return null; }
    }
    return null;
}

// --- LOGGING ---
async function appendDualLog(sourceInput, selection, durationMs) {
    const date = now_date();
    const time = now_time();
    const durationSec = Math.floor(durationMs); 
    
    const contentFile = `${LOG_CONTENT_FOLDER}/${date}-${PROJECT_NAME}.md`;
    const metaFile = `${LOG_META_FOLDER}/${date}.md`; 
    
    await ensureFolder(LOG_CONTENT_FOLDER);
    await ensureFolder(LOG_META_FOLDER);

    if (!(await app.vault.adapter.exists(contentFile))) {
        const header = `[[SiechalinePathway.md]] \n## Summary \n\n-\n-\n-\n-\n-\n\n---\n## Notes\n|id|Comment|Time|\n|---|---|---|`;
        await app.vault.create(contentFile, header);
    }
    if (!(await app.vault.adapter.exists(metaFile))) {
        const header = `|id|Source|Task|Duration (ms)|\n|---|---|---|---|`;
        await app.vault.create(metaFile, header);
    }

    const currentContent = await app.vault.adapter.read(contentFile);
    const lines = currentContent.split(/\n/);
    const tableRows = lines.filter(l => l.trim().startsWith("|")).length; 
    const note_id = Math.max(1, tableRows - 1); 

    const cleanedSelection = sanitizeForTable(selection);
    
    const contentRow = `\n|${note_id}|${cleanedSelection}|${time}|`;
    const metaRow = `\n|${note_id}|${sourceInput}|Reading|${durationSec}|`;

    await app.vault.adapter.append(contentFile, contentRow);
    await app.vault.adapter.append(metaFile, metaRow);
    
    if (durationMs > 0) new Notice(`Captured ID ${note_id}`);
}

// --- UI BUILD ---

const pages = dv.pages(SOURCE_FOLDER)
    .where(p => p.file.tags && p.file.tags.includes(BOOK_TAG))
    .sort(p => p.file.mtime, "desc");

const container = this.container;
container.innerHTML = ""; 
container.style.display = "flex";
container.style.flexDirection = "column";
container.style.gap = "10px";

// Nav Controls
const navControls = container.createEl("div");
navControls.style.display = "flex";
navControls.style.gap = "5px";

const backBtn = navControls.createEl("button");
backBtn.innerText = "⬅";
backBtn.disabled = true;

const indexBtn = navControls.createEl("button");
indexBtn.innerText = "🏠";
indexBtn.disabled = true; 

const selectEl = navControls.createEl("select");
selectEl.style.flexGrow = "1";
selectEl.style.padding = "5px";
selectEl.style.background = "var(--background-secondary)";
selectEl.style.border = "1px solid var(--background-modifier-border)";

const defaultOpt = selectEl.createEl("option");
defaultOpt.text = "Select a book to start...";
pages.forEach(p => {
    const opt = selectEl.createEl("option");
    opt.value = p.file.path;
    opt.text = p.file.name;
});

const pathLabel = container.createEl("div");
pathLabel.style.fontSize = "0.8em";
pathLabel.style.color = "var(--text-muted)";
pathLabel.innerText = "Current: None";

// Main Reader
const readerBox = container.createEl("div");
readerBox.style.height = READER_HEIGHT;
readerBox.style.overflowY = "scroll";
readerBox.style.border = "1px solid var(--background-modifier-border)";
readerBox.style.padding = "20px";
readerBox.style.backgroundColor = "var(--background-primary)";
readerBox.style.borderRadius = "8px";
readerBox.innerHTML = "<p style='color:var(--text-faint)'>Main Viewer</p>";

// Capture
const captureBtn = container.createEl("button");
captureBtn.innerText = "Capture Selection";
captureBtn.className = "mod-cta"; 
captureBtn.style.width = "100%";

// Reference
container.createEl("hr", {attr: {style: "margin: 10px 0; border: none; border-top: 1px dashed var(--text-muted)"}});

const fixedNoteBtn = container.createEl("button");
fixedNoteBtn.innerText = "Open Reference Note"; 
fixedNoteBtn.style.width = "100%";

const secondaryBox = container.createEl("div");
secondaryBox.style.height = SECONDARY_HEIGHT;
secondaryBox.style.overflowY = "scroll";
secondaryBox.style.border = "1px solid var(--interactive-accent)";
secondaryBox.style.padding = "20px";
secondaryBox.style.backgroundColor = "var(--background-secondary)";
secondaryBox.style.borderRadius = "8px";
secondaryBox.style.marginTop = "10px";
secondaryBox.style.display = "none"; 

// --- CORE LOGIC ---

const renderMd = async (content, el, path, component) => {
    const { MarkdownRenderer } = require("obsidian");
    await MarkdownRenderer.render(app, content, el, path, component);
}

// *** NAVIGATOR & AUTO-LOGGER ***
const loadFileIntoReader = async (filePath) => {
    const file = app.vault.getAbstractFileByPath(filePath);
    
    if (!file) {
        new Notice("File not found: " + filePath);
        return;
    }

    pathLabel.innerText = "Current: " + file.basename;
    
    if (currentRootBook && filePath !== currentRootBook) {
        indexBtn.disabled = false;
    } else {
        indexBtn.disabled = true;
    }

    if (currentRootBook) {
        await saveBookmark(currentRootBook, filePath);
    }

    const content = await app.vault.read(file);
    readerBox.innerHTML = "";
    await renderMd(content, readerBox, filePath, this.component);
    
    // *** UPDATED: AUTO-LOG WITH UNIX TIMESTAMP ***
    // Source = Unix Timestamp (Date.now())
    // Content = File Name
    // Duration = 0
    const unixTimestamp = Date.now().toString();
    await appendDualLog(unixTimestamp, file.basename, 0);

    const internalLinks = readerBox.querySelectorAll("a.internal-link");
    internalLinks.forEach(link => {
        link.addEventListener("click", async (e) => {
            e.preventDefault(); 
            e.stopPropagation();
            const targetLink = link.getAttribute("data-href");
            const targetFile = app.metadataCache.getFirstLinkpathDest(targetLink, filePath);
            if (targetFile) {
                navigationHistory.push(filePath);
                backBtn.disabled = false;
                readerBox.scrollTop = 0; 
                await loadFileIntoReader(targetFile.path);
            }
        });
    });
};

// Events
selectEl.onchange = async () => {
    const path = selectEl.value;
    currentRootBook = path; 
    navigationHistory = []; 
    backBtn.disabled = true;
    
    const lastRead = await getBookmark(path);
    if (lastRead && lastRead !== path) {
        new Notice("Resuming last session...");
        navigationHistory.push(path);
        backBtn.disabled = false;
        await loadFileIntoReader(lastRead);
    } else {
        await loadFileIntoReader(path);
    }
};

backBtn.onclick = async () => {
    if (navigationHistory.length > 0) {
        const previousPath = navigationHistory.pop();
        if (navigationHistory.length === 0) backBtn.disabled = true;
        await loadFileIntoReader(previousPath);
    }
};

indexBtn.onclick = async () => {
    if (currentRootBook) {
        navigationHistory.push(pathLabel.innerText.replace("Current: ","")); 
        backBtn.disabled = false;
        await loadFileIntoReader(currentRootBook);
    }
};

fixedNoteBtn.onclick = async () => {
    if (secondaryBox.style.display === "none") {
        const file = app.vault.getAbstractFileByPath(FIXED_NOTE_PATH);
        if (file) {
            if (secondaryBox.innerHTML === "") {
                const content = await app.vault.read(file);
                await renderMd(content, secondaryBox, FIXED_NOTE_PATH, this.component);
            }
            secondaryBox.style.display = "block"; 
            fixedNoteBtn.innerText = "Close Reference Note"; 
        }
    } else {
        secondaryBox.style.display = "none";
        fixedNoteBtn.innerText = "Open Reference Note"; 
    }
};

const startTimer = () => {
    highResStart = performance.now();
    isSelecting = true;
};
readerBox.addEventListener("mousedown", startTimer);
secondaryBox.addEventListener("mousedown", startTimer);

// *** MANUAL CAPTURE ***
captureBtn.onclick = async () => {
    const selection = window.getSelection().toString();
    const currentFileName = pathLabel.innerText.replace("Current: ", "");
    
    // Normal Formatting for Manual Capture
    const fullSource = formatSourceName(currentFileName, currentRootBook);
    
    if (!selection) {
        new Notice("Select text first.");
        return;
    }

    if (!isSelecting) highResStart = performance.now() - 5000;
    const highResEnd = performance.now();
    const duration = highResEnd - highResStart;

    await appendDualLog(fullSource, selection, duration);
    
    isSelecting = false;
    window.getSelection().removeAllRanges();
};
```