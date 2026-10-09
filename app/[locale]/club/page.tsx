import type { Metadata } from "next";
import { localeFromParams } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import { C, FONTS } from "@/lib/theme";
import {
  BrandBar,
  HandQuote,
  Inner,
  NAV_HEIGHT,
  RuleText,
  SectionCover,
  SubLabel,
  TextLink,
  labelText,
} from "@/components/brand/ui";

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
  const isEn = locale === "en";

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
        paddingTop: NAV_HEIGHT,
      }}
    >
      <SectionCover as="h1" title="Bakerization CLUB" sub="メーリングリスト" no="01" />

      <Inner className="mob-pad-v-sm" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <HandQuote size={isEn ? 38 : 44}>
          {t.headlineTop}
          <br />
          {t.headlineMid}
          <br />
          {t.headlineBot}
        </HandQuote>
        <BrandBar reach="58%" style={{ marginTop: 32 }} />
        <RuleText style={{ marginTop: 56, maxWidth: 760, fontSize: 18, lineHeight: 1.95, color: C.ink }}>
          {t.deck}
        </RuleText>
      </Inner>

      <Inner style={{ paddingBottom: 120 }}>
        {/* Body — embedded Google Form + what-you-get block */}
        <section
          className="mob-1col"
          style={{
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
              border: `1px solid ${C.line}`,
              padding: 40,
            }}
          >
            <SubLabel style={{ marginBottom: 28 }}>{t.formLabel}</SubLabel>
            <iframe
              src={`${FORM_URL}?embedded=true`}
              title={t.formTitle}
              className="club-form-frame"
              style={{
                display: "block",
                width: "100%",
                height: 1300,
                border: 0,
                background: C.card,
              }}
            >
              {t.fallback}
            </iframe>
          </div>

          <div
            className="mob-pad-card-lg"
            style={{
              background: C.slab,
              color: C.onSlabSoft,
              padding: 40,
            }}
          >
            <div style={{ ...labelText, color: C.onSlab, marginBottom: 20 }}>{t.whatLabel}</div>
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
                <li key={item} style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.5, color: C.onSlabSoft }}>
                  — {item}
                </li>
              ))}
            </ul>
            <div
              aria-hidden
              style={{
                height: 1,
                margin: "28px 0 20px",
                background: "color-mix(in srgb, var(--on-slab) 30%, transparent)",
              }}
            />
            <a
              href={FORM_URL}
              target="_blank"
              rel="noopener"
              style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: C.onSlabSoft,
                textDecorationColor: "color-mix(in srgb, var(--on-slab) 60%, transparent)",
                textUnderlineOffset: 4,
              }}
            >
              {t.fallback}
            </a>
          </div>
        </section>

        <div style={{ marginTop: 72 }}>
          <TextLink href="/">{t.back}</TextLink>
        </div>
      </Inner>
    </main>
  );
}
