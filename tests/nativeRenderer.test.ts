import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parseResumeMarkdown } from "../src/domain/parseResumeMarkdown";
import { NativeResumeRenderer } from "../src/rendering/nativeRenderer";

test("native renderer creates a PDF file", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "resume-native-render-"));
  const output = path.join(tempDir, "resume.pdf");
  const markdown = await fs.readFile(new URL("./fixtures/simple_resume.md", import.meta.url), "utf8");
  const renderer = new NativeResumeRenderer();

  await renderer.render({
    sourcePath: path.join(tempDir, "resume.md"),
    outputPath: output,
    document: parseResumeMarkdown(markdown)
  });

  const pdf = await fs.readFile(output, "utf8");
  assert.ok(pdf.startsWith("%PDF-1.4"));
  assert.ok(pdf.includes("/Type /Page"));
  assert.ok(pdf.includes("JANE DOE"));
});
