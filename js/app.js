// Application state and rendering.

let lastSplitResult = null;
const state = { raw: '', options: {}, n: '3', result: null };
const solveState = { shifts: [], hints: new Set() };

function invalidateResult() {
  state.raw = inputText.value;
  state.n = splitCount.value;
  state.options = {
    upper: document.getElementById('uppercase').checked,
    alphaOnly: document.getElementById('alpha-only').checked,
    removeSpaces: document.getElementById('remove-spaces').checked
  };
  state.result = null;
  lastSplitResult = null;
  outputArea.replaceChildren();
  resultsContainer.hidden = true;
  exportCsvBtn.disabled = true;
  solveState.shifts = [];
  solveState.hints.clear();
  document.getElementById('solve-section').hidden = true;
  document.getElementById('solve-cards').replaceChildren();
}

// UI要素の取得
const inputText = document.getElementById("input-text");
const processedText = document.getElementById("processed-text");
const splitCount = document.getElementById("split-count");
const splitSlider = document.getElementById("split-slider");
const splitButton = document.getElementById("split-button");
const outputArea = document.getElementById("output-area");
const exportSection = document.getElementById("export-section");
const exportCsvBtn = document.getElementById("export-csv");
const resultsContainer = document.getElementById("results-container");
const inputCharCount = document.getElementById("input-char-count");
const processedCharCount = document.getElementById("processed-char-count");

// 分割数の同期とバリデーション
const splitError = document.getElementById("split-error");

// 文字数を更新
function updateCharCounts() {
  i18n.assign(inputCharCount, 'count', { count: Array.from(inputText.value).length });
  i18n.assign(processedCharCount, 'count', { count: Array.from(processedText.value).length });
}

// 列分割ボタンの状態を更新
function updateSplitButtonState() {
  splitButton.disabled = false;
}

function validateSplitCount(value) {
  const result = DividerCore.validateN(value);
  i18n.assign(splitError, result.ok ? '' : result.reason);
  return result.ok;
}

splitCount.addEventListener("input", () => {
  invalidateResult();
  const val = parseInt(splitCount.value, 10);
  
  validateSplitCount(splitCount.value);
  
  if (!isNaN(val) && val >= 1 && val <= 20) {
    splitSlider.value = val;
  }
  
  updateSplitButtonState();
});

splitSlider.addEventListener("input", () => {
  splitCount.value = splitSlider.value;
  invalidateResult();
  validateSplitCount(splitCount.value);
  updateSplitButtonState();
});

// サンプル文読み込み
function loadSample() {
  inputText.value = "LXFOPVEFRNHRLXFOPVEFRNHR";
  updateProcessedText();
}

document.getElementById("load-sample").addEventListener("click", loadSample);

const sampleSelect = document.getElementById('sample-select');
const sampleLoad = document.getElementById('load-bundled-sample');
sampleSelect.addEventListener('change', () => { sampleLoad.disabled = !sampleSelect.value; });
sampleLoad.addEventListener('click', () => {
  const sample = DividerSamples.find(item => item.id === sampleSelect.value);
  if (!sample) return;
  inputText.value = sample.text;
  ['uppercase', 'alpha-only', 'remove-spaces'].forEach(id => { document.getElementById(id).checked = true; });
  splitCount.value = splitSlider.value = String(sample.n);
  updateProcessedText();
  performSplit();
});

// ファイル読み込み
const fileInput = document.getElementById("file-input");
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  readFile(file);
  fileInput.value = '';
});

function readFile(file) {
  if (!file) return;
  const error = document.getElementById('file-error');
  i18n.assign(error, '');
  if (!(file.name.toLowerCase().endsWith('.txt') || file.type.startsWith('text/'))) {
    i18n.assign(error, 'fileType');
    return;
  }
  if (file.size > DividerCore.MAX_FILE_BYTES) {
    i18n.assign(error, 'fileSize');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    inputText.value = e.target.result;
    updateProcessedText();
  };
  reader.onerror = () => { i18n.assign(error, 'fileRead'); };
  reader.readAsText(file);
}

// ドラッグ＆ドロップ対応
const dropArea = document.getElementById("file-drop-area");
dropArea.addEventListener('keydown', (event) => {
  if (event.target === dropArea && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    fileInput.click();
  }
});

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.add("drag-over");
});

dropArea.addEventListener("dragleave", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.remove("drag-over");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.remove("drag-over");
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    readFile(files[0]);
  }
});

