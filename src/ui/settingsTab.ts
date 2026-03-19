import { App, PluginSettingTab, Setting } from "obsidian";
import type ResumePdfPlugin from "../../main";
import type { RendererMode, ResumePdfSettings } from "../settings";

export class ResumePdfSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: ResumePdfPlugin) {
    super(app, plugin);
  }

  display(): void {
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

  private addOutputModeSetting(): void {
    new Setting(this.containerEl)
      .setName("Output mode")
      .setDesc("Choose whether the PDF is saved next to the note or in a fixed folder.")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("same-folder", "Same folder")
          .addOption("fixed-folder", "Fixed folder")
          .setValue(this.plugin.settings.outputMode)
          .onChange(async (value) => {
            this.plugin.settings.outputMode = value as ResumePdfSettings["outputMode"];
            await this.plugin.saveSettings();
            this.display();
          });
      });
  }

  private addRendererModeSetting(): void {
    new Setting(this.containerEl)
      .setName("Renderer mode")
      .setDesc("Version 1 supports the external Python renderer.")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("external", "External")
          .addOption("native", "Native (not implemented)")
          .setValue(this.plugin.settings.rendererMode)
          .onChange(async (value) => {
            this.plugin.settings.rendererMode = value as RendererMode;
            await this.plugin.saveSettings();
          });
      });
  }

  private addTextSetting(name: string, value: string, setter: (value: string) => Promise<void>, desc?: string): void {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(desc ?? "")
      .addText((text) => {
        text.setValue(value).onChange(async (nextValue) => {
          await setter(nextValue);
          await this.plugin.saveSettings();
        });
      });
  }

  private addToggleSetting(name: string, value: boolean, setter: (value: boolean) => Promise<void>): void {
    new Setting(this.containerEl)
      .setName(name)
      .addToggle((toggle) => {
        toggle.setValue(value).onChange(async (nextValue) => {
          await setter(nextValue);
          await this.plugin.saveSettings();
        });
      });
  }
}
