'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');

test('checkbox visuals are compact while their labels retain touch targets', () => {
  const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
  const checkbox = css.match(/\ninput\[type="checkbox"\]\s*\{([^}]+)\}/g).at(-1);
  const label = css.match(/label:has\(input\[type="checkbox"\]\)\s*\{([^}]+)\}/)[1];
  for (const prop of ['width', 'height', 'min-width', 'min-height']) {
    assert.match(checkbox, new RegExp(`\\b${prop}: 20px;`));
  }
  assert.match(checkbox, /flex: 0 0 20px/);
  assert.match(label, /min-width: 44px/);
  assert.match(label, /min-height: 44px/);
  assert.match(label, /padding: 0 12px/);
  assert.match(css, /input:not\(\[type="checkbox"\]\)/);
  for (const id of ['uppercase', 'alpha-only', 'remove-spaces', 'csv-with-index']) {
    assert.match(html, new RegExp(`<label[^>]*>\\s*<input[^>]*id="${id}"`));
  }
});

test('hand solving and bundled sample controls use local scripts and safe SVG', () => {
  for (const id of ['solve-section', 'solve-guidance', 'solve-workspace', 'solve-key', 'solve-plain',
    'solve-live', 'solve-reset', 'solve-cards', 'sample-select', 'load-bundled-sample']) {
    assert.ok(html.includes(`id="${id}"`), id);
  }
  assert.match(html, /id="solve-live"[^>]*aria-live="polite"/);
  assert.ok(html.indexOf('id="output-area"') < html.indexOf('id="solve-section"'));
  assert.ok(html.indexOf('id="solve-section"') < html.indexOf('id="export-section"'));
  assert.ok(html.indexOf('js/samples.js') < html.indexOf('js/app.js'));
  assert.match(app, /createElementNS/);
  for (const call of ['isSolvable', 'shiftBack', 'letterCounts', 'chiSquare', 'bestShift', 'solve']) {
    assert.ok(app.includes(`DividerCore.${call}(`), call);
  }
  for (const file of fs.readdirSync(path.join(root, 'js'))) {
    assert.doesNotMatch(fs.readFileSync(path.join(root, 'js', file), 'utf8'), /\bfetch\s*\(|XMLHttpRequest|console\.log/);
  }
});

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