// テキスト処理
function preprocessText(raw) {
  return DividerCore.preprocess(raw, state.options);
}

function updateProcessedText() {
  invalidateResult();
  i18n.assign(splitError, '');
  const raw = inputText.value;
  processedText.value = preprocessText(raw);
  updateCharCounts();
  updateSplitButtonState();
}

// チェックボックス変更で処理反映
["uppercase", "alpha-only", "remove-spaces"].forEach((id) => {
  document.getElementById(id).addEventListener("change", updateProcessedText);
});

inputText.addEventListener("input", updateProcessedText);

// クリアボタン
const clearBtn = document.getElementById("clear-button");
clearBtn.addEventListener("click", () => {
  inputText.value = "";
  processedText.value = "";
  outputArea.replaceChildren();
  exportCsvBtn.disabled = true;
  resultsContainer.hidden = true;
  lastSplitResult = null;
  updateProcessedText();
  updateCharCounts();
  updateSplitButtonState();
});

// 列分割処理
function splitIntoColumns(text, n) {
  state.result = DividerCore.split(text, n);
  lastSplitResult = state.result;
  renderColumnOutputs(state.result.columns);
  exportCsvBtn.disabled = false;
  resultsContainer.hidden = false;
  i18n.assign(document.getElementById('result-summary'), 'splitDone', { count: n });
  solveState.shifts = new Array(n).fill(0);
  solveState.hints.clear();
  renderSolve();
}

function renderColumnOutputs(columns) {
  outputArea.replaceChildren();
  columns.forEach((col, i) => {
    const wrapper = document.createElement("div");
    wrapper.className = "output-column";

    const headerDiv = document.createElement("div");
    headerDiv.className = "column-header";

    const countLabel = document.createElement("p");
    i18n.assign(countLabel, 'column', { number: i + 1, count: Array.from(col).length });
    countLabel.id = `column-label-${i}`;

    const buttonGroup = document.createElement("div");
    buttonGroup.className = "column-buttons";

    const copyBtn = document.createElement("button");
    copyBtn.type = 'button';
    i18n.assign(copyBtn, 'ui.48');
    copyBtn.className = "copy-btn-inline";
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(col);
        showToast('copied', { number: i + 1 });
      } catch (err) {
        showToast('copyFailed');
      }
    });

    const analyzeBtn = document.createElement("a");
    const truncated = Array.from(col).length > 5000;
    i18n.assign(analyzeBtn, truncated ? 'analyzeLong' : 'analyze');
    analyzeBtn.className = "analyze-btn-inline";
    analyzeBtn.href = 'https://ipusiron.github.io/frequency-analyzer/?text=' +
      encodeURIComponent(Array.from(col).slice(0, 5000).join(''));
    analyzeBtn.target = '_blank';
    analyzeBtn.rel = 'noopener noreferrer';
    analyzeBtn.title = i18n.t('analyzeTitle');
    analyzeBtn.setAttribute('data-i18n-title', 'analyzeTitle');

    const textarea = document.createElement("textarea");
    textarea.rows = 3;
    textarea.readOnly = true;
    textarea.value = col;
    textarea.setAttribute('aria-labelledby', countLabel.id);

    buttonGroup.appendChild(copyBtn);
    buttonGroup.appendChild(analyzeBtn);
    headerDiv.appendChild(countLabel);
    headerDiv.appendChild(buttonGroup);
    wrapper.appendChild(headerDiv);
    wrapper.appendChild(textarea);
    outputArea.appendChild(wrapper);
  });
}

function performSplit() {
  const clean = processedText.value;
  
  // バリデーションチェック
  if (!validateSplitCount(splitCount.value)) {
    return;
  }
  
  const n = parseInt(splitCount.value, 10);
  if (clean.length === 0) {
    i18n.assign(splitError, 'noText');
    return;
  }
  const validation = DividerCore.validateN(splitCount.value, Array.from(clean).length);
  if (!validation.ok) {
    i18n.assign(splitError, 'tooLarge', { length: validation.length });
    return;
  }
  splitIntoColumns(clean, n);
}
document.getElementById('split-button').addEventListener('click', performSplit);

