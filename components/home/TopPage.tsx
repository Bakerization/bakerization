import Link from "next/link";
import Image from "next/image";
import { CSSProperties, ReactNode } from "react";
import { C, FONTS } from "@/lib/theme";
import type { Locale } from "@/lib/locale";
import BlogImage from "@/components/blog/BlogImage";
import {
  BrandBar,
  BrandButtonLink,
  ContentHeading,
  HandQuote,
  Inner,
  NAV_HEIGHT,
  NumberDot,
  PhotoSpread,
  RuleText,
  SectionCover,
  TextLink,
  labelText,
} from "@/components/brand/ui";

type BlogTeaser = {
  slug: string;
  date: string;
  tag: string;
  ja: string;
  en: string;
  /** Journal hero image, when the post has one. */
  image?: string;
};

type NewsTeaser = {
  slug: string;
  date: string;
  /** ISO timestamp for <time dateTime>. */
  iso: string;
  title: string;
};

type Props = { posts?: BlogTeaser[]; news?: NewsTeaser[]; locale?: Locale };

type ServiceItem = {
  num: string;
  slug: string;
  ja: string;
  en: string;
  bodyJa: string;
  bodyEn: string;
  noteJa?: string;
  noteEn?: string;
};

type ProductItem = {
  num: string;
  name: string;
  pointsJa: ReactNode[];
  pointsEn: ReactNode[];
  href: string;
  ctaJa: string;
  ctaEn: string;
  privacy: string;
};

