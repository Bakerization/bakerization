import { C, FONTS } from "@/lib/theme";
import { APP, COMPANY, COMPANY_ADDRESS } from "@/lib/company";
import type { Metadata } from "next";
import { localeFromParams, type Locale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
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
    path: "/app",
    locale,
    title: locale === "en" ? `About ${APP.name}` : `${APP.name} について`,
    description:
      locale === "en"
        ? `What ${APP.name}, a mixing recorder for bakeries by Bakerization, does — its features, how you sign in, and what information it collects.`
        : `Bakerizationが提供するミキシング記録アプリ ${APP.name} の機能、ログイン方法、取得する情報の概要。`,
  });
}

/* ─────────────────────────────────────────────────────────────
   ページ本文 — 日本語と英語で同じ組みを使う
   ───────────────────────────────────────────────────────────── */
function copyFor(locale: Locale) {
  const isEn = locale === "en";
  return {
    headline: isEn
      ? ["Every mix,", "on record,", "to look back on."]
      : ["ミキシングを、", "記録して、", "見返す。"],
    deck: isEn ? (
      <>
        {APP.name} is a working tool for bakeries. It records each day&apos;s
        mixing alongside the batch conditions, so you can look back on them
        later.
      </>
    ) : (
      <>
        {APP.name}{" "}
        は、ベーカリー向けの業務用ツールです。日々のミキシングの様子と仕込みの条件を記録し、あとから見返すことができます。
      </>
    ),
    featuresLabel: isEn ? "What it does" : "このアプリでできること",
    features: isEn
      ? [
          {
            no: "01",
            title: "Record",
            lead: "Records what happens during mixing.",
            items: [
              "Mixing data",
              "Video and audio",
              "Room temperature and humidity (measured by a separately purchased thermo-hygrometer)",
            ],
          },
          {
            no: "02",
            title: "Enter",
            lead: "The baker enters the conditions for that day's batch.",
            items: [
              "Recipe and weights",
              "Batch conditions such as temperatures",
              "An assessment of the dough",
            ],
          },
          {
            no: "03",
            title: "Look back",
            lead: "Everything recorded can be reviewed and shared later.",
            items: [
              "Lists and graphs",
              "CSV export",
              "Playback of saved video and audio",
            ],
          },
        ]
      : [
          {
            no: "01",
            title: "記録する",
            lead: "ミキシングの様子を記録します。",
            items: [
              "ミキシングのデータ",
              "映像・録音",
              "室温・湿度（別途購入の温湿度計により計測）",
            ],
          },
          {
            no: "02",
            title: "入力する",
            lead: "その日の仕込みの条件を、職人が入力します。",
            items: [
              "レシピ・重量",
              "温度などの仕込みの条件",
              "生地の評価",
            ],
          },
          {
            no: "03",
            title: "見返す",
            lead: "記録した内容を、あとから確認・共有できます。",
            items: [
              "一覧・グラフでの表示",
              "CSVでの書き出し",
              "保存した映像・録音の再生",
            ],
          },
        ],
    loginLabel: isEn ? "Signing in" : "ログインについて",
    loginLead: isEn
      ? "You need an account to use it. There are two ways to sign in. Either way, we ask for your shop name, phone number and address when you register."
      : "本アプリのご利用にはログインが必要です。次の2つの方法に対応しています。いずれの場合も、アカウントの登録時に店舗名、電話番号、住所をご入力いただきます。",
    method: isEn ? "Method" : "方法",
    google: {
      title: isEn ? "Sign in with a Google account" : "Googleアカウントでログイン",
      rows: isEn
        ? ([
            ["What we receive", "Email address / name / profile picture"],
            ["What we store", "Email address only"],
            [
              "Purpose",
              "Identifying the account, signing in, resetting the password",
            ],
          ] as [string, string][])
        : ([
            ["受け取る情報", "メールアドレス／氏名／プロフィール画像"],
            ["保存・利用する情報", "メールアドレスのみ"],
            ["利用目的", "アカウントの識別、ログイン、パスワードの再設定"],
          ] as [string, string][]),
      body1: isEn ? (
        <>
          From your Google account we receive your email address, name and
          profile picture. Of these, the only one we store and use is{" "}
          <strong>the email address</strong>, and we use it solely to identify
          the account, to sign you in, and to reset your password. We do not
          store your name or your profile picture. We do not use any of it for
          advertising, and we do not sell it to anyone.
        </>
      ) : (
        <>
          Googleアカウントからは、メールアドレス・氏名・プロフィール画像を受け取ります。このうち当社が保存し利用するのは
          <strong>メールアドレスのみ</strong>
          で、アカウントの識別、ログイン、およびパスワードの再設定のみに使用します。氏名およびプロフィール画像は保存しません。広告目的での利用、および第三者への販売は行いません。
        </>
      ),
      body2: isEn ? (
        <>
          <strong>
            We never access data held in your other Google services
          </strong>{" "}
          — Gmail, Drive, Calendar, Contacts and the rest.
        </>
      ) : (
        <>
          Gmail、Googleドライブ、Googleカレンダー、連絡先など、
          <strong>他のGoogleサービスのデータには一切アクセスしません。</strong>
        </>
      ),
    },
    password: {
      title: isEn
        ? "Sign in with an email address and password"
        : "メールアドレスとパスワードでログイン",
      rows: isEn
        ? ([
            ["What we receive", "Email address / password"],
            ["Purpose", "Identifying the account, signing in, resetting the password"],
          ] as [string, string][])
        : ([
            ["取得する情報", "メールアドレス／パスワード"],
            ["利用目的", "アカウントの識別、ログイン、パスワードの再設定"],
          ] as [string, string][]),
    },
    deleteLabel: isEn ? "How to delete your account" : "削除方法",
    deleteBody: isEn
      ? "You can delete your account yourself at any time, from the settings screen in the app. Deleting it removes your registered information, including anything received from your Google account."
      : "アカウントは、アプリ内の設定画面からいつでもご自身で削除できます。削除すると、Googleアカウントから取得した情報を含む登録情報が削除されます。",
    storageLabel: isEn
      ? "What we collect and where it is kept"
      : "取得する情報と保存先",
    storage: isEn
      ? ([
          [
            "Account information (email address, shop name, phone number, address)",
            "Supabase / Tokyo region (Japan)",
          ],
          [
            "Mixing data, environmental data, entered data",
            "Supabase / Tokyo region (Japan)",
          ],
          ["Video and audio data", "Backblaze B2 / US West region (United States)"],
        ] as [string, string][])
      : ([
          [
            "アカウント情報（メールアドレス、店舗名、電話番号、住所）",
            "Supabase／東京リージョン（日本国内）",
          ],
          [
            "ミキシングデータ・環境データ・入力データ",
            "Supabase／東京リージョン（日本国内）",
          ],
          ["映像データ・録音データ", "Backblaze B2／US Westリージョン（米国）"],
        ] as [string, string][]),
    storageNote: isEn
      ? "The full breakdown of what we collect, why we use it, how long we keep it, how we think about sharing it, and how to delete it, is set out in the privacy policy."
      : "取得する情報の内訳、利用目的、保管期間、第三者提供の考え方、削除の方法については、プライバシーポリシーに記載しています。",
    companyLabel: isEn ? "Business information" : "事業者情報",
    companyRows: (isEn
      ? [
          ["Name", COMPANY.name],
          ...(COMPANY_ADDRESS ? [["Address", COMPANY_ADDRESS]] : []),
          ["Contact", COMPANY.email],
        ]
      : [
          ["事業者名", COMPANY.name],
          ...(COMPANY_ADDRESS ? [["所在地", COMPANY_ADDRESS]] : []),
          ["お問い合わせ", COMPANY.email],
        ]) as [string, string][],
    policyLink: isEn ? "Read the privacy policy →" : "プライバシーポリシーを読む →",
    back: isEn ? "← Back to Home" : "← トップへ戻る",
  };
}

