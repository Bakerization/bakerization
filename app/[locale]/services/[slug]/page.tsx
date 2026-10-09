import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LOCALES, localeFromParams } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import { C, FONTS } from "@/lib/theme";
import { SERVICES, getService, getServiceCopy } from "@/lib/services";
import {
  BrandBar,
  BrandButtonLink,
  ContentHeading,
  HandQuote,
  Inner,
  NAV_HEIGHT,
  NumberDot,
  RuleText,
  SectionCover,
  TextLink,
  labelText,
} from "@/components/brand/ui";

// Every service × locale is prerendered; anything else is a 404.
export const dynamic = "error";
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => SERVICES.map((s) => ({ locale, slug: s.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service" };
  const locale = await localeFromParams(params);
  const copy = getServiceCopy(service, locale);
  return pageMetadata({ path: `/services/${service.slug}`, locale, title: copy.title, description: copy.deck });
}

const UI = {
  en: {
    tag: "What We Do",
    back: "← Back to Home",
    otherLabel: "Other activities",
    ctaLabel: "Let's talk",
    ctaTitle: "Tell us what your shop is up against.",
    ctaBody:
      "From a single neighborhood shop to a large food company — whatever you're carrying, start by telling us about it.",
    ctaButton: "Open the contact form →",
  },
  ja: {
    tag: "活動内容",
    back: "← トップへ戻る",
    otherLabel: "ほかの活動",
    ctaLabel: "お問い合わせ",
    ctaTitle: "あなたのお店の「困った」を、聞かせてください。",
    ctaBody:
      "小さな町のお店から大規模な食品会社まで。いま抱えていることを、まずは言葉にするところから始めましょう。",
    ctaButton: "お問い合わせフォームを開く →",
  },
} as const;

// Hairline on the green band: the yellow at a quarter strength.
const SLAB_LINE = "color-mix(in srgb, var(--on-slab) 25%, transparent)";

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const locale = await localeFromParams(params);
  const isEn = locale === "en";
  const c = getServiceCopy(service, locale);
  const ui = UI[locale];
  // Section headings pair the English label with the Japanese one in both
  // locales (the brand book's "Title / 日本語").
  const en = service.en;
  const ja = service.ja;

  const others = SERVICES.filter((s) => s.slug !== service.slug);

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
      <SectionCover as="h1" title={service.titleEn} sub={ja.title} no={service.num} />

      <Inner className="mob-pad-v-sm" style={{ paddingTop: 96, paddingBottom: 112 }}>
        <HandQuote size={isEn ? 36 : 40}>{c.tagline}</HandQuote>
        <BrandBar reach="58%" style={{ marginTop: 32 }} />
        <RuleText style={{ marginTop: 56, maxWidth: 760, fontSize: 18, lineHeight: 1.95, color: C.ink }}>
          {c.deck}
        </RuleText>
      </Inner>

      {/* Empathy band — the feelings we hear on the floor */}
      <section style={{ background: C.slab, color: C.onSlabSoft }}>
        <Inner className="mob-pad-v-sm" style={{ paddingTop: 104, paddingBottom: 112 }}>
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
            {en.empathyLabel}
          </h2>
          <p lang="ja" style={{ margin: "18px 0 0", display: "flex", gap: 18, fontSize: 14, color: C.onSlab }}>
            <span aria-hidden>-</span>
            <span>{ja.empathyLabel}</span>
          </p>

          <div
            className="mob-1col"
            style={{
              marginTop: 64,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 72,
              alignItems: "start",
            }}
          >
            <p
              className="mob-quote"
              style={{
                margin: 0,
                fontFamily: FONTS.display,
                fontSize: 28,
                lineHeight: 1.7,
                fontWeight: 500,
                color: C.onSlab,
              }}
            >
              {c.pullQuote}
            </p>
            <div>
              <p style={{ margin: "0 0 28px", fontSize: 16, lineHeight: 1.95, color: C.onSlabSoft }}>
                {c.empathyLead}
              </p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {c.pains.map((p, i) => (
                  <li
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "28px 1fr",
                      gap: 14,
                      padding: "16px 0",
                      borderTop: `1px solid ${SLAB_LINE}`,
                      borderBottom: i === c.pains.length - 1 ? `1px solid ${SLAB_LINE}` : "none",
                      fontSize: 16,
                      lineHeight: 1.7,
                      color: C.onSlabSoft,
                    }}
                  >
                    <span aria-hidden style={{ color: C.onSlab }}>—</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Inner>
      </section>

      {/* Approach + Steps */}
      <Inner className="mob-pad-v-sm" style={{ paddingTop: 112, paddingBottom: 96 }}>
        {/* auto-fit rather than mob-1col so the stacked columns keep a full gap */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
            gap: 72,
            alignItems: "start",
          }}
        >
          <div>
            <ContentHeading title={en.approachLabel} sub={ja.approachLabel} />
            <RuleText style={{ fontSize: 17, color: C.ink }}>
              {c.approach.map((p, i) => (
                <p key={i} style={{ margin: i === 0 ? 0 : "20px 0 0" }}>
                  {p}
                </p>
              ))}
            </RuleText>
          </div>
          <div>
            <ContentHeading title={en.stepsLabel} sub={ja.stepsLabel} />
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {c.steps.map((s, i) => (
                <li
                  key={s.num}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "52px 1fr",
                    gap: 20,
                    alignItems: "start",
                    padding: "24px 0",
                    borderTop: i === 0 ? `1px solid ${C.line}` : "none",
                    borderBottom: `1px solid ${C.line}`,
                  }}
                >
                  <NumberDot n={s.num} tone={i === 1 ? "green" : "yellow"} size={52} />
                  <span>
                    <span
                      style={{
                        display: "block",
                        fontSize: 18,
                        fontWeight: 700,
                        lineHeight: 1.5,
                        color: C.ink,
                        marginBottom: 6,
                      }}
                    >
                      {s.title}
                    </span>
                    <span style={{ fontSize: 15, lineHeight: 1.85, color: C.sub }}>{s.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Outcome line */}
        <section style={{ marginTop: 96, maxWidth: 880 }}>
          <ContentHeading title={en.outcomeLabel} sub={ja.outcomeLabel} />
          <p
            className="mob-quote"
            style={{
              margin: 0,
              fontFamily: FONTS.display,
              fontSize: 26,
              lineHeight: 1.75,
              fontWeight: 400,
              color: C.ink,
            }}
          >
            {c.outcome}
          </p>
        </section>
      </Inner>

      {/* CTA → contact */}
      <section style={{ background: C.main, color: C.onMain }}>
        <Inner className="mob-pad-v-sm" style={{ paddingTop: 96, paddingBottom: 96 }}>
          <div
            className="mob-1col"
            style={{
              display: "grid",
              gridTemplateColumns: "1.3fr 1fr",
              gap: 60,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  ...labelText,
                  display: "inline-block",
                  background: C.slab,
                  color: C.onSlab,
                  padding: "9px 14px",
                  marginBottom: 28,
                }}
              >
                {ui.ctaLabel}
              </div>
              <h2
                className="mob-h3"
                style={{
                  margin: 0,
                  fontFamily: FONTS.display,
                  fontSize: 40,
                  lineHeight: 1.3,
                  letterSpacing: "-0.02em",
                  fontWeight: 500,
                  color: C.onMain,
                }}
              >
                {ui.ctaTitle}
              </h2>
              <p style={{ margin: "22px 0 0", fontSize: 16, lineHeight: 1.95, maxWidth: 540, color: C.onMain }}>
                {ui.ctaBody}
              </p>
            </div>
            <BrandButtonLink
              href="/contact"
              arrow={false}
              style={{ width: "100%", padding: "22px 28px", fontSize: 15, boxSizing: "border-box", textAlign: "center" }}
            >
              {ui.ctaButton}
            </BrandButtonLink>
          </div>
        </Inner>
      </section>

      {/* Other activities */}
      <Inner className="mob-pad-v-sm" style={{ paddingTop: 112, paddingBottom: 120 }}>
        <ContentHeading title={UI.en.otherLabel} sub={UI.ja.otherLabel} />
        <div
          className="mob-1col"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
          }}
        >
          {others.map((s) => {
            const oc = getServiceCopy(s, locale);
            return (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderTop: `1px solid ${C.ink}`,
                  paddingTop: 36,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <NumberDot n={s.num} tone={s.num === "02" ? "green" : "yellow"} size={72} />
                <div style={{ marginTop: 24, fontSize: 22, fontWeight: 700, lineHeight: 1.45, color: C.ink }}>
                  {oc.title}
                </div>
                <div
                  style={{
                    ...labelText,
                    marginTop: "auto",
                    paddingTop: 24,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    color: C.ink,
                  }}
                >
                  <span>{s.titleEn}</span>
                  <span aria-hidden>↗</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div style={{ marginTop: 72 }}>
          <TextLink href="/">{ui.back}</TextLink>
        </div>
      </Inner>
    </main>
  );
}
