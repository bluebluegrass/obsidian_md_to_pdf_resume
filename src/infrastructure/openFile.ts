export async function openLocalFile(targetPath: string): Promise<void> {
  const electron = require("electron") as { shell: { openPath: (path: string) => Promise<string> } };
  const result = await electron.shell.openPath(targetPath);
  if (result) {
    throw new Error(result);
  }
}
