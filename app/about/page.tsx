import Link from "next/link";
import { getServerLocale } from "@/lib/i18n";
import { C, FONTS } from "@/lib/theme";

export const metadata = {
  title: "団体情報 | Bakerization",
  description:
    "Bakerizationの共同代表プロフィール、ステートメント、行動原則。",
};

type Credential = string;
type SocialLink = { label: string; href: string };

type Founder = {
  imageSrc: string;
  imageAlt: string;
  kicker: string;
  name: string;
  nameAlt: string;
  role: string;
  bio: string[];
  credentials?: Credential[];
  socials?: SocialLink[];
};

export default async function AboutPage() {
  const locale = await getServerLocale();
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
        opEdLabel: "Op-ed · Founder's words",
        opEdTitle: "A morning that smells of wheat, into the next century.",
        quote:
          "A morning that smells of wheat — may it remain in the 22nd century too. Baking has carried mornings in our towns for generations. We don't want to lighten the craft — we want to give it a shape that can continue. Data and systems, in the end, exist for people.",
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
        opEdLabel: "Op-ed · 寄稿",
        opEdTitle: "小麦の香りがする朝を、22世紀にも。",
        quote:
          "小麦の香りがする朝を、22世紀にも楽しめるように。「焼く」という営みは、街の朝を支えてきました。私たちは、その手仕事の重さを軽くするのではなく、続けられる形に整えたい。データも仕組みも、結局は人のためにあります。",
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
        imageSrc: "/kenji.jpeg",
        imageAlt: "Kenji Hatanaka",
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
        imageSrc: "/kenji.jpeg",
        imageAlt: "畑中 健司",
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
        imageSrc: "/ikeda.jpeg",
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
        imageSrc: "/ikeda.jpeg",
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
        paddingTop: 96,
      }}
    >
      <div
        style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 64px 96px" }}
      >
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

        {/* Op-ed slab — shared founders' quote */}
        <section
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
            {t.opEdLabel}
          </div>
          <h2
            style={{
              margin: 0,
              fontFamily: FONTS.display,
              fontSize: 52,
              lineHeight: 1.15,
              letterSpacing: -1.5,
              fontWeight: 700,
              color: C.onSlab,
            }}
          >
            {t.opEdTitle}
          </h2>
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
              fontFamily: FONTS.display,
              fontSize: 24,
              lineHeight: 1.7,
              margin: 0,
              fontWeight: 500,
              color: C.onSlab,
              maxWidth: 880,
            }}
          >
            {t.quote}
          </p>
        </section>

        {/* Founder cards */}
        <FounderCard founder={hatanaka} t={t} primary />
        <FounderCard founder={ikeda} t={t} />

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

/* ─────────────────────────────────────────────────────────────
   FounderCard — framed portrait + bio + (optional) credentials/socials
   ───────────────────────────────────────────────────────────── */
function FounderCard({
  founder,
  t,
  primary = false,
}: {
  founder: Founder;
  t: {
    bioLabel: string;
    credLabel: string;
    socialLabel: string;
  };
  primary?: boolean;
}) {
  return (
    <section
      style={{
        marginTop: 56,
        background: primary ? C.slab : C.card,
        color: primary ? C.onSlab : C.ink,
        padding: 48,
        display: "grid",
        gridTemplateColumns: "0.85fr 1.55fr",
        gap: 56,
        alignItems: "start",
        border: primary ? "none" : `1.5px solid ${C.line}`,
      }}
    >
      <div>
        <div style={{ background: C.accent, padding: 12 }}>
          <div style={{ width: "100%", aspectRatio: "4/5", overflow: "hidden" }}>
            <img
              src={founder.imageSrc}
              alt={founder.imageAlt}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "saturate(1.05) contrast(1.05)",
              }}
            />
          </div>
        </div>
        <div
          style={{
            marginTop: 16,
            fontFamily: FONTS.mono,
            fontSize: 11,
            letterSpacing: "0.24em",
            color: primary ? C.onSlab : C.sub,
            opacity: 0.75,
            textTransform: "uppercase",
          }}
        >
          {founder.kicker}
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 26,
            fontWeight: 700,
            color: primary ? C.onSlab : C.ink,
          }}
        >
          {founder.name}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            color: primary ? C.onSlab : C.sub,
            opacity: 0.7,
          }}
        >
          {founder.nameAlt}
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
          {founder.role}
        </div>
      </div>

      <div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 11,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: C.accent,
            marginBottom: 16,
          }}
        >
          ▎{t.bioLabel}
        </div>
        {founder.bio.map((p, i) => (
          <p
            key={i}
            style={{
              fontSize: 16,
              lineHeight: 1.95,
              margin: i === 0 ? 0 : "20px 0 0",
              color: primary ? C.onSlab : C.ink,
            }}
          >
            {p}
          </p>
        ))}

        {founder.credentials && (
          <>
            <div
              style={{
                marginTop: 36,
                fontFamily: FONTS.mono,
                fontSize: 11,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: C.accent,
                marginBottom: 14,
              }}
            >
              ▎{t.credLabel}
            </div>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              {founder.credentials.map((c, i) => (
                <li
                  key={i}
                  style={{
                    padding: "10px 0",
                    borderTop:
                      i === 0
                        ? `1px solid ${
                            primary ? "rgba(246,231,201,0.18)" : C.line
                          }`
                        : "none",
                    borderBottom: `1px solid ${
                      primary ? "rgba(246,231,201,0.18)" : C.line
                    }`,
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: primary ? C.onSlab : C.ink,
                    display: "grid",
                    gridTemplateColumns: "24px 1fr",
                    gap: 12,
                  }}
                >
                  <span style={{ color: C.accent, fontWeight: 700 }}>—</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {founder.socials && founder.socials.length > 0 && (
          <>
            <div
              style={{
                marginTop: 36,
                fontFamily: FONTS.mono,
                fontSize: 11,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: C.accent,
                marginBottom: 14,
              }}
            >
              ▎{t.socialLabel}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {founder.socials.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    padding: "10px 14px",
                    border: `1px solid ${
                      primary ? "rgba(246,231,201,0.32)" : C.line
                    }`,
                    color: primary ? C.onSlab : C.ink,
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
