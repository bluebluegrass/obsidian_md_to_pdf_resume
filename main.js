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
  let foundName = false;
  let awaitingContact = false;
  const items = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }
    if (line.startsWith("# ")) {
      name = line.slice(2).trim();
      foundName = true;
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
  const electron = require("electron");
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
  openAfterExport: false,
  rendererMode: "external",
  externalPythonPath: "python3",
  externalScriptPath: "scripts/render_resume_pdf.py"
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
    containerEl.createEl("h2", { text: "Resume PDF Exporter" });
    this.addOutputModeSetting();
    this.addTextSetting("Fixed output folder", this.plugin.settings.fixedOutputFolder, async (value) => {
      this.plugin.settings.fixedOutputFolder = value.trim();
    }, "Used only when output mode is fixed folder.");
    this.addToggleSetting("Overwrite existing PDFs", this.plugin.settings.overwriteExisting, async (value) => {
      this.plugin.settings.overwriteExisting = value;
    });
    this.addToggleSetting("Open PDF after export", this.plugin.settings.openAfterExport, async (value) => {
      this.plugin.settings.openAfterExport = value;
    });
    this.addRendererModeSetting();
    this.addTextSetting("Python executable", this.plugin.settings.externalPythonPath, async (value) => {
      this.plugin.settings.externalPythonPath = value.trim() || "python3";
    }, "Example: python3 or /usr/bin/python3");
    this.addTextSetting("Renderer script path", this.plugin.settings.externalScriptPath, async (value) => {
      this.plugin.settings.externalScriptPath = value.trim();
    }, "Relative to the plugin folder or an absolute path.");
  }
  addOutputModeSetting() {
    new import_obsidian3.Setting(this.containerEl).setName("Output mode").setDesc("Choose whether the PDF is saved next to the note or in a fixed folder.").addDropdown((dropdown) => {
      dropdown.addOption("same-folder", "Same folder").addOption("fixed-folder", "Fixed folder").setValue(this.plugin.settings.outputMode).onChange(async (value) => {
        this.plugin.settings.outputMode = value;
        await this.plugin.saveSettings();
        this.display();
      });
    });
  }
  addRendererModeSetting() {
    new import_obsidian3.Setting(this.containerEl).setName("Renderer mode").setDesc("Version 1 supports the external Python renderer.").addDropdown((dropdown) => {
      dropdown.addOption("external", "External").addOption("native", "Native (not implemented)").setValue(this.plugin.settings.rendererMode).onChange(async (value) => {
        this.plugin.settings.rendererMode = value;
        await this.plugin.saveSettings();
      });
    });
  }
  addTextSetting(name, value, setter, desc) {
    new import_obsidian3.Setting(this.containerEl).setName(name).setDesc(desc ?? "").addText((text) => {
      text.setValue(value).onChange(async (nextValue) => {
        await setter(nextValue);
        await this.plugin.saveSettings();
      });
    });
  }
  addToggleSetting(name, value, setter) {
    new import_obsidian3.Setting(this.containerEl).setName(name).addToggle((toggle) => {
      toggle.setValue(value).onChange(async (nextValue) => {
        await setter(nextValue);
        await this.plugin.saveSettings();
      });
    });
  }
};

// src/rendering/externalRenderer.ts
var import_node_path3 = __toESM(require("node:path"));

// src/infrastructure/processRunner.ts
var import_node_child_process = require("node:child_process");
async function runProcess(params) {
  const { command, args, cwd } = params;
  return await new Promise((resolve, reject) => {
    const child = (0, import_node_child_process.spawn)(command, args, {
      cwd,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (err) => {
      reject(new Error(`Failed to start process '${command}': ${err.message}`));
    });
    child.on("close", (code) => {
      const exitCode = code ?? -1;
      if (exitCode !== 0) {
        reject(new Error(`Process exited with code ${exitCode}. ${stderr.trim() || stdout.trim()}`.trim()));
        return;
      }
      resolve({ stdout, stderr, exitCode });
    });
  });
}

// src/rendering/externalRenderer.ts
var ExternalResumeRenderer = class {
  constructor(settings, pluginRoot) {
    this.settings = settings;
    this.pluginRoot = pluginRoot;
  }
  async render(request) {
    const scriptPath = import_node_path3.default.isAbsolute(this.settings.externalScriptPath) ? this.settings.externalScriptPath : import_node_path3.default.join(this.pluginRoot, this.settings.externalScriptPath);
    await ensureDirectoryForFile(request.outputPath);
    await runProcess({
      command: this.settings.externalPythonPath,
      args: [scriptPath, "--input", request.sourcePath, "--output", request.outputPath],
      cwd: this.pluginRoot
    });
    if (!await fileExists(request.outputPath)) {
      throw new Error(`Renderer did not create output file: ${request.outputPath}`);
    }
    return { outputPath: request.outputPath, pageCount: 1 };
  }
};

// src/rendering/nativeRenderer.ts
var NativeResumeRenderer = class {
  async render(_request) {
    throw new Error("Native renderer is not implemented in version 1.");
  }
};

// main.ts
var import_node_path4 = __toESM(require("node:path"));
var ResumePdfPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.statusBarItemEl = null;
  }
  async onload() {
    await this.loadSettings();
    this.addRibbonIcon(RIBBON_ICON, "Export resume PDF", async () => {
      await this.runExport();
    });
    this.addCommand({
      id: EXPORT_COMMAND_ID,
      name: "Resume: Convert current note to PDF",
      callback: async () => await this.runExport()
    });
    this.addCommand({
      id: EXPORT_AND_OPEN_COMMAND_ID,
      name: "Resume: Convert current note to PDF and open",
      callback: async () => await this.runExport(true)
    });
    this.statusBarItemEl = this.addStatusBarItem();
    this.statusBarItemEl.setText("Export Resume PDF");
    this.statusBarItemEl.setAttribute("aria-label", "Export resume PDF");
    this.statusBarItemEl.style.cursor = "pointer";
    this.statusBarItemEl.addEventListener("click", async () => {
      await this.runExport();
    });
    this.registerEvent(this.app.workspace.on("file-menu", (menu, file) => {
      if (file.extension !== "md") {
        return;
      }
      menu.addItem((item) => {
        item.setTitle("Export resume PDF").setIcon(RIBBON_ICON).onClick(async () => {
          const leaf = this.app.workspace.getMostRecentLeaf();
          await leaf?.openFile(file);
          await this.runExport();
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
  createRenderer() {
    if (this.settings.rendererMode === "native") {
      return new NativeResumeRenderer();
    }
    const adapter = this.app.vault.adapter;
    if (!(adapter instanceof import_obsidian4.FileSystemAdapter)) {
      throw new Error("Resume PDF Exporter requires the desktop filesystem adapter.");
    }
    const pluginRoot = import_node_path4.default.join(
      adapter.getBasePath(),
      this.app.vault.configDir,
      "plugins",
      this.manifest.id
    );
    return new ExternalResumeRenderer(this.settings, pluginRoot);
  }
};
