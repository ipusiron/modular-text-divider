// script.js

let lastSplitResult = null;

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
  inputCharCount.textContent = `（文字数: ${inputText.value.length}）`;
  processedCharCount.textContent = `（文字数: ${processedText.value.length}）`;
}

// 列分割ボタンの状態を更新
function updateSplitButtonState() {
  const hasText = processedText.value.trim().length > 0;
  const hasValidCount = validateSplitCount(splitCount.value);
  splitButton.disabled = !(hasText && hasValidCount);
}

function validateSplitCount(value) {
  const val = parseFloat(value);
  
  // 空の場合
  if (value === "") {
    splitError.textContent = "分割数を入力してください";
    return false;
  }
  
  // 整数でない場合
  if (!Number.isInteger(val)) {
    splitError.textContent = "分割数は整数を入力してください";
    return false;
  }
  
  // 範囲外の場合
  if (val < 1 || val > 20) {
    splitError.textContent = "分割数は1～20の範囲で入力してください";
    return false;
  }
  
  splitError.textContent = "";
  return true;
}

splitCount.addEventListener("input", () => {
  const val = parseInt(splitCount.value, 10);
  
  validateSplitCount(splitCount.value);
  
  if (!isNaN(val) && val >= 1 && val <= 20) {
    splitSlider.value = val;
  }
  
  updateSplitButtonState();
});

splitSlider.addEventListener("input", () => {
  splitCount.value = splitSlider.value;
  validateSplitCount(splitCount.value);
  updateSplitButtonState();
});

// サンプル文読み込み
function loadSample() {
  inputText.value = "LXFOPVEFRNHRLXFOPVEFRNHR";
  updateProcessedText();
}

document.getElementById("load-sample").addEventListener("click", loadSample);

// ファイル読み込み
const fileInput = document.getElementById("file-input");
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    inputText.value = e.target.result;
    updateProcessedText();
  };
  reader.readAsText(file);
});

// ドラッグ＆ドロップ対応
const dropArea = document.getElementById("file-drop-area");

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
    const file = files[0];
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        inputText.value = e.target.result;
        updateProcessedText();
      };
      reader.readAsText(file);
    } else {
      alert("テキストファイル（.txt）のみ対応しています。");
    }
  }
});

// テキスト処理
function preprocessText(raw) {
  let text = raw;
  if (document.getElementById("uppercase").checked) {
    text = text.toUpperCase();
  }
  if (document.getElementById("alpha-only").checked) {
    text = text.replace(/[^A-Z]/gi, "");
  }
  if (document.getElementById("remove-spaces").checked) {
    text = text.replace(/\s+/g, "");
  }
  return text;
}

function updateProcessedText() {
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
  outputArea.innerHTML = "";
  exportCsvBtn.disabled = true;
  resultsContainer.style.display = "none";
  lastSplitResult = null;
  updateCharCounts();
  updateSplitButtonState();
});

// 列分割処理
function splitIntoColumns(text, n) {
  const columns = Array.from({ length: n }, () => []);
  const withIndex = [];
  for (let i = 0; i < text.length; i++) {
    const col = i % n;
    columns[col].push(text[i]);
    withIndex.push({ index: i + 1, col, char: text[i] });
  }
  lastSplitResult = { columns, withIndex };
  renderColumnOutputs(columns);
  exportCsvBtn.disabled = false;
  resultsContainer.style.display = "block";
}

