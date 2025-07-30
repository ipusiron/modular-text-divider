// script.js

let lastSplitResult = null;

// UI要素の取得
const inputText = document.getElementById("input-text");
const processedText = document.getElementById("processed-text");
const splitCount = document.getElementById("split-count");
const splitSlider = document.getElementById("split-slider");
const outputArea = document.getElementById("output-area");
const exportSection = document.getElementById("export-section");
const exportCsvBtn = document.getElementById("export-csv");

// 分割数の同期
splitCount.addEventListener("input", () => {
  const val = parseInt(splitCount.value, 10);
  if (!isNaN(val) && val >= 1 && val <= 20) {
    splitSlider.value = val;
  }
});

splitSlider.addEventListener("input", () => {
  splitCount.value = splitSlider.value;
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
  exportSection.style.display = "none";
  lastSplitResult = null;
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
  exportSection.style.display = "block";
}

function renderColumnOutputs(columns) {
  outputArea.innerHTML = "";
  columns.forEach((col, i) => {
    const wrapper = document.createElement("div");
    wrapper.className = "output-column";

    const countLabel = document.createElement("p");
    countLabel.textContent = `📏 Column ${i + 1}（文字数: ${col.length}）`;

    const textarea = document.createElement("textarea");
    textarea.rows = 3;
    textarea.readOnly = true;
    textarea.value = col.join("");

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "📋 コピー";
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(textarea.value);
    };

    wrapper.appendChild(countLabel);
    wrapper.appendChild(textarea);
    wrapper.appendChild(copyBtn);
    outputArea.appendChild(wrapper);
  });
}

document.getElementById("split-button").addEventListener("click", () => {
  const clean = processedText.value;
  const n = parseInt(splitCount.value, 10);
  if (n < 1 || clean.length === 0 || n > clean.length) {
    alert("分割数が不正です。入力テキストを確認してください。");
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

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "split_result.csv";
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("export-csv").addEventListener("click", exportCSV);

// 初期処理
updateProcessedText();
