import path from "node:path";
import { fileExists } from "./fileSystem";
import type { ResumePdfSettings } from "../settings";

export async function buildOutputPath(params: {
  sourcePath: string;
  settings: ResumePdfSettings;
}): Promise<string> {
  const { sourcePath, settings } = params;
  const baseName = `${path.parse(sourcePath).name}.pdf`;
  const outputPath = settings.outputMode === "same-folder"
    ? path.join(path.dirname(sourcePath), baseName)
    : path.join(settings.fixedOutputFolder.trim(), baseName);

  if (settings.outputMode === "fixed-folder" && !settings.fixedOutputFolder.trim()) {
    throw new Error("Fixed output folder is empty.");
  }

  if (!settings.overwriteExisting && (await fileExists(outputPath))) {
    throw new Error(`Output already exists: ${outputPath}`);
  }

  return outputPath;
}
