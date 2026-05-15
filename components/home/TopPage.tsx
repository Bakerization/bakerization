"use client";

import Link from "next/link";
import { CSSProperties, ReactNode } from "react";
import { C, FONTS } from "@/lib/theme";
import ThemeToggle from "@/components/ThemeToggle";

type BlogTeaser = {
  slug: string;
  date: string;
  tag: string;
  ja: string;
  en: string;
};

type Props = { posts?: BlogTeaser[] };

const COPY = {
  brand: "Bakerization",
  issue: "ISSUE 01 — 2026",
  heroTitle: "We Bake the Future.",
  heroSubJa:
    "Bakerizationはパン屋の社会問題を解決するために生まれた団体です。",
  ctaPrimary: "団体情報を見る",
  ctaSecondary: "活動を見る",
  about: {
    labelJa: "Bakerizationとは何か？",
    labelEn: "What is Bakerization?",
    lead:
      "Bakerizationは、東大パン研究会と「パンラボ」池田浩明が出会い、始まった運動です。",
    paragraphs: [
      "技術革新や国際情勢の不安定化によって、サステナブルで優しい地球を守っていくことは、どんどん難しくなっています。",
      "Global Carbon Projectのデータでは、人間が今のままの経済活動を続けていくと、2030年ごろには地球に残された二酸化炭素の排出余地が限界を迎えてしまうといいます。",
      "それだけではありません。現代の資本主義経済のなかで、様々な職人文化が、いま失われようとしています。漆器、鉄器、博物館の展示品、さらにはパティシエの文化や日本のパン技術もその一つです。",
      "日本のパンは16世紀の出島への伝来以来、あんぱんやメロンパン、様々なお食事パンまで、独自の進化を遂げてきました。近年、日本のパンはついに芸術的な領域へと達し、その技術力はアジア各地のみならず、全世界に波及しています。",
      "しかし、いま、日本のパン文化は構造的な危機に直面しています。2019年から始まる労働法の改正、気候変動、国際情勢の不安定化による原価の高騰——。Bakerizationはそのような問題に正面から立ち向かい、日本の素晴らしいパン文化を守っていきたいと考えています。",
    ],
  },
  services: {
    labelJa: "活動内容",
    titleJa: "パン屋のための、やさしい実装。",
    items: [
      {
        num: "01",
        ja: "店舗オペレーション支援",
        en: "Store Operations Support",
        body:
          "フローを設計し、パン屋さんのコンサルティングや店舗開発を担当します。",
      },
      {
        num: "02",
        ja: "データの可視化",
        en: "Data Visibility & Improvement",
        body:
          "AIや機械学習を用いたパン専用工学デバイスの開発、パン屋さんに特化したSaaSの開発をし、パンにまつわる数値を徹底的に可視化します。",
      },
      {
        num: "03",
        ja: "パン文化の未来づくり",
        en: "Future of Bakery Culture",
        body:
          "地域や職人の魅力を守りながら、次世代へつながるパン屋のあり方を企画・実装します。",
      },
    ],
  },
  blog: {
    labelJa: "ジャーナル",
    titleJa: "現場から、最新の記録。",
    posts: [
      {
        date: "2026.04.18",
        tag: "現場ノート",
        ja: "仕込みは「読む」もの。需要予測と発酵時間のあいだ。",
        en: "Forecasting bread by reading the day.",
      },
      {
        date: "2026.03.27",
        tag: "事例",
        ja: "下町の小さな店で、廃棄率を3割減らした半年の話。",
        en: "Cutting waste by 30% at a neighborhood bakery.",
      },
      {
        date: "2026.03.05",
        tag: "対談",
        ja: "町のパン屋が地域インフラになるとき。",
        en: "When the corner bakery becomes infrastructure.",
      },
    ] as BlogTeaser[],
  },
  ikeda: {
    labelJa: "代表メッセージ",
    name: "池田 弘明",
    nameEn: "Hiroaki Ikeda",
    role: "共同代表 COO / Co-founder & COO",
    quoteJa:
      "小麦の香りがする朝を、22世紀にも楽しめるように。「焼く」という営みは、街の朝を支えてきました。私たちは、その手仕事の重さを軽くするのではなく、続けられる形に整えたい。データも仕組みも、結局は人のためにあります。",
  },
  contact: {
    labelJa: "お問い合わせ",
    titleJa: "パン屋の未来を、創造しよう",
    body:
      "小さなお店から地域に根ざしたベーカリーまで、現場に合わせた形で課題解決をご提案します。まずはお気軽にご相談ください。",
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
function Nav() {
  const items = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "#services" },
    { label: "Journal", href: "/blog" },
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
          <li key={x.label}>
            <Link
              href={x.href}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {x.label}
            </Link>
          </li>
        ))}
        <li style={{ color: C.accent }}>JA / EN</li>
        <li style={{ display: "inline-flex", alignItems: "center" }}>
          <ThemeToggle />
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
        fontWeight: 500,
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
function Hero() {
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: C.sub,
            }}
          >
            <span style={{ color: C.accent }}>■ BAKERIZATION</span>
            <span>FEATURE.001</span>
          </div>

          <div>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 12,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: C.sub,
                marginBottom: 26,
              }}
            >
              — A MANIFESTO FOR JAPANESE BREAD
            </div>
            <h1
              className="mob-h1"
              style={{
                fontFamily: FONTS.display,
                fontSize: 168,
                lineHeight: 0.84,
                letterSpacing: -6,
                fontWeight: 700,
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
              {COPY.heroSubJa}
            </p>
            <div style={{ marginTop: 36, display: "flex", gap: 12 }}>
              <CtaPrimary href="/about">{COPY.ctaPrimary}</CtaPrimary>
              <CtaGhost href="#services">{COPY.ctaSecondary}</CtaGhost>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: C.sub,
            }}
          >
            <span>↓ KEEP READING</span>
            <span>EST. 2025</span>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: 320,
          }}
        >
          <img
            src="/top.jpeg"
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
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
            朝の店頭 · The morning counter
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   About — feature-spread
   ───────────────────────────────────────────────────────────── */
