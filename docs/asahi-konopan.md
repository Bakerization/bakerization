# 朝日新聞「このパンがすごい！」の移行

転載許可取得済みとして2026-11-18に依頼された連載全記事を、Bakerizationの同じブログへ追加する。対象は朝日新聞デジタルマガジン＆の [連載一覧](https://www.asahi.com/and/w/serialstory/konopan) に載る記事だけ。推薦記事や広告を対象に混ぜない。

公開一覧は15ページ・445記事（2015-09-01〜2026-11-17）。本文・公開日のメタデータ・画面上の日付を相互照合し、取得時の日付へ置き換えない。正本は `blog_posts.published_at`。記事IDは `asahi-konopan-<朝日新聞のID>`、`source_url` は元記事の正規URL。

## 保存・検証

- 元ページ、抽出した元本文、表示用本文、出典URL、署名、元の公開日、SHA-256を保存する。文章の段落・見出し・写真キャプションが表示本文にも残ることを全件照合する。
- 著者名は記事の著者リンクから取る。画像だけのリンクを名前と取り違えない。無署名の告知3件は媒体名で保持し、池田浩明本人の文章とは断定しない。
- 本文に広告・推薦記事・スクリプトを混ぜない。写真は `blog-assets/asahi-konopan/` の非公開Blobに保存し、既存の `/api/blob/` から配信する。汎用MIMEで配信される写真も、実データの画像形式を確認して保存する。
- 本文にあるGoogleマップは安全な外部リンクに置き換える。写真ギャラリーへのリンクは元サイトを保つ。
- 読み取れない本文、制限された記事、未取得の続き、日付やタイトルの不一致があれば公開用取り込みを停止する。写真の取得失敗はURLと理由を記録し、元の参照を保持する。
- 既存のパンラボ記事等は変更しない。取り込み前後で件数・タイトル・公開日・本文チェックサムを照合する。同じ記事の再実行では重複を作らない。

## 手順

取得間隔・並列数・制限の正本は [`scripts/lib/asahi-konopan.ts`](../scripts/lib/asahi-konopan.ts)。キャッシュと報告は `.cache/asahi/`。`ASAHI_CACHE_DIR` で保存先を変えられる。キャッシュ、接続設定、元ページの大量データはGit・デプロイから除外する。

```sh
node --import=tsx scripts/crawl-asahi-konopan.ts
node --env-file=.env --import=tsx scripts/mirror-asahi-images.ts --watch
node --env-file=.env --import=tsx scripts/import-asahi-konopan.ts
# 検証を通したあとにDBへ登録
node --env-file=.env --import=tsx scripts/import-asahi-konopan.ts --write
node --env-file=.env --import=tsx scripts/index-ikeda.ts
node --env-file=.env --import=tsx scripts/verify-ikeda-index.ts
node --import=tsx --test scripts/asahi-konopan.test.ts
```

写真保存と本文の取り込みを並行する場合は、初回だけ `import-asahi-konopan.ts --source-images --write` とする。未保存の写真は元サイトの参照で表示する。写真保存が終わったら通常の `--write` を再実行し、保存先をすべて確定する。公開前の最終報告には未処理写真を残さない。

取得済みページの再解析は `crawl-asahi-konopan.ts --offline`。`listing.json` と `manifest.json` が全件の対象一覧、`posts.json` が抽出結果、`assets.json` が写真の保存先、`asset-failures.json` が取得不能の参照、`import-report.json` が全件照合結果。元ページの取り直しは対象キャッシュを退避してから行い、古い一覧と混ぜない。

## 池田AI

許可済み媒体と記事IDの正本は [`lib/ikeda-sources.ts`](../lib/ikeda-sources.ts)。索引作成・検証と公開API・クライアントの出典検証で共用する。新しい朝日新聞記事だけを追加解析し、既存記事の埋め込みは再生成しない。質問時の検索件数やトークン上限は既存の [`lib/ikeda-config.ts`](../lib/ikeda-config.ts) を維持する。

DBの登録と索引作成が済んだらデプロイして、一覧・サイトマップ・記事のISRキャッシュを更新する。記事ページの出典、公開日、本文、写真、AIの参照番号を本番URLで確認する。

## 取り込み結果

445記事の元の公開日・元本文・表示本文を全件照合し、既存1,942記事の不変も確認した。署名のある池田浩明の記事442件、媒体名で扱う無署名のお知らせ3件。写真3,646点（284,883,557バイト）を保存し、取得不能の写真はない。元から空だった画像参照1件と装飾アイコンは写真として取り込まない。元HTMLは保持する。

池田AIには既存1,941件に新規445件を追加し、対象は計2,386件。署名は、原記事の著者リンクと一致する明示署名をAIの推定より優先する。索引の検証では本文と構造化データを100記事ずつ読み、大きなレスポンスによるタイムアウトを避ける。
