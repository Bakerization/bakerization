import ContactForm from "@/components/ContactForm";
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


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFromParams(params);
  return pageMetadata({
    path: "/contact",
    locale,
    title: "Contact",
    description:
      locale === "en"
        ? "Contact Bakerization. We welcome inquiries from bakeries, local governments and the media."
        : "Bakerization へのお問い合わせ。パン屋の現場・自治体・メディアからのご相談を受け付けています。",
  });
}

export default async function ContactPage({ params }: Props) {
  const locale = await localeFromParams(params);
  const isEn = locale === "en";

  const t =
    locale === "en"
      ? {
          section: "Contact",
          page: "p. 014",
          headlineTop: "LET'S",
          headlineMid: "TALK",
          headlineBot: "BREAD.",
          deck: "From small local bakeries to municipalities and press — we read every message. Please share what you're working on.",
          emailLabel: "EMAIL",
          formLabel: "Inquiry form",
          back: "← Back to Home",
        }
      : {
          section: "お問い合わせ",
          page: "p. 014",
          headlineTop: "話す、",
          headlineMid: "聴く、",
          headlineBot: "焼く。",
          deck: "町のパン屋さんから自治体・メディアまで、いただいた一通一通に目を通します。今お考えのことをお聞かせください。",
          emailLabel: "メール",
          formLabel: "お問い合わせフォーム",
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
      <SectionCover as="h1" title="Contact" sub="お問い合わせ" no="01" />

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
        {/* Body — form + email block */}
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
            <ContactForm locale={locale} />
          </div>

          <div
            className="mob-pad-card-lg"
            style={{
              background: C.slab,
              color: C.onSlabSoft,
              padding: 40,
            }}
          >
            <div style={{ ...labelText, color: C.onSlab, marginBottom: 12 }}>{t.emailLabel}</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: "0.01em",
                color: C.onSlabSoft,
                overflowWrap: "anywhere",
              }}
            >
              info@bakerization.com
            </div>
            <div
              aria-hidden
              style={{
                height: 1,
                margin: "28px 0",
                background: "color-mix(in srgb, var(--on-slab) 30%, transparent)",
              }}
            />
            <div style={{ ...labelText, color: C.onSlab, marginBottom: 12 }}>ADDRESS</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: C.onSlabSoft }}>
              Tokyo · Osaka
              <br />
              Japan
            </div>
          </div>
        </section>

        <div style={{ marginTop: 72 }}>
          <TextLink href="/">{t.back}</TextLink>
        </div>
      </Inner>
    </main>
  );
}
