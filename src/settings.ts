export type OutputMode = "same-folder" | "fixed-folder";

export interface ResumePdfSettings {
  outputMode: OutputMode;
  fixedOutputFolder: string;
  overwriteExisting: boolean;
  openAfterExport: boolean;
}

export const DEFAULT_SETTINGS: ResumePdfSettings = {
  outputMode: "same-folder",
  fixedOutputFolder: "",
  overwriteExisting: true,
  openAfterExport: false
};
