import { ensureDirectoryForFile, fileExists } from "../infrastructure/fileSystem";
import { PAGE_HEIGHT, PAGE_WIDTH, createRenderLines } from "./layout";
import { writePdf } from "./pdfWriter";
import type { ResumeRenderer, RenderRequest, RenderResult } from "./renderer";

export class NativeResumeRenderer implements ResumeRenderer {
  async render(request: RenderRequest): Promise<RenderResult> {
    await ensureDirectoryForFile(request.outputPath);

    const lines = createRenderLines(request.document);
    await writePdf({
      outputPath: request.outputPath,
      pageWidth: PAGE_WIDTH,
      pageHeight: PAGE_HEIGHT,
      lines
    });

    if (!(await fileExists(request.outputPath))) {
      throw new Error(`Renderer did not create output file: ${request.outputPath}`);
    }

    return { outputPath: request.outputPath, pageCount: 1 };
  }
}