const COPY = {
  brand: "Bakerization",
  issue: "ISSUE 01 — 2026",
  heroTitle: "We Bake the Future.",
  heroSubJa:
    "Bakerizationはパン屋の社会問題を解決するために生まれた団体です。",
  heroSubEn:
    "Bakerization was founded to solve the social challenges facing the bakery industry.",
  ctaPrimaryJa: "団体情報を見る",
  ctaPrimaryEn: "About Us",
  ctaSecondaryJa: "活動を見る",
  ctaSecondaryEn: "Our Work",
  heroCaptionJa: "朝の店頭 · The morning counter",
  heroCaptionEn: "The morning counter",
  about: {
    labelJa: "Bakerizationとは何か？",
    labelEn: "What is Bakerization?",
    leadJa:
      "Bakerizationは、東大パン研究会と「パンラボ」池田浩明が出会い、始まった運動です。",
    leadEn:
      "Bakerization is a movement that began when the University of Tokyo Bread Society met Hiroaki Ikeda of “Pan Labo.”",
    paragraphsJa: [
      "技術革新や国際情勢の不安定化によって、サステナブルで優しい地球を守っていくことは、どんどん難しくなっています。",
      "Global Carbon Projectのデータでは、人間が今のままの経済活動を続けていくと、2030年ごろには地球に残された二酸化炭素の排出余地が限界を迎えてしまうといいます。",
      "それだけではありません。現代の資本主義経済のなかで、様々な職人文化が、いま失われようとしています。漆器、鉄器、博物館の展示品、さらにはパティシエの文化や日本のパン技術もその一つです。",
      "日本のパンは16世紀の出島への伝来以来、あんぱんやメロンパン、様々なお食事パンまで、独自の進化を遂げてきました。近年、日本のパンはついに芸術的な領域へと達し、その技術力はアジア各地のみならず、全世界に波及しています。",
      "しかし、いま、日本のパン文化は構造的な危機に直面しています。2019年から始まる労働法の改正、気候変動、国際情勢の不安定化による原価の高騰——。Bakerizationはそのような問題に正面から立ち向かい、日本の素晴らしいパン文化を守っていきたいと考えています。",
    ],
    paragraphsEn: [
      "Technological upheaval and a more unstable world are making it ever harder to protect a sustainable, gentle planet.",
      "According to Global Carbon Project data, if we keep up our current economic activity, the carbon budget left to the planet will reach its limit around 2030.",
      "And that is not all. Within today's capitalist economy, many craft cultures are now being lost — lacquerware, ironware, museum pieces, and the cultures of pâtisserie and Japanese bread among them.",
      "Since bread first arrived at Dejima in the 16th century, Japanese bread has evolved in its own way — from anpan and melon pan to countless savory loaves. In recent years it has reached an artistic realm, and its craftsmanship now ripples out across Asia and the whole world.",
      "Yet today, Japanese bread culture faces a structural crisis: the labor-law reforms beginning in 2019, climate change, and costs soaring with global instability. Bakerization wants to meet these challenges head-on and protect Japan's wonderful bread culture.",
    ],
  },
  services: {
    labelJa: "活動内容",
    labelEn: "What We Do",
    items: [
      {
        num: "01",
        slug: "store-operations",
        ja: "店舗オペレーション支援",
        en: "Store Operations Support",
        bodyJa:
          "フローを設計し、パン屋さんのコンサルティングや店舗開発を担当します。",
        bodyEn:
          "We design operational flow and handle consulting and store development for bakeries.",
      },
      {
        num: "02",
        slug: "data-visibility",
        ja: "データの可視化",
        en: "Data Visibility & Improvement",
        bodyJa:
          "パン屋さんに特化したSaaSの開発をし、パンにまつわる数値を徹底的に可視化します。",
        bodyEn:
          "We develop bakery-focused SaaS to thoroughly visualize the numbers behind bread.",
        noteJa: "kiji hubというSaaSを開発中です。",
        noteEn: "We are building a SaaS called kiji hub.",
      },
      {
        num: "03",
        slug: "future-of-bakery-culture",
        ja: "パン文化の未来づくり",
        en: "Future of Bakery Culture",
        bodyJa:
          "地域や職人の魅力を守りながら、次世代へつながるパン屋のあり方を企画・実装します。",
        bodyEn:
          "While protecting the appeal of local communities and artisans, we plan and implement the kind of bakery that connects to the next generation.",
      },
    ] as ServiceItem[],
  },
  product: {
    labelJa: "プロダクト",
    labelEn: "Product",
    titleEn: "Product.",
    privacyLabelJa: "プライバシーポリシー →",
    privacyLabelEn: "Privacy Policy →",
    items: [
      {
        num: "01",
        name: "kiji hub",
        pointsJa: [
          "ミキシングと仕込みの条件を記録",
          "記録をあとから一覧・グラフで見返せる",
          "パン職人の負担を軽減",
        ],
        pointsEn: [
          "Records each mix alongside the day's conditions",
          "Look back on records later as lists and graphs",
          "Lightens the load on the baker",
        ],
        href: "/app",
        ctaJa: "kiji hubを見る",
        ctaEn: "See kiji hub",
        privacy: "/privacy",
      },
    ] as ProductItem[],
  },
  blog: {
    labelJa: "ジャーナル",
    labelEn: "Journal",
    viewAll: "VIEW JOURNAL →",
    titleJa: "",
    titleEn: "",
    posts: [
      {
        date: "2026.04.18",
        tagJa: "現場ノート",
        tagEn: "Field Note",
        ja: "仕込みは「読む」もの。需要予測と発酵時間のあいだ。",
        en: "Forecasting bread by reading the day.",
      },
      {
        date: "2026.03.27",
        tagJa: "事例",
        tagEn: "Case Study",
        ja: "下町の小さな店で、廃棄率を3割減らした半年の話。",
        en: "Cutting waste by 30% at a neighborhood bakery.",
      },
      {
        date: "2026.03.05",
        tagJa: "対談",
        tagEn: "Dialogue",
        ja: "町のパン屋が地域インフラになるとき。",
        en: "When the corner bakery becomes infrastructure.",
      },
    ],
  },
  club: {
    labelJa: "メーリングリスト",
    labelEn: "Mailing list",
    title: "Bakerization CLUB",
    bodyJa:
      "パンの未来に関わるすべての人のためのメーリングリストです。イベントのご案内、リサーチやプロダクトの最新情報、NEWS をお届けします。",
    bodyEn:
      "A mailing list for everyone shaping the future of bread — event invitations, research and product updates, and news.",
    ctaJa: "CLUB にエントリーする →",
    ctaEn: "Join the CLUB →",
  },
  contact: {
    labelJa: "お問い合わせ",
    labelEn: "Contact",
    titleJa: "",
    titleEn: "",
    bodyJa:
      "小さなお店から大規模な食品会社まで、食品製造の最適化技術に関する質問や、売り上げを増やしたい、パン業界を盛り上げるイベントを開きたいなど、何でもご相談ください。",
    bodyEn:
      "From small shops to large food companies — whether you have questions about food-production optimization, want to grow your sales, or hope to host an event that energizes the bakery world, we'd love to hear from you.",
    ctaJa: "お問い合わせフォームを開く →",
    ctaEn: "Open the contact form →",
  },
};

