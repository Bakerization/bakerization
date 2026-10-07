import Link from "next/link";
import Image from "next/image";
import { Quicksand } from "next/font/google";
import { CSSProperties, ReactNode } from "react";
import { C, FONTS } from "@/lib/theme";
import type { Locale } from "@/lib/locale";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Only the hero <h1> uses Quicksand, so it is loaded here (home route only)
// instead of in the root layout where every page would preload it.
const fontRound = Quicksand({ subsets: ["latin"], weight: "600", display: "swap" });

type BlogTeaser = {
  slug: string;
  date: string;
  tag: string;
  ja: string;
  en: string;
};

type Props = { posts?: BlogTeaser[]; locale?: Locale };

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
          "AIや機械学習を用いたパン専用工学デバイスの開発、パン屋さんに特化したSaaSの開発をし、パンにまつわる数値を徹底的に可視化します。",
        bodyEn:
          "We develop bread-specific engineering devices using AI and machine learning, and bakery-focused SaaS, to thoroughly visualize the numbers behind bread.",
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
          "ミキシングのデータと環境データを計測し、仕込みの条件とあわせて記録",
          <>
            機械学習・AIを駆使したミキサーの自動制御によって、その日に合わせた
            <strong>最適なミキシング</strong>を自動で再現
          </>,
          "パン職人の負担を軽減",
        ],
        pointsEn: [
          "Measures mixing data and environmental data, and records them alongside the day's conditions",
          <>
            Reproduces <strong>the optimal mix</strong> for that day automatically,
            through mixer control driven by machine learning and AI
          </>,
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
   Stage — fluid container capped at 1280px (no more zoom scaling)
   ───────────────────────────────────────────────────────────── */
function Stage({ children }: { children: ReactNode }) {
  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto" }}>
      {children}
    </div>
  );
}

function Rule({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{ width: "100%", height: 1, background: C.line, ...style }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   Nav
   ───────────────────────────────────────────────────────────── */
function Nav({ locale }: { locale: Locale }) {
  const items: { label: string; href: string; drop?: string }[] = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Message", href: "/message" },
    { label: "Services", href: "#services" },
    { label: "Product", href: "/app", drop: "kiji hub" },
    { label: "Journal", href: "/blog" },
    { label: "Research", href: "/research" },
    { label: "Contact", href: "#contact" },
  ];
  return (
    <div
      className="mob-flex-wrap mob-pad"
      style={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 56px",
        background: "transparent",
        gap: 12,
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: FONTS.display,
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: 0.3,
          color: C.ink,
          textDecoration: "none",
        }}
      >
        {COPY.brand}
      </Link>
      <ul
        className="mob-flex-wrap"
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 22,
          fontFamily: FONTS.mono,
          fontSize: 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.sub,
        }}
      >
        {items.map((x) => (
          <li key={x.label} className={x.drop ? "nav-drop" : undefined}>
            <Link
              href={x.href}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {x.label}
            </Link>
            {x.drop && (
              <div className="nav-drop-menu">
                <Link
                  href={x.href}
                  style={{
                    display: "block",
                    padding: "10px 16px",
                    background: C.card,
                    border: `1px solid ${C.line}`,
                    color: C.ink,
                    textDecoration: "none",
                    textTransform: "none",
                    letterSpacing: "0.08em",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  {x.drop}
                </Link>
              </div>
            )}
          </li>
        ))}
        <li style={{ display: "flex", alignItems: "center" }}>
          <LanguageSwitcher locale={locale} />
        </li>
      </ul>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CTAs
   ───────────────────────────────────────────────────────────── */
function CtaPrimary({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        background: C.accent,
        color: C.paper,
        border: "none",
        padding: "16px 24px",
        fontFamily: FONTS.body,
        fontSize: 14,
        letterSpacing: 0.4,
        fontWeight: 600,
        cursor: "pointer",
        borderRadius: 4,
        textDecoration: "none",
        display: "inline-block",
      }}
    >
      {children} →
    </Link>
  );
}

