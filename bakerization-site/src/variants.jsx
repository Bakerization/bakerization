// variants.jsx — Five editorial directions for the Bakerization top page.
// Each <TopPage theme={theme}/> renders a full landing mockup at 1280px wide.

const THEMES = [
  {
    id: "v1-warm-serif",
    name: "01 · Warm Editorial",
    sub: "雑誌の特集扉。明朝主役、紙のトーン。",
    palette: {
      bg: "#efe5cf",
      paper: "#faf3e0",
      card: "#fffaee",
      ink: "#1f1407",
      sub: "#6e553a",
      line: "#cfb98c",
      rule: "#9a8557",
      accent: "#a3401d",
      tag: "#7a3315",
    },
    fonts: {
      display: '"Cormorant Garamond", "Shippori Mincho", "Noto Serif JP", serif',
      body: '"Zen Kaku Gothic Antique", "Noto Sans JP", sans-serif',
      mono: '"JetBrains Mono", ui-monospace, monospace',
    },
    italicDisplay: true,
    layout: {
      hero: "masthead-center",
      heroFilter: "saturate(.85) contrast(1.05) brightness(.78)",
      heroOverlay: "rgba(20,12,4,.42)",
      about: "two-col-figured",
      services: "numbered-list",
      blog: "stacked-large",
      ikeda: "portrait-left-quote",
      contact: "centered-rule",
    },
  },
  {
    id: "v2-cool-gothic",
    name: "02 · Cool Grid",
    sub: "クールジャーナル。グリッド、細線、ゴシック。",
    palette: {
      bg: "#e9eef3",
      paper: "#f4f7fa",
      card: "#ffffff",
      ink: "#0c1a2b",
      sub: "#54647a",
      line: "#bfcadb",
      rule: "#6e8099",
      accent: "#1f4d8f",
      tag: "#0e3463",
    },
    fonts: {
      display: '"Manrope", "Noto Sans JP", sans-serif',
      body: '"Manrope", "Noto Sans JP", sans-serif',
      mono: '"JetBrains Mono", ui-monospace, monospace',
    },
    italicDisplay: false,
    layout: {
      hero: "split-right-image",
      heroFilter: "saturate(.45) hue-rotate(190deg) brightness(.75) contrast(1.05)",
      heroOverlay: "rgba(8,18,32,.35)",
      about: "three-col",
      services: "grid-cards",
      blog: "row-with-thumbs",
      ikeda: "stacked-quote",
      contact: "split-form",
    },
  },
  {
    id: "v3-mono-serif",
    name: "03 · Mono Photobook",
    sub: "モノクロ写真集。余白、明朝、静けさ。",
    palette: {
      bg: "#f7f6f3",
      paper: "#ffffff",
      card: "#ffffff",
      ink: "#0a0a0a",
      sub: "#6e6e6e",
      line: "#d8d8d4",
      rule: "#1a1a1a",
      accent: "#0a0a0a",
      tag: "#1a1a1a",
    },
    fonts: {
      display: '"EB Garamond", "Shippori Mincho", "Noto Serif JP", serif',
      body: '"Shippori Mincho", "Noto Serif JP", serif',
      mono: '"JetBrains Mono", ui-monospace, monospace',
    },
    italicDisplay: true,
    layout: {
      hero: "bottom-overlay-mono",
      heroFilter: "grayscale(1) contrast(1.05) brightness(.82)",
      heroOverlay: "rgba(0,0,0,.18)",
      about: "stacked-large",
      services: "wide-rule-rows",
      blog: "minimal-index",
      ikeda: "duotone-portrait",
      contact: "single-line",
    },
  },
  {
    id: "v4-warm-gothic",
    name: "04 · Warm Bold",
    sub: "現代のパン屋ジャーナル。太字ゴシック、色面。",
    palette: {
      bg: "#ebdcc1",
      paper: "#f6e9cf",
      card: "#fff5dc",
      ink: "#1c0e02",
      sub: "#6b4d2a",
      line: "#c7a973",
      rule: "#1c0e02",
      accent: "#c8451a",
      tag: "#1c0e02",
    },
    fonts: {
      display: '"Space Grotesk", "Zen Kaku Gothic Antique", "Noto Sans JP", sans-serif',
      body: '"Zen Kaku Gothic Antique", "Noto Sans JP", sans-serif',
      mono: '"JetBrains Mono", ui-monospace, monospace',
    },
    italicDisplay: false,
    layout: {
      hero: "blockprint-bold",
      heroFilter: "saturate(1.05) contrast(1.1) brightness(.85)",
      heroOverlay: "rgba(28,14,2,.18)",
      about: "two-col-block",
      services: "color-block-cards",
      blog: "horizontal-strip",
      ikeda: "framed-portrait",
      contact: "block-button",
    },
  },
  {
    id: "v5-cool-serif",
    name: "05 · Newspaper",
    sub: "新聞風。罫線、コラム、明朝の見出し。",
    palette: {
      bg: "#e9ede4",
      paper: "#f3f0e4",
      card: "#fbf8ec",
      ink: "#0e1812",
      sub: "#566054",
      line: "#aab1a4",
      rule: "#1a2620",
      accent: "#1f5037",
      tag: "#1f5037",
    },
    fonts: {
      display: '"DM Serif Display", "Noto Serif JP", serif',
      masthead: '"DM Serif Display", "Noto Serif JP", serif',
      body: '"Noto Sans JP", sans-serif',
      mono: '"JetBrains Mono", ui-monospace, monospace',
    },
    italicDisplay: false,
    layout: {
      hero: "newspaper-masthead",
      heroFilter: "grayscale(.6) contrast(1.05) sepia(.15)",
      heroOverlay: "rgba(14,24,18,.28)",
      about: "column-rules",
      services: "column-list",
      blog: "newspaper-cols",
      ikeda: "byline-portrait",
      contact: "classified",
    },
  },
  {
    id: "v4b-warm-bold-poster",
    name: "04b · Warm Bold · Poster",
    sub: "インバート気味の色面、ポスター的な誌面。",
    palette: {
      bg: "#1b0e02",
      paper: "#f4e5c8",
      card: "#2a1707",
      ink: "#f4e5c8",
      sub: "#c4a473",
      line: "#503a1c",
      rule: "#f4e5c8",
      accent: "#e85b22",
      tag: "#f4e5c8",
    },
    fonts: {
      display: '"Space Grotesk", "Zen Kaku Gothic Antique", "Noto Sans JP", sans-serif',
      body: '"Zen Kaku Gothic Antique", "Noto Sans JP", sans-serif',
      mono: '"JetBrains Mono", ui-monospace, monospace',
    },
    italicDisplay: false,
    layout: {
      hero: "poster-split",
      heroFilter: "saturate(1.08) contrast(1.12) brightness(.78)",
      heroOverlay: "rgba(0,0,0,.22)",
      about: "feature-spread",
      services: "color-block-cards",
      blog: "horizontal-strip",
      ikeda: "framed-portrait",
      contact: "block-button",
    },
  },
  {
    id: "v5b-newspaper-bold",
    name: "05b · Newspaper · Bold Title",
    sub: "04の書体（Space Grotesk）を新聞紙面に流し込んだ案。",
    palette: {
      bg: "#e9ede4",
      paper: "#f3f0e4",
      card: "#fbf8ec",
      ink: "#0e1812",
      sub: "#566054",
      line: "#aab1a4",
      rule: "#1a2620",
      accent: "#b6442a",
      tag: "#b6442a",
    },
    fonts: {
      display: '"Space Grotesk", "Zen Kaku Gothic Antique", "Noto Sans JP", sans-serif',
      masthead: '"DM Serif Display", "Noto Serif JP", serif',
      body: '"Noto Sans JP", sans-serif',
      mono: '"JetBrains Mono", ui-monospace, monospace',
    },
    italicDisplay: false,
    boldHeadline: true,
    layout: {
      hero: "newspaper-masthead",
      heroFilter: "grayscale(.6) contrast(1.05) sepia(.15)",
      heroOverlay: "rgba(14,24,18,.28)",
      about: "front-page-essay",
      services: "column-list",
      blog: "newspaper-cols",
      ikeda: "byline-portrait",
      contact: "classified",
    },
  },
];