// CSVエクスポート
function exportCSV() {
  if (!lastSplitResult) return;
  const useIndex = document.getElementById("csv-with-index").checked;
  const csv = DividerCore.toCsv(lastSplitResult, useIndex);

  // 現在の日時をファイル名に含める
  const now = new Date();
  const timestamp = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') + '_' +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  
  const filename = `split_result_${timestamp}.csv`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("export-csv").addEventListener("click", exportCSV);

// トースト通知
function showToast(key, values = {}, duration = 3000) {
  // 既存のトーストがあれば削除
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  // 新しいトーストを作成
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  i18n.assign(toast, key, values);
  document.body.appendChild(toast);

  // アニメーション開始
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // 自動的に非表示
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// Consume hand-off parameters without retaining ciphertext in the address bar.
function receiveParams() {
  const params = DividerCore.readParams(location.search);
  if (params.text !== null) {
    inputText.value = params.text;
    ['uppercase', 'alpha-only', 'remove-spaces'].forEach(id => { document.getElementById(id).checked = true; });
  }
  if (params.n !== null) splitCount.value = splitSlider.value = String(params.n);
  updateProcessedText();
  const warning = document.getElementById('url-warning');
  warning.replaceChildren();
  params.warnings.forEach(key => {
    const item = document.createElement('span');
    i18n.assign(item, key);
    warning.append(item, document.createTextNode(' '));
  });
  if (params.text !== null && params.n !== null) performSplit();
  const url = new URL(location.href);
  url.searchParams.delete('text');
  url.searchParams.delete('n');
  try { history.replaceState(null, '', url); } catch { /* file origins can deny history changes. */ }
}

// ダークモード切り替え機能
function initDarkMode() {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  
  // ローカルストレージから設定を読み込み
  const savedTheme = document.documentElement.dataset.theme;
  
  // アイコンを更新
  updateToggleIcon(savedTheme);
  
  // トグルボタンのクリックイベント
  darkModeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    try { localStorage.setItem('theme', newTheme); } catch { /* Storage is optional. */ }
    updateToggleIcon(newTheme);
    
    // トースト通知
    showToast(newTheme === 'dark' ? 'theme.dark' : 'theme.light');
  });
}

