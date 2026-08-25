import Link from "next/link";
import { C, FONTS } from "@/lib/theme";
import { APP, COMPANY, COMPANY_ADDRESS } from "@/lib/company";
import { getServerLocale, Locale } from "@/lib/i18n";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return locale === "en"
    ? {
        title: `About ${APP.name} | Bakerization`,
        description: `What ${APP.name}, a mixing recorder for bakeries by Bakerization, does — its features, how you sign in, and what information it collects.`,
      }
    : {
        title: `${APP.name} について | Bakerization`,
        description: `Bakerizationが提供するミキシング記録アプリ ${APP.name} の機能、ログイン方法、取得する情報の概要。`,
      };
}

/* ─────────────────────────────────────────────────────────────
   ページ本文 — 日本語と英語で同じ組みを使う
   ───────────────────────────────────────────────────────────── */
function copyFor(locale: Locale) {
  const isEn = locale === "en";
  return {
    headline: isEn
      ? ["Every mix,", "kept in numbers", "and video."]
      : ["ミキシングを、", "数値と映像で", "残す。"],
    deck: isEn ? (
      <>
        {APP.name} is a working tool for bakeries. A device retrofitted to your
        mixer measures the mixing data and records it alongside the day&apos;s
        conditions. It also reproduces{" "}
        <strong>the optimal mix</strong> for that day automatically, through
        mixer control driven by machine learning and AI.
      </>
    ) : (
      <>
        {APP.name}{" "}
        は、ベーカリー向けの業務用ツールです。ミキサーに後付けしたデバイスが、ミキシングデータを計測し、仕込みの条件とあわせて記録します。また、機械学習・AIを駆使したミキサーの自動制御によって、その日に合わせた
        <strong>最適なミキシング</strong>を自動で再現します。
      </>
    ),
    featuresLabel: isEn ? "What it does" : "このアプリでできること",
    features: isEn
      ? [
          {
            no: "01",
            title: "Measure and record",
            lead: "A device retrofitted to the mixer measures and records what happens during mixing, automatically.",
            items: [
              "Power",
              "Rotation speed",
              "Video from a camera",
              "Audio from a microphone",
              "Room temperature and humidity (measured by a separately purchased thermo-hygrometer)",
            ],
          },
          {
            no: "02",
            title: "Enter",
            lead: "The baker enters the conditions for that day's batch.",
            items: [
              "Recipe and weights (set the recipe in advance and the weights are calculated for you)",
              "Flour temperature, water temperature, final dough temperature, flour lot",
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
          {
            no: "04",
            title: `Control (${APP.name})`,
            lead: "The device controls the mixer automatically to achieve the optimal mix.",
            items: [
              "AI and machine learning",
              "Control of the mixer's rotation speed",
              "Ends the mix at the right moment, using power and video data",
            ],
          },
        ]
      : [
          {
            no: "01",
            title: "計測・記録する",
            lead: "ミキサーに後付けしたデバイスが、ミキシング中の状態を自動で計測し、記録します。",
            items: [
              "電力",
              "回転速度",
              "カメラによる映像",
              "マイクによる録音",
              "室温・湿度（別途購入の温湿度計により計測）",
            ],
          },
          {
            no: "02",
            title: "入力する",
            lead: "その日の仕込みの条件を、職人が入力します。",
            items: [
              "レシピ・重量（事前にレシピを設定すれば、重量を自動で計算します）",
              "粉温度・水温・こね上げ温度・小麦粉ロット",
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
          {
            no: "04",
            title: `制御する（${APP.name}）`,
            lead: "ミキサーをデバイスが自動で制御し、最適なミキシングを実現します。",
            items: [
              "AI・機械学習",
              "ミキサーの回転速度を制御",
              "電力と映像データにより、最適なタイミングでミキシングを終了",
            ],
          },
        ],
    lineupLabel: isEn ? "Product line" : "製品構成",
    lineup: isEn
      ? [
          {
            title: APP.name,
            body: "Measures and records the mixing data, and controls the mixer on top of that.",
          },
          {
            title: `${APP.logName} (early version)`,
            body: "Measures, records and stores the mixing data only. It does not control the mixer.",
          },
        ]
      : [
          {
            title: APP.name,
            body: "ミキシングデータの計測・記録に加えて、ミキサーの制御を行います。",
          },
          {
            title: `${APP.logName}（先行版）`,
            body: "ミキシングデータの計測・記録と保存のみを行います。ミキサーの制御は行いません。",
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
            ["What we receive", "Email address"],
            ["Purpose", "Identifying the account, signing in, resetting the password"],
          ] as [string, string][])
        : ([
            ["取得する情報", "メールアドレス"],
            ["利用目的", "アカウントの識別、ログイン、パスワードの再設定"],
          ] as [string, string][]),
      body1: isEn ? (
        <>
          The email address we receive from your Google account is used{" "}
          <strong>only</strong> to identify the account, to sign you in, and to
          reset your password. We do not receive your profile picture. We do not
          use it for advertising, and we do not sell it to anyone.
        </>
      ) : (
        <>
          Googleアカウントから取得したメールアドレスは、アカウントの識別、ログイン、およびパスワードの再設定
          <strong>のみ</strong>
          に使用します。プロフィール画像は取得しません。広告目的での利用、および第三者への販売は行いません。
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

export default async function AppPage() {
  const locale = await getServerLocale();
  const t = copyFor(locale);

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
              color: C.accent,
            }}
          >
            ▍{APP.name}
          </span>
        </div>

        {/* Headline */}
        <h1
          className="mob-h1"
          style={{
            margin: 0,
            fontFamily: FONTS.display,
            fontSize: 132,
            lineHeight: 0.9,
            letterSpacing: -4,
            fontWeight: 700,
            color: C.ink,
          }}
        >
          {t.headline[0]}
          <br />
          {t.headline[1]}
          <br />
          <span style={{ color: C.accent }}>{t.headline[2]}</span>
        </h1>

        <div
          style={{ marginTop: 32, width: 100, height: 3, background: C.accent }}
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

        {/* プライバシーポリシーへの導線（上部） */}
        <div style={{ marginTop: 28 }}>
          <PolicyLink label={t.policyLink} />
        </div>

        {/* ── できること ── */}
        <SectionLabel style={{ marginTop: 80 }}>{t.featuresLabel}</SectionLabel>

        <section
          className="mob-1col"
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 24,
            alignItems: "start",
          }}
        >
          {t.features.map((f) => (
            <div
              key={f.no}
              className="mob-pad-card"
              style={{
                background: C.card,
                border: `1.5px solid ${C.line}`,
                padding: 36,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 32,
                  fontWeight: 700,
                  color: C.accent,
                  lineHeight: 1,
                }}
              >
                {f.no}
              </div>
              <h2
                style={{
                  margin: "14px 0 0",
                  fontSize: 24,
                  fontWeight: 700,
                  color: C.ink,
                }}
              >
                {f.title}
              </h2>
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: 15,
                  lineHeight: 1.9,
                  color: C.sub,
                }}
              >
                {f.lead}
              </p>
              <ul style={{ listStyle: "none", margin: "20px 0 0", padding: 0 }}>
                {f.items.map((item, i) => (
                  <li
                    key={item}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "22px 1fr",
                      gap: 10,
                      padding: "10px 0",
                      borderTop: i === 0 ? `1px solid ${C.line}` : "none",
                      borderBottom: `1px solid ${C.line}`,
                      fontSize: 15,
                      lineHeight: 1.6,
                      color: C.ink,
                    }}
                  >
                    <span style={{ color: C.accent, fontWeight: 700 }}>—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* ── 製品構成 ── */}
        <SectionLabel style={{ marginTop: 80 }}>{t.lineupLabel}</SectionLabel>
        <div
          className="mob-1col"
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          {t.lineup.map((p) => (
            <Card key={p.title} title={p.title}>
              {p.body}
            </Card>
          ))}
        </div>

        {/* ── ログインについて ── */}
        <SectionLabel style={{ marginTop: 80 }}>{t.loginLabel}</SectionLabel>
        <p
          style={{
            marginTop: 20,
            fontSize: 16,
            lineHeight: 1.95,
            color: C.sub,
            maxWidth: 780,
          }}
        >
          {t.loginLead}
        </p>

        <div
          className="mob-1col"
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Google */}
          <div
            className="mob-pad-card"
            style={{
              background: C.card,
              border: `1.5px solid ${C.line}`,
              padding: 36,
            }}
          >
            <MethodLabel>{t.method} 01</MethodLabel>
            <h3
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                color: C.ink,
              }}
            >
              {t.google.title}
            </h3>
            <DefList rows={t.google.rows} />
            <p
              style={{
                margin: "24px 0 0",
                fontSize: 15,
                lineHeight: 1.9,
                color: C.ink,
              }}
            >
              {t.google.body1}
            </p>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: 15,
                lineHeight: 1.9,
                color: C.ink,
              }}
            >
              {t.google.body2}
            </p>
          </div>

          {/* Email + password */}
          <div
            className="mob-pad-card"
            style={{
              background: C.card,
              border: `1.5px solid ${C.line}`,
              padding: 36,
            }}
          >
            <MethodLabel>{t.method} 02</MethodLabel>
            <h3
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                color: C.ink,
              }}
            >
              {t.password.title}
            </h3>
            <DefList rows={t.password.rows} />
          </div>
        </div>

        {/* 削除方法 */}
        <div
          className="mob-pad-card-lg"
          style={{
            marginTop: 24,
            background: C.card,
            border: `1.5px solid ${C.line}`,
            padding: 40,
          }}
        >
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
            ▎{t.deleteLabel}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.95,
              color: C.ink,
              maxWidth: 880,
            }}
          >
            {t.deleteBody}
          </p>
        </div>

        {/* ── 取得する情報と保存先 ── */}
        <SectionLabel style={{ marginTop: 80 }}>{t.storageLabel}</SectionLabel>
        <div style={{ marginTop: 24 }}>
          {t.storage.map(([what, where], i) => (
            <div
              key={what}
              className="mob-1col"
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1fr",
                gap: 24,
                padding: "20px 0",
                borderTop: i === 0 ? `1px solid ${C.line}` : "none",
                borderBottom: `1px solid ${C.line}`,
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1.7, color: C.ink }}>
                {what}
              </span>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: C.sub,
                }}
              >
                {where}
              </span>
            </div>
          ))}
        </div>
        <p
          style={{
            marginTop: 24,
            fontSize: 16,
            lineHeight: 1.95,
            color: C.sub,
            maxWidth: 780,
          }}
        >
          {t.storageNote}
        </p>
        <div style={{ marginTop: 20 }}>
          <PolicyLink label={t.policyLink} />
        </div>

        {/* ── 事業者情報 ── */}
        <SectionLabel style={{ marginTop: 80 }}>{t.companyLabel}</SectionLabel>
        <div style={{ marginTop: 24, maxWidth: 780 }}>
          <DefList rows={t.companyRows} />
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

