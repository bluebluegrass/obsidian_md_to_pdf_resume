import { Notice } from "obsidian";
import { NOTICE_TIMEOUT_MS } from "../constants/defaults";

export function showExportStarted(): void {
  new Notice("Rendering resume PDF...", NOTICE_TIMEOUT_MS);
}

export function showExportSuccess(outputPath: string): void {
  new Notice(`Resume PDF saved: ${outputPath}`, NOTICE_TIMEOUT_MS);
}

export function showExportError(message: string): void {
  new Notice(`Resume PDF export failed: ${message}`, NOTICE_TIMEOUT_MS);
}

export function showOpenWarning(message: string): void {
  new Notice(`PDF created, but opening failed: ${message}`, NOTICE_TIMEOUT_MS);
}
