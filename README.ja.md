# NoShitUi-skill

[简体中文](README.md) · [English](README.en.md) · 日本語 · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md)

<div align="center">
  <h3>継ぎはぎのない UI —— AI による UI リソースの発見・選定・実装を支える Skill</h3>
  <p><sub>Less Shit UI, More Intentional Interfaces.</sub></p>
</div>

> Web ページ、製品 UI、デザイン探索のために必要に応じて読み込める Skill。AI がまず画面の意図を理解し、オープンソースの UI リソースから根拠を持って選択し、検証可能な最小限の変更で実装することを支援します。

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Codex Skill](https://img.shields.io/badge/Codex-Skill-2563EB.svg)](SKILL.md)
[![Catalog](https://img.shields.io/badge/catalog-open--source%20UI-0ea5e9.svg)](open-source-ui-resources/references/ui-libraries.md)

## プロジェクト概要

NoShitUi-skill は、UI 制作で手戻りが生じやすい問題に取り組みます。多数のコンポーネントライブラリ、テンプレート、参考サイト、コード断片を前に、選定基準がないまま複数のデザインシステムを組み合わせると、見た目の不統一、操作状態の不足、ライセンスの不明確さが残ってしまいます。

この Skill は作業を四つの段階に分けます。

1. **リソースの発見**：参考サイト、コンポーネントのソースコード、総合 UI ライブラリ、アイコン、グラフ、テンプレートを区別します。
2. **選択肢の比較**：プロジェクトのフレームワーク、実行環境、コンポーネントの対応範囲、アクセシビリティ、テーマ機能、バンドルサイズ、ライセンス、保守状況から候補を絞ります。
3. **実装と導入**：中心となるコンポーネント方針を一つ決め、代表的な画面やユーザーフローを最小限の変更で実装します。
4. **成果の検証**：レスポンシブレイアウト、キーボードのフォーカス、操作状態、ビルド結果、第三者リソースの出典を確認します。

ルートの [`SKILL.md`](SKILL.md) はそのままインストールできる入口です。[`open-source-ui-resources/`](open-source-ui-resources/) には詳細なルール、リソース一覧、保守用スクリプトを収録しています。

## 継ぎはぎのない UI の考え方

扱いにくい UI は、一度の設計で生まれるわけではありません。「とりあえず既製品を探そう」「とりあえずコンポーネントを足そう」「統一するのは後でいい」という判断の積み重ねで生まれます。

基本原則は一つです。

> **まず画面の意図を定め、それからリソースを選ぶ。まず視覚的なルールを決め、それからコンポーネントを取り込む。**

三つの制約を守ります。

- 参考デザイン、コード、フォント、画像、アイコン、ブランド素材の出典をそれぞれ確認し、展示サイトをオープンソースのコードリポジトリとして扱いません。
- 一つのプロジェクトでは一つの主となるコンポーネント方針を優先し、明確な不足を補う場合にだけ、スタイルを持たないプリミティブ、アイコン、アニメーションのリソースを追加します。
- 操作状態とモバイルでの挙動を見た目と同じくらい重視し、静止画のスクリーンショットだけで確認を終えません。

## 主な機能

| 機能 | 適した質問 | 主な成果物 |
| --- | --- | --- |
| リソースの発見 | 「参考にできる UI サイトやオープンソースのライブラリは？」 | 分類した一覧、用途の説明、公式リンク、利用条件に関する注意事項 |
| UI の選定 | 「MUI、shadcn/ui、Radix、Element Plus はどう選ぶ？」 | エコシステム、スタイル方式、対応範囲、コスト、ライセンスの比較 |
| プロジェクトに合う提案 | 「今の技術スタックに合う構成を勧めてほしい」 | 主となる方針一つ、代替案一つ、選定理由 |
| 画面の実装 | 「選んだコンポーネントをプロジェクトに導入してほしい」 | 最小限の代表的な画面やユーザーフロー、テーマ、出典の記録 |
| 品質の回帰確認 | 「今回の UI 変更は問題なく動く？」 | デスクトップとモバイル、キーボードのフォーカス、状態、ビルドの検証 |

これらは自然な言葉で依頼できます。決まったスラッシュコマンドを覚える必要はなく、`$noshit-ui-skill` と明示して呼び出すこともできます。

## 出力例（手軽なプレビュー、展示用）

### オンラインのホームページ

ショーケースのホームページは、クールな白とシルバーに青い光を重ねたデザインです。実際のプロジェクト画面を浮遊ウィンドウとして配置し、マウスの動きに合わせた視差効果を加えています。

- **20 の実装例**：キーワード検索、カテゴリ、3D フィルターで絞り込み、各デモを開けます。
- **8 言語**：簡体字中国語、英語、日本語、韓国語、スペイン語、フランス語、ドイツ語、ポルトガル語に対応し、各言語の README ガイドにリンクしています。
- **デスクトップとモバイル**：画面幅に応じてレイアウトとプレビューを調整し、システムの「動きを減らす」設定を尊重します。

<p align="center">
  <a href="https://wzj1228516103.github.io/NoShitUi-skill/?lang=ja"><img src="docs/screenshots/concepts/showcase-desktop.png" alt="実際のプロジェクト画面が浮かぶ銀色と青の NoShitUi-skill ホームページ（中国語表示）" width="920"></a>
</p>

<details>
  <summary>モバイル版のホームページを見る</summary>
  <p align="center">
    <img src="docs/screenshots/concepts/showcase-mobile.png" alt="紹介文と浮遊するプロジェクト画面を縦に並べた銀色と青のモバイル版ホームページ（中国語表示）" width="320">
  </p>
</details>

### 20 のインタラクティブな実装例

カルーセルは実装済みの全20プロジェクトを紹介します。3D体験の OBJECT、rooted.、DRIFT、ORBITAL を先頭に置き、運用画面、shadcn の注文ダッシュボード、UI ATLAS のリソース図譜、残りのブランド・動的ページを続けています。ホームページも同じ順序で、3D絞り込み、カテゴリ、キーワード検索に対応します。リソース発見、選定理由、統合と検証がプロジェクトの中心です。 [展示をオンラインで体験](https://wzj1228516103.github.io/NoShitUi-skill/) · [展示のソースコード](https://github.com/wzj1228516103/NoShitUi-skill/tree/showcase-source/ui-atlas-demo) · [オンラインのリソースマップ](https://wzj1228516103.github.io/NoShitUi-skill/resources.html)

[再現可能な3つの選定事例（英語）](docs/case-studies/README.md)では、SHADCN/OPS・NODE・OBJECT の制約、候補の比較、出典とライセンス、実装、検証手順を確認できます。[オンライン事例一覧](https://wzj1228516103.github.io/NoShitUi-skill/case-studies.html)。

検索語・分類・言語を含むリンクを共有できます（例：[ポスターツール](https://wzj1228516103.github.io/NoShitUi-skill/?category=creative&q=poster&lang=ja#examples)）。再読み込みやブラウザーの戻る・進むで選択した表示を復元します。

オンラインのリソース図鑑は厳選したデモです。選定用の全一覧は [Skill のライブラリ一覧](open-source-ui-resources/references/ui-libraries.md)を参照してください。

<p align="center">
  <img src="docs/screenshots/concepts/ui-atlas-showcase.gif" alt="全20プロジェクトのプレビュー、3D体験を先頭に" width="920">
</p>
<p align="center"><sub>OBJECT// · rooted. · DRIFT. · ORBITAL/ · TEMPO · FRAME · STAY · NODE · LOOP · SOURCE · ARCHIVE · PLATE · PRECISION_ · SHADCN/OPS · UI ATLAS · FORME · OFFGRID · NOVA//25 · AETHER · KINETIC_</sub></p>

## ワークフロー

### 1. まず依頼の種類を判断する

- **リソース探し**：おすすめだけが必要な場合は、分類した候補リストと公式リンクを提示し、プロジェクトは変更しません。
- **選定**：プロジェクトの技術スタック、バージョン、ルーティング、スタイル方式、既存の依存関係を調べてから、主案とトレードオフを提示します。
- **実装**：ユーザーがコードの変更を明確に依頼した後にリソースをインストールまたはコピーし、検証できる最小限のユースケースを実装します。
- **保守**：一覧を更新する際は、公式の出典、ライセンス、ローカル参照を確認し、チェック用スクリプトを実行します。

### 2. 主となる方針を一つ選ぶ

- **スタイル付きの総合システム**：管理画面、フォーム、テーブル、CRUD 操作が多い製品に適しています。多数のコンポーネントを素早く揃えたい場合に優先します。
- **スタイルを持たないプリミティブ**：ブランドの表現が明確で、DOM と CSS を制御したい製品に適しています。フォーカス管理とキーボード操作を重点的に確認します。
- **ソースコードを所有する方式**：コンポーネントのコードをプロジェクトに取り込み、長期的に自ら保守したいチームに適しています。コピー元と依存関係のライセンスを残す必要があります。
- **CSS／ユーティリティクラス方式**：コンポーネントの組み合わせ、操作の挙動、アクセシビリティを自分たちで担うチームに適しています。

標準では一つの主となるコンポーネント方針を勧め、具体的な用途のためのアイコンまたは挙動を補うリソースを最大一つ追加します。複数のサイトの例が魅力的だからという理由で、複数の総合デザインシステムを同時に導入しません。

### 3. 採用理由を記録する

実際にインストールまたはコピーするリソースについて、少なくとも次を記録します。

| 項目 | 確認する内容 |
| --- | --- |
| 互換性 | フレームワーク、バージョン、SSR/RSC、ブラウザー、パッケージマネージャー |
| 対応範囲 | テーブル、日付入力、アップロード、コマンドメニュー、グラフ、ナビゲーションなどの実際の要件 |
| 導入コスト | peer dependencies、Provider、グローバルスタイル、バンドルサイズ、更新の負担 |
| 製品側の制御 | テーマの token、DOM の制御、ソースコードの所有、カスタマイズ方法 |
| 品質要件 | キーボード、フォーカス、セマンティクス、スクリーンリーダー、RTL、ローカライズ、reduced motion |
| ライセンス | 直接利用するパッケージ、コピーしたソース、テンプレート、フォント、画像、アイコン、例それぞれの利用許諾 |
| 保守状況の根拠 | 対応バージョン、最近のリリース、Issue への対応、セキュリティ情報 |

## リソース一覧

詳細な一覧は [`open-source-ui-resources/references/`](open-source-ui-resources/references/) にあり、以下を含みます。

- **React のスタイル付きシステム**：MUI、Ant Design、Mantine、Chakra UI、PrimeReact、Fluent UI。
- **React のスタイルを持たない方式とソースコード方式**：shadcn/ui、Radix UI、React Aria、Headless UI、Base UI。
- **Vue のコンポーネントシステム**：Element Plus、Naive UI、Vuetify、Quasar、PrimeVue、Arco Design Vue、Reka UI。
- **Svelte とフレームワークに依存しない方式**：Skeleton、Bits UI、Melt UI、shadcn-svelte、Bootstrap、Bulma、Pico CSS、Tailwind CSS、daisyUI。
- **アイコンとデータ可視化**：Lucide、Heroicons、Tabler Icons、Phosphor、Apache ECharts、Recharts、Nivo。
- **デザインの参考とパターン**：Mobbin、Page Flows、Godly、Awwwards、UIverse、HyperUI、Component Gallery、Component Party。
- **動きと用途別の UI**：Motion、assistant-ui、React Flow / Svelte Flow、TanStack Table。
- **編集と操作**：Tiptap、Lexical、dnd-kit、React Hook Form、TanStack Virtual、React DayPicker。
- **追加制限のあるビジュアルソース**：React Bits、Animate UI。採用前に実際の LICENSE と Commons Clause の条件を確認してください。

日付付きのバージョン情報、依存条件、ライセンスの出典は[検証記録](open-source-ui-resources/references/library-verification.md)にあります。既存プロジェクトの更新を求めるものではありません。

この一覧は網羅的な登録簿ではありません。展示サイトは主に、階層、フロー、余白、状態、レスポンシブな変化を研究するために使います。再利用するコードの出典にできるのは、公式リポジトリ、公式パッケージ、またはソースコードであることを明示したページです。各リソースのコード、画像、フォント、アイコン、ブランド素材についても、利用条件を個別に確認する必要があります。

## インストール

リポジトリを Codex Skill としてインストールします。

```bash
npx skills add https://github.com/wzj1228516103/NoShitUi-skill -g -a codex -y
npx skills list -g -a codex
```

一覧に `noshit-ui-skill` が表示されればインストール完了です。Codex を開き直して、作りたい UI をそのまま説明してください。

## 使用例

```text
この React 管理画面向けに MUI、Mantine、shadcn/ui を比較してください。SSR、アクセシビリティ、バンドルサイズ、テーマのカスタマイズを考慮し、最後に代表的なテーブル画面を実装してください。
```

```text
参考デザインだけが必要なので、コードは変更しないでください。SaaS のトップページ、モバイルの onboarding、データ管理画面の各用途について、研究に適した UI サイトを勧め、参考専用のものを明記してください。
```

```text
この Vue 3 プロジェクトはすでに Element Plus を使っています。まず既存の依存関係とテーマを調べ、補助的なアイコンの構成を一つ提案してください。二つ目の総合コンポーネントライブラリは追加しないでください。
```

```text
今回の UI 変更に、グローバルスタイルの競合、キーボードのフォーカス消失、モバイルでの横方向のはみ出し、loading/empty/error 状態の不足、第三者素材の出典が不明な箇所がないか調べてください。まずは確認だけで、変更はしないでください。
```

## ディレクトリ構成

```text
.
├─ SKILL.md                              # そのままインストールできるルートの Skill 入口
├─ README.*.md                           # 多言語の概要と利用ガイド
├─ agents/openai.yaml                    # Codex の UI メタデータ
├─ .github/workflows/check-catalog.yml
├─ open-source-ui-resources/
│  ├─ SKILL.md                           # リソースの発見と導入のルール
│  ├─ references/ui-libraries.md         # フレームワークと用途別の UI ライブラリ
│  ├─ references/ui-websites.md          # デザイン参考、コンポーネント、パターンのサイト
│  ├─ references/selection-and-adoption.md
│  ├─ references/library-verification.md
│  ├─ scripts/check_catalog.py           # ローカル参照とリンクの確認スクリプト
│  └─ scripts/test_check_catalog.py
```

## 検証と保守

固定シナリオと証拠記録は[動作評価ガイド](evals/README.md)、デスクトップ・モバイル・復旧チェックの実行方法は[ブラウザー回帰ガイド](tests/browser/README.md)を参照してください。デプロイ前にブラウザー回帰とランプ組立チェックを実行します。

リソース一覧を変更した後は、次を実行します。

```bash
python open-source-ui-resources/scripts/check_catalog.py
python -m unittest discover -s open-source-ui-resources/scripts -p "test_*.py"
```

CI はオフラインの回帰テストを実行し、両方の Skill 入口、一覧、8 言語の README のローカルリンクと画像を確認します。外部リンクは必要に応じて手動で確認します。

ネットワークが利用できる場合は、外部リンクも確認できます。

```bash
python open-source-ui-resources/scripts/check_catalog.py --check-links
```

アクセス拒否、レート制限、タイムアウトのあるリンクは「未検証」と記録し、すぐにリンク切れと判断しません。実際のプロジェクトへの導入では、そのプロジェクトの typecheck、lint、build も実行します。さらにデスクトップとモバイルで、はみ出し、タッチ操作の対象サイズ、フォーカス、ポップアップ、loading、empty、error、reduced-motion の挙動を確認します。

## 適用範囲と限界

- UI の参考資料整理、コンポーネントの選定、デザイン方向の比較、画面の試作、小規模な導入に適しています。
- 一覧に掲載されているだけでリソースを自動的にインストールまたはコピーしません。実装前にプロジェクトの制約とユーザーの許可を確認します。
- 正式なアクセシビリティ監査、ライセンス審査、ブランドの利用許諾、性能負荷試験、公開の承認を代替するものではありません。
- 「無料」「コピー可能」「MIT」「オープンソース」を同じ意味の約束として扱いません。具体的なパッケージ、ファイル、素材ごとにライセンスを確認する必要があります。
- 公式の出典、バージョン、利用条件を確認できない場合、そのリソースは根拠が揃うまでデザインの参考用途にとどめます。

## 参考資料とライセンス

- [Component Gallery](https://component.gallery/)：異なるデザインシステムのコンポーネントパターンを比較できます。
- [Component Party](https://component-party.dev/)：React、Vue、Svelte などのフレームワークでのコンポーネントの書き方を比較できます。
- [Radix UI](https://www.radix-ui.com/) と [React Aria](https://react-spectrum.adobe.com/react-aria/)：スタイルを持たないインタラクションとアクセシビリティの挙動を参照できます。

本プロジェクトは、上記プロジェクトの公式製品ではなく、その推薦や承認も受けていません。独自に作成した Skill コンテンツには [MIT License](LICENSE) が適用されます。一覧内の第三者プロジェクト、リモートリソース、他のプロジェクトにコピーしたコンポーネントには、それぞれのライセンスまたはサイトの利用規約が適用されます。リポジトリの出典情報は [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md) を参照してください。

Issue や改善提案を歓迎します。
