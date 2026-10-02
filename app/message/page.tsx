import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getServerLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { C, FONTS } from "@/lib/theme";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMetadata({
    path: "/message",
    locale,
    title: locale === "en" ? "Message from the representatives" : "代表メッセージ",
    description:
      locale === "en"
        ? "A message from Bakerization's co-representatives on why we work to protect Japan's bread culture."
        : "Bakerizationの共同代表からのメッセージ。日本のパン文化を守るために、私たちが取り組む理由。",
  });
}

type Rep = {
  imageSrc?: string;
  imageAlt?: string;
  kicker: string;
  name: string;
  nameAlt: string;
  role: string;
};

export default async function MessagePage() {
  const locale = await getServerLocale();
  const isEn = locale === "en";

  const t = isEn
    ? {
        tag: "MESSAGE",
        section: "Representatives",
        page: "p. 021",
        heading: "Message.",
        back: "← Back to Home",
      }
    : {
        tag: "代表メッセージ",
        section: "Message",
        page: "p. 021",
        heading: "代表メッセージ",
        back: "← トップへ戻る",
      };

  const reps: Rep[] = isEn
    ? [
        {
          kicker: "Representative Director · CEO",
          name: "Kenji Hatanaka",
          nameAlt: "畑中 健司",
          role: "Co-founder & CEO · Bakerization",
        },
        {
          imageSrc: "/ikeda.webp",
          imageAlt: "Hiroaki Ikeda",
          kicker: "Co-founder · COO",
          name: "Hiroaki Ikeda",
          nameAlt: "池田 浩明",
          role: "Co-founder & COO · Bakerization",
        },
      ]
    : [
        {
          kicker: "代表取締役 · CEO",
          name: "畑中 健司",
          nameAlt: "Kenji Hatanaka",
          role: "共同代表 CEO · Bakerization",
        },
        {
          imageSrc: "/ikeda.webp",
          imageAlt: "池田 浩明",
          kicker: "共同代表 · COO",
          name: "池田 浩明",
          nameAlt: "Hiroaki Ikeda",
          role: "共同代表 COO · Bakerization",
        },
      ];

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
            ▍SECTION VI — {t.tag} / {t.section}
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
          className="mob-h2"
          style={{
            margin: 0,
            fontFamily: FONTS.display,
            fontSize: 96,
            lineHeight: 0.95,
            letterSpacing: -3,
            fontWeight: 700,
            color: C.ink,
          }}
        >
          {t.heading}
        </h1>

        <div
          style={{
            marginTop: 32,
            width: 100,
            height: 3,
            background: C.accent,
          }}
        />

        {/* Portraits — photos only, no message text */}
        <div
          className="mob-1col"
          style={{
            marginTop: 72,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 36,
          }}
        >
          {reps.map((r) => (
            <section
              key={r.name}
              className="mob-pad-card-lg"
              style={{
                background: C.card,
                border: `1.5px solid ${C.line}`,
                padding: 32,
              }}
            >
              {r.imageSrc && (
                <div style={{ background: C.accent, padding: 12 }}>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "4/5",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={r.imageSrc}
                      alt={r.imageAlt ?? ""}
                      fill
                      sizes="(max-width: 880px) 100vw, 560px"
                      style={{
                        objectFit: "cover",
                        filter: "saturate(1.05) contrast(1.05)",
                      }}
                    />
                  </div>
                </div>
              )}
              <div
                style={{
                  marginTop: 18,
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  letterSpacing: "0.24em",
                  color: C.sub,
                  textTransform: "uppercase",
                }}
              >
                {r.kicker}
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.ink,
                }}
              >
                {r.name}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: C.sub,
                  opacity: 0.8,
                }}
              >
                {r.nameAlt}
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  color: C.accent,
                  textTransform: "uppercase",
                }}
              >
                {r.role}
              </div>
            </section>
          ))}
        </div>

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
