'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../js/divider-core.js');

for (const [text, n, columns] of [
  ['LXFOPVEFRNHRLXFOPVEFRNHR', 3, ['LOENLOEN', 'XPFHXPFH', 'FVRRFVRR']],
  ['ABCDEFGHIJ', 4, ['AEI', 'BFJ', 'CG', 'DH']],
  ['A😀B😀C', 2, ['ABC', '😀😀']],
  ['AB', 1, ['AB']],
  ['a,b"c😀d', 2, ['abcd', ',"😀']]
]) {
  test(`split ${text}`, () => assert.deepEqual(core.split(text, n).columns, columns));
}

for (const [raw, options, expected] of [
  ['Hello, World 123', {}, 'Hello, World 123'],
  ['Hello, World 123', { upper: true }, 'HELLO, WORLD 123'],
  ['Hello, World 123', { alphaOnly: true }, 'HelloWorld'],
  ['Hello, World 123', { upper: true, alphaOnly: true }, 'HELLOWORLD'],
  ['He llo\tW\no', { removeSpaces: true }, 'HelloWo'],
  ['ｈｉ Ünï', { upper: true, alphaOnly: true }, 'HIUNI']
]) {
  test(`preprocess ${JSON.stringify(options)} ${raw}`, () => assert.equal(core.preprocess(raw, options), expected));
}

for (const [value, length, expected] of [
  ['', undefined, { ok: false, reason: 'empty' }],
  ['3', undefined, { ok: true, n: 3 }],
  ['3.5', undefined, { ok: false, reason: 'notInteger' }],
  ['0', undefined, { ok: false, reason: 'range' }],
  ['21', undefined, { ok: false, reason: 'range' }],
  ['20', undefined, { ok: true, n: 20 }],
  [' 7 ', undefined, { ok: true, n: 7 }],
  ['5', 4, { ok: false, reason: 'tooLarge', length: 4 }],
  ['-2', undefined, { ok: false, reason: 'notInteger' }],
  ['1e1', undefined, { ok: false, reason: 'notInteger' }]
]) {
  test(`validate ${value}`, () => assert.deepEqual(core.validateN(value, length), expected));
}

for (const [value, expected] of [
  ['A', 'A'], [',', '","'], ['"', '""""'], ['a"b', '"a""b"'], [' x', '" x"'],
  ['x ', '"x "'], ['é', 'é'], ['😀', '😀'], ['', ''], ['a\nb', '"a\nb"'], ['\r', '"\r"']
]) {
  test(`CSV cell ${JSON.stringify(value)}`, () => assert.equal(core.csvCell(value), expected));
}

test('CSV exact bytes, both formats', () => {
  const result = core.split('a,b"c😀d', 2);
  assert.equal(core.toCsv(result, false), '\uFEFFColumn 1,Column 2\r\na,","\r\nb,""""\r\nc,😀\r\nd,\r\n');
  assert.equal(core.toCsv(result, true),
    '\uFEFFIndex,Column 1,Column 2\r\n1,a,\r\n2,,","\r\n3,b,\r\n4,,""""\r\n5,c,\r\n6,,😀\r\n7,d,\r\n');
});

for (const [search, expected] of [
  ['?text=LXFOPV&n=3', { text: 'LXFOPV', n: 3, warnings: [] }],
  ['?text=A%20B&n=21', { text: 'A B', n: null, warnings: ['badN'] }],
  ['?n=abc', { text: null, n: null, warnings: ['badN'] }],
  ['?text=' + 'A'.repeat(10001), { text: null, n: null, warnings: ['textTooLong'] }],
  ['?text=' + 'A'.repeat(10000) + '&n=20', { text: 'A'.repeat(10000), n: 20, warnings: [] }],
  ['', { text: null, n: null, warnings: [] }],
  ['?text=%F0%9F%98%80', { text: '😀', n: null, warnings: [] }]
]) {
  test(`URL ${search.slice(0, 35)}`, () => assert.deepEqual(core.readParams(search), expected));
}

for (const [sample, n, length, lengths, starts] of [
  ['vigenere1', 3, 614, [205, 205, 204], ['YPCKJYVQ', 'HIPLEESW', 'XGKMLXAX']],
  ['vigenere2', 4, 1146, [287, 287, 286, 286], ['QDPDYCZQ', 'CQOSMGCO', 'WQPXGCWV', 'BBNOKQBR']],
  ['vigenere3', 7, 8623, [1232, 1232, 1232, 1232, 1232, 1232, 1231],
    ['SGDTXDNU', 'OALWNGTS', 'ZEHDQHLL', 'YMLDTECE', 'HWZPBJSH', 'JVKGIGFK', 'ORMQDBYX']]
]) {
  test(`bundled ${sample}`, () => {
    const raw = fs.readFileSync(path.join(__dirname, '..', 'samples', sample, 'ciphertext.txt'), 'utf8');
    const text = core.preprocess(raw, { upper: true, alphaOnly: true, removeSpaces: true });
    const { columns } = core.split(text, n);
    assert.equal(text.length, length);
    assert.deepEqual(columns.map(c => c.length), lengths);
    assert.deepEqual(columns.map(c => c.slice(0, 8)), starts);
  });
}

// RFC 4180 reader independent of the production serializer.
function parseCsv(csv) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 1; i < csv.length; i++) {
    const c = csv[i];
    if (quoted) {
      if (c === '"' && csv[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\r' && csv[i + 1] === '\n') {
      row.push(cell); rows.push(row); row = []; cell = ''; i++;
    } else cell += c;
  }
  assert.equal(quoted, false);
  return rows;
}

test('200 seeded Unicode round trips for every n=1..20, including CSV', () => {
  let seed = 20260925;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  const alphabet = Array.from('ABCxyz日本語😀🧩 ,"\r\n');
  for (let trial = 0; trial < 200; trial++) {
    const chars = Array.from({ length: 20 + random() % 150 }, () => alphabet[random() % alphabet.length]);
    for (let n = 1; n <= 20; n++) {
      const result = core.split(chars.join(''), n);
      const columns = result.columns.map(c => Array.from(c));
      assert.equal(chars.map((_, i) => columns[i % n][Math.floor(i / n)]).join(''), chars.join(''));
      const vertical = parseCsv(core.toCsv(result, false)).slice(1);
      assert.deepEqual(vertical, Array.from({ length: Math.ceil(chars.length / n) },
        (_, r) => columns.map(c => c[r] ?? '')));
      const indexed = parseCsv(core.toCsv(result, true)).slice(1);
      assert.deepEqual(indexed, chars.map((char, i) => [String(i + 1),
        ...Array.from({ length: n }, (_, c) => c === i % n ? char : '')]));
    }
  }
});
