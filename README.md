## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

トップページの共同事業の企業例は [lib/partnership-companies.ts](lib/partnership-companies.ts) の世界300社が正本。ブラウザで表示ごとに3社を均等に抽出し、同じタブの直前の3社は候補から外す。ISRのキャッシュでも例示が固定されないよう初期HTMLに特定企業を置かない。

Use `.env.example` as the source of truth.  
For Vercel, register the same keys in Project Settings -> Environment Variables.

Required for production (`ADMIN_EMAIL` / `ADMIN_PASSWORD` are read only by the local scripts `seed:admin` / `rotate:admin`, not at runtime):

```env
ADMIN_EMAIL=
ADMIN_PASSWORD=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
RESEND_API_KEY=
EMAIL_ADDRESS=
```

Optional (contact mail behavior):

```env
CONTACT_TO=
CONTACT_FROM=
CONTACT_SEND_CONFIRMATION=true
CONTACT_CONFIRM_SUBJECT=
CONTACT_CONFIRM_TEXT=
CONTACT_CONFIRM_HTML=
```

Notes:

- `BETTER_AUTH_URL` must be the canonical production URL on Vercel (`https://www.bakerization.com`, not `http://localhost:3000`).
- `DATABASE_URL` is required to persist blog posts. If unset, blog list/detail returns empty during runtime.
- `BLOB_READ_WRITE_TOKEN` is required for blog image upload and `/api/blob/*` proxy reads.

## ブログ・パンラボ記事アーカイブ

### 中国語・韓国語の検索向け紹介ページ

`/zh`（簡体字中国語）と `/ko`（韓国語）は、団体・活動・kiji hub・公開資料を紹介する翻訳済みのページ。日本語・英語のトップページと相互に `hreflang` を指定し、サイトマップにも同じ4言語のURLを掲載する。通常のページ・記事は実際に用意した言語だけを代替URLとして扱う。ブログへは同じ言語で移動し、その他の記事・製品ページへ移るリンクにはリンク先の言語を表示する。

公開ブログ・ニュース画像の `/api/blob/blog-assets/` は `robots.txt` の個別の `Allow` でクロールを許可し、他の `/api/` は従来どおり除外する。SEOの回帰チェックは `npm run test:seo`。

池田浩明氏の他媒体の許可済み執筆記事も、出典・元の公開日・共著者を保持して同じブログと池田AIへ追加する。対象・再実行・照合手順は [docs/ikeda-publications.md](docs/ikeda-publications.md)。

ブログの英語・簡体字中国語・韓国語対応（全記事の各言語タイトル・紹介文、全文の翻訳保存、原文切り替え、検索と池田AI）は [docs/blog-english.md](docs/blog-english.md)。翻訳モデル・分割・速度の正本は [lib/blog-translation-config.ts](lib/blog-translation-config.ts)。

朝日新聞デジタルマガジン＆の連載「このパンがすごい！」も、転載許可取得済みとして同じブログに掲載する。取得・写真保存・本文と公開日の照合は [docs/asahi-konopan.md](docs/asahi-konopan.md)。媒体の出典表記と池田AIの対象記事・IDは [lib/ikeda-sources.ts](lib/ikeda-sources.ts) を共用する。

年代・テーマ・語句検索と池田AIの構成・運用は [docs/ikeda-ai.md](docs/ikeda-ai.md) を参照する。検索件数・モデル・トークン予算・利用上限の正本は [lib/ikeda-config.ts](lib/ikeda-config.ts)。`/blog/chat` は専用チャット画面で、記事の問い・主張・原文引用を確認しながら質問できる。ChatGPT Pro等のAPI特典を受け取ったOpenAI組織の `OPENAI_API_KEY` をサーバーに設定し、OpenAI APIへ直接接続する。特典の有効化・対象組織・残高を確認してから切り替え、Vercel AI Gatewayへはフォールバックしない。

2026-11-17に公開アーカイブ195ページから1,941記事を取り込み、元の公開日・元本文・表示本文の全件一致を確認した。公開日は2009-07-09〜2024-11-10。既存のBakerization記事1件を保持し、写真11,026点（1,393,185,201バイト）を保存した。元サイトで404の写真6点と、元から解決できない `blob:` 画像参照1点は移行レポートに記録している。

- `/blog` と `/blog/page/<番号>` が公開記事の一覧、`/blog/<slug>` が本文。ヘッダー・フッター・トップページからリンクする。けんの Journal（note）は別の導線として継続する。
- 日付の正本は `blog_posts.published_at`。表示は日本時間、並び順は公開日の降順。同じ日の記事も元の時刻を保存する。`created_at` / `updated_at` や取り込み日時から公開日を作らない。既存のBakerization記事では移行時に `created_at` を引き継ぐ。
- 一覧のページサイズは `lib/blog-store.ts` の `BLOG_PAGE_SIZE` を共用する。サイトマップは全件を扱い、以前の1,000件の取得上限を設けない。公開ページ・公開APIは下書きを返さない。
- パンラボの記事は `panlabo-<JUGEM記事ID>` の固定slugと、一意な `source_url` で重複を防ぐ。`source_html` に元の本文、`source_hash` にタイトル・公開日・元本文のSHA-256、`original_date` に元サイトの日付文字列を保存する。転載先の本文だけを安全化し、広告・共有ボタン・スクリプトを除く。元記事の署名を保持し、集合的な著者表記を「パンラボ」とする。
- JUGEM写真は既存の非公開Blobストアの `blog-assets/panlabo/` に保存し、既存の `/api/blob/` 経由で配信する。第三者サイトの埋め込みは参照先を維持する。取得不能な写真は元URLを残し、移行レポートに記録する。
- 旧YouTube Flash埋め込みは同じ動画IDの現在のプレーヤーへ変換する。元から解決不能な `blob:` 形式の写真も移行レポートに記録する。

