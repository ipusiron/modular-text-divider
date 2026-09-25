'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');

test('application delegates splitting and CSV to the reference core', () => {
  for (const call of ['preprocess', 'validateN', 'split', 'toCsv', 'readParams']) {
    assert.ok(app.includes(`DividerCore.${call}(`), call);
  }
  assert.ok(html.indexOf('js/divider-core.js') < html.indexOf('js/app.js'));
  assert.match(html, /id="results-container" hidden/);
});

test('file and frequency integration avoid blocking dialogs', () => {
  assert.doesNotMatch(app, /\b(?:alert|confirm)\s*\(|window\.open\s*\(/);
  assert.match(app, /MAX_FILE_BYTES/);
  assert.match(app, /fileInput\.value = ''/);
  assert.match(app, /noopener noreferrer/);
  assert.match(html, /id="file-drop-area"[^>]*role="button"[^>]*tabindex="0"/);
});