function renderColumnOutputs(columns) {
  outputArea.innerHTML = "";
  columns.forEach((col, i) => {
    const wrapper = document.createElement("div");
    wrapper.className = "output-column";

    const headerDiv = document.createElement("div");
    headerDiv.className = "column-header";

    const countLabel = document.createElement("p");
    countLabel.textContent = `📏 Column ${i + 1}（文字数: ${col.length}）`;

    const buttonGroup = document.createElement("div");
    buttonGroup.className = "column-buttons";

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "📋 コピー";
    copyBtn.className = "copy-btn-inline";
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(col.join(""));
        showToast(`📋 Column ${i + 1} をクリップボードにコピーしました`);
      } catch (err) {
        console.error('Failed to copy: ', err);
        showToast('❌ コピーに失敗しました');
      }
    };

    const analyzeBtn = document.createElement("button");
    analyzeBtn.textContent = "📊 頻度分析 🔗";
    analyzeBtn.className = "analyze-btn-inline";
    analyzeBtn.onclick = () => {
      sendToFrequencyAnalyzer(col.join(""));
    };

    const textarea = document.createElement("textarea");
    textarea.rows = 3;
    textarea.readOnly = true;
    textarea.value = col.join("");

    buttonGroup.appendChild(copyBtn);
    buttonGroup.appendChild(analyzeBtn);
    headerDiv.appendChild(countLabel);
    headerDiv.appendChild(buttonGroup);
    wrapper.appendChild(headerDiv);
    wrapper.appendChild(textarea);
    outputArea.appendChild(wrapper);
  });
}

document.getElementById("split-button").addEventListener("click", () => {
  const clean = processedText.value;
  
  // バリデーションチェック
  if (!validateSplitCount(splitCount.value)) {
    return;
  }
  
  const n = parseInt(splitCount.value, 10);
  if (clean.length === 0) {
    alert("テキストを入力してください。");
    return;
  }
  if (n > clean.length) {
    alert(`分割数がテキスト長（${clean.length}文字）を超えています。`);
    return;
  }
  splitIntoColumns(clean, n);
});

// CSVエクスポート
function exportCSV() {
  if (!lastSplitResult) return;
  const useIndex = document.getElementById("csv-with-index").checked;
  let csv = "";

  if (!useIndex) {
    const maxLen = Math.max(...lastSplitResult.columns.map(c => c.length));
    csv += lastSplitResult.columns.map((_, i) => `Column ${i + 1}`).join(",") + "\n";
    for (let i = 0; i < maxLen; i++) {
      csv += lastSplitResult.columns.map(col => col[i] || "").join(",") + "\n";
    }
  } else {
    csv += "Index" + lastSplitResult.columns.map((_, i) => `,Column ${i + 1}`).join("") + "\n";
    lastSplitResult.withIndex.forEach(({ index, col, char }) => {
      const row = Array(lastSplitResult.columns.length).fill("");
      row[col] = char;
      csv += `${index},${row.join(",")}\n`;
    });
  }

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
function showToast(message, duration = 3000) {
  // 既存のトーストがあれば削除
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  // 新しいトーストを作成
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
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

// 頻度分析ツールへの連携
function sendToFrequencyAnalyzer(text) {
  const maxLength = 5000; // GETパラメーターの実用的な制限
  
  if (text.length > maxLength) {
    if (confirm(`テキストが${maxLength}文字を超えています（${text.length}文字）。\n先頭${maxLength}文字のみ送信しますか？`)) {
      text = text.substring(0, maxLength);
    } else {
      return;
    }
  }
  
  const encodedText = encodeURIComponent(text);
  const url = `https://ipusiron.github.io/frequency-analyzer/?text=${encodedText}`;
  window.open(url, '_blank');
}

// ダークモード切り替え機能
function initDarkMode() {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const toggleIcon = darkModeToggle.querySelector('.toggle-icon');
  
  // ローカルストレージから設定を読み込み
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // アイコンを更新
  updateToggleIcon(savedTheme);
  
  // トグルボタンのクリックイベント
  darkModeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateToggleIcon(newTheme);
    
    // トースト通知
    showToast(`${newTheme === 'dark' ? '🌙 ダークモード' : '☀️ ライトモード'}に切り替えました`);
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
  
  // ヘルプボタンクリック
  helpButton.addEventListener('click', () => {
    helpModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 背景スクロール無効化
  });
  
  // 閉じるボタンクリック
  helpModalClose.addEventListener('click', () => {
    helpModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // 背景スクロール復活
  });
  
  // モーダル外クリックで閉じる
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      helpModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
  
  // Escキーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && helpModal.style.display === 'block') {
      helpModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
}

// 初期処理
updateProcessedText();
updateSplitButtonState();
initDarkMode();
initHelpModal();