### 移行の再実行

池田浩明氏の承諾済み。公開指示は2026-11-17。元サイトは `https://panlabo.jugem.jp/`。

```sh
# .env に本番接続先を設定し、最初に読み取りで接続先を照合する。
node --import=tsx scripts/crawl-panlabo.ts
# 収集中から --watch で写真保存を並行できる。本文取得は10秒間隔。
node --env-file=.env --import=tsx scripts/mirror-panlabo-images.ts --watch
# 収集済みキャッシュからの再解析。ネットワークアクセスしない。
node --import=tsx scripts/crawl-panlabo.ts --offline
# 書き込まずに件数・日付・ハッシュ・写真の処理完了を検証。
node --import=tsx scripts/import-panlabo.ts
# 検証後にDBへ登録。再実行時は既存の同一記事を増やさない。
node --env-file=.env --import=tsx scripts/import-panlabo.ts --write
node --import=tsx --test scripts/panlabo.test.ts
```

キャッシュ・移行前バックアップ・照合結果は `.cache/panlabo/`（Git・デプロイの対象外）に保存する。保存先は `PANLABO_CACHE_DIR` で変更可能。移行前の既存記事は `blog-posts-before-import.json`、移行後の全件照合は `import-report.json`。収集中にアーカイブのページ数が変わる、日付を認識できない、記事IDが重複する、本文の続きを取得できない場合は取り込みを中止する。DB登録後にデプロイを行い、一覧とサイトマップのISRキャッシュを新しいデプロイで生成し直す。


## Research（メンバー限定の HTML アーティファクト置き場）

`/research` は Claude 製 HTML の公開ギャラリー兼メンバー用の管理画面です。
ログインしていない人には公開（`visibility: "public"`）のアーティファクトと、それを含むプロジェクトだけが見えます（ログイン導線は出さず、メンバー限定の URL は 404）。
メンバーは `/research/login` を直接開いてログインします。

### 初回セットアップ

1. 環境変数を設定する（`.env` / Vercel）: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`（本番は `https://www.bakerization.com`）, `DATABASE_URL`。ローカルの `.env` には `ADMIN_EMAIL`, `ADMIN_PASSWORD` も（スクリプト専用）。
2. 認証テーブルを作る: `npx auth@latest migrate --config lib/auth.ts -y`
3. 管理者を作る: `npm run seed:admin`（パスワードの入れ替えは `npm run rotate:admin`: ランダム 32 文字に変更し、全セッションを失効、`.env` を更新）
4. `/admen/login` で管理者ログイン → `/research/members` で名前とメールを入力して招待メールを送る（受け取った人が自分でパスワードを設定）。
   メールは Resend（`RESEND_API_KEY` / `CONTACT_FROM`）で送る。
5. ブログ・研究用テーブルとインデックスを作る: `npm run ensure:tables`（再実行可）。
   読み取り経路は起動時に DDL を実行しない（コールドスタート短縮のため）ので、新しい環境とスキーマ変更後はこれを 1 回実行する。
   作成系の操作（プロジェクト作成・アーティファクト公開）は従来どおり自動で作成する。

### レンダリングとキャッシュ

- 公開ページは `app/[locale]/` 配下で言語ごとに静的生成される。公開 URL は従来どおり（ja = クリーン URL、en = `?lang=en`）で、`next.config.ts` の rewrite が内部パス `/ja/...` `/en/...` に振る。
- `/research` の公開ページは ISR。公開・更新・削除・並べ替えのたびに `lib/research-store.ts` の `revalidateResearch()` が再生成を指示する（web / REST / MCP すべて同じ経路）。ブログは `savePost()` が同様に再生成する。
- メンバー向け画面（セッション cookie あり）は `proxy.ts` が `/{locale}/m/research/...` に rewrite し、毎回動的に描画する。`/m/...` を直接開くと公開 URL にリダイレクトされる。
- 成果物 HTML（`/research/raw/<id>`）は `?v=<sha256 先頭 16 桁>` 付きで配信され、ブラウザと Vercel CDN にキャッシュされる。内容が変わると URL が変わる。
- Vercel の関数リージョンは `vercel.json` で Neon と同じ `sin1`。

### Claude からの公開

- **Claude Cowork / claude.ai / Desktop**: カスタムコネクタに `https://www.bakerization.com/api/mcp` を追加 → 接続 → ログイン → 許可。
  以後 `publish_artifact` / `update_artifact` で公開できる。`docs/cowork-skill/` を zip にして Cowork のスキルとしてアップロードすると、毎回指示しなくても自動で公開される。
- **Claude Code**: `claude mcp add --transport http bakerization https://www.bakerization.com/api/mcp`
- **REST**: `/research/settings` で API キーを発行し、`POST /api/research/artifacts`（JSON または multipart）。

### 主なパス

| パス | 内容 |
|---|---|
| `/research` | プロジェクト一覧 |
| `/research/p/<slug>` | プロジェクト（リスト/グリッド、ドラッグ並び替え、アップロード） |
| `/research/a/<id>` | アーティファクトビューア（sandbox iframe） |
| `/research/raw/<id>` | 認証付きの生 HTML（CSP sandbox） |
| `/research/settings` | API キー・パスワード変更・接続手順 |
| `/research/members` | メンバー管理（管理者のみ） |
| `/api/mcp` | MCP サーバー（OAuth 2.1） |
