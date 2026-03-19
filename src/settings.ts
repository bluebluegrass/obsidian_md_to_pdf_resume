export type OutputMode = "same-folder" | "fixed-folder";
export type RendererMode = "external" | "native";

export interface ResumePdfSettings {
  outputMode: OutputMode;
  fixedOutputFolder: string;
  overwriteExisting: boolean;
  openAfterExport: boolean;
  rendererMode: RendererMode;
  externalPythonPath: string;
  externalScriptPath: string;
}

export const DEFAULT_SETTINGS: ResumePdfSettings = {
  outputMode: "same-folder",
  fixedOutputFolder: "",
  overwriteExisting: true,
  openAfterExport: false,
  rendererMode: "external",
  externalPythonPath: "python3",
  externalScriptPath: "scripts/render_resume_pdf.py"
};