function About() {
  const c = COPY.about;
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
          ▍FEATURE.001 — {c.labelJa}
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
              fontSize: 96,
              lineHeight: 1.08,
              letterSpacing: -3,
              fontWeight: 700,
              color: C.ink,
            }}
          >
            22世紀には、
            <br />
            どんなパン屋さんが
            <br />
            <span style={{ color: C.accent }}>あるでしょうか？</span>
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
            {c.lead}
          </p>
        </div>
        <div>
          <p style={pStyle()}>{c.paragraphs[0]}</p>
          <p style={pStyle(true)}>{c.paragraphs[1]}</p>
          <p style={pStyle(true)}>{c.paragraphs[2]}</p>
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
          <p style={pStyle()}>{c.paragraphs[3]}</p>
          <p style={pStyle(true)}>
            <span className="mk">宇宙の全てのパン好きのために</span>、
            <span className="mk">Bakerization</span>
            は今日も文化を紡ぎ続けます。
          </p>
        </div>
        <div>
          <p style={pStyle()}>{c.paragraphs[4]}</p>
          <p style={pStyle(true)}>
            <span className="mk">Bakerization</span>
            は日本のパン文化を世界に広げ、
            <span className="mk">22世紀のパン屋さん</span>を創造します。
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
function Services() {
  const c = COPY.services;
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
            ▍{c.labelJa}
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
            <div
              key={it.num}
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
                  {it.ja}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.85,
                    margin: 0,
                    opacity: onAccent ? 0.92 : 0.78,
                  }}
                >
                  {it.body}
                </p>
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
                <span>{it.en}</span>
                <span>↗</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Blog — horizontal-strip
   ───────────────────────────────────────────────────────────── */
