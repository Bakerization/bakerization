## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Use `.env.example` as the source of truth.  
For Vercel, register the same keys in Project Settings -> Environment Variables.

Required for production:

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


## Research（メンバー限定の HTML アーティファクト置き場）

`/research` は Better Auth でログインしたメンバーだけが見られる、Claude 製 HTML の管理画面です。

### 初回セットアップ

1. 環境変数を設定する（`.env` / Vercel）: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`（本番は `https://www.bakerization.com`）, `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`。
2. 認証テーブルを作る: `npx auth@latest migrate --config lib/auth.ts -y`
3. 管理者を作る: `npm run seed:admin`
4. `/admen/login` で管理者ログイン → `/research/members` で名前とメールを入力して招待メールを送る（受け取った人が自分でパスワードを設定）。
   メールは Resend（`RESEND_API_KEY` / `CONTACT_FROM`）で送る。
   研究用テーブル（`research_projects` / `research_artifacts`）は初回アクセス時に自動作成される。

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
