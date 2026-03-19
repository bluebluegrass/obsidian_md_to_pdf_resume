import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runProcess } from '../src/infrastructure/processRunner';

const fixture = new URL('./fixtures/simple_resume.md', import.meta.url);
const root = path.resolve(new URL('..', import.meta.url).pathname);
const script = path.join(root, 'scripts', 'render_resume_pdf.py');
const python = process.env.PYTHON_PATH || '/opt/homebrew/bin/python3';

test('renderer script creates a PDF file', async (t) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'resume-render-'));
  const output = path.join(tempDir, 'resume.pdf');
  try {
    await runProcess({
      command: python,
      args: [script, '--input', fixture.pathname, '--output', output],
      cwd: root
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('ENOENT')) {
      t.skip(`Python runtime unavailable for integration test: ${message}`);
      return;
    }
    throw error;
  }
  const stat = await fs.stat(output);
  assert.ok(stat.size > 0);
});