type Copy = ReturnType<typeof copyFor>;

// Section headings pair the English label with the Japanese one in both
// locales (the brand book's "Title / 日本語").
const EN = copyFor("en");
const JA = copyFor("ja");

const cardBox: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.line}`,
  padding: 40,
};

const bodyText: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.9,
  color: C.ink,
};

export default async function AppPage({ params }: Props) {
  const locale = await localeFromParams(params);
  const t = copyFor(locale);

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
      <SectionCover as="h1" title={APP.name} sub="プロダクト" no="01" />

      <Inner className="mob-pad-v-sm" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <HandQuote size={locale === "en" ? 38 : 44}>
          {t.headline[0]}
          <br />
          {t.headline[1]}
          <br />
          {t.headline[2]}
        </HandQuote>
        <BrandBar reach="58%" style={{ marginTop: 32 }} />
        <RuleText style={{ marginTop: 56, maxWidth: 760, fontSize: 18, lineHeight: 1.95, color: C.ink }}>
          {t.deck}
        </RuleText>

        {/* プライバシーポリシーへの導線（上部） */}
        <div style={{ marginTop: 40 }}>
          <PolicyLink label={t.policyLink} />
        </div>
      </Inner>

      <Inner style={{ paddingBottom: 120 }}>
        {/* ── できること ── */}
        <section>
          <ContentHeading title={EN.featuresLabel} sub={JA.featuresLabel} />
          <div
            className="mob-1col"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
              alignItems: "stretch",
            }}
          >
            {t.features.map((f, i) => (
              <div key={f.no} className="mob-pad-card" style={{ background: C.paper, padding: 40 }}>
                <NumberDot n={f.no} tone={i === 1 ? "green" : "yellow"} size={56} />
                <h2
                  style={{
                    margin: "24px 0 0",
                    fontSize: 24,
                    fontWeight: 700,
                    lineHeight: 1.4,
                    color: C.ink,
                  }}
                >
                  {f.title}
                </h2>
                <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.9, color: C.sub }}>{f.lead}</p>
                <ul style={{ listStyle: "none", margin: "24px 0 0", padding: 0 }}>
                  {f.items.map((item, j) => (
                    <li
                      key={item}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "22px 1fr",
                        gap: 10,
                        padding: "11px 0",
                        borderTop: j === 0 ? `1px solid ${C.lineStrong}` : "none",
                        borderBottom: `1px solid ${C.lineStrong}`,
                        fontSize: 15,
                        lineHeight: 1.6,
                        color: C.ink,
                      }}
                    >
                      <span aria-hidden>—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── ログインについて ── */}
        <section style={{ marginTop: 112 }}>
          <ContentHeading title={EN.loginLabel} sub={JA.loginLabel} />
          <p style={{ margin: 0, maxWidth: 860, fontSize: 16, lineHeight: 1.95, color: C.sub }}>{t.loginLead}</p>

          <div
            className="mob-1col"
            style={{
              marginTop: 32,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              alignItems: "start",
            }}
          >
            {/* Google */}
            <div className="mob-pad-card" style={cardBox}>
              <SubLabel>{t.method} 01</SubLabel>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.5, color: C.ink }}>
                {t.google.title}
              </h3>
              <DefList rows={t.google.rows} />
              <p style={{ ...bodyText, margin: "24px 0 0" }}>{t.google.body1}</p>
              <p style={{ ...bodyText, margin: "16px 0 0" }}>{t.google.body2}</p>
            </div>

            {/* Email + password */}
            <div className="mob-pad-card" style={cardBox}>
              <SubLabel>{t.method} 02</SubLabel>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.5, color: C.ink }}>
                {t.password.title}
              </h3>
              <DefList rows={t.password.rows} />
            </div>
          </div>

          {/* 削除方法 */}
          <div className="mob-pad-card" style={{ marginTop: 24, background: C.paper, padding: 40 }}>
            <SubLabel>{t.deleteLabel}</SubLabel>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.95, color: C.ink }}>{t.deleteBody}</p>
          </div>
        </section>

        {/* ── 取得する情報と保存先 ── */}
        <section style={{ marginTop: 112 }}>
          <ContentHeading title={EN.storageLabel} sub={JA.storageLabel} />
          <div>
            {t.storage.map(([what, where], i) => (
              <div
                key={what}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  columnGap: 24,
                  rowGap: 4,
                  padding: "20px 0",
                  borderTop: i === 0 ? `1px solid ${C.ink}` : "none",
                  borderBottom: `1px solid ${C.line}`,
                }}
              >
                <span style={{ flex: "1.6 1 360px", minWidth: 0, fontSize: 16, lineHeight: 1.7, color: C.ink }}>
                  {what}
                </span>
                <span
                  style={{ flex: "1 1 240px", minWidth: 0, fontSize: 14, letterSpacing: "0.02em", lineHeight: 1.9, color: C.sub }}
                >
                  {where}
                </span>
              </div>
            ))}
          </div>
          <p style={{ margin: "28px 0 0", maxWidth: 860, fontSize: 16, lineHeight: 1.95, color: C.sub }}>
            {t.storageNote}
          </p>
          <div style={{ marginTop: 28 }}>
            <PolicyLink label={t.policyLink} />
          </div>
        </section>

        {/* ── 事業者情報 ── */}
        <section style={{ marginTop: 112 }}>
          <ContentHeading title={EN.companyLabel} sub={JA.companyLabel} />
          <div style={{ maxWidth: 860 }}>
            <DefList rows={t.companyRows} top={0} />
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
   Local parts
   ───────────────────────────────────────────────────────────── */
function DefList({ rows, top = 24 }: { rows: [string, string][]; top?: number }) {
  return (
    <dl style={{ margin: `${top}px 0 0` }}>
      {rows.map(([k, v], i) => (
        // Flex-wrap instead of mob-1col: on a narrow card the value drops
        // just under its label instead of 28px away.
        <div
          key={k}
          style={{
            display: "flex",
            flexWrap: "wrap",
            columnGap: 16,
            rowGap: 2,
            padding: "12px 0",
            borderTop: i === 0 ? `1px solid ${C.line}` : "none",
            borderBottom: `1px solid ${C.line}`,
          }}
        >
          <dt style={{ ...labelText, flex: "0 0 150px", lineHeight: "27px", color: C.sub }}>{k}</dt>
          <dd
            style={{
              margin: 0,
              flex: "1 1 200px",
              minWidth: 0,
              fontSize: 15,
              lineHeight: "27px",
              color: C.ink,
              overflowWrap: "anywhere",
            }}
          >
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function PolicyLink({ label }: { label: string }) {
  return (
    <BrandButtonLink href="/privacy" variant="outline" arrow={false}>
      {label}
    </BrandButtonLink>
  );
}
