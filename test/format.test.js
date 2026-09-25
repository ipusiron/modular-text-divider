'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');

test('new JavaScript and tests stay readable', () => {
  const files = ['js/divider-core.js', ...fs.readdirSync(__dirname).filter(f => f.endsWith('.js')).map(f => `test/${f}`)];
  for (const file of files) {
    const lines = fs.readFileSync(path.join(root, file), 'utf8').split('\n');
    assert.ok(Math.max(...lines.map(l => l.length)) <= 160, file);
  }
});

test('source line count floors', () => {
  for (const [file, min] of [['style.css', 600], ['index.html', 150], ['js/app.js', 200], ['js/divider-core.js', 60]]) {
    assert.ok(fs.readFileSync(path.join(root, file), 'utf8').split('\n').length >= min, file);
  }
});
