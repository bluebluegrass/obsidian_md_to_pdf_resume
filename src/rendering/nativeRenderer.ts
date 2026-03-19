import type { ResumeRenderer, RenderRequest, RenderResult } from "./renderer";

export class NativeResumeRenderer implements ResumeRenderer {
  async render(_request: RenderRequest): Promise<RenderResult> {
    throw new Error("Native renderer is not implemented in version 1.");
  }
}
