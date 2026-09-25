'use strict';

const i18n = (() => {
  const messages = {
  ja: {
    "help.solve": "前処理後がA～Zだけなら、列ごとの◀▶や選択欄でシフトを変え、棒を英文の頻度の点と比べます。" +
      "『💡 ヒント』でカイ二乗が最小の文字を見て、『このシフトにする』で適用できます。短い列では正解とは限りません。" +
      "鍵と平文の先頭300文字を表示し、読み上げは鍵と先頭20文字だけです。『すべて A に戻す』でシフトを戻せます。" +
      "日英切り替えはシフトとヒントを保ち、入力や設定の変更・再分割では破棄します。CSVは元の分割結果を出力します。",
    "help.samples": "同梱サンプルを選んで『読み込む』を押すと、前処理3種と分割数（3・4・7）を設定して分割します。" +
      "file://でも使えます。固定文の『🔤 サンプル文を入力』も残しています。Tabで移動し、ボタンはEnterやSpace、選択欄は矢印キーで操作できます。",
    "samples.label": "同梱サンプル",
    "samples.choose": "選んでください",
    "samples.one": "サンプル1（短い鍵）",
    "samples.two": "サンプル2（4文字の鍵）",
    "samples.three": "サンプル3（長文）",
    "samples.load": "読み込む",
    "solve.title": "🧮 手で解く",
    "solve.guidance": "手で解くには、前処理で『小文字を大文字に変換』と『アルファベット以外を除去』をオンにしてください",
    "solve.intro": "各列は同じ鍵の文字でずらされた『シーザー暗号』です。棒グラフの山の形が、英文の頻度（点）に重なるシフトを探してください。",
    "solve.key": "いまの鍵: {key}",
    "solve.plain": "組み立てた平文（全文 {count} 文字・先頭300文字）",
    "solve.reset": "すべて A に戻す",
    "solve.column": "列 {number}（{count} 文字）",
    "solve.shift": "列 {number} の鍵の文字",
    "solve.previous": "列 {number} のシフトを1つ戻す",
    "solve.next": "列 {number} のシフトを1つ進める",
    "solve.chi": "いまのシフトの χ²: {value}",
    "solve.hint": "💡 ヒント",
    "solve.seen": "✓ ヒント確認済み",
    "solve.best": "カイ二乗が最小になるのは {letter}（{value}）",
    "solve.apply": "このシフトにする",
    "solve.graph": "列 {number} の文字の割合と英文の頻度",
    "solve.legend": "棒: この列の文字の割合 ／ 点: 英文の頻度",
    "solve.live": "鍵 {key}。平文の先頭: {start}",
    "solve.option": "{letter}（{shift}）",
    "ui.0": "Modular Text Divider - テキスト列分割ツール",
    "ui.1": "🧩 Modular Text Divider",
    "ui.2": "テキストを指定した分割数で周期的に列分割するツールです。",
    "ui.3": "❓",
    "ui.4": "🌙",
    "ui.5": "📄 入力テキスト:",
    "ui.6": "（文字数: 0）",
    "ui.7": "📁",
    "ui.8": "ファイルをドラッグ＆ドロップ",
    "ui.9": "または",
    "ui.10": "クリックして選択",
    "ui.11": "🔤 サンプル文を入力",
    "ui.12": "🧹 クリア",
    "ui.13": "🔢 分割数 (n):",
    "ui.14": "1",
    "ui.15": "3",
    "ui.16": "5",
    "ui.17": "9",
    "ui.18": "20",
    "ui.19": "⚙️ テキスト処理オプション",
    "ui.20": "小文字を大文字に変換",
    "ui.21": "アルファベット以外を除去",
    "ui.22": "スペースを除去",
    "ui.23": "📝 処理後のテキスト:",
    "ui.24": "✂️ 列分割する",
    "ui.25": "📥 CSVとしてエクスポート",
    "ui.26": "拡張形式（元インデックス付き）でエクスポート",
    "ui.27": "🧩 Modular Text Divider - ヘルプ",
    "ui.28": "×",
    "ui.29": "📖 このツールについて",
    "ui.30": "Modular Text Dividerは、テキストを指定した分割数で周期的に列分割するツールです。主にヴィジュネル暗号などの多表式暗号の解読で使用される「列分割処理」を効率的に行うことができます。",
    "ui.31": "🚀 基本的な使い方",
    "ui.32": "テキスト入力",
    "ui.33": ": 上部のテキストエリアに分割したいテキストを入力するか、ファイルをドラッグ&ドロップします",
    "ui.34": "分割数設定",
    "ui.35": ": スライダーまたは数値入力で分割数（1～20）を指定します",
    "ui.36": "処理オプション",
    "ui.37": ": 必要に応じて大文字変換、英字のみ抽出、スペース除去のオプションを選択します",
    "ui.38": "列分割実行",
    "ui.39": ": 「列分割する」ボタンをクリックして処理を実行します",
    "ui.40": "結果確認",
    "ui.41": ": 各列のテキストが表示され、コピーや頻度分析への連携が可能です",
    "ui.42": "⚙️ 機能詳細",
    "ui.43": "📄 テキスト処理オプション",
    "ui.44": ": すべての英字を大文字に統一します",
    "ui.45": ": NFKDで全角英字を半角にし、アクセント（結合文字）を外してからA–Z・a–zだけを残します",
    "ui.46": ": 空白文字を削除します",
    "ui.47": "📊 結果エリアの機能",
    "ui.48": "📋 コピー",
    "ui.49": ": 各列のテキストをクリップボードにコピーします",
    "ui.50": "📊 頻度分析 🔗",
    "ui.51": ": 選択した列のテキストを頻度分析ツールで開きます（新しいタブ）",
    "ui.52": "📥 CSVエクスポート",
    "ui.53": ": RFC 4180形式、UTF-8のBOM・CRLF改行のCSVをダウンロードします",
    "ui.54": "🔗 外部ツール連携",
    "ui.55": "各列のリンクから",
    "ui.56": "Frequency Analyzer",
    "ui.57": "を開けます。5,000文字を超える列は先頭5,000文字を送ります。",
    "ui.58": "🔐 ヴィジュネル暗号解読での使用例",
    "ui.59": "鍵長推定",
    "ui.60": ": カシスキー法などで鍵長の候補を特定",
    "ui.61": "列分割",
    "ui.62": ": 本ツールで推定した鍵長に基づいてテキストを分割",
    "ui.63": "頻度分析",
    "ui.64": ": 各列に対して個別に頻度分析を実行",
    "ui.65": "鍵推定",
    "ui.66": ": 英語の文字頻度と比較して各列の鍵文字を推定",
    "ui.67": "復号",
    "ui.68": ": 推定した鍵で暗号文を復号",
    "ui.69": "💡 ヒント",
    "ui.70": "ヴィジュネル暗号の解読では、通常「アルファベット以外を除去」と「小文字を大文字に変換」を有効にします",
    "ui.71": "分割数は鍵長と同じに設定します（例：鍵が「CAT」なら分割数は3）",
    "ui.72": "各列の文字数が極端に少ない場合は、分割数を減らすことを検討してください",
    "ui.73": "頻度分析結果で最も頻出する文字がEの場合が多いため、これを基準に鍵を推定できます",
    "ui.74": "🌙 ダークモード",
    "ui.75": "右上の月/太陽アイコンをクリックすることで、ライトモードとダークモードを切り替えできます。設定は自動的に保存されます。",
    "ui.76": "🔗 GitHubリポジトリはこちら（",
    "ui.77": "ipusiron/modular-text-divider",
    "ui.78": "）",
    "ui.79": "ヘルプを表示",
    "ui.80": "ダークモード切り替え",
    "ui.81": "ここに暗号文を入力してください",
    "ui.82": "ファイルを選択",
    "ui.83": "テキストを周期的に分割する列数を指定します（1～20の整数）。例: n=3の場合、1文字目→列1、2文字目→列2、3文字目→列3、4文字目→列1...",
    "ui.84": "分割数",
    "ui.85": "ヘルプを閉じる",
    "noscript": "JavaScriptを有効にしてください。",
    "language": "英語に切り替える",
    "count": "（文字数: {count}）",
    "empty": "分割数を入力してください",
    "notInteger": "分割数は整数を入力してください",
    "range": "分割数は1～20の範囲で入力してください",
    "tooLarge": "分割数がテキスト長（{length}文字）を超えています。",
    "noText": "テキストを入力してください",
    "fileType": "テキストファイルを選択してください",
    "fileSize": "ファイルは1 MB以下にしてください",
    "fileRead": "ファイルの読み込みに失敗しました",
    "column": "📏 列 {number}（文字数: {count}）",
    "copied": "📋 列{number}をクリップボードにコピーしました",
    "copyFailed": "❌ コピーに失敗しました",
    "analyze": "📊 頻度分析で開く",
    "analyzeLong": "先頭5,000文字で頻度分析",
    "analyzeTitle": "このテキストを頻度分析ツールで開きます（新しいタブで外部サイトに移動）",
    "splitDone": "{count}列に分割しました",
    "textTooLong": "URLのテキストが10,000文字を超えるため読み込みませんでした",
    "badN": "URLの分割数は1～20の整数にしてください",
    "theme.dark": "🌙 ダークモードに切り替えました",
    "theme.light": "☀️ ライトモードに切り替えました",
    "help.limits": "?text=…&n=…で受け取ると前処理をすべてオンにし、両方が有効なら分割します。URLは10,000文字、分割数は1～20、ファイルは1 MBまでです。読込後にtextとnをURLから消します。入力や設定を変えると結果を隠します。文字数はコードポイント単位です。",
  },
  en: {
    "help.solve": "When the processed text contains only A–Z, adjust each column with the arrows or selector and compare bars with English-frequency dots. " +
      "Select “💡 Hint” to reveal the minimum-chi-square letter, then “Use this shift” to apply it. Short columns may give incorrect hints. " +
      "The key and first 300 plaintext characters are shown; announcements contain only the key and first 20 characters. " +
      "“Reset all to A” resets shifts. Switching languages preserves shifts and hints; editing inputs or settings and splitting again discards them. " +
      "CSV exports the original split result.",
    "help.samples": "Choose a bundled sample and press “Load” to enable all preprocessing and split into 3, 4, or 7 columns. " +
      "This works under file://. The fixed-text “🔤 Load sample” button is also available. " +
      "Use Tab to move, Enter or Space for buttons, and arrow keys for selectors.",
    "samples.label": "Bundled samples",
    "samples.choose": "Choose a sample",
    "samples.one": "Sample 1 (short key)",
    "samples.two": "Sample 2 (4-letter key)",
    "samples.three": "Sample 3 (long text)",
    "samples.load": "Load",
    "solve.title": "🧮 Solve by Hand",
    "solve.guidance": "To solve by hand, enable “Convert lowercase to uppercase” and “Remove non-alphabetic characters” in preprocessing.",
    "solve.intro": "Each column is a Caesar cipher shifted by one key letter. Find a shift whose bars match the English frequencies (dots).",
    "solve.key": "Current key: {key}",
    "solve.plain": "Assembled plaintext ({count} characters; first 300 shown)",
    "solve.reset": "Reset all to A",
    "solve.column": "Column {number} ({count} characters)",
    "solve.shift": "Key letter for column {number}",
    "solve.previous": "Previous shift for column {number}",
    "solve.next": "Next shift for column {number}",
    "solve.chi": "Current shift χ²: {value}",
    "solve.hint": "💡 Hint",
    "solve.seen": "✓ Hint viewed",
    "solve.best": "Minimum chi-square: {letter} ({value})",
    "solve.apply": "Use this shift",
    "solve.graph": "Letter percentages and English frequencies for column {number}",
    "solve.legend": "Bars: column percentages / dots: English frequencies",
    "solve.live": "Key {key}. Plaintext begins: {start}",
    "solve.option": "{letter} ({shift})",
    "ui.0": "Modular Text Divider - Periodic Column Divider",
    "ui.1": "🧩 Modular Text Divider",
    "ui.2": "Divide text into periodic columns for cryptanalysis.",
    "ui.3": "❓",
    "ui.4": "🌙",
    "ui.5": "📄 Input text:",
    "ui.6": "(Characters: 0)",
    "ui.7": "📁",
    "ui.8": "Drag and drop a file",
    "ui.9": "or",
    "ui.10": "click to choose",
    "ui.11": "🔤 Load sample",
    "ui.12": "🧹 Clear",
    "ui.13": "🔢 Columns (n):",
    "ui.14": "1",
    "ui.15": "3",
    "ui.16": "5",
    "ui.17": "9",
    "ui.18": "20",
    "ui.19": "⚙️ Preprocessing options",
    "ui.20": "Convert to uppercase",
    "ui.21": "Keep letters only",
    "ui.22": "Remove whitespace",
    "ui.23": "📝 Processed text:",
    "ui.24": "✂️ Split into columns",
    "ui.25": "📥 Export CSV",
    "ui.26": "Include original character indices",
    "ui.27": "🧩 Modular Text Divider - Help",
    "ui.28": "×",
    "ui.29": "📖 About this tool",
    "ui.30": 
      "Modular Text Divider divides text into periodic columns. It supports the column-splitting step " +
      "used in cryptanalysis of polyalphabetic ciphers such as Vigenère.",
    "ui.31": "🚀 Getting started",
    "ui.32": "Input text",
    "ui.33": ": Enter text above or drag and drop a text file.",
    "ui.34": "Column count",
    "ui.35": ": Choose 1–20 columns using the slider or number field.",
    "ui.36": "Preprocessing",
    "ui.37": ": Optionally convert to uppercase, keep letters only, and remove whitespace, in that order.",
    "ui.38": "Split",
    "ui.39": ": Select “✂️ Split into columns”.",
    "ui.40": "Results",
    "ui.41": ": Copy each column or open it in the frequency analyzer.",
    "ui.42": "⚙️ Features",
    "ui.43": "📄 Preprocessing options",
    "ui.44": ": Convert letters to uppercase.",
    "ui.45": ": Normalize with NFKD, remove combining accents, convert fullwidth letters, and keep only A–Z and a–z.",
    "ui.46": ": Remove spaces, tabs, and line breaks.",
    "ui.47": "📊 Result actions",
    "ui.48": "📋 Copy",
    "ui.49": ": Copy the column to the clipboard.",
    "ui.50": "📊 Open frequency analysis",
    "ui.51": ": Open the column in the frequency analyzer in a new tab.",
    "ui.52": "📥 Export CSV",
    "ui.53": ": Download RFC 4180 CSV with a UTF-8 BOM and CRLF line endings.",
    "ui.54": "🔗 Tool integration",
    "ui.55": "Column links open ",
    "ui.56": "Frequency Analyzer",
    "ui.57": ". Columns longer than 5,000 characters send only their first 5,000 characters.",
    "ui.58": "🔐 Vigenère cryptanalysis example",
    "ui.59": "Estimate key length",
    "ui.60": ": Find candidate key lengths with methods such as the Kasiski examination.",
    "ui.61": "Split columns",
    "ui.62": ": Divide the text using the estimated key length.",
    "ui.63": "Frequency analysis",
    "ui.64": ": Analyze letter frequencies for each column.",
    "ui.65": "Estimate the key",
    "ui.66": ": Compare with English letter frequencies to estimate each key letter.",
    "ui.67": "Decrypt",
    "ui.68": ": Decrypt with the estimated key.",
    "ui.69": "💡 Tips",
    "ui.70": "For Vigenère cryptanalysis, usually enable “Keep letters only” and “Convert to uppercase”.",
    "ui.71": "Set the column count to the key length (for example, 3 for CAT).",
    "ui.72": "Consider fewer columns if each column contains very few characters.",
    "ui.73": "E is often the most frequent letter in English; its frequency can help estimate the key.",
    "ui.74": "🌙 Dark mode",
    "ui.75": "Use the moon/sun button to switch between light and dark themes. The preference is saved when storage is available.",
    "ui.76": "🔗 GitHub repository (",
    "ui.77": "ipusiron/modular-text-divider",
    "ui.78": ")",
    "ui.79": "Show help",
    "ui.80": "Toggle theme",
    "ui.81": "Enter ciphertext here",
    "ui.82": "Choose a file",
    "ui.83": "Choose an integer from 1 to 20. With n=3, positions 1, 2, 3 go to columns 1, 2, 3; position 4 returns to column 1.",
    "ui.84": "Column count",
    "ui.85": "Close help",
    "noscript": "Please enable JavaScript.",
    "language": "Switch to Japanese",
    "count": "(Characters: {count})",
    "empty": "Enter a column count.",
    "notInteger": "Enter an integer column count.",
    "range": "Enter a column count from 1 to 20.",
    "tooLarge": "Column count exceeds the text length ({length} characters).",
    "noText": "Enter text to split.",
    "fileType": "Choose a text file.",
    "fileSize": "Choose a file no larger than 1 MB.",
    "fileRead": "Could not read the file.",
    "column": "📏 Column {number} (Characters: {count})",
    "copied": "📋 Copied column {number} to the clipboard.",
    "copyFailed": "❌ Could not copy to the clipboard.",
    "analyze": "📊 Open frequency analysis",
    "analyzeLong": "Analyze the first 5,000 characters",
    "analyzeTitle": "Open this text in Frequency Analyzer (external website in a new tab).",
    "splitDone": "Split into {count} columns.",
    "textTooLong": "The URL text exceeds 10,000 characters and was not loaded.",
    "badN": "The URL column count must be an integer from 1 to 20.",
    "theme.dark": "🌙 Switched to dark mode.",
    "theme.light": "☀️ Switched to light mode.",
    "help.limits": 
      "Receive text and n through ?text=…&n=…; all preprocessing is enabled, and valid pairs split " +
      "automatically. Limits: 10,000 URL characters, 1–20 columns, and 1 MB per file. Text and n are " +
      "removed from the URL after loading. Editing inputs or settings clears results. Characters are " +
      "counted by code point.",
  }
  };
  let language = 'en';
  const bindings = new Map();
  const query = new URLSearchParams(location.search).get('lang');
  let saved = null;
  try { saved = localStorage.getItem('divider-language'); } catch { /* Storage is optional. */ }
  if (query === 'ja' || query === 'en') language = query;
  else if (saved === 'ja' || saved === 'en') language = saved;
  else language = navigator.language.startsWith('ja') ? 'ja' : 'en';

  function t(key, values = {}) {
    return (messages[language][key] ?? key).replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
  }

  function assign(element, key, values = {}) {
    if (!key) {
      bindings.delete(element);
      element.textContent = '';
      return;
    }
    bindings.set(element, { key, values });
    element.textContent = t(key, values);
  }

  function apply() {
    document.documentElement.lang = language;
    for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
    for (const attr of ['title', 'aria-label', 'placeholder']) {
      for (const el of document.querySelectorAll('[data-i18n-' + attr + ']')) {
        el.setAttribute(attr, t(el.getAttribute('data-i18n-' + attr)));
      }
    }
    for (const [el, binding] of bindings) {
      if (el.isConnected) el.textContent = t(binding.key, binding.values);
      else bindings.delete(el);
    }
    const toggle = document.getElementById('language-toggle');
    toggle.textContent = language === 'ja' ? 'EN' : 'JA';
    toggle.setAttribute('aria-label', t('language'));
    toggle.title = t('language');
    document.dispatchEvent(new Event('language-changed'));
  }

  document.getElementById('language-toggle').addEventListener('click', () => {
    language = language === 'ja' ? 'en' : 'ja';
    try { localStorage.setItem('divider-language', language); } catch { /* Storage is optional. */ }
    apply();
  });
  apply();
  return { t, assign, apply, messages, get language() { return language; } };
})();
