"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ResumePdfPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian4 = require("obsidian");

// src/constants/defaults.ts
var PLUGIN_NAME = "Resume PDF Exporter";
var EXPORT_COMMAND_ID = "export-resume-pdf";
var EXPORT_AND_OPEN_COMMAND_ID = "export-resume-pdf-open";
var RIBBON_ICON = "file-down";
var NOTICE_TIMEOUT_MS = 5e3;

// src/application/exportResume.ts
var import_obsidian2 = require("obsidian");

// src/domain/normalizeMarkdown.ts
function stripInlineBold(text) {
  return text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/__(.*?)__/g, "$1");
}
function normalizeResumeMarkdown(input) {
  return input.split(/\r?\n/).map((line) => line.replace(/^\s*-\s*###\s+/, "### ")).map(stripInlineBold).map((line) => line.replace(/[ \t]+$/g, ""));
}

// src/domain/parseResumeMarkdown.ts
function parseResumeMarkdown(markdown) {
  const lines = normalizeResumeMarkdown(markdown);
  let name = "";
  let contact = "";
  let awaitingContact = false;
  const items = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }
    if (line.startsWith("# ")) {
      name = line.slice(2).trim();
      awaitingContact = true;
      continue;
    }
    if (awaitingContact) {
      if (line.startsWith("## ") || line.startsWith("### ") || line.startsWith("- ")) {
        throw new Error("Resume is missing a contact line after the name heading.");
      }
      contact = line;
      awaitingContact = false;
      continue;
    }
    if (line.startsWith("## ")) {
      items.push({ kind: "section", text: line.slice(3).trim() });
      continue;
    }
    if (line.startsWith("### ")) {
      items.push({ kind: "role", text: line.slice(4).trim() });
      continue;
    }
    if (line.startsWith("- ")) {
      items.push({ kind: "bullet", text: line.slice(2).trim() });
      continue;
    }
    items.push({ kind: "text", text: line });
  }
  if (!name) {
    throw new Error("Resume is missing a top-level '# Name' heading.");
  }
  if (!contact) {
    throw new Error("Resume is missing a contact line after the name heading.");
  }
  if (items.length === 0) {
    throw new Error("Resume is missing body content.");
  }
  return { name, contact, items };
}

// src/application/validateResumeFile.ts
function validateActiveMarkdownFile(file) {
  if (!file) {
    throw new Error("No active file.");
  }
  if (file.extension !== "md") {
    throw new Error("The active file is not a markdown note.");
  }
  return file;
}

// src/infrastructure/outputPath.ts
var import_node_path2 = __toESM(require("node:path"));

// src/infrastructure/fileSystem.ts
var import_promises = __toESM(require("node:fs/promises"));
var import_node_path = __toESM(require("node:path"));
async function fileExists(targetPath) {
  try {
    await import_promises.default.access(targetPath);
    return true;
  } catch {
    return false;
  }
}
async function ensureDirectoryForFile(targetPath) {
  await import_promises.default.mkdir(import_node_path.default.dirname(targetPath), { recursive: true });
}

// src/infrastructure/outputPath.ts
async function buildOutputPath(params) {
  const { sourcePath, settings } = params;
  const baseName = `${import_node_path2.default.parse(sourcePath).name}.pdf`;
  const outputPath = settings.outputMode === "same-folder" ? import_node_path2.default.join(import_node_path2.default.dirname(sourcePath), baseName) : import_node_path2.default.join(settings.fixedOutputFolder.trim(), baseName);
  if (settings.outputMode === "fixed-folder" && !settings.fixedOutputFolder.trim()) {
    throw new Error("Fixed output folder is empty.");
  }
  if (!settings.overwriteExisting && await fileExists(outputPath)) {
    throw new Error(`Output already exists: ${outputPath}`);
  }
  return outputPath;
}

// src/infrastructure/openFile.ts
async function openLocalFile(targetPath) {
  const electron = await import("electron");
  const result = await electron.shell.openPath(targetPath);
  if (result) {
    throw new Error(result);
  }
}

// src/infrastructure/logger.ts
function debug(message, ...details) {
  console.debug(`[${PLUGIN_NAME}] ${message}`, ...details);
}
function error(message, ...details) {
  console.error(`[${PLUGIN_NAME}] ${message}`, ...details);
}

// src/ui/notices.ts
var import_obsidian = require("obsidian");
function showExportStarted() {
  new import_obsidian.Notice("Rendering resume PDF...", NOTICE_TIMEOUT_MS);
}
function showExportSuccess(outputPath) {
  new import_obsidian.Notice(`Resume PDF saved: ${outputPath}`, NOTICE_TIMEOUT_MS);
}
function showExportError(message) {
  new import_obsidian.Notice(`Resume PDF export failed: ${message}`, NOTICE_TIMEOUT_MS);
}
function showOpenWarning(message) {
  new import_obsidian.Notice(`PDF created, but opening failed: ${message}`, NOTICE_TIMEOUT_MS);
}

