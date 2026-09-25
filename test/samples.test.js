'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const core = require('../js/divider-core.js');
const samples = require('../js/samples.js');
const read = file => fs.readFileSync(path.join(__dirname, '..', file));

test('embedded ciphertexts exactly match all three files without answer spoilers', () => {
  assert.equal(samples.length, 3);
  for (const [i, sample] of samples.entries()) {
    assert.equal(sample.id, `vigenere${i + 1}`);
    assert.equal(sample.file, `samples/vigenere${i + 1}/ciphertext.txt`);
    assert.equal(sample.n, [3, 4, 7][i]);
    assert.deepEqual(Object.keys(sample), ['id', 'file', 'n', 'text']);
    assert.deepEqual(Buffer.from(sample.text, 'utf8'), read(sample.file));
    const text = core.preprocess(sample.text, { upper: true, alphaOnly: true });
    const columns = core.split(text, sample.n).columns;
    assert.equal(core.solve(columns, columns.map(core.bestShift)).plain,
      core.preprocess(read(`samples/${sample.id}/plaintext.txt`).toString('utf8'), { upper: true, alphaOnly: true }));
  }
  assert.doesNotMatch(read('js/samples.js').toString('utf8'), /CAT|LOCK|PADLOCK|WHENINAPRIL|FOURSCORE|DOWNTHERABBIT/);
});

test('corrected vigenere2 plaintext has the specified bytes and digest', () => {
  const plain = read('samples/vigenere2/plaintext.txt');
  assert.equal(plain.length, 1146);
  assert.equal(crypto.createHash('sha256').update(plain).digest('hex'),
    'a5a177200b573836654a52d49fac8d76851dbf7993385072e309e1d8a23486e3');
  assert.ok(plain.toString().startsWith('FOURSCOREANDSEVENYEARSAGO'));
  assert.ok(plain.toString().endsWith('SHALLNOTPERISHFROMTHEEARTH'));
  assert.doesNotMatch(plain.toString(), /[\r\n]/);
});
