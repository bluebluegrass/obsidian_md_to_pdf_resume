import fs from "node:fs/promises";
import path from "node:path";
import { parseResumeMarkdown } from "../src/domain/parseResumeMarkdown";
import { NativeResumeRenderer } from "../src/rendering/nativeRenderer";

async function main(): Promise<void> {
  const sourcePath = path.resolve("docs/images/Sample Resume.md");
  const outputPath = path.resolve("docs/images/Sample Resume.pdf");
  const markdown = await fs.readFile(sourcePath, "utf8");

  await new NativeResumeRenderer().render({
    sourcePath,
    outputPath,
    document: parseResumeMarkdown(markdown)
  });
}

void main();