// src/application/exportResume.ts
async function exportResume(params) {
  const { app, settings, renderer, openAfterExportOverride } = params;
  try {
    const activeFile = validateActiveMarkdownFile(app.workspace.getActiveFile());
    showExportStarted();
    const markdown = await app.vault.cachedRead(activeFile);
    const document = parseResumeMarkdown(markdown);
    if (!(app.vault.adapter instanceof import_obsidian2.FileSystemAdapter)) {
      throw new Error("Resume PDF Exporter requires the desktop filesystem adapter.");
    }
    const sourcePath = app.vault.adapter.getFullPath(activeFile.path);
    const outputPath = await buildOutputPath({ sourcePath, settings });
    const result = await renderer.render({ sourcePath, outputPath, document });
    debug("Resume export completed", { sourcePath, outputPath: result.outputPath });
    showExportSuccess(result.outputPath);
    const shouldOpen = openAfterExportOverride ?? settings.openAfterExport;
    if (shouldOpen) {
      try {
        await openLocalFile(result.outputPath);
      } catch (openErr) {
        const message = openErr instanceof Error ? openErr.message : String(openErr);
        error("Opening PDF failed", openErr);
        showOpenWarning(message);
      }
    }
  } catch (err) {
    error("Resume export failed", err);
    const message = err instanceof Error ? err.message : String(err);
    showExportError(message);
  }
}

// src/settings.ts
var DEFAULT_SETTINGS = {
  outputMode: "same-folder",
  fixedOutputFolder: "",
  overwriteExisting: true,
  openAfterExport: false
};

// src/ui/settingsTab.ts
var import_obsidian3 = require("obsidian");
var ResumePdfSettingTab = class extends import_obsidian3.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("resume-pdf-exporter-setting");
    this.addOutputModeSetting();
    this.addTextSetting("Fixed output folder", this.plugin.settings.fixedOutputFolder, (value) => {
      this.plugin.settings.fixedOutputFolder = value.trim();
    }, "Used only when output mode is fixed folder.");
    this.addToggleSetting("Overwrite existing PDFs", this.plugin.settings.overwriteExisting, (value) => {
      this.plugin.settings.overwriteExisting = value;
    });
    this.addToggleSetting("Open PDF after export", this.plugin.settings.openAfterExport, (value) => {
      this.plugin.settings.openAfterExport = value;
    });
  }
  addOutputModeSetting() {
    new import_obsidian3.Setting(this.containerEl).setName("Output mode").setDesc("Choose whether the PDF is saved next to the note or in a fixed folder.").addDropdown((dropdown) => {
      dropdown.addOption("same-folder", "Same folder").addOption("fixed-folder", "Fixed folder").setValue(this.plugin.settings.outputMode).onChange((value) => {
        this.plugin.settings.outputMode = value;
        void this.plugin.saveSettings();
        this.display();
      });
    });
  }
  addTextSetting(name, value, setter, desc) {
    new import_obsidian3.Setting(this.containerEl).setName(name).setDesc(desc ?? "").addText((text) => {
      text.setValue(value).onChange((nextValue) => {
        setter(nextValue);
        void this.plugin.saveSettings();
      });
    });
  }
  addToggleSetting(name, value, setter) {
    new import_obsidian3.Setting(this.containerEl).setName(name).addToggle((toggle) => {
      toggle.setValue(value).onChange((nextValue) => {
        setter(nextValue);
        void this.plugin.saveSettings();
      });
    });
  }
};

