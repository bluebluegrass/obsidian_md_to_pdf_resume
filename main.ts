import { FileSystemAdapter, Plugin, TFile } from "obsidian";
import { EXPORT_AND_OPEN_COMMAND_ID, EXPORT_COMMAND_ID, RIBBON_ICON } from "./src/constants/defaults";
import { exportResume } from "./src/application/exportResume";
import { DEFAULT_SETTINGS, type ResumePdfSettings } from "./src/settings";
import { ResumePdfSettingTab } from "./src/ui/settingsTab";
import { ExternalResumeRenderer } from "./src/rendering/externalRenderer";
import { NativeResumeRenderer } from "./src/rendering/nativeRenderer";
import type { ResumeRenderer } from "./src/rendering/renderer";
import path from "node:path";

export default class ResumePdfPlugin extends Plugin {
  settings: ResumePdfSettings = DEFAULT_SETTINGS;
  private statusBarItemEl: HTMLElement | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.addRibbonIcon(RIBBON_ICON, "Export resume PDF", () => {
      void this.runExport();
    });

    this.addCommand({
      id: EXPORT_COMMAND_ID,
      name: "Resume: Convert current note to PDF",
      callback: () => {
        void this.runExport();
      }
    });

    this.addCommand({
      id: EXPORT_AND_OPEN_COMMAND_ID,
      name: "Resume: Convert current note to PDF and open",
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
      if (!(file instanceof TFile) || file.extension !== "md") {
        return;
      }
      menu.addItem((item) => {
        item
          .setTitle("Export resume PDF")
          .setIcon(RIBBON_ICON)
          .onClick(() => {
            void this.exportFileFromMenu(file);
          });
      });
    }));

    this.addSettingTab(new ResumePdfSettingTab(this.app, this));
  }

  async loadSettings(): Promise<void> {
    const loaded = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...loaded };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private async runExport(openAfterExportOverride?: boolean): Promise<void> {
    await exportResume({
      app: this.app,
      settings: this.settings,
      renderer: this.createRenderer(),
      openAfterExportOverride
    });
  }

  private async exportFileFromMenu(file: TFile): Promise<void> {
    const leaf = this.app.workspace.getMostRecentLeaf();
    if (leaf) {
      await leaf.openFile(file);
    }
    await this.runExport();
  }

  private createRenderer(): ResumeRenderer {
    if (this.settings.rendererMode === "native") {
      return new NativeResumeRenderer();
    }
    const adapter = this.app.vault.adapter;
    if (!(adapter instanceof FileSystemAdapter)) {
      throw new Error("Resume PDF Exporter requires the desktop filesystem adapter.");
    }
    const pluginRoot = path.join(
      adapter.getBasePath(),
      this.app.vault.configDir,
      "plugins",
      this.manifest.id
    );
    return new ExternalResumeRenderer(this.settings, pluginRoot);
  }
}