function CtaGhost({
  href,
  children,
  onPhoto = false,
}: {
  href: string;
  children: ReactNode;
  onPhoto?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        background: "transparent",
        color: onPhoto ? "#fbf3df" : C.ink,
        border: `1px solid ${
          onPhoto ? "rgba(255,250,238,.65)" : C.line
        }`,
        padding: "16px 24px",
        fontFamily: FONTS.body,
        fontSize: 14,
        letterSpacing: 0.4,
        fontWeight: 700,
        cursor: "pointer",
        borderRadius: 4,
        textDecoration: "none",
        display: "inline-block",
      }}
    >
      {children}
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────
   Hero — poster-split
   ───────────────────────────────────────────────────────────── */
function Hero({ locale }: { locale: Locale }) {
  const en = locale === "en";
  return (
    <section
      className="mob-h-auto"
      style={{
        position: "relative",
        height: 880,
        overflow: "hidden",
        background: C.bg,
      }}
    >
      <div
        className="mob-1col"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          height: "100%",
        }}
      >
        <div
          className="mob-hero-pad"
          style={{
            background: C.bg,
            color: C.ink,
            padding: "96px 60px 48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 36,
            position: "relative",
          }}
        >
          <div>
            <h1
              className={`mob-h1-hero ${fontRound.className}`}
              style={{
                fontSize: 116,
                lineHeight: 0.92,
                letterSpacing: -1,
                fontWeight: 600,
                margin: 0,
                color: C.ink,
                textTransform: "uppercase",
              }}
            >
              We<br />Bake<br />the<br />
              <span style={{ color: C.accent }}>Future.</span>
            </h1>
            <div
              style={{
                marginTop: 32,
                width: 80,
                height: 2,
                background: C.accent,
              }}
            />
            <p
              style={{
                marginTop: 26,
                fontSize: 17,
                lineHeight: 1.95,
                color: C.sub,
                maxWidth: 460,
              }}
            >
              {en ? COPY.heroSubEn : COPY.heroSubJa}
            </p>
            <div style={{ marginTop: 36, display: "flex", gap: 12 }}>
              <CtaPrimary href="/about">
                {en ? COPY.ctaPrimaryEn : COPY.ctaPrimaryJa}
              </CtaPrimary>
              <CtaGhost href="#services">
                {en ? COPY.ctaSecondaryEn : COPY.ctaSecondaryJa}
              </CtaGhost>
            </div>
          </div>

        </div>

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: 320,
          }}
        >
          <Image
            src="/top.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 880px) 100vw, 50vw"
            style={{
              objectFit: "cover",
              filter: "saturate(1.08) contrast(1.12) brightness(.78)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,.22)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 32,
              bottom: 32,
              color: C.paper,
              fontFamily: FONTS.mono,
              fontSize: 10,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              opacity: 0.92,
            }}
          >
            {en ? COPY.heroCaptionEn : COPY.heroCaptionJa}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   About — feature-spread
   ───────────────────────────────────────────────────────────── */