/* ─────────────────────────────────────────────────────────────
   Hero — the brand book's yellow cover, with the watercolor wheat
   field along the bottom. `darken` keeps the painting's own colors
   and lets only its pale paper take the yellow, so no rectangle
   shows. No z-index on the wrappers: a stacking context would
   isolate the blend.
   ───────────────────────────────────────────────────────────── */
function Hero({ locale }: { locale: Locale }) {
  const en = locale === "en";
  return (
    <section
      style={{
        position: "relative",
        background: C.main,
        color: C.onMain,
        paddingTop: NAV_HEIGHT,
        overflow: "hidden",
      }}
    >
      <Inner className="brand-hero-pad" style={{ paddingTop: 104 }}>
        <h1
          className="brand-hero-title"
          style={{
            margin: 0,
            fontFamily: FONTS.label,
            fontWeight: 500,
            fontSize: 120,
            lineHeight: 0.98,
            letterSpacing: "0.01em",
            textTransform: "uppercase",
            color: C.onMain,
          }}
        >
          We Bake
          <br />
          the Future.
        </h1>
        <p
          style={{
            margin: "36px 0 0",
            maxWidth: 640,
            fontSize: 17,
            lineHeight: 1.95,
          }}
        >
          {en ? COPY.heroSubEn : COPY.heroSubJa}
        </p>
        <div className="mob-flex-wrap" style={{ marginTop: 36, display: "flex", gap: 12 }}>
          <BrandButtonLink href="/about">
            {en ? COPY.ctaPrimaryEn : COPY.ctaPrimaryJa}
          </BrandButtonLink>
          <BrandButtonLink href="#services" variant="outline" arrow={false}>
            {en ? COPY.ctaSecondaryEn : COPY.ctaSecondaryJa}
          </BrandButtonLink>
        </div>
      </Inner>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px" }}>
        <Image
          src="/illustrations/wheat-field.webp"
          alt=""
          width={996}
          height={440}
          priority
          sizes="(max-width: 1040px) 100vw, 1000px"
          style={{ display: "block", width: "100%", height: "auto", mixBlendMode: "darken" }}
        />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   News — dated list under the hero (hidden when empty)
   ───────────────────────────────────────────────────────────── */
function News({ news, locale }: { news: NewsTeaser[]; locale: Locale }) {
  if (news.length === 0) return null;
  const en = locale === "en";
  return (
    <section style={{ background: C.bg }}>
      <Inner className="mob-pad-v-sm" style={{ paddingTop: 88, paddingBottom: 96 }}>
        <ContentHeading
          title="News"
          sub="お知らせ"
          aside={<TextLink href="/news">{en ? "View all news →" : "ニュース一覧 →"}</TextLink>}
        />
        <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: `1px solid ${C.ink}` }}>
          {news.map((n) => (
            <li key={n.slug} style={{ borderBottom: `1px solid ${C.line}` }}>
              <Link
                href={`/news/${n.slug}`}
                className="news-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr auto",
                  gap: 24,
                  alignItems: "baseline",
                  padding: "20px 0",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <time dateTime={n.iso} style={{ ...labelText, color: C.sub }}>
                  {n.date}
                </time>
                <span style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.6, color: C.ink }}>{n.title}</span>
                <span aria-hidden className="news-row-arrow" style={{ fontFamily: FONTS.label, fontSize: 14, color: C.ink }}>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Inner>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   About — green divider, handwritten question, ruled body copy
   ───────────────────────────────────────────────────────────── */
function About({ locale }: { locale: Locale }) {
  const c = COPY.about;
  const en = locale === "en";
  const lead = en ? c.leadEn : c.leadJa;
  const paragraphs = en ? c.paragraphsEn : c.paragraphsJa;
  return (
    <>
      <SectionCover id="about" title="About" sub={c.labelJa} no="02" />
      <section style={{ background: C.bg }}>
        <Inner className="mob-pad-v-sm" style={{ paddingTop: 104, paddingBottom: 120 }}>
          <HandQuote as="h2" size={en ? 34 : 44}>
            {en ? (
              <>
                What kind of bakeries
                <br />
                will exist in the 22nd&nbsp;century?
              </>
            ) : (
              <>
                22世紀には、
                <br />
                どんなパン屋さんが
                <br />
                あるでしょうか？
              </>
            )}
          </HandQuote>
          <BrandBar reach="58%" style={{ marginTop: 36 }} />

          <div
            className="mob-1col"
            style={{
              marginTop: 80,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 64,
              alignItems: "start",
            }}
          >
            <RuleText style={{ color: C.ink, fontSize: 18, lineHeight: 1.95 }}>{lead}</RuleText>
            <div>
              <p style={pStyle()}>{paragraphs[0]}</p>
              <p style={pStyle(true)}>{paragraphs[1]}</p>
              <p style={pStyle(true)}>{paragraphs[2]}</p>
            </div>
          </div>

          <div
            className="mob-1col"
            style={{
              marginTop: 72,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 64,
            }}
          >
            <div>
              <p style={pStyle()}>{paragraphs[3]}</p>
              <p style={pStyle(true, true)}>
                {en ? (
                  <>
                    <span className="mk">For every bread lover in the universe</span>
                    , <span className="mk">Bakerization</span> keeps weaving culture
                    today.
                  </>
                ) : (
                  <>
                    <span className="mk">宇宙の全てのパン好きのために</span>、
                    <span className="mk">Bakerization</span>
                    は今日も文化を紡ぎ続けます。
                  </>
                )}
              </p>
            </div>
            <div>
              <p style={pStyle()}>{paragraphs[4]}</p>
              <p style={pStyle(true, true)}>
                {en ? (
                  <>
                    <span className="mk">Bakerization</span> will carry Japan&apos;s bread
                    culture to the world and create the{" "}
                    <span className="mk">bakery of the 22nd century</span>.
                  </>
                ) : (
                  <>
                    <span className="mk">Bakerization</span>
                    は日本のパン文化を世界に広げ、
                    <span className="mk">22世紀のパン屋さん</span>を創造します。
                  </>
                )}
              </p>
            </div>
          </div>
        </Inner>
      </section>
    </>
  );
}

function pStyle(spaced = false, strong = false): CSSProperties {
  return {
    fontSize: 16,
    lineHeight: 2,
    color: strong ? C.ink : C.sub,
    fontWeight: strong ? 700 : 400,
    margin: spaced ? "24px 0 0" : 0,
  };
}

/* ─────────────────────────────────────────────────────────────
   Photo spread — placeholder photo until the real shoot arrives
   ───────────────────────────────────────────────────────────── */
function Morning({ locale }: { locale: Locale }) {
  const en = locale === "en";
  return (
    <PhotoSpread src="/top.webp">
      <span style={labelText}>{en ? COPY.heroCaptionEn : COPY.heroCaptionJa}</span>
    </PhotoSpread>
  );
}

/* ─────────────────────────────────────────────────────────────
   Services — numbered circles after the deck's Experience diagram
   ───────────────────────────────────────────────────────────── */
function Services({ locale }: { locale: Locale }) {
  const c = COPY.services;
  const en = locale === "en";
  return (
    <>
      <SectionCover id="services" title="Service" sub={c.labelJa} no="03" />
      <section style={{ background: C.bg }}>
        <Inner className="mob-pad-v-sm" style={{ paddingTop: 96, paddingBottom: 120 }}>
          <div
            className="mob-1col"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 48,
            }}
          >
            {c.items.map((it, i) => (
              <Link
                key={it.num}
                href={`/services/${it.slug}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderTop: `1px solid ${C.ink}`,
                  paddingTop: 36,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <NumberDot n={it.num} tone={i === 1 ? "green" : "yellow"} />
                <div
                  style={{
                    marginTop: 28,
                    fontSize: 22,
                    fontWeight: 700,
                    lineHeight: 1.45,
                    color: C.ink,
                  }}
                >
                  {en ? it.en : it.ja}
                </div>
                <p style={{ margin: "14px 0 0", fontSize: 15, lineHeight: 1.9, color: C.sub }}>
                  {en ? it.bodyEn : it.bodyJa}
                </p>
                {(en ? it.noteEn : it.noteJa) && (
                  <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.9, fontWeight: 700, color: C.ink }}>
                    {en ? it.noteEn : it.noteJa}
                  </p>
                )}
                <div
                  style={{
                    ...labelText,
                    marginTop: "auto",
                    paddingTop: 28,
                    display: "flex",
                    justifyContent: "space-between",
                    color: C.ink,
                  }}
                >
                  <span>{en ? it.ja : it.en}</span>
                  <span aria-hidden>↗</span>
                </div>
              </Link>
            ))}
          </div>
        </Inner>
      </section>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Product — プロダクトが増えたら COPY.product.items に足すだけでよい。
   ───────────────────────────────────────────────────────────── */
function Product({ locale }: { locale: Locale }) {
  const c = COPY.product;
  const en = locale === "en";
  return (
    <section id="product" style={{ background: C.bg }}>
      <Inner style={{ paddingBottom: 120 }}>
        <ContentHeading title="Product" sub={c.labelJa} />
        <div style={{ display: "grid", gap: 18 }}>
          {c.items.map((it) => (
            <div
              key={it.num}
              className="mob-1col mob-pad-card"
              style={{
                background: C.paper,
                padding: 48,
                display: "grid",
                gridTemplateColumns: "1fr 1.2fr",
                gap: 48,
                alignItems: "start",
              }}
            >
              <div>
                {c.items.length > 1 && <NumberDot n={it.num} size={64} />}
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 300,
                    fontSize: 56,
                    lineHeight: 1.05,
                    letterSpacing: "-0.035em",
                    color: C.ink,
                  }}
                >
                  {it.name}
                </div>
              </div>
              <div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {(en ? it.pointsEn : it.pointsJa).map((pt, i) => (
                    <li
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "22px 1fr",
                        gap: 10,
                        padding: "12px 0",
                        borderTop: i === 0 ? `1px solid ${C.lineStrong}` : "none",
                        borderBottom: `1px solid ${C.lineStrong}`,
                        fontSize: 15,
                        lineHeight: 1.8,
                        color: C.ink,
                      }}
                    >
                      <span aria-hidden>—</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
                <div
                  className="mob-flex-wrap"
                  style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}
                >
                  <BrandButtonLink href={it.href}>{en ? it.ctaEn : it.ctaJa}</BrandButtonLink>
                  <TextLink href={it.privacy}>{en ? c.privacyLabelEn : c.privacyLabelJa}</TextLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Inner>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Journal — three latest posts with their hero images
   ───────────────────────────────────────────────────────────── */
function Blog({ posts, locale }: { posts: BlogTeaser[]; locale: Locale }) {
  const c = COPY.blog;
  const en = locale === "en";

  // Real posts arrive already localized (title in `ja`, excerpt in `en`).
  // The built-in fallback keeps a JA/EN pairing, so swap by locale.
  const items =
    posts.length > 0
      ? posts.map((p) => ({
          key: p.slug || p.date,
          href: p.slug ? `/blog/${p.slug}` : "/blog",
          tag: p.tag,
          date: p.date,
          primary: p.ja,
          secondary: p.en,
          image: p.image,
        }))
      : c.posts.map((p, i) => ({
          key: String(i),
          href: "/blog",
          tag: en ? p.tagEn : p.tagJa,
          date: p.date,
          primary: en ? p.en : p.ja,
          secondary: en ? p.ja : p.en,
          image: undefined,
        }));

  return (
    <section style={{ background: C.bg }}>
      <Inner style={{ paddingBottom: 120 }}>
        <ContentHeading title="Journal" sub={c.labelJa} aside={<TextLink href="/blog">{c.viewAll}</TextLink>} />
        <div
          className="mob-1col"
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr",
            gap: 28,
            alignItems: "start",
          }}
        >
          {items.map((p, i) => (
            <Link
              key={p.key}
              href={p.href}
              style={{ display: "flex", flexDirection: "column", textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  position: "relative",
                  aspectRatio: "4 / 3",
                  background: C.paper,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {p.image ? (
                  <BlogImage
                    src={p.image}
                    alt=""
                    sizes="(max-width: 880px) 100vw, 40vw"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <NumberDot n={String(i + 1).padStart(2, "0")} tone={i === 1 ? "green" : "yellow"} size={64} />
                )}
              </div>
              <div style={{ ...labelText, marginTop: 20, color: C.sub }}>
                {p.tag} · {p.date}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: i === 0 ? 24 : 19,
                  fontWeight: 700,
                  lineHeight: 1.45,
                  color: C.ink,
                }}
              >
                {p.primary}
              </div>
              {p.secondary ? (
                <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.75, color: C.sub }}>{p.secondary}</div>
              ) : null}
            </Link>
          ))}
        </div>
      </Inner>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Club — mailing-list band, links to /club (Google Form)
   ───────────────────────────────────────────────────────────── */
function Club({ locale }: { locale: Locale }) {
  const c = COPY.club;
  const en = locale === "en";
  return (
    <section id="club" style={{ background: C.main, color: C.onMain }}>
      <Inner className="mob-pad-v-sm" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <div
          className="mob-1col"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 60,
            alignItems: "center",
          }}
        >
          <div>
            <p lang="ja" style={{ margin: 0, display: "flex", gap: 18, fontSize: 14, letterSpacing: "0.04em" }}>
              <span aria-hidden>-</span>
              <span>{c.labelJa}</span>
            </p>
            <h2
              className="mob-h3"
              style={{
                margin: "16px 0 0",
                fontFamily: FONTS.display,
                fontWeight: 300,
                fontSize: 64,
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                color: C.onMain,
              }}
            >
              {c.title}
            </h2>
            <p style={{ margin: "24px 0 0", fontSize: 17, lineHeight: 1.95, maxWidth: 540 }}>
              {en ? c.bodyEn : c.bodyJa}
            </p>
          </div>
          <BrandButtonLink href="/club" arrow={false} style={{ width: "100%", padding: "22px 28px", fontSize: 15 }}>
            {en ? c.ctaEn : c.ctaJa}
          </BrandButtonLink>
        </div>
      </Inner>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Contact — green band above the yellow footer
   ───────────────────────────────────────────────────────────── */
function Contact({ locale }: { locale: Locale }) {
  const c = COPY.contact;
  const en = locale === "en";
  return (
    <section id="contact" style={{ background: C.slab, color: C.onSlabSoft }}>
      <Inner className="mob-pad-v-sm" style={{ paddingTop: 112, paddingBottom: 112 }}>
        <div
          className="mob-1col"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 60,
            alignItems: "center",
          }}
        >
          <div>
            <h2
              className="mob-h3"
              style={{
                margin: 0,
                fontFamily: FONTS.display,
                fontWeight: 300,
                fontSize: 64,
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                color: C.onSlab,
              }}
            >
              Contact
            </h2>
            <p lang="ja" style={{ margin: "18px 0 0", display: "flex", gap: 18, fontSize: 14, color: C.onSlab }}>
              <span aria-hidden>-</span>
              <span>{c.labelJa}</span>
            </p>
            <p style={{ margin: "28px 0 0", fontSize: 17, lineHeight: 1.95, maxWidth: 540 }}>
              {en ? c.bodyEn : c.bodyJa}
            </p>
          </div>
          <div>
            <div style={{ ...labelText, color: C.onSlab }}>Email</div>
            <div style={{ marginTop: 10, fontSize: 26, fontWeight: 500, letterSpacing: "0.01em" }}>
              info@bakerization.com
            </div>
            <div
              aria-hidden
              style={{ height: 1, margin: "28px 0", background: "color-mix(in srgb, var(--on-slab) 35%, transparent)" }}
            />
            <BrandButtonLink
              href="/contact"
              variant="yellow"
              arrow={false}
              style={{ width: "100%", padding: "20px 24px", fontSize: 15 }}
            >
              {en ? c.ctaEn : c.ctaJa}
            </BrandButtonLink>
          </div>
        </div>
      </Inner>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   TopPage — composed page
   ───────────────────────────────────────────────────────────── */
export default function TopPage({ posts = [], news = [], locale = "ja" }: Props) {
  return (
    <div
      style={{
        width: "100%",
        background: C.bg,
        color: C.ink,
        fontFamily: FONTS.body,
        fontSynthesis: "none",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <Hero locale={locale} />
      <News news={news} locale={locale} />
      <About locale={locale} />
      <Morning locale={locale} />
      <Services locale={locale} />
      <Product locale={locale} />
      <Blog posts={posts} locale={locale} />
      <Club locale={locale} />
      <Contact locale={locale} />
    </div>
  );
}
