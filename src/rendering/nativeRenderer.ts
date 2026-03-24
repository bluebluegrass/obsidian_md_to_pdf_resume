import type { ResumeRenderer, RenderRequest, RenderResult } from "./renderer";

export class NativeResumeRenderer implements ResumeRenderer {
  render(_request: RenderRequest): Promise<RenderResult> {
    return Promise.reject(new Error("Native renderer is not implemented in version 1."));
  }
}
