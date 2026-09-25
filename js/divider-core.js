'use strict';

// Pure reference implementation. No browser state is used here.
const DividerCore = (() => {
  const MAX_N = 20;
  const MAX_PARAM_CHARS = 10000;
  const MAX_FILE_BYTES = 1024 * 1024;

  function preprocess(raw, { upper = false, alphaOnly = false, removeSpaces = false } = {}) {
    let text = String(raw);
    if (upper) text = text.toUpperCase();
    if (alphaOnly) text = text.normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^A-Za-z]/g, '');
    if (removeSpaces) text = text.replace(/\s+/g, '');
    return text;
  }

  function validateN(value, length) {
    const s = String(value).trim();
    if (s === '') return { ok: false, reason: 'empty' };
    if (!/^\d+$/.test(s)) return { ok: false, reason: 'notInteger' };
    const n = Number(s);
    if (n < 1 || n > MAX_N) return { ok: false, reason: 'range' };
    if (length !== undefined && n > length) return { ok: false, reason: 'tooLarge', length };
    return { ok: true, n };
  }

  function split(text, n) {
    const chars = Array.from(text);
    const columns = Array.from({ length: n }, () => []);
    const cells = chars.map((char, i) => { columns[i % n].push(char); return { index: i + 1, col: i % n, char }; });
    return { columns: columns.map(c => c.join('')), cells };
  }

  function csvCell(value) {
    const s = String(value);
    return /[",\r\n]|^\s|\s$/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function toCsv(result, withIndex) {
    const n = result.columns.length;
    const head = Array.from({ length: n }, (_, i) => `Column ${i + 1}`);
    const rows = [];
    if (!withIndex) {
      rows.push(head);
      const cols = result.columns.map(c => Array.from(c));
      const max = Math.max(...cols.map(c => c.length));
      for (let r = 0; r < max; r++) rows.push(cols.map(c => c[r] ?? ''));
    } else {
      rows.push(['Index', ...head]);
      for (const { index, col, char } of result.cells) {
        const row = new Array(n).fill('');
        row[col] = char;
        rows.push([String(index), ...row]);
      }
    }
    return '\uFEFF' + rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
  }

  function readParams(search) {
    const p = new URLSearchParams(search);
    const out = { text: null, n: null, warnings: [] };
    const text = p.get('text');
    if (text !== null) {
      if (Array.from(text).length > MAX_PARAM_CHARS) out.warnings.push('textTooLong');
      else out.text = text;
    }
    const n = p.get('n');
    if (n !== null) {
      const v = validateN(n);
      if (v.ok) out.n = v.n; else out.warnings.push('badN');
    }
    return out;
  }

  return { MAX_N, MAX_PARAM_CHARS, MAX_FILE_BYTES, preprocess, validateN, split, csvCell, toCsv, readParams };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DividerCore;
}
