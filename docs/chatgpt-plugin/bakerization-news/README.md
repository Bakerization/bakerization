# Bakerization NEWS（ChatGPT プラグイン）

パン・ベーカリー業界のニュースを ChatGPT が Web で調べ、出典付きの週刊まとめ記事「パン業界ウィークリー」を
日本語・英語で https://www.bakerization.com/news に公開するプラグインです。

## 中身

- `plugin.json` / `.codex-plugin/plugin.json` — プラグイン定義（表示名、説明、アイコン）
- `mcp.json` / `.mcp.json` — 接続先 `https://www.bakerization.com/api/mcp`（Streamable HTTP、OAuth）
- `skills/weekly-news/` — 週刊まとめ記事の調べ方・書き方・公開手順
- `skills/setup/` — 初回設定（接続確認と毎週の定期タスク作成）
- `assets/icon.png` — アイコン

## サーバー側

`/api/mcp` は Bakerization Research と同じ MCP サーバーです。**管理者（admin）アカウントで接続したときだけ**
次のツールが表示されます（`app/api/mcp/route.ts`）。

| ツール | 内容 |
| --- | --- |
| `news_list_posts` | 最近の記事一覧（`include_drafts` で下書きも） |
| `news_get_post` | 1記事の全文（日本語・英語の Markdown） |
| `news_create_post` | 新規作成。`published: true` で即公開、`false` で下書き。同じ slug があれば何も書かずにエラー |
| `news_update_post` | 既存記事の一部を変更（slug と URL は固定） |

削除ツールはありません。削除は https://www.bakerization.com/admen/news から行います。

## インストール

1. ChatGPT（デスクトップの ChatGPT Work）で `@plugin-creator` を開き、
   「`docs/chatgpt-plugin/bakerization-news` のフォルダからプラグインを作って」と頼む。
   Web 版でプラグインの ZIP アップロードが使える場合は `docs/chatgpt-plugin/bakerization-news.zip` をアップロードしてもよい。
2. プラグインをインストールし、接続フローで Bakerization の**管理者アカウント**でログインして同意する。
3. セットアップ（`setup` スキル）が動き、接続確認と毎週月曜 7:00 の定期タスク作成を案内する。
4. プラグインの書き込み操作を「常に許可」にする（定期タスクが承認待ちで止まらないように）。

## 使い方

- 今すぐ1本: 「先週のパン業界ウィークリーを作って公開して」
- 一覧: 「Bakerization NEWS の最近の記事を一覧して」
- 修正: 「weekly-2026-10-06 の要約を〜に直して」

記事の slug は `weekly-YYYY-MM-DD`（対象週の月曜）。同じ週を2回実行しても二重投稿にはなりません。

## ZIP の作り直し

```sh
cd docs/chatgpt-plugin/bakerization-news && rm -f ../bakerization-news.zip && zip -r ../bakerization-news.zip . -x '.DS_Store'
```
