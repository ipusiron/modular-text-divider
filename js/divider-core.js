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

  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // 英文の文字頻度（%、A〜Z）。Day009 Frequency Analyzer・Day028 RepeatSeq Analyzer と同じ値（Lewand）
  const ENGLISH_FREQ = [8.167, 1.492, 2.782, 4.253, 12.702, 2.228, 2.015, 6.094, 6.966, 0.153, 0.772, 4.025, 2.406,
    6.749, 7.507, 1.929, 0.095, 5.987, 6.327, 9.056, 2.758, 0.978, 2.360, 0.150, 1.974, 0.074];

  // 手で解けるのは A〜Z の大文字だけの文字列（前処理で「大文字」「英字だけ」をオンにした状態）
  function isSolvable(text) {
    return /^[A-Z]+$/.test(text);
  }

  // 列を鍵の文字（シフト s＝0〜25、A=0）で戻す（ヴィジュネルの復号＝引き算）
  function shiftBack(col, s) {
    let out = '';
    for (const c of col) out += ALPHA[(c.charCodeAt(0) - 65 - s + 26) % 26];
    return out;
  }

  // 文字の出現回数（A〜Z の26個）
  function letterCounts(col) {
    const n = new Array(26).fill(0);
    for (const c of col) n[c.charCodeAt(0) - 65]++;
    return n;
  }

  // シフト s で戻したときのカイ二乗（Day028 の chiSquare と同じ式）
  function chiSquare(col, s) {
    const cnt = letterCounts(col);
    let chi = 0;
    for (let j = 0; j < 26; j++) {
      const e = ENGLISH_FREQ[j] / 100 * col.length;
      const o = cnt[(j + s) % 26];
      chi += (o - e) * (o - e) / e;
    }
    return chi;
  }

  // カイ二乗が最小のシフト（同点は小さいほう）
  function bestShift(col) {
    let best = 0, bestChi = Infinity;
    for (let s = 0; s < 26; s++) {
      const chi = chiSquare(col, s);
      if (chi < bestChi) { bestChi = chi; best = s; }
    }
    return best;
  }

  // 列を位置 i mod n の順に戻して1本の文字列にする（split の逆）
  function interleave(columns) {
    const cols = columns.map(c => Array.from(c));
    const total = cols.reduce((a, c) => a + c.length, 0);
    let out = '';
    for (let i = 0; i < total; i++) out += cols[i % cols.length][Math.floor(i / cols.length)];
    return out;
  }

  // 各列をシフトで戻して組み立てた平文と、シフトから作った鍵
  function solve(columns, shifts) {
    return { plain: interleave(columns.map((c, i) => shiftBack(c, shifts[i]))), key: shifts.map(s => ALPHA[s]).join('') };
  }

  return { MAX_N, MAX_PARAM_CHARS, MAX_FILE_BYTES, preprocess, validateN, split, csvCell, toCsv, readParams,
    ALPHA, ENGLISH_FREQ, isSolvable, shiftBack, letterCounts, chiSquare, bestShift, interleave, solve };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DividerCore;
}
