// sections.jsx — About / Services / Blog / Ikeda / Contact + Footer
// Reads THEMES + COPY from window (defined in variants.jsx).

function SectionLabel({ theme, children, accent }) {
  return (
    <div style={{
      fontFamily: theme.fonts.mono,
      fontSize: 11,
      letterSpacing: "0.28em",
      textTransform: "uppercase",
      color: accent ? theme.palette.accent : theme.palette.sub,
      marginBottom: 14,
    }}>
      {children}
    </div>
  );
}

function H2({ theme, children, size = 56, style = {} }) {
  return (
    <h2 style={{
      fontFamily: theme.fonts.display,
      fontSize: size,
      lineHeight: 1.08,
      letterSpacing: -1,
      fontStyle: theme.italicDisplay ? "italic" : "normal",
      fontWeight: theme.layout.hero === "blockprint-bold" ? 700 : 500,
      color: theme.palette.ink,
      margin: 0,
      ...style,
    }}>{children}</h2>
  );
}

// ─────────────────────────────────────────────────────────────
// ABOUT
// ─────────────────────────────────────────────────────────────
function About({ theme }) {
  const { layout, palette, fonts } = theme;
  const c = COPY.about;

  // Shared sub-components
  const RefrainBig = ({ color, size = 124, weight = 700, align = "left", spacing = -3 }) => (
    <div
      style={{
        fontFamily: fonts.display,
        fontSize: size,
        lineHeight: 0.9,
        letterSpacing: spacing,
        fontWeight: weight,
        textTransform: "uppercase",
        color: color || palette.ink,
        textAlign: align,
      }}
    >
      WE BAKE<br />THE&nbsp;FUTURE.
    </div>
  );

  const FactBox = ({ inverted }) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 0,
        border: `1.5px solid ${inverted ? palette.paper : palette.ink}`,
        background: inverted ? "transparent" : palette.card,
      }}
    >
      {c.facts.map((f, i) => (
        <div
          key={f.kicker}
          style={{
            padding: "24px 22px",
            borderRight: i < c.facts.length - 1 ? `1.5px solid ${inverted ? palette.paper : palette.ink}` : "none",
            color: inverted ? palette.paper : palette.ink,
          }}
        >
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 44, lineHeight: 1, letterSpacing: -1 }}>
            {f.kicker}
          </div>
          <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
            {f.label}
          </div>
          <div style={{ marginTop: 6, fontFamily: fonts.mono, fontSize: 10, letterSpacing: "0.16em", opacity: 0.7, textTransform: "uppercase" }}>
            {f.source}
          </div>
        </div>
      ))}
    </div>
  );

  // ───────────────────────────────────────────────
  // V4 · two-col-block — manifesto on cream w/ bold blocks
  // ───────────────────────────────────────────────
  if (layout.about === "two-col-block") {
    return (
      <section style={{ padding: "140px 64px 130px", background: palette.paper }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 18, borderBottom: `1.5px solid ${palette.ink}` }}>
          <div style={{ background: palette.ink, color: palette.paper, padding: "10px 14px", fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase" }}>
            ▍{c.label.ja}
          </div>
          <span style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: palette.sub }}>
            §02 — {c.label.en}
          </span>
        </div>

        {/* Title + lead */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 60, marginTop: 56, alignItems: "end" }}>
          <RefrainBig size={138} spacing={-4} />
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: palette.accent, marginBottom: 14 }}>
              ▎LEAD
            </div>
            <p style={{ fontSize: 19, lineHeight: 1.95, color: palette.ink, margin: 0, fontWeight: 500 }}>
              {c.lead}
            </p>
          </div>
        </div>

        {/* Big question — pull quote on accent */}
        <div style={{
          marginTop: 64,
          background: palette.accent,
          color: palette.paper,
          padding: "56px 60px",
        }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 12, letterSpacing: "0.32em", textTransform: "uppercase", opacity: 0.85, marginBottom: 18 }}>
            ↗ QUESTION
          </div>
          <div style={{ fontFamily: fonts.display, fontSize: 76, lineHeight: 1.15, letterSpacing: -2, fontWeight: 700 }}>
            {c.question}
          </div>
        </div>

        {/* Body — 2 columns */}
        <div style={{ marginTop: 72, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
          <div>
            <p style={{ fontSize: 16, lineHeight: 2, color: palette.ink, margin: 0 }}>{c.paragraphs[0]}</p>
            <p style={{ fontSize: 16, lineHeight: 2, color: palette.ink, margin: "28px 0 0" }}>{c.paragraphs[1]}</p>
            <p style={{ fontSize: 16, lineHeight: 2, color: palette.ink, margin: "28px 0 0" }}>{c.paragraphs[2]}</p>
          </div>
          <div>
            <p style={{ fontSize: 16, lineHeight: 2, color: palette.ink, margin: 0 }}>{c.paragraphs[3]}</p>
            <p style={{ fontSize: 16, lineHeight: 2, color: palette.ink, margin: "28px 0 0" }}>{c.paragraphs[4]}</p>
            <div style={{ marginTop: 36 }}>
              <FactBox />
            </div>
          </div>
        </div>

        {/* Closing — ink slab */}
        <div style={{ marginTop: 80, background: palette.ink, color: palette.paper, padding: "64px 60px" }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.32em", textTransform: "uppercase", opacity: 0.6, marginBottom: 22 }}>
            ↘ MANIFESTO / CLOSING
          </div>
          <p style={{ fontFamily: fonts.display, fontSize: 38, lineHeight: 1.5, margin: 0, fontWeight: 500, letterSpacing: -0.5 }}>
            {c.closing[0]}
          </p>
          <p style={{ fontFamily: fonts.display, fontSize: 38, lineHeight: 1.5, margin: "24px 0 0", fontWeight: 700, color: palette.accent, letterSpacing: -0.5 }}>
            {c.closing[1]}
          </p>
        </div>
      </section>
    );
  }

  // ───────────────────────────────────────────────
  // V4b · feature-spread — inverted poster/spread
  // ───────────────────────────────────────────────
  if (layout.about === "feature-spread") {
    return (
      <section style={{ padding: "120px 60px 120px", background: palette.bg, color: palette.ink }}>
        {/* Header strip */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${palette.line}`, borderBottom: `1px solid ${palette.line}`, padding: "16px 0", marginBottom: 64 }}>
          <span style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: palette.accent }}>
            ▍FEATURE.001 — {c.label.ja}
          </span>
          <span style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: palette.sub }}>
            What is Bakerization? / p. 02
          </span>
        </div>

        {/* Big question — left, body right */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase", color: palette.sub, marginBottom: 18 }}>
              ↗ A QUESTION
            </div>
            <h2 style={{
              margin: 0,
              fontFamily: fonts.display,
              fontSize: 96,
              lineHeight: 1.08,
              letterSpacing: -3,
              fontWeight: 700,
              color: palette.ink,
            }}>
              22世紀には、
              <br />
              どんなパン屋さんが
              <br />
              <span style={{ color: palette.accent }}>あるでしょうか？</span>
            </h2>
            <Rule theme={theme} style={{ background: palette.accent, height: 3, width: 100, margin: "40px 0" }} />
            <p style={{ fontSize: 17, lineHeight: 1.95, color: palette.sub, margin: 0, maxWidth: 520 }}>
              {c.lead}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 16, lineHeight: 2, color: palette.ink, margin: 0 }}>{c.paragraphs[0]}</p>
            <p style={{ fontSize: 16, lineHeight: 2, color: palette.ink, margin: "24px 0 0" }}>{c.paragraphs[1]}</p>
            <p style={{ fontSize: 16, lineHeight: 2, color: palette.ink, margin: "24px 0 0" }}>{c.paragraphs[2]}</p>
          </div>
        </div>

        {/* Lower body — 2 columns, with closing folded in */}
        <div style={{ marginTop: 80, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>
          <div>
            <p style={{ fontSize: 16, lineHeight: 2, color: palette.ink, margin: 0 }}>{c.paragraphs[3]}</p>
            <p style={{ fontSize: 16, lineHeight: 2, color: palette.ink, margin: "24px 0 0" }}>
              <span className="mk">宇宙の全てのパン好きのために</span>、<span className="mk">Bakerization</span>は今日も文化を紡ぎ続けます。
            </p>
          </div>
          <div>
            <p style={{ fontSize: 16, lineHeight: 2, color: palette.ink, margin: 0 }}>{c.paragraphs[4]}</p>
            <p style={{ fontSize: 16, lineHeight: 2, color: palette.ink, margin: "24px 0 0" }}>
              <span className="mk">Bakerization</span>は日本のパン文化を世界に広げ、<span className="mk">22世紀のパン屋さん</span>を創造します。
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ───────────────────────────────────────────────
  // V5 · column-rules — newspaper long-form
  // V5b · front-page-essay — newspaper with bold Space Grotesk headline
  // ───────────────────────────────────────────────
  if (layout.about === "column-rules" || layout.about === "front-page-essay") {
    const bold = layout.about === "front-page-essay" || theme.boldHeadline;
    return (
      <section style={{ padding: "60px 56px 80px", background: palette.paper, borderTop: `2px solid ${palette.rule}` }}>
        {/* Section bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 12, borderBottom: `1px solid ${palette.line}` }}>
          <SectionLabel theme={theme} accent>§ Section II — {c.label.ja}</SectionLabel>
          <span style={{ fontFamily: fonts.body, fontSize: 12, color: palette.sub, fontStyle: "italic" }}>
            {c.label.en} · p. 003
          </span>
        </div>

        {/* Sub-deck */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 0 16px", borderBottom: `1px solid ${palette.line}`, marginBottom: 28 }}>
          <span style={{ fontFamily: fonts.body, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.sub }}>
            東大パン研究会 × パンラボ
          </span>
          <span style={{ fontFamily: fonts.body, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.sub }}>
            A movement, est. 2025
          </span>
        </div>

        {/* Big headline */}
        <h2
          style={{
            margin: 0,
            fontFamily: fonts.display,
            fontSize: bold ? 144 : 112,
            lineHeight: bold ? 0.88 : 0.95,
            letterSpacing: bold ? -4 : -2.5,
            color: palette.ink,
            fontWeight: bold ? 700 : 400,
            textTransform: bold ? "uppercase" : "none",
          }}
        >
          {bold ? <>WE BAKE<br />THE&nbsp;FUTURE.</> : <>We Bake<br />the Future.</>}
        </h2>

        {/* Italic deck under headline */}
        <p style={{
          fontFamily: bold ? fonts.body : fonts.masthead || fonts.display,
          fontStyle: bold ? "normal" : "italic",
          fontSize: bold ? 17 : 24,
          fontWeight: bold ? 600 : 400,
          lineHeight: 1.6,
          color: palette.ink,
          margin: "28px 0 0",
          maxWidth: 880,
        }}>
          {c.lead}
        </p>
        <Rule theme={theme} style={{ background: palette.rule, height: 2, margin: "32px 0" }} />

        {/* Body — 4 columns w/ drop cap */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 }}>
          {/* Col 1 — drop cap */}
          <div style={{ borderRight: `1px solid ${palette.line}`, paddingRight: 24 }}>
            <p style={{ fontSize: 14, lineHeight: 1.95, color: palette.ink, margin: 0 }}>
              <span style={{
                float: "left",
                fontFamily: bold ? fonts.display : (fonts.masthead || fonts.display),
                fontWeight: bold ? 700 : 400,
                fontSize: bold ? 62 : 64,
                lineHeight: 0.85,
                paddingRight: 8,
                paddingTop: 4,
                color: palette.accent,
              }}>技</span>
              {c.paragraphs[0]}
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.95, color: palette.ink, margin: "20px 0 0" }}>{c.paragraphs[1]}</p>
          </div>

          {/* Col 2 */}
          <div style={{ borderRight: `1px solid ${palette.line}`, paddingRight: 24 }}>
            <p style={{ fontSize: 14, lineHeight: 1.95, color: palette.ink, margin: 0 }}>{c.paragraphs[2]}</p>
            <Rule theme={theme} style={{ background: palette.line, height: 1, margin: "20px 0" }} />
            <span style={{ fontFamily: fonts.body, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.accent }}>
              ▍QUESTION
            </span>
            <p style={{
              marginTop: 10,
              fontFamily: bold ? fonts.display : (fonts.masthead || fonts.display),
              fontStyle: bold ? "normal" : "italic",
              fontWeight: bold ? 700 : 400,
              fontSize: bold ? 26 : 24,
              lineHeight: 1.35,
              color: palette.ink,
            }}>
              {c.question}
            </p>
          </div>

          {/* Col 3 */}
          <div style={{ borderRight: `1px solid ${palette.line}`, paddingRight: 24 }}>
            <p style={{ fontSize: 14, lineHeight: 1.95, color: palette.ink, margin: 0 }}>{c.paragraphs[3]}</p>
          </div>

          {/* Col 4 — with factbox */}
          <div>
            <p style={{ fontSize: 14, lineHeight: 1.95, color: palette.ink, margin: 0 }}>{c.paragraphs[4]}</p>
            <div style={{ marginTop: 20, border: `2px solid ${palette.rule}`, padding: 16 }}>
              <div style={{ fontFamily: fonts.body, fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: palette.sub, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${palette.line}` }}>
                ▎FACT BOX
              </div>
              {c.facts.map((f, i) => (
                <div key={f.kicker} style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: 10, padding: "10px 0", borderBottom: i < c.facts.length - 1 ? `1px solid ${palette.line}` : "none" }}>
                  <span style={{ fontFamily: bold ? fonts.display : (fonts.masthead || fonts.display), fontSize: bold ? 24 : 22, fontWeight: bold ? 700 : 400, color: palette.accent, lineHeight: 1 }}>
                    {f.kicker}
                  </span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: palette.ink, lineHeight: 1.4 }}>{f.label}</div>
                    <div style={{ marginTop: 2, fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: "0.12em", color: palette.sub, textTransform: "uppercase" }}>{f.source}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Closing — italic pull quote stripe */}
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: `2px solid ${palette.rule}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <p style={{
            margin: 0,
            fontFamily: bold ? fonts.body : (fonts.masthead || fonts.display),
            fontStyle: bold ? "normal" : "italic",
            fontSize: bold ? 17 : 22,
            fontWeight: bold ? 600 : 400,
            lineHeight: 1.7,
            color: palette.ink,
          }}>
            「{c.closing[0]}」
          </p>
          <p style={{
            margin: 0,
            fontFamily: bold ? fonts.display : (fonts.masthead || fonts.display),
            fontStyle: bold ? "normal" : "italic",
            fontWeight: bold ? 700 : 400,
            fontSize: bold ? 24 : 26,
            textTransform: bold ? "uppercase" : "none",
            letterSpacing: bold ? 0 : -0.5,
            lineHeight: 1.4,
            color: palette.accent,
          }}>
            {c.closing[1]}
          </p>
        </div>
      </section>
    );
  }

  // Fallback (old layouts kept for v1/v2/v3 if ever re-enabled) — reuse two-col-block visual
  return null;
}

// ─────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────
function Services({ theme }) {
  const { layout, palette, fonts } = theme;
  const c = COPY.services;

  if (layout.services === "numbered-list") {
    return (
      <section style={{ padding: "130px 80px", background: palette.bg }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 60, marginBottom: 64, alignItems: "end" }}>
          <div>
            <SectionLabel theme={theme} accent>— {c.label.ja}</SectionLabel>
            <div style={{ fontFamily: fonts.display, fontStyle: "italic", fontSize: 22, color: palette.sub, marginTop: 6 }}>
              What We Do
            </div>
          </div>
          <H2 theme={theme} size={62}>{c.titleJa}</H2>
        </div>
        <div>
          {c.items.map((it, i) => (
            <div key={it.num} style={{
              display: "grid",
              gridTemplateColumns: "120px 0.9fr 1.5fr 100px",
              gap: 32,
              alignItems: "baseline",
              padding: "44px 0",
              borderTop: `1px solid ${palette.line}`,
              borderBottom: i === c.items.length - 1 ? `1px solid ${palette.line}` : "none",
            }}>
              <span style={{ fontFamily: fonts.display, fontStyle: "italic", fontSize: 88, color: palette.accent, lineHeight: 0.9 }}>
                {it.num}
              </span>
              <div>
                <div style={{ fontFamily: fonts.display, fontStyle: "italic", fontSize: 16, color: palette.sub, marginBottom: 8 }}>
                  {it.en}
                </div>
                <div style={{ fontFamily: fonts.display, fontSize: 32, color: palette.ink, lineHeight: 1.2 }}>
                  {it.ja}
                </div>
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.95, color: palette.ink, margin: 0, maxWidth: 480 }}>
                {it.body}
              </p>
              <span style={{ fontFamily: fonts.mono, fontSize: 12, color: palette.sub, letterSpacing: "0.18em", textAlign: "right" }}>
                READ →
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (layout.services === "grid-cards") {
    return (
      <section style={{ padding: "110px 64px", background: palette.paper }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 24, marginBottom: 48, alignItems: "end" }}>
          <div style={{ gridColumn: "1 / span 5" }}>
            <SectionLabel theme={theme} accent>// {c.label.en}</SectionLabel>
            <H2 theme={theme} size={48}>{c.titleJa}</H2>
          </div>
          <div style={{ gridColumn: "8 / span 5", fontSize: 14, color: palette.sub, lineHeight: 1.85 }}>
            私たちは「人が続けられる仕組み」を中心に置き、3つの領域で支援を行っています。
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, borderTop: `1px solid ${palette.line}`, borderLeft: `1px solid ${palette.line}` }}>
          {c.items.map((it, i) => (
            <div key={it.num} style={{
              padding: 36,
              borderRight: `1px solid ${palette.line}`,
              borderBottom: `1px solid ${palette.line}`,
              background: palette.card,
              minHeight: 360,
              display: "flex",
              flexDirection: "column",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
                <span style={{ fontFamily: fonts.mono, fontSize: 12, letterSpacing: "0.24em", color: palette.accent }}>
                  {it.num} / SERVICE
                </span>
                <span style={{ fontFamily: fonts.mono, fontSize: 12, color: palette.sub }}>↗</span>
              </div>
              <div style={{ fontFamily: fonts.mono, fontSize: 11, color: palette.sub, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>
                {it.en}
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: palette.ink, lineHeight: 1.3, marginBottom: 20 }}>
                {it.ja}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.9, color: palette.sub, margin: 0, flex: 1 }}>{it.body}</p>
              <Rule theme={theme} style={{ background: palette.line, margin: "24px 0 12px" }} />
              <span style={{ fontFamily: fonts.mono, fontSize: 11, color: palette.accent, letterSpacing: "0.22em" }}>
                READ MORE →
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (layout.services === "wide-rule-rows") {
    return (
      <section style={{ padding: "160px 80px", background: palette.paper }}>
        <div style={{ marginBottom: 60 }}>
          <SectionLabel theme={theme}>— {c.label.ja} —</SectionLabel>
          <H2 theme={theme} size={78}>{c.titleJa}</H2>
        </div>
        {c.items.map((it, i) => (
          <div key={it.num} style={{
            padding: "60px 0",
            borderTop: `1px solid ${palette.line}`,
            borderBottom: i === c.items.length - 1 ? `1px solid ${palette.line}` : "none",
            display: "grid",
            gridTemplateColumns: "0.4fr 1.3fr 1fr",
            gap: 40,
            alignItems: "start",
          }}>
            <div style={{ fontFamily: fonts.display, fontStyle: "italic", fontSize: 22, color: palette.sub }}>
              No. {it.num}
            </div>
            <H2 theme={theme} size={44} style={{ fontStyle: "italic", fontWeight: 400 }}>{it.ja}</H2>
            <div>
              <div style={{ fontFamily: fonts.display, fontStyle: "italic", fontSize: 18, color: palette.sub, marginBottom: 14 }}>
                {it.en}
              </div>
              <p style={{ fontSize: 16, lineHeight: 2, color: palette.ink, margin: 0, fontFamily: theme.fonts.body }}>
                {it.body}
              </p>
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (layout.services === "color-block-cards") {
    return (
      <section style={{ padding: "120px 64px", background: palette.bg }}>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 56 }}>
          <div>
            <div style={{ background: palette.slab, color: palette.onSlab, padding: "10px 14px", display: "inline-block", fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 24 }}>
              ▍{c.label.ja}
            </div>
            <H2 theme={theme} size={72} style={{ fontWeight: 700, letterSpacing: -2 }}>Service.</H2>
          </div>
          <span style={{ fontFamily: fonts.mono, fontSize: 12, color: palette.sub, letterSpacing: "0.2em" }}>
            3 SERVICES → 01 / 02 / 03
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {c.items.map((it, i) => {
            const onAccent = i === 1;
            return (
              <div key={it.num} style={{
                background: onAccent ? palette.accent : palette.card,
                color: onAccent ? palette.paper : palette.ink,
                padding: 36,
                minHeight: 400,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                border: onAccent ? "none" : `1.5px solid ${palette.ink}`,
              }}>
                <div>
                  <div style={{ fontFamily: fonts.display, fontSize: 88, fontWeight: 700, lineHeight: 0.9, marginBottom: 24, opacity: 0.95 }}>
                    {it.num}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3, marginBottom: 16 }}>
                    {it.ja}
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.85, margin: 0, opacity: onAccent ? 0.92 : 0.78 }}>
                    {it.body}
                  </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase" }}>
                  <span>{it.en}</span>
                  <span>↗</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // column-list (newspaper)
  return (
    <section style={{ padding: "60px 56px", background: palette.paper, borderTop: `1px solid ${palette.line}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 12, borderBottom: `1px solid ${palette.line}`, marginBottom: 32 }}>
        <SectionLabel theme={theme} accent>§ Section III — {c.label.ja}</SectionLabel>
        <span style={{ fontFamily: theme.fonts.body, fontSize: 12, color: palette.sub }}>p. 005</span>
      </div>
      <H2 theme={theme} size={64} style={{ marginBottom: 32 }}>{c.titleJa}</H2>
      <Rule theme={theme} style={{ background: palette.rule, height: 2, marginBottom: 28 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
        {c.items.map((it, i) => (
          <div key={it.num} style={{ borderRight: i === 2 ? "none" : `1px solid ${palette.line}`, paddingRight: 24 }}>
            <span style={{ fontFamily: theme.fonts.display, fontSize: 12, letterSpacing: "0.24em", color: palette.accent, fontWeight: 700, textTransform: "uppercase" }}>
              No. {it.num}
            </span>
            <div style={{ marginTop: 14, fontFamily: theme.fonts.display, fontSize: 28, color: palette.ink, lineHeight: 1.25 }}>
              {it.ja}
            </div>
            <Rule theme={theme} style={{ background: palette.line, margin: "16px 0", height: 1 }} />
            <p style={{ fontSize: 13, lineHeight: 1.9, color: palette.ink, margin: 0 }}>
              {it.body}
            </p>
            <p style={{ marginTop: 12, fontSize: 12, color: palette.sub, fontStyle: "italic" }}>{it.bodyEn}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { About, Services, SectionLabel, H2 });
