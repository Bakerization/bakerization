import Link from "next/link";
import { C, FONTS } from "@/lib/theme";
import { APP, COMPANY, COMPANY_ADDRESS } from "@/lib/company";

export const metadata = {
  title: "kiji hub について | Bakerization",
  description:
    "Bakerizationが提供するミキシング記録アプリ kiji hub の機能、ログイン方法、取得する情報の概要。",
};

/* ─────────────────────────────────────────────────────────────
   何ができるか — 4つの機能カード
   ───────────────────────────────────────────────────────────── */
const FEATURES: { no: string; title: string; lead: string; items: string[] }[] =
  [
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
  ];

/* ─────────────────────────────────────────────────────────────
   取得する情報と保存先（概要）— 詳細は /privacy
   ───────────────────────────────────────────────────────────── */
const STORAGE: [string, string][] = [
  [
    "アカウント情報（メールアドレス、店舗名、電話番号、住所）",
    "Supabase／東京リージョン（日本国内）",
  ],
  [
    "ミキシングデータ・環境データ・入力データ",
    "Supabase／東京リージョン（日本国内）",
  ],
  [
    "映像データ・録音データ",
    "Backblaze B2／US Westリージョン（米国）",
  ],
];

export default function AppPage() {
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
              color: C.accent,
            }}
          >
            ▍SECTION VII — {APP.name}
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
            p. 021
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
          ミキシングを、
          <br />
          数値と映像で
          <br />
          <span style={{ color: C.accent }}>残す。</span>
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
          {APP.name} は、ベーカリー向けの業務用ツールです。ミキサーに後付けしたデバイスが、生地のこね上がりまでのミキシングデータを計測し、職人が入力した仕込みの条件とあわせて記録・保存します。
        </p>

        {/* プライバシーポリシーへの導線（上部） */}
        <div style={{ marginTop: 28 }}>
          <PolicyLink />
        </div>

        {/* ── できること ── */}
        <SectionLabel style={{ marginTop: 80 }}>
          このアプリでできること
        </SectionLabel>

        <section
          className="mob-1col"
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            alignItems: "start",
          }}
        >
          {FEATURES.map((f) => (
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
        <SectionLabel style={{ marginTop: 80 }}>製品構成</SectionLabel>
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
          <Card title="kiji hub">
            ミキシングデータの計測・記録に加えて、ミキサーの制御を行います。
          </Card>
          <Card title="kiji hub log（先行版）">
            ミキシングデータの計測・記録と保存のみを行います。ミキサーの制御は行いません。
          </Card>
        </div>

        {/* ── ログインについて ── */}
        <SectionLabel style={{ marginTop: 80 }}>ログインについて</SectionLabel>
        <p
          style={{
            marginTop: 20,
            fontSize: 16,
            lineHeight: 1.95,
            color: C.sub,
            maxWidth: 780,
          }}
        >
          本アプリのご利用にはログインが必要です。次の2つの方法に対応しています。いずれの場合も、アカウントの登録時に店舗名、電話番号、住所をご入力いただきます。
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
              方法 01
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                color: C.ink,
              }}
            >
              Googleアカウントでログイン
            </h3>
            <DefList
              rows={[
                ["取得する情報", "メールアドレス"],
                [
                  "利用目的",
                  "アカウントの識別、ログイン、パスワードの再設定",
                ],
              ]}
            />
            <p
              style={{
                margin: "24px 0 0",
                fontSize: 15,
                lineHeight: 1.9,
                color: C.ink,
              }}
            >
              Googleアカウントから取得したメールアドレスは、アカウントの識別、ログイン、およびパスワードの再設定<strong>のみ</strong>に使用します。プロフィール画像は取得しません。広告目的での利用、および第三者への販売は行いません。
            </p>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: 15,
                lineHeight: 1.9,
                color: C.ink,
              }}
            >
              Gmail、Googleドライブ、Googleカレンダー、連絡先など、<strong>他のGoogleサービスのデータには一切アクセスしません。</strong>
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
              方法 02
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                color: C.ink,
              }}
            >
              メールアドレスとパスワードでログイン
            </h3>
            <DefList
              rows={[
                ["取得する情報", "メールアドレス／パスワード"],
                [
                  "利用目的",
                  "アカウントの識別、ログイン、パスワードの再設定",
                ],
              ]}
            />
          </div>
        </div>

        {/* なぜログインが必要か */}
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
            ▎削除方法
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
            アカウントは、アプリ内の設定画面からいつでもご自身で削除できます。削除すると、Googleアカウントから取得した情報を含む登録情報が削除されます。
          </p>
        </div>

        {/* ── 取得する情報と保存先 ── */}
        <SectionLabel style={{ marginTop: 80 }}>
          取得する情報と保存先
        </SectionLabel>
        <div style={{ marginTop: 24 }}>
          {STORAGE.map(([what, where], i) => (
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
          取得する情報の内訳、利用目的、保管期間、第三者提供の考え方、削除の方法については、プライバシーポリシーに記載しています。
        </p>
        <div style={{ marginTop: 20 }}>
          <PolicyLink />
        </div>

        {/* ── 事業者情報 ── */}
        <SectionLabel style={{ marginTop: 80 }}>事業者情報</SectionLabel>
        <div style={{ marginTop: 24, maxWidth: 780 }}>
          <DefList
            rows={[
              ["事業者名", COMPANY.name],
              ...(COMPANY_ADDRESS
                ? ([["所在地", COMPANY_ADDRESS]] as [string, string][])
                : []),
              ["お問い合わせ", COMPANY.email],
            ]}
          />
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
            ← トップへ戻る
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

function PolicyLink() {
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
      プライバシーポリシーを読む →
    </Link>
  );
}
