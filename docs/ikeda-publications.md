# 池田浩明氏の他媒体記事

2026-11-20の利用者指示により、本人の全記事の転載許可取得済みとして追加する。対象媒体・出典表示・池田AIの対象URLと記事IDの正本は `lib/ikeda-sources.ts`。表示上の著者・共著者と原文の写真クレジットを保持する。

今回の追加は12媒体103記事（文春15、PHP3、婦人公論2、ITALIANITY9、ippin3、&Premium4、料理通信9、Hanako46、暮らしとおしゃれ2、びゅうたび1、ELLE8、製粉振興1）。写真985点・554,990,490バイトを保存し、欠損0件。既存2,387記事を保持し、本文・元の公開日を全件照合した。池田AIは計2,489記事・7,940段落のハッシュ・原文引用・話者・ベクトル次元を検証し、問題0件だった。

製粉振興 No.640 の「品種の個性でパン文化は生まれる」は21〜30ページだけを扱い、発行日は原本68ページの「令和8年1月20日」を正本とする。元PDF、抽出した全テキスト、図表5領域、当該寄稿だけの原版PDFを保存する。`scripts/prepare-seifun-ikeda.py`（PyMuPDF 1.26.7）で二段組みの順序を保持して抽出し、`scripts/import-seifun-ikeda.ts` で保存した後に通常の取り込みを行う。元PDFのハッシュとページ範囲は `seifun-proof.json` に記録する。

`scripts/lib/ikeda-publications.ts` は正規媒体の著者一覧・連載ページを起点とする。おすすめ記事は一覧の対象領域から除き、個別記事の署名を再照合する。漢字・ローマ字の本人の署名、または媒体の本人連載の明示と本人プロフィールを根拠とする。本文のページ送りを結合し、本文・写真説明・公開日を検証、広告・共有ボタン・スクリプトを除去する。ITALIANITYでは移転時のメタデータより本文中の「初出」を優先する。日時がない媒体の時刻は日本時間0時とし、日付を取り込み日に置き換えない。

```sh
node --import=tsx scripts/crawl-ikeda-publications.ts
node --import=tsx scripts/crawl-ikeda-publications.ts --offline
node --env-file=.env.production.local --import=tsx scripts/mirror-ikeda-publications-images.ts
node --import=tsx scripts/import-ikeda-publications.ts
node --env-file=.env.production.local --import=tsx scripts/import-ikeda-publications.ts --write
node --env-file=.env.production.local --import=tsx scripts/index-ikeda.ts
npx vitest run
```

キャッシュは `.cache/other-sources/`。元ページをURLのSHA-256で保存し、記事ごとに署名根拠・全ページURL・原文・原文ハッシュ・原日付を残す。`manifest.json` は著者一覧の収集件数と除外理由、`assets.json` は写真の保存先とバイトハッシュ、`import-report.json` はDB登録後の全件照合結果。本文と写真の同時再実行は避け、最終の再解析後に写真保存と取り込みを実行する。

取り込みは固定slugと出典URLの衝突を事前検査し、他の既存記事をチェックサムで保護する。再実行は同じ記事を増やさない。池田AIは新しい記事だけを索引化する。共著記事の主張は単独執筆として帰属させず、取材相手の引用も本人の主張として表示しない。

幻冬舎plus「パンラボ研究員のNY出張報告」は正規ページが会員限定のため、冒頭だけを全文として取り込まない。Zeroの正規取得手段の検索でも対応するサービスは見つからなかった。本人以外が執筆した紹介・取材記事（Precious、CREA、ヒトサラ等）と、著者の異なる食べログ記事は対象に混ぜない。
