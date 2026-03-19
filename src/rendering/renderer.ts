import type { ResumeDocument } from "../domain/resumeTypes";

export interface RenderRequest {
  sourcePath: string;
  outputPath: string;
  document: ResumeDocument;
}

export interface RenderResult {
  outputPath: string;
  pageCount?: number;
}

export interface ResumeRenderer {
  render(request: RenderRequest): Promise<RenderResult>;
}