function Blog({ posts }: { posts: BlogTeaser[] }) {
  const c = COPY.blog;
  const items = posts.length ? posts : c.posts;
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
            ▍{c.labelJa}
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
            {c.titleJa}
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
          VIEW JOURNAL →
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
        {items.map((p, i) => {
          const href = p.slug ? `/blog/${p.slug}` : "/blog";
          return (
            <Link
              key={p.slug || p.date}
              href={href}
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
                  {p.ja}
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
                  {p.en}
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
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Ikeda — framed-portrait
   ───────────────────────────────────────────────────────────── */
function Ikeda() {
  const c = COPY.ikeda;
  return (
    <section
      className="mob-pad mob-pad-v-sm"
      style={{ padding: "120px 64px", background: C.bg }}
    >
      <div
        className="mob-founder mob-pad-card-lg"
        style={{
          background: C.slab,
          color: C.onSlab,
          padding: 56,
          display: "grid",
          gridTemplateColumns: "0.9fr 1.6fr",
          gap: 60,
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ background: C.accent, padding: 12 }}>
            <div
              style={{ width: "100%", aspectRatio: "4/5", overflow: "hidden" }}
            >
              <img
                src="/ikeda.jpeg"
                alt={c.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "saturate(1.1) contrast(1.05)",
                }}
              />
            </div>
          </div>
          <div
            style={{
              marginTop: 18,
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.24em",
              color: C.paper,
              opacity: 0.7,
              textTransform: "uppercase",
            }}
          >
            Co-founder · COO
          </div>
        </div>
        <div>
          <div
            style={{
              display: "inline-block",
              padding: "8px 12px",
              background: C.accent,
              color: C.paper,
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              marginBottom: 28,
            }}
          >
            ▍{c.labelJa}
          </div>
          <p
            className="mob-quote"
            style={{
              fontFamily: FONTS.display,
              fontSize: 30,
              lineHeight: 1.6,
              margin: 0,
              fontWeight: 500,
              color: C.paper,
            }}
          >
            {c.quoteJa}
          </p>
          <Rule
            style={{
              background: C.paper,
              opacity: 0.4,
              margin: "36px 0",
              width: 60,
              height: 2,
            }}
          />
          <div style={{ fontSize: 26, fontWeight: 700 }}>{c.name}</div>
          <div style={{ marginTop: 4, fontSize: 14, opacity: 0.7 }}>
            {c.nameEn} · {c.role}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Contact — block-button
   ───────────────────────────────────────────────────────────── */
function Contact() {
  const c = COPY.contact;
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
            ▍{c.labelJa}
          </div>
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
            {c.titleJa}
          </h2>
          <p
            style={{
              marginTop: 24,
              fontSize: 17,
              lineHeight: 1.95,
              opacity: 0.92,
              maxWidth: 540,
            }}
          >
            {c.body}
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
              お問い合わせフォームを開く →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Footer
   ───────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      className="mob-footer"
      style={{
        padding: "48px 64px",
        background: C.slab,
        color: C.onSlab,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: FONTS.mono,
        fontSize: 11,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
      }}
    >
      <span
        style={{
          fontFamily: FONTS.display,
          fontSize: 18,
          letterSpacing: 0,
          textTransform: "none",
        }}
      >
        Bakerization
      </span>
      <span style={{ opacity: 0.65 }}>
        © {new Date().getFullYear()} Bakerization · We Bake the Future · ALL RIGHTS
        RESERVED
      </span>
      <span style={{ opacity: 0.85 }}>JA · EN</span>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────
   TopPage — composed page
   ───────────────────────────────────────────────────────────── */
export default function TopPage({ posts = [] }: Props) {
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
        <Nav />
        <Hero />
        <About />
        <Services />
        <Blog posts={posts} />
        <Ikeda />
        <Contact />
        <Footer />
      </div>
    </Stage>
  );
}