// ─────────────────────────────────────────────────────────────
// Copy content (kept verbatim from the live site, both locales).
// We render JP here; EN sits below as kicker captions.
// ─────────────────────────────────────────────────────────────
const COPY = {
  brand: "Bakerization",
  brandJa: "ベイカーリゼーション",
  issue: "ISSUE 01 — 2026",
  heroTitle: "We Bake the Future.",
  heroSubJa: "Bakerizationはパン屋の社会問題を解決するために生まれた団体です。",
  heroSubEn: "Bakerization was founded to solve social challenges in the bakery industry.",
  ctaPrimary: { ja: "団体情報を見る", en: "Our Information" },
  ctaSecondary: { ja: "活動を見る", en: "See Services" },
  about: {
    label: { ja: "Bakerizationとは何か？", en: "What is Bakerization?" },
    refrain: "WE BAKE THE FUTURE.",
    refrainJa: "私たちは、未来を焼いている。",
    lead:
      "Bakerizationは、東大パン研究会と「パンラボ」池田浩明が出会い、始まった運動です。",
    question: "22世紀には、どんなパン屋さんがあるでしょうか？",
    paragraphs: [
      "技術革新や国際情勢の不安定化によって、サステナブルで優しい地球を守っていくことは、どんどん難しくなっています。",
      "Global Carbon Projectのデータでは、人間が今のままの経済活動を続けていくと、2030年ごろには地球に残された二酸化炭素の排出余地が限界を迎えてしまうといいます。",
      "それだけではありません。現代の資本主義経済のなかで、様々な職人文化が、いま失われようとしています。漆器、鉄器、博物館の展示品、さらにはパティシエの文化や日本のパン技術もその一つです。",
      "日本のパンは16世紀の出島への伝来以来、あんぱんやメロンパン、様々なお食事パンまで、独自の進化を遂げてきました。近年、日本のパンはついに芸術的な領域へと達し、その技術力はアジア各地のみならず、全世界に波及しています。",
      "しかし、いま、日本のパン文化は構造的な危機に直面しています。2019年から始まる労働法の改正、気候変動、国際情勢の不安定化による原価の高騰——。Bakerizationはそのような問題に正面から立ち向かい、日本の素晴らしいパン文化を守っていきたいと考えています。",
    ],
    closing: [
      "宇宙の全てのパン好きのために、Bakerizationは今日も文化を紡ぎ続けます。",
      "Bakerizationは日本のパン文化を世界に広げ、22世紀のパン屋さんを創造します。",
    ],
    facts: [
      { kicker: "2030", label: "炭素排出余地の限界", source: "Source — Global Carbon Project" },
      { kicker: "2019—", label: "労働法改正以降", source: "現場のひずみが顕在化" },
      { kicker: "1600s", label: "出島へのパン伝来", source: "日本のパン、独自進化の起点" },
    ],
  },
  services: {
    label: { ja: "活動内容", en: "What We Do" },
    titleJa: "パン屋のための、やさしい実装。",
    titleEn: "Gentle implementation for bakeries.",
    items: [
      {
        num: "01",
        ja: "店舗オペレーション支援",
        en: "Store Operations Support",
        body:
          "フローを設計し、パン屋さんのコンサルティングや店舗開発を担当します。",
        bodyEn:
          "We redesign prep planning, inventory control, and demand forecasting into sustainable daily workflows.",
      },
      {
        num: "02",
        ja: "データの可視化",
        en: "Data Visibility & Improvement",
        body:
          "AIや機械学習を用いたパン専用工学デバイスの開発、パン屋さんに特化したSaaSの開発をし、パンにまつわる数値を徹底的に可視化します。",
        bodyEn:
          "We provide decision-ready visibility across sales, waste, and time-slot demand.",
      },
      {
        num: "03",
        ja: "パン文化の未来づくり",
        en: "Future of Bakery Culture",
        body:
          "地域や職人の魅力を守りながら、次世代へつながるパン屋のあり方を企画・実装します。",
        bodyEn:
          "We help preserve local craft while implementing systems that connect bakeries to the next generation.",
      },
    ],
  },
  blog: {
    label: { ja: "ジャーナル", en: "Journal" },
    titleJa: "現場から、最新の記録。",
    titleEn: "Latest notes from the field.",
    posts: [
      {
        date: "2026.04.18",
        tag: "現場ノート",
        ja: "仕込みは「読む」もの。需要予測と発酵時間のあいだ。",
        en: "Forecasting bread by reading the day.",
      },
      {
        date: "2026.03.27",
        tag: "事例",
        ja: "下町の小さな店で、廃棄率を3割減らした半年の話。",
        en: "Cutting waste by 30% at a neighborhood bakery.",
      },
      {
        date: "2026.03.05",
        tag: "対談",
        ja: "町のパン屋が地域インフラになるとき。",
        en: "When the corner bakery becomes infrastructure.",
      },
    ],
  },
  ikeda: {
    label: { ja: "代表メッセージ", en: "From the Founder" },
    name: "池田 弘明",
    nameEn: "Hiroaki Ikeda",
    role: "共同代表 COO / Co-founder & COO",
    quoteJa:
      "「焼く」という営みは、街の朝を支えてきました。私たちは、その手仕事の重さを軽くするのではなく、続けられる形に整えたい。データも仕組みも、結局は人のためにあります。",
    quoteEn:
      "Baking has carried mornings in our towns for generations. We don't want to lighten the craft — we want to give it a shape that can continue. Data and systems, in the end, exist for people.",
  },
  contact: {
    label: { ja: "お問い合わせ", en: "Contact" },
    titleJa: "パン屋の未来を、創造しよう",
    titleEn: "Shall we build the future of bakeries together?",
    body:
      "小さなお店から地域に根ざしたベーカリーまで、現場に合わせた形で課題解決をご提案します。まずはお気軽にご相談ください。",
    bodyEn:
      "From small local bakeries to growing chains, we propose practical solutions tailored to your operations.",
  },
};

