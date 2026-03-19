import { spawn } from "node:child_process";

export interface ProcessResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function runProcess(params: {
  command: string;
  args: string[];
  cwd?: string;
}): Promise<ProcessResult> {
  const { command, args, cwd } = params;

  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      reject(new Error(`Failed to start process '${command}': ${err.message}`));
    });

    child.on("close", (code) => {
      const exitCode = code ?? -1;
      if (exitCode !== 0) {
        reject(new Error(`Process exited with code ${exitCode}. ${stderr.trim() || stdout.trim()}`.trim()));
        return;
      }
      resolve({ stdout, stderr, exitCode });
    });
  });
}