/* ─────────────────────────────────────────────────────────────
   Local parts
   ───────────────────────────────────────────────────────────── */
function SectionLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        fontFamily: FONTS.mono,
        fontSize: 11,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: C.accent,
        ...style,
      }}
    >
      ▎{children}
    </div>
  );
}

function MethodLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONTS.mono,
        fontSize: 11,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        color: C.accent,
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="mob-pad-card"
      style={{
        background: C.card,
        border: `1.5px solid ${C.line}`,
        padding: 36,
      }}
    >
      <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.ink }}>
        {title}
      </h3>
      <p
        style={{
          margin: "14px 0 0",
          fontSize: 16,
          lineHeight: 1.95,
          color: C.sub,
        }}
      >
        {children}
      </p>
    </div>
  );
}

function DefList({ rows }: { rows: [string, string][] }) {
  return (
    <dl style={{ margin: "20px 0 0" }}>
      {rows.map(([k, v], i) => (
        <div
          key={k}
          className="mob-1col"
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: 16,
            padding: "12px 0",
            borderTop: i === 0 ? `1px solid ${C.line}` : "none",
            borderBottom: `1px solid ${C.line}`,
          }}
        >
          <dt
            style={{
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.sub,
              lineHeight: 1.9,
            }}
          >
            {k}
          </dt>
          <dd
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.8,
              color: C.ink,
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
    <Link
      href="/privacy"
      style={{
        display: "inline-block",
        fontFamily: FONTS.mono,
        fontSize: 12,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        padding: "14px 20px",
        border: `1px solid ${C.accent}`,
        color: C.accent,
        textDecoration: "none",
      }}
    >
      {label}
    </Link>
  );
}
