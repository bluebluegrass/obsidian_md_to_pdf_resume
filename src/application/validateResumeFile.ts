import type { TFile } from "obsidian";
import { parseResumeMarkdown } from "../domain/parseResumeMarkdown";

export function validateActiveMarkdownFile(file: TFile | null): TFile {
  if (!file) {
    throw new Error("No active file.");
  }
  if (file.extension !== "md") {
    throw new Error("The active file is not a markdown note.");
  }
  return file;
}

export function assertLooksLikeResume(markdown: string): void {
  parseResumeMarkdown(markdown);
}
