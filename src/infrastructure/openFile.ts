export async function openLocalFile(targetPath: string): Promise<void> {
  const electron = await import("electron");
  const result = await electron.shell.openPath(targetPath);
  if (result) {
    throw new Error(result);
  }
}
