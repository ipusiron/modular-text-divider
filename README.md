# Modular Text Divider - テキスト列分割ツール

![GitHub Repo stars](https://img.shields.io/github/stars/ipusiron/modular-text-divider?style=social)
![GitHub forks](https://img.shields.io/github/forks/ipusiron/modular-text-divider?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/ipusiron/modular-text-divider)
![GitHub license](https://img.shields.io/github/license/ipusiron/modular-text-divider)

**Day030 - 生成AIで作るセキュリティツール100**

**Modular Text Divider** は、テキストを指定した分割数にしたがって周期的に分割するツールです。

AIを活用して、教育・可視化・ツール化を高速に反復し、暗号やセキュリティの理解を深めることを目的としています。

本ツールは、多表式暗号（ヴィジュネル暗号など）の解読で不可欠な「列分割処理」に焦点を当てます。
また、暗号以外にもテキスト解析やデータ前処理など、汎用性のある構成を意識しています。

列分割処理したテキストは頻度分析ツールとの連携によって、多表式暗号の解読を段階的に支援できる構造になっています。

---

## 🔗 デモページ

👉 [https://ipusiron.github.io/modular-text-divider/](https://ipusiron.github.io/modular-text-divider/)

---

## 📸 スクリーンショット

>![ヴィジュネル暗号文を列分割処理した結果](assets/screenshot.png)
>
>*ヴィジュネル暗号文を列分割処理した結果*

---

## ✨ 主な機能

- 任意のテキストを`n`分割（`n=3`なら、1・4・7…列など）
- ファイル読み込み、サンプル文入力、クリア機能
- テキスト整形オプション：
  - 小文字→大文字変換
  - 非アルファベット除去
  - スペース除去
- 処理済みテキストのプレビュー
- 各列のテキストをコピー
- 各列の文字数カウント
- CSV形式でのエクスポート（インデックスつき／なしの切替対応）

---

## 🔐 ヴィジュネル暗号解読の典型的な流れ

ヴィジュネル暗号の解読は以下の段階的なプロセスで行われます：

### 1. **カシスキー法による鍵長特定**
暗号文中の同じ文字列の出現間隔を測定し、鍵長の候補を絞り込む

### 2. **🎯 列分割（本ツールの役割）**
特定した鍵長で暗号文を周期的に分割し、各列を独立した単一換字暗号として扱う

### 3. **頻度分析による鍵特定**
各列に対して文字頻度分析を実行し、統計的手法で鍵の各文字を推定

### 4. **復号と検証**
推定した鍵で復号を試行し、意味のある平文が得られるかを確認

**本ツールは上記プロセスの「ステップ2」を効率化**し、カシスキー法で得られた鍵長候補を用いて暗号文を適切に列分割します。分割後の各列は[Frequency Analyzer](https://ipusiron.github.io/frequency-analyzer/)などの頻度分析ツールと連携することで、完全な解読ワークフローを実現できます。

---

## 🧠 想定される用途

- ヴィジュネル暗号などの **多表式暗号解読支援**
- 周期性のあるログや文字列の **列ごとのパターン分析**
- 単一換字として扱える列に対して **頻度分析を適用**
- 詩・歌詞・俳句などの **構造的分析**
- **教育用途**（暗号・パターン分析・整形手順の可視化）

---

## 📦 フォルダー構成（例）

```
modular-text-divider/
├── index.html # メイン画面
├── style.css # モダンカード風スタイル
├── script.js # 分割・整形・出力処理
├── README.md # 本ファイル
```

---

## 🔗 他ツールとの連携：Frequency Analyzer

各列に対して頻度分析を行いたい場合は、以下のツールと連携できます：

👉 [Vigenère Cipher Tool (Frequency Analyzer)](https://ipusiron.github.io/vigenere-cipher-tool/)

### 連携方法

**1. ワンクリック連携（推奨）**
- 各列の「📊 頻度分析」ボタンをクリック
- 自動的に新しいタブでFrequency Analyzerが開き、テキストが送信されます

**2. 手動連携**
- 各列の「📋 コピー」ボタンでテキストをコピー
- Frequency Analyzerに手動で貼り付け

### GET パラメーター仕様

本ツールは以下の形式でFrequency Analyzerにテキストを送信します：

```
https://ipusiron.github.io/vigenere-cipher-tool/?text={URLエンコードされたテキスト}
```

**制限事項：**
- 文字数制限：5,000文字（GETパラメーターの実用的制限）
    - GETパラメーターが何文字送れるかはブラウザー依存。IEだと2,000文字、Chrome / Firefox / Edgeだと8万文字（理論上はもっと可）とされる。
- 5,000文字を超える場合は確認ダイアログが表示し、OKなら先頭5,000文字だけ送る
- URLエンコードにより日本語や特殊文字も対応
- URLエンコードによって、1文字が3文字にエンコードされるケースもある。

**使用例：**

```
https://ipusiron.github.io/vigenere-cipher-tool/?text=HELLO%20WORLD
```

---

## 🔧 技術的なメモ

### スライダーラベルの実装

スライダー（1-20の範囲）の下に表示される数値ラベル（1, 3, 5, 9, 20）の位置合わせについて：

**問題**: 初期実装では手動で各ラベルの位置をパーセンテージで計算していたが、ブラウザー間の差異やスライダーの内部実装により、目盛りと数値ラベルが正確に一致しない問題が発生。

**解決方法**: CSS Gridを使用した設計変更
- `grid-template-columns: repeat(20, 1fr)` で20等分のグリッドを作成
- HTMLで20個のセルを用意し、必要な位置（1, 3, 5, 9, 20番目）にのみラベルを配置
- 他のセルは空の`<span></span>`で埋める

```css
.slider-labels {
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  text-align: center;
}
```

```html
<div class="slider-labels">
  <span class="label-1">1</span>        <!-- 1番目 -->
  <span></span>                         <!-- 2番目（空） -->
  <span class="mark label-3">3</span>   <!-- 3番目 -->
  <span></span>                         <!-- 4番目（空） -->
  <span class="mark label-5">5</span>   <!-- 5番目 -->
  <!-- ... 以下省略 ... -->
  <span class="label-20">20</span>      <!-- 20番目 -->
</div>
```

**利点**:
- 数学的計算が不要で保守性が向上
- ブラウザー間の一貫性が保証される
- スライダーの値と完全に対応した位置決め

---

## 📄 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)をご覧ください。

---

## 🛠 このツールについて

本ツールは、「生成AIで作るセキュリティツール100」プロジェクトの一環として開発されました。
このプロジェクトでは、AIの支援を活用しながら、セキュリティに関連するさまざまなツールを100日間にわたり制作・公開していく取り組みを行っています。

プロジェクトの詳細や他のツールについては、以下のページをご覧ください。

🔗 [https://akademeia.info/?page_id=42163](https://akademeia.info/?page_id=42163)
