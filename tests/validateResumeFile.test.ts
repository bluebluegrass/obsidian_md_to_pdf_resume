import test from 'node:test';
import assert from 'node:assert/strict';
import { assertLooksLikeResume, validateActiveMarkdownFile } from '../src/application/validateResumeFile';

test('validate rejects missing active file', () => {
  assert.throws(() => validateActiveMarkdownFile(null));
});

test('validate rejects non-markdown file', () => {
  assert.throws(() => validateActiveMarkdownFile({ extension: 'txt' } as never));
});

test('resume validation accepts structured resume markdown', () => {
  assert.doesNotThrow(() => assertLooksLikeResume('# NAME\ncontact\n\n## EXPERIENCE\n- bullet'));
});

test('resume validation rejects missing contact', () => {
  assert.throws(() => assertLooksLikeResume('# NAME\n\n## EXPERIENCE\n- bullet'));
});
