import { FileSystemAdapter, type App } from "obsidian";
import { parseResumeMarkdown } from "../domain/parseResumeMarkdown";
import { validateActiveMarkdownFile } from "./validateResumeFile";
import { buildOutputPath } from "../infrastructure/outputPath";
import { openLocalFile } from "../infrastructure/openFile";
import { debug, error } from "../infrastructure/logger";
import { showExportError, showExportStarted, showExportSuccess, showOpenWarning } from "../ui/notices";
import type { ResumePdfSettings } from "../settings";
import type { ResumeRenderer } from "../rendering/renderer";

export async function exportResume(params: {
  app: App;
  settings: ResumePdfSettings;
  renderer: ResumeRenderer;
  openAfterExportOverride?: boolean;
}): Promise<void> {
  const { app, settings, renderer, openAfterExportOverride } = params;

  try {
    const activeFile = validateActiveMarkdownFile(app.workspace.getActiveFile());
    showExportStarted();

    const markdown = await app.vault.cachedRead(activeFile);
    const document = parseResumeMarkdown(markdown);
    if (!(app.vault.adapter instanceof FileSystemAdapter)) {
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
