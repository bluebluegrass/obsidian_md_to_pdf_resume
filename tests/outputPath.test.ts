import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildOutputPath } from '../src/infrastructure/outputPath';
import { DEFAULT_SETTINGS } from '../src/settings';

test('same-folder output path replaces extension', async () => {
  const target = await buildOutputPath({
    sourcePath: '/tmp/resume.md',
    settings: { ...DEFAULT_SETTINGS, outputMode: 'same-folder' }
  });
  assert.equal(target, path.join('/tmp', 'resume.pdf'));
});

test('fixed-folder output path uses configured directory', async () => {
  const target = await buildOutputPath({
    sourcePath: '/tmp/resume.md',
    settings: { ...DEFAULT_SETTINGS, outputMode: 'fixed-folder', fixedOutputFolder: '/exports' }
  });
  assert.equal(target, path.join('/exports', 'resume.pdf'));
});

test('overwrite disabled rejects existing output', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'resume-pdf-'));
  const existing = path.join(tempDir, 'resume.pdf');
  await fs.writeFile(existing, 'x');
  await assert.rejects(() => buildOutputPath({
    sourcePath: path.join(tempDir, 'resume.md'),
    settings: {
      ...DEFAULT_SETTINGS,
      outputMode: 'same-folder',
      overwriteExisting: false
    }
  }));
});
