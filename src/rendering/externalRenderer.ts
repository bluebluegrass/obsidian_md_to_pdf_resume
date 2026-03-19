import path from "node:path";
import type { ResumeRenderer, RenderRequest, RenderResult } from "./renderer";
import type { ResumePdfSettings } from "../settings";
import { ensureDirectoryForFile, fileExists } from "../infrastructure/fileSystem";
import { runProcess } from "../infrastructure/processRunner";

export class ExternalResumeRenderer implements ResumeRenderer {
  constructor(private readonly settings: ResumePdfSettings, private readonly pluginRoot: string) {}

  async render(request: RenderRequest): Promise<RenderResult> {
    const scriptPath = path.isAbsolute(this.settings.externalScriptPath)
      ? this.settings.externalScriptPath
      : path.join(this.pluginRoot, this.settings.externalScriptPath);

    await ensureDirectoryForFile(request.outputPath);
    await runProcess({
      command: this.settings.externalPythonPath,
      args: [scriptPath, "--input", request.sourcePath, "--output", request.outputPath],
      cwd: this.pluginRoot
    });

    if (!(await fileExists(request.outputPath))) {
      throw new Error(`Renderer did not create output file: ${request.outputPath}`);
    }

    return { outputPath: request.outputPath, pageCount: 1 };
  }
}
