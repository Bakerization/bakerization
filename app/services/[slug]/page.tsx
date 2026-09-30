import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerLocale } from "@/lib/i18n";
import { C, FONTS } from "@/lib/theme";
import { SERVICES, getService, getServiceCopy } from "@/lib/services";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service | Bakerization" };
  const locale = await getServerLocale();
  const copy = getServiceCopy(service, locale);
  return {
    title: `${copy.title} | Bakerization`,
    description: copy.deck,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const locale = await getServerLocale();
  const isEn = locale === "en";
  const c = getServiceCopy(service, locale);

  const ui = isEn
    ? {
        tag: "What We Do",
        page: `p. 0${service.num.replace(/^0/, "")}`,
        back: "← Back to Home",
        otherLabel: "Other activities",
        ctaLabel: "Let's talk",
        ctaTitle: "Tell us what your shop is up against.",
        ctaBody:
          "From a single neighborhood shop to a large food company — whatever you're carrying, start by telling us about it.",
        ctaButton: "Open the contact form →",
      }
    : {
        tag: "活動内容",
        page: `p. 0${service.num.replace(/^0/, "")}`,
        back: "← トップへ戻る",
        otherLabel: "ほかの活動",
        ctaLabel: "お問い合わせ",
        ctaTitle: "あなたのお店の「困った」を、聞かせてください。",
        ctaBody:
          "小さな町のお店から大規模な食品会社まで。いま抱えていることを、まずは言葉にするところから始めましょう。",
        ctaButton: "お問い合わせフォームを開く →",
      };

  const others = SERVICES.filter((s) => s.slug !== service.slug);

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
        style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 64px 96px" }}
      >
        {/* Header strip */}
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
            ▍SERVICE.{service.num} — {ui.tag}
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
            {ui.page}
          </span>
        </div>

        {/* Big number + headline */}
        <div
          className="mob-num"
          style={{
            fontFamily: FONTS.display,
            fontSize: 120,
            fontWeight: 700,
            lineHeight: 0.85,
            color: C.accent,
            letterSpacing: -4,
          }}
        >
          {service.num}
        </div>
        <h1
          className="mob-h1"
          style={{
            margin: "12px 0 0",
            fontFamily: FONTS.display,
            fontSize: 96,
            lineHeight: 1.0,
            letterSpacing: -3,
            fontWeight: 700,
            color: C.ink,
          }}
        >
          {c.title}
        </h1>
        <div
          style={{ marginTop: 28, width: 100, height: 3, background: C.accent }}
        />
        <p
          style={{
            marginTop: 22,
            fontFamily: FONTS.display,
            fontSize: 24,
            lineHeight: 1.5,
            color: C.accent,
            fontWeight: 500,
          }}
        >
          {c.tagline}
        </p>
        <p
          style={{
            marginTop: 20,
            fontSize: 18,
            lineHeight: 1.95,
            color: C.sub,
            maxWidth: 720,
          }}
        >
          {c.deck}
        </p>

        {/* Empathy slab — the feelings we hear on the floor */}
        <section
          className="mob-pad-card-lg"
          style={{
            marginTop: 80,
            background: C.slab,
            color: C.onSlab,
            padding: 56,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 12px",
              background: C.accent,
              color: C.bg,
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              marginBottom: 28,
            }}
          >
            {c.empathyLabel}
          </div>
          <p
            className="mob-quote"
            style={{
              fontFamily: FONTS.display,
              fontSize: 30,
              lineHeight: 1.6,
              margin: 0,
              fontWeight: 500,
              color: C.onSlab,
              maxWidth: 880,
            }}
          >
            {c.pullQuote}
          </p>
          <div
            style={{
              margin: "32px 0",
              width: 60,
              height: 2,
              background: C.onSlab,
              opacity: 0.4,
            }}
          />
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.95,
              color: C.onSlab,
              opacity: 0.85,
              margin: "0 0 28px",
              maxWidth: 720,
            }}
          >
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
                  borderTop: `1px solid rgba(246,231,201,0.18)`,
                  borderBottom:
                    i === c.pains.length - 1
                      ? `1px solid rgba(246,231,201,0.18)`
                      : "none",
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: C.onSlab,
                }}
              >
                <span style={{ color: C.accent, fontWeight: 700 }}>—</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Approach + Steps */}
        <section
          className="mob-1col"
          style={{
            marginTop: 80,
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
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: C.accent,
                marginBottom: 18,
              }}
            >
              ▎{c.approachLabel}
            </div>
            {c.approach.map((p, i) => (
              <p
                key={i}
                style={{
                  fontSize: 17,
                  lineHeight: 2,
                  color: C.ink,
                  margin: i === 0 ? 0 : "20px 0 0",
                }}
              >
                {p}
              </p>
            ))}
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
              ▎{c.stepsLabel}
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {c.steps.map((s, i) => (
                <li
                  key={s.num}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr",
                    gap: 16,
                    padding: "22px 0",
                    borderTop: i === 0 ? `1px solid ${C.line}` : "none",
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
                    {s.num}
                  </span>
                  <span>
                    <span
                      style={{
                        display: "block",
                        fontSize: 18,
                        fontWeight: 700,
                        color: C.ink,
                        marginBottom: 6,
                      }}
                    >
                      {s.title}
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        lineHeight: 1.75,
                        color: C.sub,
                      }}
                    >
                      {s.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Outcome line */}
        <section style={{ marginTop: 72, maxWidth: 880 }}>
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
            ▎{c.outcomeLabel}
          </div>
          <p
            style={{
              fontFamily: FONTS.display,
              fontSize: 26,
              lineHeight: 1.7,
              color: C.ink,
              margin: 0,
              fontWeight: 500,
            }}
          >
            {c.outcome}
          </p>
        </section>

        {/* CTA → contact */}
        <section
          className="mob-1col"
          style={{
            marginTop: 88,
            background: C.accent,
            color: C.paper,
            padding: 56,
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr",
            gap: 48,
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
                marginBottom: 24,
              }}
            >
              ▍{ui.ctaLabel}
            </div>
            <h2
              className="mob-h3"
              style={{
                fontFamily: FONTS.display,
                fontSize: 40,
                lineHeight: 1.2,
                letterSpacing: -1,
                fontWeight: 700,
                color: C.paper,
                margin: 0,
              }}
            >
              {ui.ctaTitle}
            </h2>
            <p
              style={{
                marginTop: 20,
                fontSize: 16,
                lineHeight: 1.9,
                opacity: 0.92,
                maxWidth: 520,
              }}
            >
              {ui.ctaBody}
            </p>
          </div>
          <div>
            <Link
              href="/contact"
              style={{
                display: "block",
                width: "100%",
                padding: "20px 24px",
                background: C.slab,
                color: C.onSlab,
                fontFamily: FONTS.body,
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 0.5,
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              {ui.ctaButton}
            </Link>
          </div>
        </section>

        {/* Other activities */}
        <section style={{ marginTop: 80 }}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: C.accent,
              marginBottom: 24,
            }}
          >
            ▎{ui.otherLabel}
          </div>
          <div
            className="mob-1col"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
            }}
          >
            {others.map((s) => {
              const oc = getServiceCopy(s, locale);
              return (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="mob-pad-card"
                  style={{
                    background: C.card,
                    border: `1.5px solid ${C.line}`,
                    padding: 32,
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 180,
                  }}
                >
                  <div>
                    <div
                      className="mob-num"
                      style={{
                        fontFamily: FONTS.display,
                        fontSize: 48,
                        fontWeight: 700,
                        lineHeight: 0.9,
                        color: C.accent,
                        marginBottom: 16,
                      }}
                    >
                      {s.num}
                    </div>
                    <div
                      style={{ fontSize: 22, fontWeight: 700, color: C.ink }}
                    >
                      {oc.title}
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 24,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      letterSpacing: "0.24em",
                      textTransform: "uppercase",
                      color: C.sub,
                    }}
                  >
                    <span>{s.titleEn}</span>
                    <span style={{ color: C.accent }}>↗</span>
                  </div>
                </Link>
              );
            })}
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
            {ui.back}
          </Link>
        </div>
      </div>
    </main>
  );
}
