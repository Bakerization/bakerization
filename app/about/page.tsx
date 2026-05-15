import Link from "next/link";
import { getServerLocale } from "@/lib/i18n";
import { C, FONTS } from "@/lib/theme";

export const metadata = {
  title: "団体情報 | Bakerization",
  description:
    "Bakerizationの代表者プロフィールと、私たちが大切にする倫理観・行動原則。",
};

export default async function AboutPage() {
  const locale = await getServerLocale();

  const t =
    locale === "en"
      ? {
          tag: "OUR INFORMATION",
          section: "From the Founder",
          page: "p. 011",
          headlineTop: "BAKING",
          headlineMid: "A CRAFT",
          headlineBot: "THAT LASTS.",
          deck:
            "Bakerization addresses structural challenges in the Japanese bakery industry — labor reform, climate, costs — and gives the craft a shape that can continue.",
          opEdLabel: "Op-ed · 寄稿",
          opEdTitle: "Building kinder systems for a craft that lasts.",
          name: "Hiroaki Ikeda",
          nameJa: "池田 弘明",
          role: "Co-founder & COO · Bakerization",
          quote:
            "Baking has carried mornings in our towns for generations. We don't want to lighten the craft — we want to give it a shape that can continue. Data and systems, in the end, exist for people.",
          statementLabel: "Statement",
          statement:
            "Bakerization was founded to solve structural social challenges faced by bakeries. We believe that food, craft, and business ethics can coexist through practical systems and long-term responsibility.",
          principlesLabel: "Core Principles",
          p1: "Practical value for bakery operators and teams",
          p2: "Transparency in operations, data, and decision-making",
          p3: "Respect for local culture, craft, and ethical growth",
          back: "← Back to Home",
        }
      : {
          tag: "団体情報",
          section: "代表メッセージ",
          page: "p. 011",
          headlineTop: "焼くという",
          headlineMid: "営みに、",
          headlineBot: "続く形を。",
          deck:
            "Bakerizationは、労働法改正・気候変動・原価高騰に直面する日本のパン文化の構造的課題に正面から向き合い、続けられる仕組みを設計します。",
          opEdLabel: "Op-ed · 寄稿",
          opEdTitle: "焼くことに、続けられる形をあげたい。",
          name: "池田 弘明",
          nameJa: "Hiroaki Ikeda",
          role: "共同代表 COO · Bakerization",
          quote:
            "「焼く」という営みは、街の朝を支えてきました。私たちは、その手仕事の重さを軽くするのではなく、続けられる形に整えたい。データも仕組みも、結局は人のためにあります。",
          statementLabel: "ステートメント",
          statement:
            "Bakerizationは、パン屋が抱える構造的な社会課題を解決するために生まれました。食文化・職人性・経営倫理が共存できる仕組みを、現場と長期視点の両方から実装していきます。",
          principlesLabel: "行動原則",
          p1: "現場にとって実効性のある価値を提供する",
          p2: "運営・データ・意思決定の透明性を担保する",
          p3: "地域文化と職人性を尊重した持続的成長を目指す",
          back: "← トップへ戻る",
        };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.ink,
        fontFamily: FONTS.body,
        paddingTop: 96,
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 64px 96px" }}>
        {/* Header strip */}
        <div
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
            ▍SECTION V — {t.tag} / {t.section}
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
            {t.page}
          </span>
        </div>

        {/* Big headline */}
        <h1
          style={{
            margin: 0,
            fontFamily: FONTS.display,
            fontSize: 132,
            lineHeight: 0.9,
            letterSpacing: -4,
            fontWeight: 700,
            color: C.ink,
            textTransform: "uppercase",
          }}
        >
          {t.headlineTop}
          <br />
          {t.headlineMid}
          <br />
          <span style={{ color: C.accent }}>{t.headlineBot}</span>
        </h1>

        <div
          style={{
            marginTop: 32,
            width: 100,
            height: 3,
            background: C.accent,
          }}
        />

        <p
          style={{
            marginTop: 28,
            fontSize: 18,
            lineHeight: 1.95,
            color: C.sub,
            maxWidth: 720,
          }}
        >
          {t.deck}
        </p>

        {/* Framed portrait + op-ed */}
        <section
          style={{
            marginTop: 80,
            background: C.slab,
            padding: 56,
            display: "grid",
            gridTemplateColumns: "0.85fr 1.55fr",
            gap: 60,
            alignItems: "start",
          }}
        >
          <div>
            <div style={{ background: C.accent, padding: 12 }}>
              <div
                style={{ width: "100%", aspectRatio: "4/5", overflow: "hidden" }}
              >
                <img
                  src="/ikeda.jpeg"
                  alt={t.name}
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
            <div style={{ marginTop: 18, fontSize: 24, fontWeight: 700 }}>
              {t.name}
            </div>
            <div style={{ marginTop: 4, fontSize: 13, color: C.sub }}>
              {t.nameJa}
            </div>
            <div
              style={{
                marginTop: 10,
                fontFamily: FONTS.mono,
                fontSize: 11,
                letterSpacing: "0.22em",
                color: C.accent,
                textTransform: "uppercase",
              }}
            >
              {t.role}
            </div>
          </div>

          <div>
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                background: C.accent,
                color: C.paper,
                fontFamily: FONTS.mono,
                fontSize: 11,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                marginBottom: 24,
              }}
            >
              {t.opEdLabel}
            </span>
            <h2
              style={{
                margin: 0,
                fontFamily: FONTS.display,
                fontSize: 52,
                lineHeight: 1.15,
                letterSpacing: -1.5,
                fontWeight: 700,
                color: C.paper,
              }}
            >
              {t.opEdTitle}
            </h2>
            <div
              style={{
                margin: "32px 0",
                width: 60,
                height: 2,
                background: C.paper,
                opacity: 0.4,
              }}
            />
            <p
              style={{
                fontFamily: FONTS.display,
                fontSize: 26,
                lineHeight: 1.65,
                margin: 0,
                fontWeight: 500,
                color: C.paper,
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 60,
                  color: C.accent,
                  lineHeight: 0.4,
                  display: "inline-block",
                  verticalAlign: "top",
                  marginRight: 6,
                }}
              >
                「
              </span>
              {t.quote}
            </p>
          </div>
        </section>

        {/* Statement + Principles */}
        <section
          style={{
            marginTop: 80,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: C.accent,
                marginBottom: 18,
              }}
            >
              ▎{t.statementLabel}
            </div>
            <p
              style={{
                fontSize: 17,
                lineHeight: 2,
                color: C.ink,
                margin: 0,
              }}
            >
              {t.statement}
            </p>
          </div>
          <div>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: C.accent,
                marginBottom: 18,
              }}
            >
              ▎{t.principlesLabel}
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {[t.p1, t.p2, t.p3].map((p, i) => (
                <li
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr",
                    gap: 16,
                    padding: "20px 0",
                    borderTop:
                      i === 0 ? `1px solid ${C.line}` : "none",
                    borderBottom: `1px solid ${C.line}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 32,
                      fontWeight: 700,
                      color: C.accent,
                      lineHeight: 1,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      lineHeight: 1.7,
                      color: C.ink,
                    }}
                  >
                    {p}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div style={{ marginTop: 64 }}>
          <Link
            href="/"
            style={{
              fontFamily: FONTS.mono,
              fontSize: 12,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: C.accent,
              textDecoration: "none",
            }}
          >
            {t.back}
          </Link>
        </div>
      </div>
    </main>
  );
}
