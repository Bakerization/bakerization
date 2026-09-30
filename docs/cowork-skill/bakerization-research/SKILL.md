---
name: bakerization-research
description: Bakerization Research（bakerization.com/research）にHTML成果物を公開する。HTMLページ・レポート・ダッシュボードを作ったら必ずこのスキルに従って公開し、URLを報告する。
---

# Bakerization Research への公開

Bakerization Research は社内メンバー限定の HTML アーティファクト置き場です。
「Bakerization Research」コネクタ（MCP）の `publish_artifact` / `update_artifact` ツールで公開します。

## いつ使うか

- ユーザーが HTML のページ・レポート・ダッシュボード・図解を求めたとき
- 「research に上げて」「公開して」「メンバーに共有して」と言われたとき
- 既に公開したアーティファクトの修正を求められたとき（→ `update_artifact`）

## 作り方のルール

1. **単一ファイルで自己完結**にする。CSS と JS はインライン。外部リソースは
   cdnjs / jsdelivr / unpkg / Google Fonts の `<script>` `<link>` だけ可。
2. `<title>` を必ず入れる（ギャラリーのタイトルになる）。
3. 画像は data URI か外部 URL。ローカルファイル参照は動かない。
4. 目安 150 KB 以内。超える場合はユーザーに「サイトの Web アップロードを使ってください」と伝える。
5. `localStorage` / `document.cookie` は使えない（サンドボックス表示）。使う場合は try/catch。

## 公開手順

1. `list_projects` でプロジェクトの slug を確認する。ユーザーが指定しなければ `inbox`。
   新しいテーマなら `create_project` で作ってよい（名前は日本語で可）。
2. `publish_artifact` に **HTML 全文**・`title`・`project_slug`・短い `description` を渡す。
   ユーザーが「公開して」「誰でも見られるように」「検索に載せて」と言ったら `visibility: "public"` を付ける
   （ログイン不要で見られ、検索エンジンにも載る）。指定がなければメンバー限定（既定）。
3. 返ってきた `url` をユーザーにそのまま報告する（例: 「公開しました → https://www.bakerization.com/research/a/xxxx」）。
4. 修正依頼は同じ `id` で `update_artifact`（URL は変わらない）。新規で公開し直さない。

## しないこと

- HTML を省略・要約して渡さない（必ず完全な文書）。
- 同じ内容を複数回 `publish_artifact` しない。
- 公開に失敗したら、エラー内容を伝えて HTML ファイルを手元に保存する。
