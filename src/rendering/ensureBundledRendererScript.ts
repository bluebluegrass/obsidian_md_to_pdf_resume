import fs from "node:fs/promises";
import path from "node:path";
import { ensureDirectoryForFile } from "../infrastructure/fileSystem";
import { BUNDLED_RENDERER_SCRIPT_SOURCE } from "./bundledRendererScriptSource";

function normalizeScriptSource(value: string): string {
  return value.replace(/\r\n/g, "\n");
}

export async function ensureBundledRendererScript(scriptPath: string): Promise<string> {
  await ensureDirectoryForFile(scriptPath);

  const expectedSource = normalizeScriptSource(BUNDLED_RENDERER_SCRIPT_SOURCE);
  let currentSource: string | null = null;

  try {
    currentSource = normalizeScriptSource(await fs.readFile(scriptPath, "utf8"));
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (code !== "ENOENT") {
      throw error;
    }
  }

  if (currentSource !== expectedSource) {
    await fs.writeFile(scriptPath, expectedSource, { encoding: "utf8", mode: 0o755 });
  } else {
    await fs.chmod(scriptPath, 0o755);
  }

  return path.resolve(scriptPath);
}
