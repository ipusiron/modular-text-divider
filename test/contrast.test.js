'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');
const variables = selector => Object.fromEntries([...css.match(selector)[1].matchAll(/--([\w-]+):\s*(#[\da-f]{6});/gi)]
  .map(m => [m[1], m[2]]));
const light = variables(/:root\s*\{([^}]+)\}/);
const dark = { ...light, ...variables(/\[data-theme="dark"\]\s*\{([^}]+)\}/) };
function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map(h => parseInt(h, 16) / 255)
    .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
for (const [theme, values] of [['light', light], ['dark', dark]]) {
  for (const [fg, bg, minimum = 4.5] of [
    ['text-color', 'card-bg'], ['secondary-text', 'card-bg'], ['char-count-text', 'card-bg'],
    ['mark-text', 'card-bg'], ['link-text', 'card-bg'], ['error-text', 'card-bg'],
    ['readonly-text', 'readonly-bg'], ['button-text', 'button-light'], ['button-text', 'button-dark'],
    ['toast-text', 'toast-light'], ['toast-text', 'toast-dark'], ['text-color', 'input-bg'],
    ['focus-ring', 'card-bg', 3], ['focus-ring', 'input-bg', 3],
    ['solve-bar', 'card-bg', 3], ['solve-dot', 'card-bg', 3]
  ]) {
    test(`${theme} ${fg} / ${bg}`, () => {
      assert.ok(values[fg] && values[bg], `${fg}, ${bg}`);
      const a = luminance(values[fg]), b = luminance(values[bg]);
      assert.ok((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= minimum);
    });
  }
}
