import Image from "next/image";
import type { Metadata } from "next";
import { localeFromParams } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import { C, FONTS } from "@/lib/theme";
import {
  BrandBar,
  ContentHeading,
  HandQuote,
  Inner,
  NAV_HEIGHT,
  NumberDot,
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
    path: "/about",
    locale,
    title: locale === "en" ? "About" : "団体情報",
    description:
      locale === "en"
        ? "About Bakerization: profiles of our co-representatives, our statement and the principles we act on."
        : "Bakerizationの共同代表プロフィール、ステートメント、行動原則。",
  });
}

type Credential = string;
type SocialLink = { label: string; href: string };

type Founder = {
  imageSrc?: string;
  imageAlt?: string;
  kicker: string;
  name: string;
  nameAlt: string;
  role: string;
  bio: string[];
  credentials?: Credential[];
  socials?: SocialLink[];
};

export default async function AboutPage({ params }: Props) {
  const locale = await localeFromParams(params);
  const isEn = locale === "en";

  const t = isEn
    ? {
        tag: "OUR INFORMATION",
        section: "Founders",
        page: "p. 011",
        headlineTop: "BAKING",
        headlineMid: "A CRAFT",
        headlineBot: "THAT LASTS.",
        deck:
          "Bakerization is built by two co-founders bridging the bread industry and modern systems — preserving Japan's bread culture for the 22nd century.",
        statementLabel: "Statement",
        statement:
          "Bakerization was founded to address structural social challenges faced by bakeries. We believe food culture, craftsmanship, and business ethics can coexist through practical systems and long-term responsibility.",
        principlesLabel: "Core Principles",
        p1: "Practical value for bakery operators and teams",
        p2: "Transparency in operations, data, and decision-making",
        p3: "Respect for local culture, craft, and ethical growth",
        bioLabel: "Biography",
        credLabel: "Credentials",
        socialLabel: "Channels",
        back: "← Back to Home",
      }
    : {
        tag: "団体情報",
        section: "共同代表",
        page: "p. 011",
        headlineTop: "焼くという",
        headlineMid: "営みに、",
        headlineBot: "続く形を。",
        deck:
          "Bakerizationは、パン業界の現場と現代のテクノロジー / 仕組みをつなぐ二人の共同代表によって運営されています。22世紀にも日本のパン文化を残すための活動です。",
        statementLabel: "ステートメント",
        statement:
          "Bakerizationは、パン屋が抱える構造的な社会課題を解決するために生まれました。食文化・職人性・経営倫理が共存できる仕組みを、現場と長期視点の両方から実装していきます。",
        principlesLabel: "行動原則",
        p1: "現場にとって実効性のある価値を提供する",
        p2: "運営・データ・意思決定の透明性を担保する",
        p3: "地域文化と職人性を尊重した持続的成長を目指す",
        bioLabel: "プロフィール",
        credLabel: "肩書き",
        socialLabel: "チャンネル",
        back: "← トップへ戻る",
      };

  const hatanaka: Founder = isEn
    ? {
        kicker: "Representative Director · CEO",
        name: "Kenji Hatanaka",
        nameAlt: "畑中 健司",
        role: "Co-founder & CEO · Bakerization",
        bio: [
          "Third-year student at the University of Tokyo, Faculty of Engineering. Through working part-time at a bakery, he saw the distance between the bread industry and technology, and founded the University of Tokyo Bread Research Society to help preserve bread culture. There he met Hiroaki Ikeda.",
          "He went on to study flour milling at Cairnspring Mills in Seattle, USA. After his studies abroad, he toured Silicon Valley — a center of bread innovation — and founded Bakerization.",
        ],
      }
    : {
        kicker: "代表取締役 · CEO",
        name: "畑中 健司",
        nameAlt: "Kenji Hatanaka",
        role: "共同代表 CEO · Bakerization",
        bio: [
          "東京大学工学部3年。パン屋のアルバイトの経験から、パン業界とテクノロジーの距離を肌で感じ、パン文化を守る「東大パン研究会」を主催。そこで池田浩明と出会う。",
          "アメリカ・シアトルのCairnspring Millsなどで製粉を学ぶ。米国留学後、パンのイノベーションの地シリコンバレーを周り、Bakerizationを起業。",
        ],
      };

  const ikeda: Founder = isEn
    ? {
        imageSrc: "/ikeda.webp",
        imageAlt: "Hiroaki Ikeda",
        kicker: "Co-founder · COO",
        name: "Hiroaki Ikeda",
        nameAlt: "池田 浩明",
        role: "Co-founder & COO · Bakerization",
        bio: [
          "Bread writer, bread geek, and bread communicator. Founder of Painlab — one of Japan's most influential platforms for bread culture.",
        ],
        credentials: [
          "Founder · Painlab",
          "Bread Geek / Bread Writer",
          "Bread Communicator (Production)",
          "Chair · NPO Shinmugi Collection",
          "Adviser · Pan no Michi no Eki, Kawasaki, Fukuoka",
        ],
        socials: [
          {
            label: "Instagram · @ikedahiloaki",
            href: "https://www.instagram.com/ikedahiloaki/",
          },
          {
            label: "YouTube · @painlabo",
            href: "https://www.youtube.com/@painlabo",
          },
        ],
      }
    : {
        imageSrc: "/ikeda.webp",
        imageAlt: "池田 浩明",
        kicker: "共同代表 · COO",
        name: "池田 浩明",
        nameAlt: "Hiroaki Ikeda",
        role: "共同代表 COO · Bakerization",
        bio: [
          "パンライター。日本のパン文化を最前線で言葉にしてきた、ブレッドギーク / ブレッドコミュニケーター。「パンラボ」主宰。",
        ],
        credentials: [
          "パンラボ 主宰",
          "ブレッドギーク / パンライター",
          "ブレッドコミュニケーター（プロデュース）",
          "NPO法人 新麦コレクション 理事長",
          "福岡県川崎町《パンの道の駅》アドバイザー",
        ],
        socials: [
          {
            label: "Instagram · @ikedahiloaki",
            href: "https://www.instagram.com/ikedahiloaki/",
          },
          {
            label: "YouTube · @painlabo",
            href: "https://www.youtube.com/@painlabo",
          },
        ],
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
      <SectionCover as="h1" title="About" sub="団体情報" no="01" />

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

      <Inner>
        <ContentHeading title="Founders" sub="共同代表" />
        <FounderCard founder={hatanaka} t={t} />
        <FounderCard founder={ikeda} t={t} />
      </Inner>

      <Inner className="mob-pad-v-sm" style={{ paddingTop: 96, paddingBottom: 120 }}>
        <section
          className="mob-1col"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
          }}
        >
          <div>
            <ContentHeading title="Statement" sub="ステートメント" />
            <RuleText style={{ fontSize: 17, color: C.ink }}>{t.statement}</RuleText>
          </div>
          <div>
            <ContentHeading title="Principles" sub="行動原則" />
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {[t.p1, t.p2, t.p3].map((p, i) => (
                <li
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "48px 1fr",
                    gap: 18,
                    alignItems: "center",
                    padding: "18px 0",
                    borderTop: i === 0 ? `1px solid ${C.line}` : "none",
                    borderBottom: `1px solid ${C.line}`,
                  }}
                >
                  <NumberDot n={String(i + 1).padStart(2, "0")} tone={i === 1 ? "green" : "yellow"} size={44} />
                  <span style={{ fontSize: 16, lineHeight: 1.7, color: C.ink }}>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div style={{ marginTop: 72 }}>
          <TextLink href="/">{t.back}</TextLink>
        </div>
      </Inner>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────
   FounderCard — portrait on an offset yellow block + ruled bio.
   A founder without a photo keeps the frame, so a portrait can
   drop in later by setting imageSrc.
   ───────────────────────────────────────────────────────────── */
function FounderCard({
  founder,
  t,
}: {
  founder: Founder;
  t: {
    bioLabel: string;
    credLabel: string;
    socialLabel: string;
  };
}) {
  return (
    <section
      className="mob-founder"
      style={{
        borderTop: `1px solid ${C.ink}`,
        padding: "56px 0 72px",
        display: "grid",
        gridTemplateColumns: "0.85fr 1.55fr",
        gap: 64,
        alignItems: "start",
      }}
    >
      <div>
        <div style={{ position: "relative", marginRight: 18, marginBottom: 18 }}>
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
            {founder.imageSrc ? (
              <Image
                src={founder.imageSrc}
                alt={founder.imageAlt ?? ""}
                fill
                sizes="(max-width: 880px) 100vw, 420px"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <span aria-hidden style={{ width: "46%", aspectRatio: "1", borderRadius: "50%", background: C.main }} />
            )}
          </div>
        </div>
        <div style={{ ...labelText, marginTop: 28, color: C.sub }}>{founder.kicker}</div>
        <div style={{ marginTop: 12, fontSize: 26, fontWeight: 700, color: C.ink }}>{founder.name}</div>
        <div style={{ marginTop: 4, fontSize: 13, color: C.sub }}>{founder.nameAlt}</div>
        <div style={{ ...labelText, marginTop: 10, color: C.ink }}>{founder.role}</div>
      </div>

      <div>
        <SubLabel>{t.bioLabel}</SubLabel>
        <RuleText>
          {founder.bio.map((p, i) => (
            <p key={i} style={{ margin: i === 0 ? 0 : "20px 0 0", color: C.ink }}>
              {p}
            </p>
          ))}
        </RuleText>

        {founder.credentials && (
          <>
            <SubLabel style={{ marginTop: 40 }}>{t.credLabel}</SubLabel>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {founder.credentials.map((c, i) => (
                <li
                  key={i}
                  style={{
                    padding: "10px 0",
                    borderTop: i === 0 ? `1px solid ${C.line}` : "none",
                    borderBottom: `1px solid ${C.line}`,
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: C.ink,
                    display: "grid",
                    gridTemplateColumns: "24px 1fr",
                    gap: 12,
                  }}
                >
                  <span aria-hidden>—</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {founder.socials && founder.socials.length > 0 && (
          <>
            <SubLabel style={{ marginTop: 40 }}>{t.socialLabel}</SubLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {founder.socials.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...labelText,
                    padding: "10px 16px",
                    borderRadius: 999,
                    border: `1px solid ${C.ink}`,
                    color: C.ink,
                    textDecoration: "none",
                  }}
                >
                  {s.label} ↗
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
