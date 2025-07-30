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

👉 [Frequency Analyzer](https://ipusiron.github.io/frequency-analyzer/)

列分割後、任意の列の文字列をコピーしてFrequency Analyzerに貼り付ければ、頻度グラフを即座に可視化できます。
今後はURLパラメーターによる連携（GETメソッドでのテキスト受け渡し）にも対応予定です。
ただし、GETメソッドの仕様上、文字数は2,000程度に制限されます。

---

## 📄 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)をご覧ください。

---

## 🛠 このツールについて

本ツールは、「生成AIで作るセキュリティツール100」プロジェクトの一環として開発されました。
このプロジェクトでは、AIの支援を活用しながら、セキュリティに関連するさまざまなツールを100日間にわたり制作・公開していく取り組みを行っています。

プロジェクトの詳細や他のツールについては、以下のページをご覧ください。

🔗 [https://akademeia.info/?page_id=42163](https://akademeia.info/?page_id=42163)
