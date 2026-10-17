---
name: bakerization-research
description: Bakerization Research（bakerization.com/research）にHTML成果物を公開する。HTMLページ・レポート・ダッシュボードを作ったら必ずこのスキルに従って公開し、URLを報告する。
---

# Bakerization Research への公開

Bakerization Research は社内メンバー限定の HTML アーティファクト置き場です。
「Bakerization Research」コネクタ（MCP）の `publish_artifact` / `update_artifact` ツールで公開します。
大きなページは `upload_html_chunk` で分割して送ってから公開します。

## いつ使うか

- ユーザーが HTML のページ・レポート・ダッシュボード・図解を求めたとき
- 「research に上げて」「公開して」「メンバーに共有して」と言われたとき
- 既に公開したアーティファクトの修正を求められたとき（→ `update_artifact`）

## 作り方のルール

1. **単一ファイルで自己完結**にする。CSS と JS はインライン。外部リソースは
   cdnjs / jsdelivr / unpkg / Google Fonts の `<script>` `<link>` だけ可。
2. `<title>` を必ず入れる（ギャラリーのタイトルになる）。
3. 画像は data URI か外部 URL。ローカルファイル参照は動かない。
4. **サイズの上限は気にしない。** 大きいページは分割アップロードで公開できる。
   サーバー側の上限は 1 ページ合計 2048 KB だけ。
5. `localStorage` / `document.cookie` は使えない（サンドボックス表示）。使う場合は try/catch。

## 公開手順

1. `list_projects` でプロジェクトの slug を確認する。ユーザーが指定しなければ `inbox`。
   新しいテーマなら `create_project` で作ってよい（名前は日本語で可）。
2. HTML の大きさで渡し方を決める。
   - **約 30 KB 以下**: `publish_artifact` の `html` に **HTML 全文**をそのまま渡す。
   - **約 30 KB を超える**（日本語の本文がおよそ 1 万字を超える、データを多く埋め込んでいる、
     迷ったら）: **分割アップロード**する。
     1. HTML 全文を、行の区切りで約 30 KB ずつのピースに分ける（手元にファイルがあれば
        `wc -c` で大きさを測り、ピースごとに読み出して使う）。
     2. `upload_html_chunk` に `index: 0` と最初のピースを渡す（`upload_id` は付けない）。
        返ってきた `upload_id` を控える。
     3. 残りのピースを `index: 1, 2, 3 …` の順に、同じ `upload_id` を付けて送る。
        ピースは送った文字列がそのまま連結される。間に何も足さない・削らない。
        失敗したピースは同じ `index` で送り直せば上書きされる。
     4. 全ピースを送ったら `publish_artifact` に `html` の代わりに `upload_id` を渡す。
3. `publish_artifact` には `title`・`project_slug`・短い `description` も渡す。
   ユーザーが「公開して」「誰でも見られるように」「検索に載せて」と言ったら `visibility: "public"` を付ける
   （ログイン不要で見られ、検索エンジンにも載る）。指定がなければメンバー限定（既定）。
4. 返ってきた `url` をユーザーにそのまま報告する（例: 「公開しました → https://www.bakerization.com/research/a/xxxx」）。
5. 修正依頼は同じ `id` で `update_artifact`（URL は変わらない）。新規で公開し直さない。
   大きいページの差し替えも、`upload_html_chunk` で送ってから `update_artifact` に `upload_id` を渡す。

## しないこと

- HTML を省略・要約・圧縮して渡さない（必ず完全な文書）。大きいからといって削らない。
- **大きさを理由に公開をあきらめない。** ファイルだけ渡して「Web アップロードしてください」
  「Chrome 拡張をつないでください」と頼まない。必ず分割アップロードで公開する。
- 同じ内容を複数回 `publish_artifact` しない。
- 分割アップロードでも公開に失敗したときだけ、エラー内容をそのまま伝えて HTML ファイルを手元に保存する。
