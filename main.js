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
    new import_obsidian3.Setting(containerEl).setName("Export").setHeading();
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
    this.addRendererModeSetting();
    this.addTextSetting("Python executable", this.plugin.settings.externalPythonPath, (value) => {
      this.plugin.settings.externalPythonPath = value.trim() || "python3";
    }, "Example: python3 or /usr/bin/python3");
    this.addTextSetting("Renderer script path", this.plugin.settings.externalScriptPath, (value) => {
      this.plugin.settings.externalScriptPath = value.trim();
    }, "Relative to the plugin folder or an absolute path.");
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
  addRendererModeSetting() {
    new import_obsidian3.Setting(this.containerEl).setName("Renderer mode").setDesc("Use the external Python renderer.").addDropdown((dropdown) => {
      dropdown.addOption("external", "External renderer").addOption("native", "Native renderer (not implemented yet)").setValue(this.plugin.settings.rendererMode).onChange((value) => {
        this.plugin.settings.rendererMode = value;
        void this.plugin.saveSettings();
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

// src/rendering/externalRenderer.ts
var import_node_path3 = __toESM(require("node:path"));
var BUNDLED_RENDERER_SCRIPT_SOURCE = `#!/usr/bin/env python3
import argparse
import re
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

LEFT = 42
RIGHT = 42
TOP = 34
BOTTOM = 30
BULLET_INDENT = 11
SECTION_BREAK_LINES = 1.0
BASE_SIZE = {
    'name': 17.2,
    'contact': 10.4,
    'section': 10.8,
    'role': 10.0,
    'text': 9.0,
    'bullet': 9.0,
}
BASE_LEAD = {
    'name': 19.2,
    'contact': 12.0,
    'section': 12.0,
    'role': 11.4,
    'text': 10.3,
    'bullet': 10.3,
}
FONTS = {
    'name': 'Times-Bold',
    'contact': 'Times-Roman',
    'section': 'Times-Bold',
    'role': 'Times-Bold',
    'text': 'Times-Roman',
    'bullet': 'Times-Roman',
}
SPACE = {
    'header': 9.5,
    'section': 2.6,
    'role': 2.2,
    'text': 1.3,
    'bullet': 1.0,
}


def normalize_lines(raw_text: str):
    lines = []
    for line in raw_text.splitlines():
        line = re.sub(r'^\\s*-\\s*###\\s+', '### ', line)
        line = re.sub(r'\\*\\*(.*?)\\*\\*', r'\\1', line)
        line = re.sub(r'__(.*?)__', r'\\1', line)
        lines.append(line.rstrip())
    return lines


def parse_resume(raw_text: str):
    lines = normalize_lines(raw_text)
    name = ''
    contact = ''
    items = []
    found_name = False
    awaiting_contact = False

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith('# '):
            name = stripped[2:].strip()
            found_name = True
            awaiting_contact = True
            continue
        if awaiting_contact:
            if stripped.startswith('## ') or stripped.startswith('### ') or stripped.startswith('- '):
                raise ValueError('Resume is missing a contact line.')
            contact = stripped
            awaiting_contact = False
            continue
        if stripped.startswith('## '):
            items.append(('section', stripped[3:].strip()))
        elif stripped.startswith('### '):
            items.append(('role', stripped[4:].strip()))
        elif stripped.startswith('- '):
            items.append(('bullet', stripped[2:].strip()))
        else:
            items.append(('text', stripped))

    if not name:
        raise ValueError("Resume is missing a '# Name' heading.")
    if not contact:
        raise ValueError('Resume is missing a contact line.')
    if not items:
        raise ValueError('Resume is missing body content.')

    return name, contact, items


def wrap_text(text, font, size, max_width):
    words = text.split()
    if not words:
        return ['']
    wrapped = []
    current = words[0]
    for word in words[1:]:
        candidate = f'{current} {word}'
        if stringWidth(candidate, font, size) <= max_width:
            current = candidate
        else:
            wrapped.append(current)
            current = word
    wrapped.append(current)
    return wrapped


def build_layout(name, contact, items, scale, usable_width):
    sizes = {k: v * scale for k, v in BASE_SIZE.items()}
    leads = {k: v * scale for k, v in BASE_LEAD.items()}
    section_break_gap = leads['text'] * SECTION_BREAK_LINES
    elements = [
        ('name', [name], sizes['name'], leads['name'], 0),
        ('contact', [contact], sizes['contact'], leads['contact'], 0),
    ]
    for idx, (kind, text) in enumerate(items):
        max_width = usable_width - BULLET_INDENT if kind == 'bullet' else usable_width
        lines = wrap_text(text, FONTS[kind], sizes[kind], max_width)
        extra_before = section_break_gap if kind == 'section' and idx > 0 else 0
        elements.append((kind, lines, sizes[kind], leads[kind], extra_before))
    return elements, sizes, leads


def measure_height(layout, page_height, scale):
    y = page_height - TOP
    y -= layout[0][3] * len(layout[0][1])
    y -= SPACE['header'] * scale
    y -= layout[1][3] * len(layout[1][1])
    y -= SPACE['header'] * scale
    for kind, lines, _size, lead, extra_before in layout[2:]:
        y -= extra_before
        y -= lead * len(lines)
        y -= SPACE[kind] * scale
    return (page_height - TOP) - y


def choose_scale(name, contact, items, page_width, page_height):
    usable_width = page_width - LEFT - RIGHT
    available_height = page_height - TOP - BOTTOM

    def used(scale):
        layout, _, _ = build_layout(name, contact, items, scale, usable_width)
        return measure_height(layout, page_height, scale)

    lo, hi = 0.70, 1.50
    best = lo
    for _ in range(28):
        mid = (lo + hi) / 2
        if used(mid) <= available_height:
            best = mid
            lo = mid
        else:
            hi = mid

    ratio = used(best) / available_height
    if ratio < 0.94:
        lo2, hi2 = best, min(best * 1.08, 1.50)
        candidate = best
        for _ in range(20):
            mid = (lo2 + hi2) / 2
            current_used = used(mid)
            current_ratio = current_used / available_height
            if current_used <= available_height and current_ratio <= 0.97:
                candidate = mid
                lo2 = mid
            else:
                hi2 = mid
        best = candidate

    if used(best) > available_height:
        raise ValueError('Resume content does not fit on one page.')

    return best


def render_pdf(input_path: Path, output_path: Path):
    name, contact, items = parse_resume(input_path.read_text(encoding='utf-8'))
    page_width, page_height = A4
    usable_width = page_width - LEFT - RIGHT
    scale = choose_scale(name, contact, items, page_width, page_height)
    layout, _, _ = build_layout(name, contact, items, scale, usable_width)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(output_path), pagesize=A4)
    y = page_height - TOP

    for idx, (kind, lines, size, lead, extra_before) in enumerate(layout):
        pdf.setFont(FONTS[kind], size)
        if idx >= 2:
            y -= extra_before
        for line_idx, line in enumerate(lines):
            baseline = y - lead + 2
            if kind in ('name', 'contact'):
                pdf.drawCentredString(page_width / 2, baseline, line)
            elif kind == 'bullet':
                if line_idx == 0:
                    pdf.drawString(LEFT, baseline, u'•')
                pdf.drawString(LEFT + BULLET_INDENT, baseline, line)
            else:
                pdf.drawString(LEFT, baseline, line)
            y -= lead
        y -= SPACE['header'] * scale if kind in ('name', 'contact') else SPACE[kind] * scale

    if y < BOTTOM:
        raise ValueError('Resume content overflowed the page during render.')

    pdf.save()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()

    render_pdf(Path(args.input), Path(args.output))
    print(args.output)


if __name__ == '__main__':
    main()
`;
function normalizeScriptSource(value) {
  return value.replace(/\r\n/g, "\n");
}
async function ensureBundledRendererScript(scriptPath) {
  await ensureDirectoryForFile(scriptPath);
  const expectedSource = normalizeScriptSource(BUNDLED_RENDERER_SCRIPT_SOURCE);
  let currentSource = null;
  try {
    currentSource = normalizeScriptSource(await import_promises.default.readFile(scriptPath, "utf8"));
  } catch (error2) {
    const code = error2 && typeof error2 === "object" && "code" in error2 ? String(error2.code) : "";
    if (code !== "ENOENT") {
      throw error2;
    }
  }
  if (currentSource !== expectedSource) {
    await import_promises.default.writeFile(scriptPath, expectedSource, { encoding: "utf8", mode: 493 });
  } else {
    await import_promises.default.chmod(scriptPath, 493);
  }
  return import_node_path3.default.resolve(scriptPath);
}

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
    const configuredScriptPath = import_node_path3.default.isAbsolute(this.settings.externalScriptPath) ? this.settings.externalScriptPath : import_node_path3.default.join(this.pluginRoot, this.settings.externalScriptPath);
    const scriptPath = await ensureBundledRendererScript(configuredScriptPath);
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
  render(_request) {
    return Promise.reject(new Error("Native renderer is not implemented in version 1."));
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