// Reusable hairline rule
function Rule({ theme, w = "100%", h = 1, opacity = 1, style = {} }) {
  return (
    <div style={{ width: w, height: h, background: theme.palette.line, opacity, ...style }} />
  );
}

function Kicker({ children, theme, color }) {
  return (
    <span
      style={{
        fontFamily: theme.fonts.mono,
        fontSize: 11,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: color || theme.palette.sub,
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// NAV — shared but type/colors driven by theme
// ─────────────────────────────────────────────────────────────
function Nav({ theme }) {
  const items = ["Home", "About", "Services", "Journal", "Contact"];
  return (
    <div
      style={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 56px",
        background: "transparent",
      }}
    >
      <div
        style={{
          fontFamily: theme.fonts.display,
          fontSize: 22,
          fontStyle: theme.italicDisplay ? "italic" : "normal",
          fontWeight: 500,
          letterSpacing: 0.3,
          color: theme.palette.ink,
        }}
      >
        {COPY.brand}
      </div>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          gap: 26,
          fontFamily: theme.fonts.mono,
          fontSize: 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: theme.palette.sub,
        }}
      >
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
        <li style={{ color: theme.palette.accent }}>JA / EN</li>
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HERO — five different framings
// ─────────────────────────────────────────────────────────────
function Hero({ theme }) {
  const { layout, palette, fonts } = theme;
  const heroImg = (extra = {}) => (
    <img
      src="assets/top.jpeg"
      alt=""
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: layout.heroFilter,
        ...extra,
      }}
    />
  );

  if (layout.hero === "masthead-center") {
    return (
      <section style={{ position: "relative", height: 820, overflow: "hidden" }}>
        {heroImg()}
        <div style={{ position: "absolute", inset: 0, background: layout.heroOverlay }} />
        {/* masthead bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "18px 56px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgba(255,250,238,.82)",
            borderBottom: `1px solid rgba(255,250,238,.32)`,
          }}
        >
          <span>{COPY.issue}</span>
          <span style={{ fontFamily: fonts.display, fontStyle: "italic", fontSize: 16, letterSpacing: 0, textTransform: "none" }}>
            — A Quiet Field Journal for Bakers —
          </span>
          <span>SHOWA · TOKYO · OSAKA</span>
        </div>
        {/* center stack */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#fbf3df",
            padding: "0 80px",
          }}
        >
          <div style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.32em", marginBottom: 18, opacity: 0.85 }}>
            FEATURE · 特集 · NO. 001
          </div>
          <h1
            style={{
              fontFamily: fonts.display,
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 140,
              lineHeight: 0.96,
              letterSpacing: -2,
              margin: 0,
              textShadow: "0 2px 30px rgba(0,0,0,.25)",
            }}
          >
            We Bake
            <br />
            the Future.
          </h1>
          <div style={{ marginTop: 28, fontSize: 17, fontFamily: theme.fonts.body, maxWidth: 640, lineHeight: 1.85, opacity: 0.92 }}>
            {COPY.heroSubJa}
          </div>
          <div style={{ marginTop: 40, display: "flex", gap: 14 }}>
            <CtaPrimary theme={theme}>{COPY.ctaPrimary.ja}</CtaPrimary>
            <CtaGhost theme={theme}>{COPY.ctaSecondary.ja}</CtaGhost>
          </div>
        </div>
        {/* bottom rule */}
        <div
          style={{
            position: "absolute",
            left: 56,
            right: 56,
            bottom: 32,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "rgba(255,250,238,.7)",
            fontFamily: fonts.mono,
            fontSize: 10,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            borderTop: `1px solid rgba(255,250,238,.3)`,
            paddingTop: 14,
          }}
        >
          <span>↓ Scroll · 下へ</span>
          <span>p. 001 / 014</span>
        </div>
      </section>
    );
  }

  if (layout.hero === "split-right-image") {
    return (
      <section style={{ position: "relative", height: 780, background: palette.paper, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100%" }}>
          <div style={{ padding: "120px 64px 60px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.24em", color: palette.accent, marginBottom: 24 }}>
              ／ BAKERIZATION  ·  EST. 2025
            </div>
            <h1
              style={{
                fontFamily: fonts.display,
                fontSize: 96,
                lineHeight: 1.02,
                letterSpacing: -2.6,
                fontWeight: 700,
                margin: 0,
                color: palette.ink,
              }}
            >
              We Bake
              <br />
              the&nbsp;Future.
            </h1>
            <div
              style={{
                marginTop: 28,
                width: 80,
                height: 2,
                background: palette.accent,
              }}
            />
            <p style={{ marginTop: 28, fontSize: 16, lineHeight: 1.95, color: palette.sub, maxWidth: 460, margin: "28px 0 0" }}>
              {COPY.heroSubJa}
            </p>
            <div style={{ marginTop: 40, display: "flex", gap: 12, alignItems: "center" }}>
              <CtaPrimary theme={theme}>{COPY.ctaPrimary.ja}</CtaPrimary>
              <CtaGhost theme={theme}>{COPY.ctaSecondary.ja}</CtaGhost>
            </div>
            {/* spec line */}
            <div style={{ marginTop: 56, display: "flex", gap: 32, fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: palette.sub }}>
              <span>01 — FIELD</span>
              <span>02 — DATA</span>
              <span>03 — COMMUNITY</span>
            </div>
          </div>
          <div style={{ position: "relative", overflow: "hidden" }}>
            {heroImg({ filter: layout.heroFilter })}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, " + palette.paper + " -5%, transparent 30%)" }} />
            <div style={{ position: "absolute", left: 24, bottom: 24, color: "rgba(255,255,255,.85)", fontFamily: fonts.mono, fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase" }}>
              Fig. 01 — Bakery counter, morning light
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (layout.hero === "bottom-overlay-mono") {
    return (
      <section style={{ position: "relative", height: 880, overflow: "hidden", background: palette.bg }}>
        {/* photo top */}
        <div style={{ position: "absolute", inset: "0 0 38% 0", overflow: "hidden" }}>
          {heroImg()}
          <div style={{ position: "absolute", inset: 0, background: layout.heroOverlay }} />
          <div style={{ position: "absolute", top: 28, left: 56, right: 56, display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,.9)", fontFamily: fonts.mono, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase" }}>
            <span>— Plate I</span>
            <span>BAKERIZATION · A FIELD STUDY</span>
            <span>2026</span>
          </div>
        </div>
        {/* white slab */}
        <div style={{ position: "absolute", inset: "62% 0 0 0", background: palette.paper, padding: "60px 64px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>
            <h1
              style={{
                fontFamily: fonts.display,
                fontSize: 92,
                fontStyle: "italic",
                lineHeight: 0.96,
                letterSpacing: -2,
                fontWeight: 500,
                margin: 0,
                color: palette.ink,
              }}
            >
              We Bake
              <br />
              the Future.
            </h1>
            <div>
              <Kicker theme={theme}>Statement · 主旨</Kicker>
              <p style={{ margin: "16px 0 0", fontSize: 18, lineHeight: 2, color: palette.ink, fontFamily: fonts.body }}>
                {COPY.heroSubJa}
              </p>
              <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
                <CtaPrimary theme={theme}>{COPY.ctaPrimary.ja}</CtaPrimary>
                <CtaGhost theme={theme}>{COPY.ctaSecondary.ja}</CtaGhost>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (layout.hero === "blockprint-bold") {
    return (
      <section style={{ position: "relative", height: 820, overflow: "hidden", background: palette.ink }}>
        {/* photo, top right block */}
        <div style={{ position: "absolute", top: 0, right: 0, width: "58%", height: "100%", overflow: "hidden" }}>
          {heroImg()}
          <div style={{ position: "absolute", inset: 0, background: layout.heroOverlay }} />
        </div>
        {/* left block */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "44%", height: "100%", background: palette.accent }} />
        {/* content */}
        <div style={{ position: "absolute", inset: 0, padding: "120px 64px 60px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ color: palette.paper, maxWidth: 700 }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.32em", textTransform: "uppercase", marginBottom: 24 }}>
              ▍BAKERIZATION  ·  2025—
            </div>
            <h1
              style={{
                fontFamily: fonts.display,
                fontSize: 132,
                lineHeight: 0.92,
                letterSpacing: -4,
                fontWeight: 700,
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              We Bake<br />the&nbsp;Future.
            </h1>
            <div style={{ marginTop: 32, fontFamily: theme.fonts.body, fontSize: 17, lineHeight: 1.9, maxWidth: 520 }}>
              {COPY.heroSubJa}
            </div>
            <div style={{ marginTop: 40, display: "flex", gap: 12 }}>
              <CtaPrimary theme={theme}>{COPY.ctaPrimary.ja}</CtaPrimary>
              <CtaGhost theme={theme}>{COPY.ctaSecondary.ja}</CtaGhost>
            </div>
          </div>
          {/* bottom band */}
          <div style={{ display: "flex", justifyContent: "space-between", color: palette.paper, fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", opacity: 0.85 }}>
            <span>↓ KEEP READING</span>
            <span>FEATURE.001  ·  PAGES 14</span>
          </div>
        </div>
      </section>
    );
  }

  // newspaper-masthead
  if (layout.hero === "newspaper-masthead") {
  const bold = theme.boldHeadline;
  return (
    <section style={{ position: "relative", padding: "32px 56px 48px", background: palette.paper }}>
      {/* Masthead */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `2px solid ${palette.rule}`, paddingBottom: 16 }}>
        <span style={{ fontFamily: theme.fonts.body, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.sub }}>
          Vol. I — No. 01
        </span>
        <h1
          style={{
            margin: 0,
            fontFamily: fonts.masthead || fonts.display,
            fontSize: 72,
            lineHeight: 1,
            letterSpacing: -1,
            color: palette.ink,
            fontWeight: 400,
          }}
        >
          The Bakerization Times
        </h1>
        <span style={{ fontFamily: theme.fonts.body, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.sub }}>
          15 MAY · 2026
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: theme.fonts.body, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.sub, padding: "8px 0 18px", borderBottom: `1px solid ${palette.line}` }}>
        <span>パン屋のための、やさしい新聞</span>
        <span>A QUIET PAPER FOR BAKERS · ¥0</span>
      </div>
      {/* Headline + photo */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 40, marginTop: 28, alignItems: "start" }}>
        <div>
          <span style={{ fontFamily: theme.fonts.body, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: palette.accent }}>
            Front Page — 巻頭
          </span>
          <h2
            style={{
              fontFamily: fonts.display,
              fontSize: bold ? 132 : 110,
              lineHeight: bold ? 0.9 : 0.95,
              letterSpacing: bold ? -4 : -2.5,
              color: palette.ink,
              margin: "12px 0 0",
              fontWeight: bold ? 700 : 400,
              textTransform: bold ? "uppercase" : "none",
            }}
          >
            {bold ? <>WE BAKE<br />THE&nbsp;FUTURE.</> : <>We Bake<br />the Future.</>}
          </h2>
          <Rule theme={theme} style={{ margin: "24px 0", background: palette.rule, height: 2 }} />
          <div style={{ columns: 2, columnGap: 30, fontSize: 14, lineHeight: 1.85, color: palette.ink }}>
            <p style={{ margin: 0, fontFamily: theme.fonts.body }}>
              <span style={{ float: "left", fontFamily: fonts.masthead || fonts.display, fontSize: 48, lineHeight: 0.8, paddingRight: 6, paddingTop: 4 }}>B</span>
              akerizationは東大パン研究会とパンラボ池田浩明が出会い、始まった運動です。人手不足、食品ロス、そして地域の朝を支える小さな店の継続。
            </p>
            <p style={{ margin: "12px 0 0", fontFamily: theme.fonts.body }}>
              私たちは22世紀を追いながら、作り手が「焼くこと」に集中できる仕組みを、ひとつずつ整えていきます。
            </p>
          </div>
          <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
            <CtaPrimary theme={theme}>{COPY.ctaPrimary.ja}</CtaPrimary>
            <CtaGhost theme={theme}>{COPY.ctaSecondary.ja}</CtaGhost>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ position: "relative", height: 460, overflow: "hidden", border: `1px solid ${palette.line}` }}>
            {heroImg()}
          </div>
          <div style={{ fontFamily: theme.fonts.body, fontSize: 11, color: palette.sub, marginTop: 8, fontStyle: "italic" }}>
            ▌Fig. 01 — 朝の店頭。焼きあがったパンが並ぶカウンター。
          </div>
        </div>
      </div>
    </section>
  );
  }

  // poster-split (v4b) — photo right, dark warm color block left, huge title
  const intensity = theme._tweaks?.headlineIntensity || "bold";
  const headlineSize = intensity === "loud" ? 196 : intensity === "quiet" ? 128 : 168;
  const headlineLh   = intensity === "loud" ? 0.82 : intensity === "quiet" ? 0.92 : 0.84;
  const headlineLs   = intensity === "loud" ? -7   : intensity === "quiet" ? -4    : -6;
  return (
    <section style={{ position: "relative", height: 880, overflow: "hidden", background: palette.bg }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100%" }}>
        {/* Left dark panel */}
        <div style={{ background: palette.bg, color: palette.ink, padding: "96px 60px 48px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
          {/* corner labels */}
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: palette.sub }}>
            <span style={{ color: palette.accent }}>■ BAKERIZATION</span>
            <span>FEATURE.001</span>
          </div>

          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 12, letterSpacing: "0.32em", textTransform: "uppercase", color: palette.sub, marginBottom: 26 }}>
              — A MANIFESTO FOR JAPANESE BREAD
            </div>
            <h1
              style={{
                fontFamily: fonts.display,
                fontSize: headlineSize,
                lineHeight: headlineLh,
                letterSpacing: headlineLs,
                fontWeight: 700,
                margin: 0,
                color: palette.ink,
                textTransform: "uppercase",
              }}
            >
              We<br />Bake<br />the<br /><span style={{ color: palette.accent }}>Future.</span>
            </h1>
            <div style={{ marginTop: 32, width: 80, height: 2, background: palette.accent }} />
            <p style={{ marginTop: 26, fontSize: 17, lineHeight: 1.95, color: palette.sub, maxWidth: 460 }}>
              {COPY.heroSubJa}
            </p>
            <div style={{ marginTop: 36, display: "flex", gap: 12 }}>
              <CtaPrimary theme={theme}>{COPY.ctaPrimary.ja}</CtaPrimary>
              <CtaGhost theme={theme}>{COPY.ctaSecondary.ja}</CtaGhost>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: palette.sub }}>
            <span>↓ KEEP READING</span>
            <span>EST. 2025</span>
          </div>
        </div>

        {/* Right photo */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          {heroImg()}
          <div style={{ position: "absolute", inset: 0, background: layout.heroOverlay }} />
          {/* tape labels */}
          <div style={{ position: "absolute", left: 32, bottom: 32, color: palette.paper, fontFamily: fonts.mono, fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", opacity: 0.92 }}>
            朝の店頭 · The morning counter
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaPrimary({ theme, children }) {
  return (
    <button
      style={{
        background: theme.palette.accent,
        color: theme.palette.paper,
        border: "none",
        padding: "16px 24px",
        fontFamily: theme.fonts.body,
        fontSize: 14,
        letterSpacing: 0.4,
        fontWeight: 600,
        cursor: "pointer",
        borderRadius: theme.id.includes("warm-gothic") ? 0 : 4,
      }}
    >
      {children} →
    </button>
  );
}

function CtaGhost({ theme, children }) {
  const onPhoto = theme.layout.hero === "masthead-center" || theme.layout.hero === "blockprint-bold";
  return (
    <button
      style={{
        background: "transparent",
        color: onPhoto ? "#fbf3df" : theme.palette.ink,
        border: `1px solid ${onPhoto ? "rgba(255,250,238,.65)" : theme.palette.line}`,
        padding: "16px 24px",
        fontFamily: theme.fonts.body,
        fontSize: 14,
        letterSpacing: 0.4,
        fontWeight: 500,
        cursor: "pointer",
        borderRadius: theme.id.includes("warm-gothic") ? 0 : 4,
      }}
    >
      {children}
    </button>
  );
}

// Export to window for the next file to extend.
Object.assign(window, { THEMES, COPY, Nav, Hero, Rule, Kicker, CtaPrimary, CtaGhost });