// src/rendering/layout.ts
var PAGE_WIDTH = 595.2756;
var PAGE_HEIGHT = 841.8898;
var LEFT = 42;
var RIGHT = 42;
var TOP = 34;
var BOTTOM = 30;
var BULLET_INDENT = 11;
var SECTION_BREAK_LINES = 1;
var BASE_SIZE = {
  name: 17.2,
  contact: 10.4,
  section: 10.8,
  role: 10,
  text: 9,
  bullet: 9
};
var BASE_LEAD = {
  name: 19.2,
  contact: 12,
  section: 12,
  role: 11.4,
  text: 10.3,
  bullet: 10.3
};
var SPACE = {
  header: 9.5,
  section: 2.6,
  role: 2.2,
  text: 1.3,
  bullet: 1
};
var FONT_BY_KIND = {
  name: "Times-Bold",
  contact: "Times-Roman",
  section: "Times-Bold",
  role: "Times-Bold",
  text: "Times-Roman",
  bullet: "Times-Roman"
};
function measureText(text, size) {
  let units = 0;
  for (const char of text) {
    if (char === " ") {
      units += 0.25;
    } else if ("ilI.,:;!'|".includes(char)) {
      units += 0.28;
    } else if ("frtJ()[]{}-".includes(char)) {
      units += 0.35;
    } else if ("mwMW@%&QG".includes(char)) {
      units += 0.92;
    } else if ("ABCDEFGHKNOPRSTUVXYZ23456789".includes(char)) {
      units += 0.62;
    } else if ("abcdeghknopqsuvxyz013".includes(char)) {
      units += 0.5;
    } else {
      units += 0.45;
    }
  }
  return units * size;
}
function wrapText(text, size, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [""];
  }
  const wrapped = [];
  let current = words[0];
  for (const word of words.slice(1)) {
    const candidate = `${current} ${word}`;
    if (measureText(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }
    wrapped.push(current);
    current = word;
  }
  wrapped.push(current);
  return wrapped;
}
function buildLayout(document, scale) {
  const usableWidth = PAGE_WIDTH - LEFT - RIGHT;
  const sizes = Object.fromEntries(
    Object.entries(BASE_SIZE).map(([key, value]) => [key, value * scale])
  );
  const leads = Object.fromEntries(
    Object.entries(BASE_LEAD).map(([key, value]) => [key, value * scale])
  );
  const sectionBreakGap = leads.text * SECTION_BREAK_LINES;
  const entries = [
    { kind: "name", lines: [document.name], size: sizes.name, lead: leads.name, extraBefore: 0 },
    { kind: "contact", lines: [document.contact], size: sizes.contact, lead: leads.contact, extraBefore: 0 }
  ];
  document.items.forEach((item, index) => {
    const maxWidth = item.kind === "bullet" ? usableWidth - BULLET_INDENT : usableWidth;
    entries.push({
      kind: item.kind,
      lines: wrapText(item.text, sizes[item.kind], maxWidth),
      size: sizes[item.kind],
      lead: leads[item.kind],
      extraBefore: item.kind === "section" && index > 0 ? sectionBreakGap : 0
    });
  });
  return entries;
}
function measureHeight(entries, scale) {
  let y = PAGE_HEIGHT - TOP;
  y -= entries[0].lead * entries[0].lines.length;
  y -= SPACE.header * scale;
  y -= entries[1].lead * entries[1].lines.length;
  y -= SPACE.header * scale;
  for (const entry of entries.slice(2)) {
    y -= entry.extraBefore;
    y -= entry.lead * entry.lines.length;
    y -= SPACE[entry.kind] * scale;
  }
  return PAGE_HEIGHT - TOP - y;
}
function chooseScale(document) {
  const availableHeight = PAGE_HEIGHT - TOP - BOTTOM;
  const used = (scale) => measureHeight(buildLayout(document, scale), scale);
  let lo = 0.7;
  let hi = 1.5;
  let best = lo;
  for (let i = 0; i < 28; i += 1) {
    const mid = (lo + hi) / 2;
    if (used(mid) <= availableHeight) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const ratio = used(best) / availableHeight;
  if (ratio < 0.94) {
    let lo2 = best;
    let hi2 = Math.min(best * 1.08, 1.5);
    let candidate = best;
    for (let i = 0; i < 20; i += 1) {
      const mid = (lo2 + hi2) / 2;
      const currentUsed = used(mid);
      const currentRatio = currentUsed / availableHeight;
      if (currentUsed <= availableHeight && currentRatio <= 0.97) {
        candidate = mid;
        lo2 = mid;
      } else {
        hi2 = mid;
      }
    }
    best = candidate;
  }
  if (used(best) > availableHeight) {
    throw new Error("Resume content does not fit on one page.");
  }
  return best;
}
function itemText(entry, pageY, lineIndex) {
  const baseline = pageY - entry.lead + 2;
  const line = entry.lines[lineIndex];
  if (entry.kind === "name" || entry.kind === "contact") {
    return {
      text: line,
      x: (PAGE_WIDTH - measureText(line, entry.size)) / 2,
      y: baseline,
      font: FONT_BY_KIND[entry.kind],
      size: entry.size
    };
  }
  if (entry.kind === "bullet") {
    return {
      text: lineIndex === 0 ? `\u2022 ${line}` : `  ${line}`,
      x: LEFT,
      y: baseline,
      font: FONT_BY_KIND[entry.kind],
      size: entry.size
    };
  }
  return {
    text: line,
    x: LEFT,
    y: baseline,
    font: FONT_BY_KIND[entry.kind],
    size: entry.size
  };
}
function createRenderLines(document) {
  const scale = chooseScale(document);
  const entries = buildLayout(document, scale);
  const lines = [];
  let y = PAGE_HEIGHT - TOP;
  entries.forEach((entry, index) => {
    if (index >= 2) {
      y -= entry.extraBefore;
    }
    entry.lines.forEach((_, lineIndex) => {
      lines.push(itemText(entry, y, lineIndex));
      y -= entry.lead;
    });
    y -= (index < 2 ? SPACE.header : SPACE[entry.kind]) * scale;
  });
  if (y < BOTTOM) {
    throw new Error("Resume content overflowed the page during render.");
  }
  return lines;
}

// src/rendering/pdfWriter.ts
var import_promises2 = __toESM(require("node:fs/promises"));
function pdfNumber(value) {
  return value.toFixed(3).replace(/\.?0+$/, "");
}
function escapePdfText(value) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
function buildContentStream(lines) {
  return lines.map((line) => {
    const fontId = line.font === "Times-Bold" ? "F2" : "F1";
    return [
      "BT",
      `/${fontId} ${pdfNumber(line.size)} Tf`,
      `1 0 0 1 ${pdfNumber(line.x)} ${pdfNumber(line.y)} Tm`,
      `(${escapePdfText(line.text)}) Tj`,
      "ET"
    ].join("\n");
  }).join("\n");
}
async function writePdf(params) {
  const { outputPath, pageWidth, pageHeight, lines } = params;
  const stream = buildContentStream(lines);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfNumber(pageWidth)} ${pdfNumber(pageHeight)}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${Buffer.byteLength(stream, "utf8")} >>
stream
${stream}
endstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>"
  ];
  const parts = ["%PDF-1.4\n"];
  const offsets = [0];
  let cursor = Buffer.byteLength(parts[0], "utf8");
  objects.forEach((object, index) => {
    offsets.push(cursor);
    const chunk = `${index + 1} 0 obj
${object}
endobj
`;
    parts.push(chunk);
    cursor += Buffer.byteLength(chunk, "utf8");
  });
  const xrefOffset = cursor;
  const xref = [
    `xref
0 ${objects.length + 1}`,
    "0000000000 65535 f "
  ];
  offsets.slice(1).forEach((offset) => {
    xref.push(`${String(offset).padStart(10, "0")} 00000 n `);
  });
  const trailer = [
    xref.join("\n"),
    `trailer
<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    `startxref
${xrefOffset}`,
    "%%EOF\n"
  ].join("\n");
  parts.push(trailer);
  await import_promises2.default.writeFile(outputPath, parts.join(""), "utf8");
}

// src/rendering/nativeRenderer.ts
var NativeResumeRenderer = class {
  async render(request) {
    await ensureDirectoryForFile(request.outputPath);
    const lines = createRenderLines(request.document);
    await writePdf({
      outputPath: request.outputPath,
      pageWidth: PAGE_WIDTH,
      pageHeight: PAGE_HEIGHT,
      lines
    });
    if (!await fileExists(request.outputPath)) {
      throw new Error(`Renderer did not create output file: ${request.outputPath}`);
    }
    return { outputPath: request.outputPath, pageCount: 1 };
  }
};

// main.ts
var ResumePdfPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.statusBarItemEl = null;
  }
  async onload() {
    await this.loadSettings();
    this.addRibbonIcon(RIBBON_ICON, "Export resume PDF", () => {
      void this.runExport();
    });
    this.addCommand({
      id: EXPORT_COMMAND_ID,
      name: "Resume: convert current note to PDF",
      callback: () => {
        void this.runExport();
      }
    });
    this.addCommand({
      id: EXPORT_AND_OPEN_COMMAND_ID,
      name: "Resume: convert current note to PDF and open",
      callback: () => {
        void this.runExport(true);
      }
    });
    this.statusBarItemEl = this.addStatusBarItem();
    this.statusBarItemEl.setText("Export resume PDF");
    this.statusBarItemEl.setAttribute("aria-label", "Export resume PDF");
    this.statusBarItemEl.addClass("resume-pdf-exporter-status");
    this.statusBarItemEl.addEventListener("click", () => {
      void this.runExport();
    });
    this.registerEvent(this.app.workspace.on("file-menu", (menu, file) => {
      if (!(file instanceof import_obsidian4.TFile) || file.extension !== "md") {
        return;
      }
      menu.addItem((item) => {
        item.setTitle("Export resume PDF").setIcon(RIBBON_ICON).onClick(() => {
          void this.exportFileFromMenu(file);
        });
      });
    }));
    this.addSettingTab(new ResumePdfSettingTab(this.app, this));
  }
  async loadSettings() {
    const loaded = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...loaded };
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async runExport(openAfterExportOverride) {
    await exportResume({
      app: this.app,
      settings: this.settings,
      renderer: this.createRenderer(),
      openAfterExportOverride
    });
  }
  async exportFileFromMenu(file) {
    const leaf = this.app.workspace.getMostRecentLeaf();
    if (leaf) {
      await leaf.openFile(file);
    }
    await this.runExport();
  }
  createRenderer() {
    return new NativeResumeRenderer();
  }
};
