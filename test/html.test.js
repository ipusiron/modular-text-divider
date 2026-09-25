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

test('CSP, referrer, synchronous theme and safe markup', () => {
  assert.match(html, /http-equiv="Content-Security-Policy"/);
  for (const rule of ["default-src 'self'", "script-src 'self'", "style-src 'self'", "object-src 'none'",
    "base-uri 'none'", "form-action 'none'"]) assert.ok(html.includes(rule), rule);
  assert.doesNotMatch(html, /unsafe-inline|frame-ancestors|\sstyle\s*=|\son\w+\s*=/i);
  assert.match(html, /name="referrer" content="no-referrer"/);
  assert.match(html, /<noscript\b[^>]*>/);
  assert.match(html.split('</head>')[0], /<script src="js\/theme-init.js"><\/script>/);
  assert.match(html, /role="dialog"[^>]*aria-modal="true"[^>]*aria-labelledby="help-title"/);
  for (const tag of html.match(/<button\b[^>]*>/g)) assert.match(tag, /type="button"/);
  for (const tag of html.match(/<a\b[^>]*>/g)) {
    if (tag.includes('target="_blank"')) assert.match(tag, /rel="noopener noreferrer"/);
  }
  for (const [, id] of html.matchAll(/\bfor="([^"]+)"/g)) assert.ok(html.includes(`id="${id}"`), id);
  for (const file of fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js'))) {
    const js = fs.readFileSync(path.join(root, 'js', file), 'utf8');
    assert.doesNotMatch(js, /innerHTML|\.style\.|\b(?:alert|confirm)\s*\(|window\.open\s*\(/);
  }
});
