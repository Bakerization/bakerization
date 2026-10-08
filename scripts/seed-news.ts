/**
 * One-off: insert the first news item (Aoyama Pan Matsuri 2026).
 *   npm run seed:news            (reads .env)
 * Insert-if-absent: re-running never overwrites edits made in /admen/news.
 * Run `npm run ensure:tables` first on a new environment.
 */
import { neon } from "@neondatabase/serverless";

const SLUG = "aoyama-pan-matsuri-2026";
const PUBLISHED_AT = "2026-10-08T00:00:00+09:00";

const title = "青山パン祭り2026でイベントを開催します！";
const titleEn = "Join our events at Aoyama Pan Matsuri 2026!";

const summary =
  "Bakerizationはこの度、青山パン祭り2026の復活に貢献しました。会期中は池田浩明主催の3つのイベントを開催します。ぜひご参加ください！";
const summaryEn =
  "Bakerization helped bring back the Aoyama Pan Matsuri bread festival in 2026. Join the three events hosted by Hiroaki Ikeda during the festival!";

const bodyMd = `約10年ぶりの開催となる「青山パン祭り - CRAFT BAKERIES 2026 -」には、北海道から沖縄まで全国約60店のパン屋が日替わりで集まります。

会期中は、パンラボ主宰・池田浩明主催の3つのイベントを開催します。ぜひご参加ください！

## 池田浩明主催の3つのイベント

### 10月10日（土）自分で作ろう！パンTシャツ・パントートワークショップ by GOCHISOU

パンをモチーフにしたTシャツやトートバッグを、自分の手で作れるワークショップです。

### 10月11日（日）酵母ラボ

- 第1部｜青山を歩き、酵母を探そう！
- 第2部｜サワードゥなんでも鑑定団

### 10月12日（月・祝）トークセッション「ぼくがかんがえたさいきょーのぱんやさん」

〜夢のパン屋さんを作ろう〜　パネラーが思い描いた夢のパン屋さんを発表し、みんなで「さいきょーのぱんやさん」へブラッシュアップします。

**各イベントは事前申込制です。** 時間・参加費などの詳細とお申し込みは[申込ページ](https://fm-supporter-club.stores.jp/)をご覧ください。

## 開催概要

- **名称**：青山パン祭り - CRAFT BAKERIES 2026 -
- **日程**：2026年10月10日（土）・11日（日）・12日（月・祝）
- **時間**：11:00〜17:00（売り切れ次第終了）
- **会場**：国際連合大学 中庭＆ピロティ（東京都渋谷区神宮前5-53-70）
- **入場料**：無料（雨天決行）

最新情報は[青山パン祭り公式サイト](https://aoyama-panmatsuri.com/)をご確認ください。会場でお会いできるのを楽しみにしています！
`;

const bodyMdEn = `Returning after about ten years, "Aoyama Pan Matsuri - CRAFT BAKERIES 2026 -" gathers around 60 bakeries from all over Japan, from Hokkaido to Okinawa, with a different line-up each day.

During the festival, Hiroaki Ikeda of Panlabo hosts three events. We hope you can join us!

## Three events hosted by Hiroaki Ikeda

### Sat, Oct 10 — Make your own bread T-shirt & tote bag, by GOCHISOU

A hands-on workshop where you make your own bread-themed T-shirt or tote bag.

### Sun, Oct 11 — Yeast Lab

- Part 1: Walk around Aoyama and hunt for wild yeast!
- Part 2: The sourdough appraisal show

### Mon, Oct 12 (holiday) — Talk session: "The Ultimate Bakery I Dreamed Up"

Panelists present the bakery of their dreams, and together we refine it into the ultimate bakery.

**Advance registration is required for each event.** See the [registration page](https://fm-supporter-club.stores.jp/) for times, fees and sign-up (in Japanese).

## Festival overview

- **Name:** Aoyama Pan Matsuri - CRAFT BAKERIES 2026 -
- **Dates:** October 10 (Sat), 11 (Sun) and 12 (Mon, holiday), 2026
- **Hours:** 11:00–17:00 (until sold out)
- **Venue:** United Nations University courtyard & piloti, 5-53-70 Jingumae, Shibuya, Tokyo
- **Admission:** Free (held rain or shine)

For the latest updates, visit the [official Aoyama Pan Matsuri website](https://aoyama-panmatsuri.com/) (in Japanese). We look forward to seeing you there!
`;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  const sql = neon(url);
  const rows = (await sql`
    INSERT INTO news_posts (
      slug, title, title_en, summary, summary_en, body_md, body_md_en, cover_image_url,
      published, published_at, created_at, updated_at
    )
    VALUES (
      ${SLUG}, ${title}, ${titleEn}, ${summary}, ${summaryEn}, ${bodyMd}, ${bodyMdEn}, '',
      TRUE, ${PUBLISHED_AT}, NOW(), NOW()
    )
    ON CONFLICT (slug) DO NOTHING
    RETURNING slug
  `) as { slug: string }[];
  console.log(rows.length ? `inserted /news/${SLUG}` : `/news/${SLUG} already exists (left unchanged)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
