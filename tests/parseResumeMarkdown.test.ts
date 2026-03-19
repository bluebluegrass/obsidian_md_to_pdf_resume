import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseResumeMarkdown } from '../src/domain/parseResumeMarkdown';
import { normalizeResumeMarkdown } from '../src/domain/normalizeMarkdown';

const simple = fs.readFileSync(new URL('./fixtures/simple_resume.md', import.meta.url), 'utf8');
const malformed = fs.readFileSync(new URL('./fixtures/malformed_role_resume.md', import.meta.url), 'utf8');

test('normalize strips inline bold and malformed role prefix', () => {
  const normalized = normalizeResumeMarkdown('**Bold**\n- ### Role\n');
  assert.equal(normalized[0], 'Bold');
  assert.equal(normalized[1], '### Role');
});

test('parse extracts name, contact, and items', () => {
  const document = parseResumeMarkdown(simple);
  assert.equal(document.name, 'JANE DOE');
  assert.equal(document.contact, 'Amsterdam, Netherlands | jane@example.com | linkedin.com/in/janedoe');
  assert.equal(document.items[0].kind, 'section');
  assert.equal(document.items[1].kind, 'text');
  assert.equal(document.items[3].kind, 'role');
});

test('parse handles malformed role heading', () => {
  const document = parseResumeMarkdown(malformed);
  assert.equal(document.items[1].kind, 'role');
});

test('parse fails without name', () => {
  assert.throws(() => parseResumeMarkdown('No heading'));
});
