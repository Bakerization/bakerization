import Image from "next/image";
import type { Metadata } from "next";
import { localeFromParams } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import { C, FONTS } from "@/lib/theme";
import { Inner, NAV_HEIGHT, SectionCover, TextLink, labelText } from "@/components/brand/ui";

// Fully static: no request-time work. `dynamic = "error"` makes the build fail if
// a dynamic API ever sneaks in. `dynamicParams = false` only applies to this leaf.
export const dynamic = "error";
export const dynamicParams = false;
type Props = { params: Promise<{ locale: string }> };


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFromParams(params);
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

export default async function MessagePage({ params }: Props) {
  const locale = await localeFromParams(params);
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
        paddingTop: NAV_HEIGHT,
      }}
    >
      <SectionCover as="h1" title="Message" sub="代表メッセージ" no="01" />

      <Inner className="mob-pad-v-sm" style={{ paddingTop: 96, paddingBottom: 120 }}>
        {/* Portraits — photos only, no message text */}
        <div
          className="mob-1col"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
          }}
        >
          {reps.map((r) => (
            <RepCard key={r.name} rep={r} />
          ))}
        </div>

        <div style={{ marginTop: 72 }}>
          <TextLink href="/">{t.back}</TextLink>
        </div>
      </Inner>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────
   RepCard — portrait on an offset yellow block (same look as the
   About founder cards). A rep without a photo keeps the frame, so
   a portrait can drop in later by setting imageSrc.
   ───────────────────────────────────────────────────────────── */
function RepCard({ rep }: { rep: Rep }) {
  return (
    <section style={{ borderTop: `1px solid ${C.ink}`, paddingTop: 48 }}>
      <div style={{ position: "relative", maxWidth: 420, marginRight: 18, marginBottom: 18 }}>
        <div
          aria-hidden
          style={{ position: "absolute", left: 18, top: 18, right: -18, bottom: -18, background: C.main }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "4/5",
            overflow: "hidden",
            background: C.paper,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {rep.imageSrc ? (
            <Image
              src={rep.imageSrc}
              alt={rep.imageAlt ?? ""}
              fill
              sizes="(max-width: 880px) 100vw, 560px"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <span aria-hidden style={{ width: "46%", aspectRatio: "1", borderRadius: "50%", background: C.main }} />
          )}
        </div>
      </div>
      <div style={{ ...labelText, marginTop: 28, color: C.sub }}>{rep.kicker}</div>
      <div style={{ marginTop: 12, fontSize: 26, fontWeight: 700, color: C.ink }}>{rep.name}</div>
      <div style={{ marginTop: 4, fontSize: 13, color: C.sub }}>{rep.nameAlt}</div>
      <div style={{ ...labelText, marginTop: 10, color: C.ink }}>{rep.role}</div>
    </section>
  );
}
