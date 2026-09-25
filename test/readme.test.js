'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const core = require('../js/divider-core.js');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const docs = ['README.md', 'README.en.md'];
const headings = [
  ['🌐 デモページ', '🌐 Demo'], ['📸 スクリーンショット', '📸 Screenshots'], ['✨ 機能', '✨ Features'],
  ['📖 使い方', '📖 Usage'], ['🔐 ヴィジュネル暗号解読の典型的な流れ', '🔐 Typical Vigenère Cryptanalysis Workflow'],
  ['🔬 仕様と既知解答', '🔬 Specification and Known Answers'], ['🔗 他ツールとの連携', '🔗 Integration with Other Tools'],
  ['🔧 技術的なメモ', '🔧 Technical Notes'], ['🔒 セキュリティ', '🔒 Security'], ['🧪 テスト', '🧪 Tests'],
  ['📁 ディレクトリー構造', '📁 Directory Structure'], ['💻 動作環境', '💻 Requirements'],
  ['📄 ライセンス', '📄 License'], ['🛠️ このツールについて', '🛠️ About This Tool']
];

for (const [lang, file] of docs.entries()) {
  const doc = read(file);
  test(`${file}: four known answers are recomputed from core and samples`, () => {
    const table = doc.split('<!-- known-answers -->')[1].split('<!-- /known-answers -->')[0];
    const rows = table.split('\n').filter(l => l.startsWith('| `')).map(l => l.split('|').slice(1, -1).map(s => s.trim()));
    assert.equal(rows.length, 4);
    assert.deepEqual(rows.map(r => r[0].replaceAll('`', '')),
      ['LXFOPVEFRNHRLXFOPVEFRNHR', 'vigenere1', 'vigenere2', 'vigenere3']);
    assert.deepEqual(rows.map(r => Number(r[1])), [3, 3, 4, 7]);
    for (const [source, n, starts, lengths] of rows) {
      const name = source.replaceAll('`', '');
      const raw = name.startsWith('vigenere') ? read(`samples/${name}/ciphertext.txt`) : name;
      const text = core.preprocess(raw, { upper: true, alphaOnly: true, removeSpaces: true });
      const { columns } = core.split(text, Number(n));
      assert.equal(starts, columns.map(c => c.slice(0, 8)).join(' '));
      assert.equal(lengths, columns.map(c => Array.from(c).length).join(', '));
    }
  });

  test(`${file}: three solving rows are recomputed from core and bundled files`, () => {
    const table = doc.split('<!-- solve-answers -->')[1].split('<!-- /solve-answers -->')[0];
    const rows = table.split('\n').filter(l => l.startsWith('| `')).map(l => l.split('|').slice(1, -1).map(s => s.trim()));
    assert.equal(rows.length, 3);
    assert.deepEqual(rows.map(r => r[0]), ['`vigenere1`', '`vigenere2`', '`vigenere3`']);
    assert.deepEqual(rows.map(r => Number(r[1])), [3, 4, 7]);
    for (const [id, n, key, prefix] of rows) {
      const text = core.preprocess(read(`samples/${id.replaceAll('`', '')}/ciphertext.txt`), { upper: true, alphaOnly: true });
      const columns = core.split(text, Number(n)).columns;
      const solved = core.solve(columns, columns.map(core.bestShift));
      assert.equal(key, solved.key);
      assert.equal(prefix, solved.plain.slice(0, 40));
    }
    assert.match(doc, /a5a177200b573836654a52d49fac8d76851dbf7993385072e309e1d8a23486e3/);
  });

  test(`${file}: matching fourteen sections and five actual PNGs`, () => {
    assert.deepEqual([...doc.matchAll(/^## (.+)$/gm)].map(m => m[1]), headings.map(h => h[lang]));
    const images = [...doc.matchAll(/!\[[^\]]*\]\((assets\/[^)]+)\)/g)].map(m => m[1]).sort();
    assert.deepEqual(images, ['assets/screenshot1.png', 'assets/screenshot2.png', 'assets/screenshot3.png',
      'assets/screenshot4.png', 'assets/screenshot5.png']);
    assert.deepEqual(fs.readdirSync(path.join(root, 'assets')).filter(f => f.endsWith('.png')).map(f => `assets/${f}`).sort(), images);
    for (const image of images) {
      const buffer = fs.readFileSync(path.join(root, image));
      assert.equal(buffer.readUInt32BE(16), 1280);
      assert.ok([1000, 1200].includes(buffer.readUInt32BE(20)));
      assert.ok(buffer.length <= 300 * 1024);
    }
    assert.doesNotMatch(doc, /Vigenère Cipher Toolとの自動連携|表示し、OK/);
  });

  test(`${file}: complete annotated directory tree`, () => {
    const tree = doc.split('## ' + headings[10][lang])[1].match(/```text\n([\s\S]*?)```/)[1];
    const entries = [];
    const stack = [];
    for (const line of tree.trimEnd().split('\n')) {
      assert.match(line, /# \S/);
      if (line.startsWith('modular-text-divider/')) continue;
      const match = line.match(/^((?:│   |    )*)(?:├── |└── )([^#]+?)\s+# /);
      assert.ok(match, line);
      const depth = match[1].length / 4;
      stack.length = depth;
      const name = match[2].trim();
      const full = [...stack, name].join('/');
      if (name.endsWith('/')) stack.push(name.slice(0, -1));
      else entries.push(full);
    }
    const walk = dir => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(entry => {
      if (['.git', '.claude'].includes(entry.name)) return [];
      const name = dir ? `${dir}/${entry.name}` : entry.name;
      return entry.isDirectory() ? walk(name) : [name];
    });
    assert.deepEqual(entries.sort(), walk('').sort());
    const tests = fs.readdirSync(path.join(root, 'test')).filter(f => f.endsWith('.test.js'));
    assert.equal(tests.length, 7);
    for (const name of tests) assert.ok(doc.includes(`| ${name} |`), name);
  });
}

test('Japanese YAML structure and immutable metadata match HEAD', () => {
  const head = execFileSync('git', ['show', 'HEAD:README.md'], { cwd: root, encoding: 'utf8' });
  const yaml = text => text.match(/^<!--[\s\S]*?-->/)[0].replaceAll('\r', '');
  assert.equal(yaml(read('README.md')), yaml(head));
  assert.match(yaml(head), /^id: day030$/m);
  assert.match(yaml(head), /^hub: true$/m);
  for (const key of ['category_ja', 'category_en', 'tags']) assert.match(yaml(head), new RegExp(key + ':\\n  - '));
  assert.match(read('README.md'), /English: \[README.en.md\]\(README.en.md\)/);
  assert.match(read('README.en.md'), /日本語: \[README.md\]\(README.md\)/);
});
