# NoShitUi-skill

[简体中文](README.md) · [English](README.en.md) · 日本語 · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md)

> オープンソースの UI リソースを探し、比較し、プロジェクトに組み込むための Codex Skill。

NoShitUi-skill は、Web ページや製品 UI の目的を理解したうえで、コンポーネントライブラリ、テンプレート、参考サイトを選ぶための手順を AI に提供します。選定理由と出典を記録し、最小限の変更で実装と検証を進めます。

**まず画面の意図を定め、それからリソースを選ぶ。まず視覚的なルールを決め、それからコンポーネントを取り込む。**

## 主な機能

1. **発見**：参考サイト、再利用できるソースコード、UI ライブラリ、アイコン、グラフ、テンプレートを区別します。
2. **比較**：フレームワーク、実行環境、コンポーネントの充実度、アクセシビリティ、テーマ、バンドルサイズ、ライセンス、保守状況を確認します。
3. **導入**：中心となるコンポーネント方針を一つ選び、代表的な画面やユーザーフローを最小限の変更で実装します。
4. **検証**：デスクトップとモバイルの表示、キーボード操作、フォーカス、操作状態、ビルド、第三者リソースの出典を確認します。

参考サイトと再利用できるコードは別のものとして扱います。追加リソースは具体的な不足を補うために使い、複数のデザインシステムを無計画に混在させません。見た目だけでなく、読み込み中・空・エラーなどの状態も検証します。

## インストール

```bash
npx skills add https://github.com/wzj1228516103/NoShitUi-skill -g -a codex -y
npx skills list -g -a codex
```

一覧に `noshit-ui-skill` が表示されればインストール完了です。Codex を開き直して、作りたい UI を自然な言葉で説明してください。`$noshit-ui-skill` と明示して呼び出すこともできます。

## 使用例

```text
この React 管理画面に向けて MUI、Mantine、shadcn/ui を比較してください。SSR、アクセシビリティ、バンドルサイズ、テーマのカスタマイズを考慮し、代表的なテーブル画面を実装してください。
```

```text
この Vue 3 プロジェクトはすでに Element Plus を使っています。既存の依存関係とテーマを確認し、補助的なアイコンを提案してください。別の総合コンポーネントライブラリは追加しないでください。
```

リソース探しだけを依頼することもできます。コードの変更を依頼した場合に、導入と実装に進みます。

## リソースと手順

- [SKILL.md](SKILL.md)：インストール可能な入口と基本手順。
- [UI ライブラリ一覧](open-source-ui-resources/references/ui-libraries.md)：フレームワークと用途別の選択肢。
- [UI 参考サイト一覧](open-source-ui-resources/references/ui-websites.md)：参考サイト、コンポーネント、UI パターン。
- [選定と導入のガイド](open-source-ui-resources/references/selection-and-adoption.md)：互換性、導入コスト、品質、出典の確認。

## 検証と保守

カタログを変更したら、ローカル参照を確認します。

```bash
python open-source-ui-resources/scripts/check_catalog.py
```

ネットワークが利用できる場合は、外部リンクも確認できます。

```bash
python open-source-ui-resources/scripts/check_catalog.py --check-links
```

アクセス拒否、レート制限、タイムアウトは「未検証」と扱い、リンク切れと即断しません。実際の導入ではプロジェクトの typecheck、lint、build を実行し、表示のはみ出し、フォーカス、操作状態、動きを減らす設定への対応も確認します。

## 出力例

この Skill で制作したページは、成果の雰囲気を手軽に見るための例です。プロジェクトの中心はリソースの発見、選定、導入、検証です。
[オンライン展示](https://wzj1228516103.github.io/NoShitUi-skill/) · [展示のソースコード](https://github.com/wzj1228516103/NoShitUi-skill/tree/showcase-source/ui-atlas-demo)

## ライセンスと対象範囲

独自の Skill コンテンツには [MIT License](LICENSE) が適用されます。第三者のライブラリ、コピーしたソース、テンプレート、フォント、画像、アイコン、ブランド素材には、それぞれのライセンスや利用規約が適用されます。出典の説明は [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) を参照してください。

この Skill は UI の調査、選定、試作、小規模な導入を支援します。正式なアクセシビリティ監査やライセンス審査を代替するものではありません。出典や条件を確認できないリソースは、確認が済むまで参考用途にとどめます。

Issue や改善提案を歓迎します。
