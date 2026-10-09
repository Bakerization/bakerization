import Link from "next/link";
import type { Metadata } from "next";
import { localeFromParams } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import { C, FONTS } from "@/lib/theme";

// Fully static: no request-time work. `dynamic = "error"` makes the build fail if
// a dynamic API ever sneaks in. `dynamicParams = false` only applies to this leaf.
export const dynamic = "error";
export const dynamicParams = false;
type Props = { params: Promise<{ locale: string }> };

// Bakerization CLUB のエントリーは Google フォームで受け付けている（回答は Google 側に溜まる）。
// iframe はクロスオリジンで高さを合わせられないので、高さは globals.css の .club-form-frame で固定。
const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfI5v-wahnohDDcNR6mS7LQesmmK5Yct7YZSTMzgIDlQdP-PQ/viewform";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFromParams(params);
  return pageMetadata({
    path: "/club",
    locale,
    title: "Bakerization CLUB",
    description:
      locale === "en"
        ? "Join Bakerization CLUB, the mailing list for everyone shaping the future of bread. Events, research, product updates and news."
        : "パンの未来に関わるすべての人のためのメーリングリスト「Bakerization CLUB」。イベントのご案内、リサーチやプロダクトの最新情報、NEWS をお届けします。",
  });
}

export default async function ClubPage({ params }: Props) {
  const locale = await localeFromParams(params);

  const t =
    locale === "en"
      ? {
          section: "Bakerization CLUB",
          page: "p. 015",
          headlineTop: "JOIN",
          headlineMid: "THE",
          headlineBot: "CLUB.",
          deck: "Bakerization CLUB is a mailing list for everyone shaping the future of bread. We'll send you event invitations, research and product updates, and news. Bakers, people working across the bread industry, students and educators are all welcome. The entry form is in Japanese.",
          formLabel: "Entry form",
          formTitle: "Bakerization CLUB entry form",
          whatLabel: "WHAT YOU'LL GET",
          what: ["Event invitations", "Research & product updates", "News from Bakerization"],
          fallback: "Form not showing? Open it in Google Forms ↗",
          back: "← Back to Home",
        }
      : {
          section: "Bakerization CLUB",
          page: "p. 015",
          headlineTop: "パンの、",
          headlineMid: "未来を、",
          headlineBot: "一緒に。",
          deck: "Bakerization CLUB は、パンの未来に関わるすべての人のためのメーリングリストです。イベントのご案内、リサーチやプロダクトの最新情報、NEWS をお届けします。パン屋さん、パン業界で働く方、学生、教育関係の方まで、どなたでもご登録いただけます。",
          formLabel: "エントリーフォーム",
          formTitle: "Bakerization CLUB エントリーフォーム",
          whatLabel: "お届けする内容",
          what: ["イベントのご案内", "リサーチ・プロダクトの最新情報", "Bakerization の NEWS"],
          fallback: "フォームが表示されない場合は Google フォームで開く ↗",
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
      <div
        className="mob-pad"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "32px 64px 96px",
        }}
      >
        {/* Strip */}
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
            ▍SECTION — {t.section}
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

        {/* Headline */}
        <h1
          className="mob-h1"
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

        {/* Body — embedded Google Form + what-you-get block */}
        <section
          className="mob-1col"
          style={{
            marginTop: 80,
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: 56,
            alignItems: "start",
          }}
        >
          <div
            className="mob-pad-card-lg"
            style={{
              background: C.card,
              border: `1.5px solid ${C.line}`,
              padding: 40,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: C.accent,
                marginBottom: 28,
              }}
            >
              ▎{t.formLabel}
            </div>
            <iframe
              src={`${FORM_URL}?embedded=true`}
              title={t.formTitle}
              className="club-form-frame"
              style={{
                display: "block",
                width: "100%",
                height: 1300,
                border: 0,
                background: "#fff",
              }}
            >
              {t.fallback}
            </iframe>
          </div>

          <div
            className="mob-pad-card-lg"
            style={{
              background: C.slab,
              color: C.onSlab,
              padding: 40,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                letterSpacing: "0.24em",
                opacity: 0.7,
                marginBottom: 16,
              }}
            >
              {t.whatLabel}
            </div>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "grid",
                gap: 14,
              }}
            >
              {t.what.map((item) => (
                <li key={item} style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.5 }}>
                  — {item}
                </li>
              ))}
            </ul>
            <div
              style={{
                background: C.onSlab,
                opacity: 0.2,
                margin: "28px 0 20px",
                height: 1,
              }}
            />
            <a
              href={FORM_URL}
              target="_blank"
              rel="noopener"
              style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: C.onSlab,
                opacity: 0.85,
              }}
            >
              {t.fallback}
            </a>
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
