import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { getServerLocale } from "@/lib/i18n";
import { C, FONTS } from "@/lib/theme";

export const metadata = {
  title: "Contact | Bakerization",
  description:
    "Bakerization へのお問い合わせ。パン屋の現場・自治体・メディアからのご相談を受け付けています。",
};

export default async function ContactPage() {
  const locale = await getServerLocale();

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
        paddingTop: 96,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "32px 64px 96px",
        }}
      >
        {/* Strip */}
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
            ▍SECTION VI — {t.section}
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

        {/* Body — form + email block */}
        <section
          style={{
            marginTop: 80,
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: 56,
            alignItems: "start",
          }}
        >
          <div
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
            <ContactForm locale={locale} />
          </div>

          <div
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
                marginBottom: 12,
              }}
            >
              {t.emailLabel}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
              info@bakerization.com
            </div>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                letterSpacing: "0.24em",
                opacity: 0.7,
                marginBottom: 12,
              }}
            >
              ADDRESS
            </div>
            <div style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7 }}>
              Tokyo · Osaka
              <br />
              Japan
            </div>
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