function updateToggleIcon(theme) {
  const toggleIcon = document.querySelector('.toggle-icon');
  toggleIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ヘルプモーダル機能
function initHelpModal() {
  const helpButton = document.getElementById('help-button');
  const helpModal = document.getElementById('help-modal');
  const helpModalClose = document.getElementById('help-modal-close');
  const siblings = [...document.body.children].filter(el => el !== helpModal && el.tagName !== 'SCRIPT');
  const close = () => {
    helpModal.hidden = true;
    document.body.classList.remove('modal-open');
    siblings.forEach(el => { el.inert = false; });
    helpButton.focus();
  };
  
  // ヘルプボタンクリック
  helpButton.addEventListener('click', () => {
    helpModal.hidden = false;
    document.body.classList.add('modal-open');
    siblings.forEach(el => { el.inert = true; });
    helpModalClose.focus();
  });
  
  // 閉じるボタンクリック
  helpModalClose.addEventListener('click', () => {
    close();
  });
  
  // モーダル外クリックで閉じる
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      close();
    }
  });
  
  // Escキーで閉じる
  document.addEventListener('keydown', (e) => {
    if (helpModal.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const items = [...helpModal.querySelectorAll('button, a[href], input, [tabindex="0"]')];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

function solveElement(tag, key, values = {}, className = '') {
  const element = document.createElement(tag);
  if (key) i18n.assign(element, key, values);
  if (className) element.className = className;
  return element;
}

function svgElement(tag, attributes) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
  return element;
}

function renderSolveGraph(column, shift, number) {
  const counts = DividerCore.letterCounts(DividerCore.shiftBack(column, shift));
  const percentages = counts.map(count => count / column.length * 100);
  const ceiling = Math.max(15, ...percentages, ...DividerCore.ENGLISH_FREQ);
  const svg = svgElement('svg', { viewBox: '0 0 364 218', role: 'img',
    'aria-label': i18n.t('solve.graph', { number }), class: 'solve-graph' });
  for (let j = 0; j < 26; j++) {
    const height = percentages[j] / ceiling * 148;
    svg.append(svgElement('rect', { x: j * 14 + 2, y: 156 - height, width: 10, height, class: 'solve-bar' }));
    svg.append(svgElement('circle', { cx: j * 14 + 7, cy: 156 - DividerCore.ENGLISH_FREQ[j] / ceiling * 148,
      r: 3.5, class: 'solve-dot' }));
    const label = svgElement('text', { x: j * 14 + 7, y: j % 2 ? 210 : 182, 'text-anchor': 'middle' });
    label.textContent = DividerCore.ALPHA[j];
    svg.append(label);
  }
  return svg;
}

function updateSolveSummary() {
  const result = DividerCore.solve(state.result.columns, solveState.shifts);
  i18n.assign(document.getElementById('solve-key'), 'solve.key', { key: result.key });
  i18n.assign(document.getElementById('solve-plain-label'), 'solve.plain', { count: result.plain.length });
  document.getElementById('solve-plain').textContent = result.plain.slice(0, 300).match(/.{1,5}/g).join(' ');
  i18n.assign(document.getElementById('solve-live'), 'solve.live', { key: result.key, start: result.plain.slice(0, 20) });
}

function renderSolveCard(column, index) {
  const number = index + 1;
  const card = solveElement('article', '', {}, 'solve-card');
  card.append(solveElement('h3', 'solve.column', { number, count: column.length }));
  const controls = solveElement('div', '', {}, 'solve-controls');
  const previous = solveElement('button');
  const next = solveElement('button');
  previous.textContent = '◀';
  next.textContent = '▶';
  previous.setAttribute('aria-label', i18n.t('solve.previous', { number }));
  next.setAttribute('aria-label', i18n.t('solve.next', { number }));
  previous.type = next.type = 'button';
  const select = solveElement('select');
  select.setAttribute('aria-label', i18n.t('solve.shift', { number }));
  for (let shift = 0; shift < 26; shift++) {
    const option = solveElement('option', 'solve.option', { letter: DividerCore.ALPHA[shift], shift });
    option.value = String(shift);
    select.append(option);
  }
  const graph = solveElement('div');
  const chi = solveElement('p');
  const refresh = () => {
    select.value = String(solveState.shifts[index]);
    graph.replaceChildren(renderSolveGraph(column, solveState.shifts[index], number));
    i18n.assign(chi, 'solve.chi', { value: DividerCore.chiSquare(column, solveState.shifts[index]).toFixed(1) });
    updateSolveSummary();
  };
  const change = shift => { solveState.shifts[index] = (shift + 26) % 26; refresh(); };
  previous.addEventListener('click', () => change(solveState.shifts[index] - 1));
  next.addEventListener('click', () => change(solveState.shifts[index] + 1));
  select.addEventListener('change', () => change(Number(select.value)));
  controls.append(previous, select, next);
  const hint = solveElement('button', 'solve.hint');
  hint.type = 'button';
  hint.className = 'solve-hint';
  const hintBody = solveElement('div', '', {}, 'solve-hint-body');
  const reveal = () => {
    solveState.hints.add(index);
    card.classList.add('hint-viewed');
    const best = DividerCore.bestShift(column);
    const apply = solveElement('button', 'solve.apply');
    apply.type = 'button';
    apply.addEventListener('click', () => change(best));
    hintBody.replaceChildren(solveElement('p', 'solve.seen'), solveElement('p', 'solve.best',
      { letter: DividerCore.ALPHA[best], value: DividerCore.chiSquare(column, best).toFixed(1) }), apply);
    hint.setAttribute('aria-expanded', 'true');
  };
  hint.setAttribute('aria-expanded', 'false');
  hintBody.id = `solve-hint-${index}`;
  hint.setAttribute('aria-controls', hintBody.id);
  hint.addEventListener('click', reveal);
  if (solveState.hints.has(index)) reveal();
  card.append(controls, graph, chi, hint, hintBody);
  refresh();
  return card;
}

function renderSolve() {
  const section = document.getElementById('solve-section');
  section.hidden = !state.result;
  if (!state.result) return;
  const solvable = DividerCore.isSolvable(processedText.value);
  document.getElementById('solve-guidance').hidden = solvable;
  document.getElementById('solve-workspace').hidden = !solvable;
  const cards = document.getElementById('solve-cards');
  cards.replaceChildren();
  if (!solvable) return;
  updateSolveSummary();
  state.result.columns.forEach((column, index) => cards.append(renderSolveCard(column, index)));
}

document.getElementById('solve-reset').addEventListener('click', () => {
  solveState.shifts.fill(0);
  renderSolve();
});

// 初期処理
updateProcessedText();
updateSplitButtonState();
initDarkMode();
initHelpModal();
receiveParams();
document.addEventListener('language-changed', () => {
  updateToggleIcon(document.documentElement.dataset.theme);
  renderSolve();
});
