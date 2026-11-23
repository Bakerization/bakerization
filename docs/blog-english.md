# ブログの多言語対応

日本語原文・元の公開日・出典・写真を維持し、英語（`?lang=en`）・簡体字中国語（`?lang=zh`）・韓国語（`?lang=ko`）で一覧・検索・記事・池田AIを利用できる。既存の人手で作成した英語版を優先し、自動翻訳は別テーブル `blog_translations` に言語別で保存する。媒体の原文や日本語の記事列は更新しない。DBは引き続きNeonを使う。

タイトルと紹介文は `scripts/translate-blog.ts` で全公開記事を先に翻訳する。語句検索は日本語原文と選択言語のタイトル・紹介文を検索する。本文は各言語で初めて開かれたときに全文を翻訳・保存する。翻訳中や取得失敗時にも日本語全文を表示し、完了後はタイトルと本文を一緒に切り替える。AI翻訳の表示と日本語原文への切り替えを備える。

対応言語・言語コード・ブログURLの正本は `lib/blog-language.ts`、画面の短文とテーマの訳は `lib/blog-copy.ts`。中国語・韓国語のrewriteはブログだけを対象にし、サイトの他ページは既存の日本語・英語を使う。記事のISRは内部パス `/en/blog/...` `/zh/blog/...` `/ko/blog/...` ごとに分け、言語変更時は文書を読み直して本文と `html lang` を揃える。サイトの言語Cookieは従来のja/enのままとし、中国語・韓国語はブログURLに明示する。フォントはOSの中国語・韓国語フォントを優先する。

翻訳はAPI特典を受け取ったOpenAI組織へ直接接続する。接続・初回の検索索引切り替え手順は `docs/ikeda-ai.md`。Vercel AI Gatewayの購入・自動補充は行わない。

モデル・分割サイズ・速度・処理時間の正本は `lib/blog-translation-config.ts`。HTMLのテキストノードと画像の代替テキストだけを翻訳し、リンク・画像・写真説明・段落構造を保つ。並列処理の完了順にかかわらず元の順序で組み立て、欠けた断片を全文として保存しない。原文ハッシュが異なる翻訳は表示しない。

`POST /api/blog/translate` は `{slug, language: "en" | "zh" | "ko"}` を受け取り（省略時はen）、公開記事だけを扱う。同一オリジン・JSON・入力サイズを検証する。同一記事・言語の同時生成はDBの期限付き予約で抑止する。保存済みの訳は生成枠を使わず再利用する。新規生成は池田AIと同じ日次・分次・利用者上限を共有し、使用トークンを記録する。全文保存後に該当言語の記事・一覧・サイトマップを再検証する。

```sh
# 初回または新規環境。既存テーブル・原文を保持する追加マイグレーション。
node --env-file=.env.production.local --import=tsx scripts/ensure-tables.ts
# 未翻訳の公開記事のタイトル・紹介文。保存済みはスキップする。
node --env-file=.env.production.local --import=tsx scripts/translate-blog.ts --language=en
node --env-file=.env.production.local --import=tsx scripts/translate-blog.ts --language=zh
node --env-file=.env.production.local --import=tsx scripts/translate-blog.ts --language=ko
# 特定記事の本文を事前に翻訳して確認する。
node --env-file=.env.production.local --import=tsx scripts/translate-blog.ts --language=ko --article=ikeda-fujinkoron-19086
```

本文の訳が保存済みの記事だけ、その言語の `hreflang` とサイトマップ項目を生成する。未翻訳の記事ページのcanonicalは原文を指し、翻訳保存後に更新する。公開日のタイムゾーンは日本時間のまま。思考索引の根拠・引用は日本語原文を使い、表示言語と区別する。池田AIは質問の言語で回答し、引用の話者を区別して翻訳を原文の直接引用として扱わない。