function About({ locale }: { locale: Locale }) {
  const c = COPY.about;
  const en = locale === "en";
  const lead = en ? c.leadEn : c.leadJa;
  const paragraphs = en ? c.paragraphsEn : c.paragraphsJa;
  return (
    <section
      id="about"
      className="mob-pad mob-pad-v-sm"
      style={{
        padding: "120px 60px 120px",
        background: C.bg,
        color: C.ink,
      }}
    >
      <div
        className="mob-flex-wrap"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${C.line}`,
          borderBottom: `1px solid ${C.line}`,
          padding: "16px 0",
          marginBottom: 64,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 11,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: C.accent,
          }}
        >
          ▍FEATURE.001 — {en ? c.labelEn : c.labelJa}
        </span>
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 11,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: C.sub,
          }}
        >
          What is Bakerization? / p. 02
        </span>
      </div>

      <div
        className="mob-1col"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 12,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: C.sub,
              marginBottom: 18,
            }}
          >
            ↗ A QUESTION
          </div>
          <h2
            className="mob-h2"
            style={{
              margin: 0,
              fontFamily: FONTS.display,
              fontSize: en ? 64 : 96,
              lineHeight: 1.08,
              letterSpacing: en ? -2 : -3,
              fontWeight: 700,
              color: C.ink,
            }}
          >
            {en ? (
              <>
                What kind of
                <br />
                bakeries will exist
                <br />
                in the{" "}
                <span style={{ color: C.accent }}>22nd&nbsp;century?</span>
              </>
            ) : (
              <>
                22世紀には、
                <br />
                どんなパン屋さんが
                <br />
                <span style={{ color: C.accent }}>あるでしょうか？</span>
              </>
            )}
          </h2>
          <Rule
            style={{
              background: C.accent,
              height: 3,
              width: 100,
              margin: "40px 0",
            }}
          />
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.95,
              color: C.sub,
              margin: 0,
              maxWidth: 520,
            }}
          >
            {lead}
          </p>
        </div>
        <div>
          <p style={pStyle()}>{paragraphs[0]}</p>
          <p style={pStyle(true)}>{paragraphs[1]}</p>
          <p style={pStyle(true)}>{paragraphs[2]}</p>
        </div>
      </div>

      <div
        className="mob-1col"
        style={{
          marginTop: 80,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
        }}
      >
        <div>
          <p style={pStyle()}>{paragraphs[3]}</p>
          <p style={pStyle(true)}>
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
          <p style={pStyle(true)}>
            {en ? (
              <>
                <span className="mk">Bakerization</span> will carry Japan's bread
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
    </section>
  );
}

function pStyle(spaced = false): CSSProperties {
  return {
    fontSize: 16,
    lineHeight: 2,
    color: C.ink,
    margin: spaced ? "24px 0 0" : 0,
  };
}

/* ─────────────────────────────────────────────────────────────
   Services — color-block-cards
   ───────────────────────────────────────────────────────────── */
function Services({ locale }: { locale: Locale }) {
  const c = COPY.services;
  const en = locale === "en";
  return (
    <section
      id="services"
      className="mob-pad mob-pad-v-sm"
      style={{ padding: "120px 64px", background: C.bg }}
    >
      <div
        className="mob-stack"
        style={{
          display: "flex",
          alignItems: "end",
          justifyContent: "space-between",
          marginBottom: 56,
          gap: 24,
        }}
      >
        <div>
          <div
            style={{
              background: C.slab,
              color: C.onSlab,
              padding: "10px 14px",
              display: "inline-block",
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            ▍{en ? c.labelEn : c.labelJa}
          </div>
          <h2
            className="mob-h2"
            style={{
              fontFamily: FONTS.display,
              fontSize: 72,
              lineHeight: 1.08,
              letterSpacing: -2,
              fontWeight: 700,
              color: C.ink,
              margin: 0,
            }}
          >
            Service.
          </h2>
        </div>
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 12,
            color: C.sub,
            letterSpacing: "0.2em",
          }}
        >
          3 SERVICES → 01 / 02 / 03
        </span>
      </div>

      <div
        className="mob-1col"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 18,
        }}
      >
        {c.items.map((it, i) => {
          const onAccent = i === 1;
          return (
            <Link
              key={it.num}
              href={`/services/${it.slug}`}
              className="mob-pad-card-lg"
              style={{
                background: onAccent ? C.accent : C.card,
                color: onAccent ? C.paper : C.ink,
                padding: 36,
                minHeight: 320,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                border: onAccent ? "none" : `1.5px solid ${C.ink}`,
                textDecoration: "none",
              }}
            >
              <div>
                <div
                  className="mob-num"
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 88,
                    fontWeight: 700,
                    lineHeight: 0.9,
                    marginBottom: 24,
                    opacity: 0.95,
                  }}
                >
                  {it.num}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    marginBottom: 16,
                  }}
                >
                  {en ? it.en : it.ja}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.85,
                    margin: 0,
                    opacity: onAccent ? 0.92 : 0.78,
                  }}
                >
                  {en ? it.bodyEn : it.bodyJa}
                </p>
                {(en ? it.noteEn : it.noteJa) && (
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.85,
                      margin: "14px 0 0",
                      fontWeight: 700,
                    }}
                  >
                    {en ? it.noteEn : it.noteJa}
                  </p>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 32,
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                }}
              >
                <span>{en ? it.ja : it.en}</span>
                <span>↗</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Product — Service. と同じ組み。見出しは外に出し、
   プロダクトが増えたら COPY.product.items に足すだけでよい。
   ───────────────────────────────────────────────────────────── */
function Product({ locale }: { locale: Locale }) {
  const c = COPY.product;
  const en = locale === "en";
  const cols = Math.min(c.items.length, 3);
  return (
    <section
      id="product"
      className="mob-pad"
      style={{ padding: "0 64px 120px", background: C.bg }}
    >
      <div
        className="mob-stack"
        style={{
          display: "flex",
          alignItems: "end",
          justifyContent: "space-between",
          marginBottom: 56,
          gap: 24,
        }}
      >
        <div>
          <div
            style={{
              background: C.slab,
              color: C.onSlab,
              padding: "10px 14px",
              display: "inline-block",
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            ▍{en ? c.labelEn : c.labelJa}
          </div>
          <h2
            className="mob-h2"
            style={{
              fontFamily: FONTS.display,
              fontSize: 72,
              lineHeight: 1.08,
              letterSpacing: -2,
              fontWeight: 700,
              color: C.ink,
              margin: 0,
            }}
          >
            {c.titleEn}
          </h2>
        </div>
        {/* プロダクトが1つのうちは出さない。増えたら Service. と同じカウンターが出る */}
        {c.items.length > 1 && (
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 12,
              color: C.sub,
              letterSpacing: "0.2em",
            }}
          >
            {c.items.length} PRODUCTS →{" "}
            {c.items.map((it) => it.num).join(" / ")}
          </span>
        )}
      </div>

      <div
        className="mob-1col"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 18,
          alignItems: "start",
        }}
      >
        {c.items.map((it) => (
          <div
            key={it.num}
            className="mob-pad-card-lg"
            style={{
              background: C.card,
              border: `1.5px solid ${C.ink}`,
              padding: 40,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 280,
            }}
          >
            <div>
              {c.items.length > 1 && (
                <div
                  className="mob-num"
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 88,
                    fontWeight: 700,
                    lineHeight: 0.9,
                    color: C.accent,
                    marginBottom: 24,
                  }}
                >
                  {it.num}
                </div>
              )}
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 40,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  letterSpacing: -1,
                  color: C.ink,
                }}
              >
                {it.name}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  margin: "20px 0 0",
                  padding: 0,
                }}
              >
                {(en ? it.pointsEn : it.pointsJa).map((pt, i) => (
                  <li
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "22px 1fr",
                      gap: 10,
                      padding: "12px 0",
                      borderTop: i === 0 ? `1px solid ${C.line}` : "none",
                      borderBottom: `1px solid ${C.line}`,
                      fontSize: 15,
                      lineHeight: 1.8,
                      color: C.ink,
                    }}
                  >
                    <span style={{ color: C.accent, fontWeight: 700 }}>—</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="mob-flex-wrap"
              style={{
                marginTop: 32,
                display: "flex",
                alignItems: "center",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <CtaPrimary href={it.href}>{en ? it.ctaEn : it.ctaJa}</CtaPrimary>
              <Link
                href={it.privacy}
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: C.accent,
                  textDecoration: "none",
                }}
              >
                {en ? c.privacyLabelEn : c.privacyLabelJa}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Blog — horizontal-strip
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
        }))
      : c.posts.map((p, i) => ({
          key: String(i),
          href: "/blog",
          tag: en ? p.tagEn : p.tagJa,
          date: p.date,
          primary: en ? p.en : p.ja,
          secondary: en ? p.ja : p.en,
        }));

  return (
    <section
      className="mob-pad mob-pad-v-sm"
      style={{ padding: "120px 64px", background: C.bg }}
    >
      <div
        className="mob-stack"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          marginBottom: 48,
          gap: 24,
        }}
      >
        <div>
          <div
            style={{
              background: C.slab,
              color: C.onSlab,
              padding: "10px 14px",
              display: "inline-block",
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            ▍{en ? c.labelEn : c.labelJa}
          </div>
          <h2
            className="mob-h3"
            style={{
              fontFamily: FONTS.display,
              fontSize: 64,
              lineHeight: 1.08,
              letterSpacing: -2,
              fontWeight: 700,
              color: C.ink,
              margin: 0,
            }}
          >
            {en ? c.titleEn : c.titleJa}
          </h2>
        </div>
        <Link
          href="/blog"
          style={{
            fontFamily: FONTS.mono,
            fontSize: 12,
            color: C.accent,
            letterSpacing: "0.2em",
            textDecoration: "none",
          }}
        >
          {c.viewAll}
        </Link>
      </div>
      <div
        className="mob-1col"
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr",
          gap: 18,
        }}
      >
        {items.map((p, i) => (
          <Link
            key={p.key}
            href={p.href}
            style={{
              background: C.card,
              border: `1.5px solid ${C.ink}`,
              padding: i === 0 ? 32 : 28,
              minHeight: i === 0 ? 380 : 320,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  letterSpacing: "0.24em",
                  color: C.accent,
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                {p.tag} · {p.date}
              </div>
              <div
                style={{
                  fontSize: i === 0 ? 28 : 22,
                  fontWeight: 700,
                  color: C.ink,
                  lineHeight: 1.35,
                }}
              >
                {p.primary}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  color: C.sub,
                  lineHeight: 1.6,
                  fontStyle: "italic",
                }}
              >
                {p.secondary}
              </div>
            </div>
            <div
              style={{
                marginTop: 24,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: `1px solid ${C.line}`,
                paddingTop: 14,
                fontFamily: FONTS.mono,
                fontSize: 11,
                letterSpacing: "0.22em",
                color: C.ink,
              }}
            >
              <span>NOTE.{String(i + 1).padStart(2, "0")}</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Contact — block-button
   ───────────────────────────────────────────────────────────── */
function Contact({ locale }: { locale: Locale }) {
  const c = COPY.contact;
  const en = locale === "en";
  const title = en ? c.titleEn : c.titleJa;
  return (
    <section
      id="contact"
      className="mob-pad mob-pad-v-sm"
      style={{
        padding: "120px 64px",
        background: C.accent,
        color: C.paper,
      }}
    >
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
          <div
            style={{
              background: C.slab,
              color: C.onSlab,
              padding: "10px 14px",
              display: "inline-block",
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              marginBottom: 28,
            }}
          >
            ▍{en ? c.labelEn : c.labelJa}
          </div>
          {title && (
            <h2
              className="mob-h2"
              style={{
                fontFamily: FONTS.display,
                fontSize: 72,
                lineHeight: 1.08,
                letterSpacing: -2,
                fontWeight: 700,
                color: C.paper,
                margin: 0,
              }}
            >
              {title}
            </h2>
          )}
          <p
            style={{
              marginTop: 24,
              fontSize: 17,
              lineHeight: 1.95,
              opacity: 0.92,
              maxWidth: 540,
            }}
          >
            {en ? c.bodyEn : c.bodyJa}
          </p>
        </div>
        <div>
          <div
            style={{
              background: C.slab,
              color: C.onSlab,
              padding: 32,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                letterSpacing: "0.24em",
                opacity: 0.7,
                marginBottom: 12,
              }}
            >
              EMAIL
            </div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>
              info@bakerization.com
            </div>
            <Rule
              style={{
                background: C.onSlab,
                opacity: 0.2,
                margin: "20px 0",
                height: 1,
              }}
            />
            <Link
              href="/contact"
              style={{
                width: "100%",
                padding: "20px 24px",
                background: C.onSlab,
                color: C.slab,
                border: "none",
                fontFamily: FONTS.body,
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 0.5,
                cursor: "pointer",
                textAlign: "center",
                display: "block",
                textDecoration: "none",
              }}
            >
              {en ? c.ctaEn : c.ctaJa}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   TopPage — composed page
   ───────────────────────────────────────────────────────────── */
export default function TopPage({ posts = [], locale = "ja" }: Props) {
  return (
    <Stage>
      <div
        className="marker-on"
        style={{
          width: "100%",
          background: C.bg,
          color: C.ink,
          fontFamily: FONTS.body,
          fontSynthesis: "none",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <Nav locale={locale} />
        <Hero locale={locale} />
        <About locale={locale} />
        <Services locale={locale} />
        <Product locale={locale} />
        <Blog posts={posts} locale={locale} />
        <Contact locale={locale} />
      </div>
    </Stage>
  );
}
