'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/i18n.js'), 'utf8');
const literal = source.match(/const messages = ([\s\S]*?);\s*let language/)[1];
const messages = JSON.parse(JSON.stringify(vm.runInNewContext(`(${literal})`)));

test('solving and sample messages exist in both languages without answer labels', () => {
  for (const lang of ['ja', 'en']) {
    for (const key of ['samples.label', 'samples.choose', 'samples.one', 'samples.two', 'samples.three', 'samples.load',
      'solve.title', 'solve.guidance', 'solve.key', 'solve.plain', 'solve.reset', 'solve.column', 'solve.shift',
      'solve.previous', 'solve.next', 'solve.chi', 'solve.hint', 'solve.seen', 'solve.best', 'solve.apply',
      'solve.graph', 'solve.legend', 'solve.live', 'solve.option']) assert.ok(messages[lang][key], key);
    for (const key of ['samples.one', 'samples.two', 'samples.three']) {
      assert.doesNotMatch(messages[lang][key], /CAT|LOCK|PADLOCK/);
    }
  }
});

test('dictionaries have matching nonempty keys and placeholders', () => {
  assert.deepEqual(Object.keys(messages.ja).sort(), Object.keys(messages.en).sort());
  for (const key of Object.keys(messages.ja)) {
    assert.ok(messages.ja[key].trim() && messages.en[key].trim(), key);
    const placeholders = text => (text.match(/\{\w+\}/g) || []).sort();
    assert.deepEqual(placeholders(messages.ja[key]), placeholders(messages.en[key]), key);
  }
});

test('all literal translation keys used by JS and HTML exist', () => {
  for (const file of fs.readdirSync(path.join(root, 'js'))) {
    const js = fs.readFileSync(path.join(root, 'js', file), 'utf8');
    const keys = [...js.matchAll(/i18n\.t\('([^']+)'/g), ...js.matchAll(/i18n\.assign\([^\n]+?, '([^']+)'/g)];
    for (const [, key] of keys) assert.ok(key in messages.ja, `${file}: ${key}`);
  }
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const [, key] of html.matchAll(/data-i18n(?:-[\w-]+)?="([^"]+)"/g)) assert.ok(key in messages.ja, key);
  for (const key of ['empty', 'notInteger', 'range', 'tooLarge', 'badN', 'textTooLong', 'theme.dark', 'theme.light']) {
    assert.ok(key in messages.ja, key);
  }
});

test('Japanese literals only live in the dictionary; help points to Frequency Analyzer', () => {
  const range = (a, b) => String.fromCodePoint(a) + '-' + String.fromCodePoint(b);
  const japanese = new RegExp('[' + range(0x3040, 0x30ff) + range(0x4e00, 0x9fff) + range(0xff01, 0xff60) + ']');
  for (const file of fs.readdirSync(path.join(root, 'js')).filter(f => f !== 'i18n.js')) {
    const js = fs.readFileSync(path.join(root, 'js', file), 'utf8').replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    assert.doesNotMatch(js, japanese, file);
  }
  for (const lang of ['ja', 'en']) assert.ok(!Object.values(messages[lang]).join('\n').includes('Vigenère Cipher Tool'));
});
