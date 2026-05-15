// sections2.jsx — Blog / Ikeda / Contact / Footer + TopPage wrapper

// Placeholder image cell (drawn block, not SVG illustration)
function PhotoBlock({ theme, src, ratio = "4/3", caption, treatment }) {
  const filterMap = {
    duotoneWarm: "saturate(.85) sepia(.2) brightness(.9)",
    duotoneCool: "saturate(.4) hue-rotate(190deg) brightness(.78)",
    grayscale: "grayscale(1) contrast(1.05) brightness(.92)",
    warm: "saturate(1.05) contrast(1.05) brightness(.95)",
    newsprint: "grayscale(.55) contrast(1.05) sepia(.12)",
  };
  return (
    <div style={{ position: "relative", aspectRatio: ratio, overflow: "hidden", border: `1px solid ${theme.palette.line}`, background: theme.palette.bg }}>
      {src
        ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: filterMap[treatment] || "none" }} />
        : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            background: `repeating-linear-gradient(45deg, ${theme.palette.bg} 0 14px, ${theme.palette.paper} 14px 28px)` }}>
            <span style={{ fontFamily: theme.fonts.mono, fontSize: 11, color: theme.palette.sub, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              [ photo ]
            </span>
          </div>
        )
      }
      {caption && (
        <div style={{ position: "absolute", left: 12, bottom: 10, fontFamily: theme.fonts.mono, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,.9)" }}>
          {caption}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BLOG
// ─────────────────────────────────────────────────────────────
function Blog({ theme }) {
  const { layout, palette, fonts } = theme;
  const c = COPY.blog;

  if (layout.blog === "stacked-large") {
    return (
      <section style={{ padding: "130px 80px", background: palette.bg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 56 }}>
          <div>
            <SectionLabel theme={theme} accent>— {c.label.ja}</SectionLabel>
            <H2 theme={theme} size={62}>{c.titleJa}</H2>
            <div style={{ marginTop: 12, fontFamily: fonts.display, fontStyle: "italic", fontSize: 22, color: palette.sub }}>
              {c.titleEn}
            </div>
          </div>
          <span style={{ fontFamily: fonts.mono, fontSize: 12, letterSpacing: "0.22em", color: palette.accent }}>
            ALL ENTRIES →
          </span>
        </div>
        <Rule theme={theme} style={{ background: palette.line, height: 1 }} />
        {c.posts.map((p, i) => (
          <a key={p.date} style={{
            display: "grid",
            gridTemplateColumns: "100px 110px 1fr auto",
            gap: 40,
            alignItems: "baseline",
            padding: "44px 0",
            borderBottom: `1px solid ${palette.line}`,
            textDecoration: "none",
            color: "inherit",
          }}>
            <span style={{ fontFamily: fonts.mono, fontSize: 12, color: palette.sub, letterSpacing: "0.1em" }}>
              {p.date}
            </span>
            <span style={{ fontFamily: fonts.mono, fontSize: 11, color: palette.accent, letterSpacing: "0.22em", textTransform: "uppercase" }}>
              {p.tag}
            </span>
            <div>
              <div style={{ fontFamily: fonts.display, fontSize: 32, color: palette.ink, lineHeight: 1.3, fontStyle: theme.italicDisplay ? "italic" : "normal" }}>
                {p.ja}
              </div>
              <div style={{ marginTop: 8, fontFamily: fonts.display, fontStyle: "italic", fontSize: 16, color: palette.sub }}>
                {p.en}
              </div>
            </div>
            <span style={{ fontFamily: fonts.mono, fontSize: 18, color: palette.sub }}>↗</span>
          </a>
        ))}
      </section>
    );
  }

  if (layout.blog === "row-with-thumbs") {
    return (
      <section style={{ padding: "110px 64px", background: palette.bg }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 24, marginBottom: 48, alignItems: "end" }}>
          <div style={{ gridColumn: "1 / span 6" }}>
            <SectionLabel theme={theme} accent>// {c.label.en} / Journal</SectionLabel>
            <H2 theme={theme} size={52}>{c.titleJa}</H2>
          </div>
          <div style={{ gridColumn: "10 / span 3", justifySelf: "end" }}>
            <span style={{ fontFamily: fonts.mono, fontSize: 12, color: palette.accent, letterSpacing: "0.22em" }}>
              VIEW ALL →
            </span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {c.posts.map((p) => (
            <a key={p.date} style={{ textDecoration: "none", color: "inherit" }}>
              <PhotoBlock theme={theme} ratio="4/3" treatment="duotoneCool" />
              <div style={{ marginTop: 16, display: "flex", gap: 12, fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: palette.sub }}>
                <span>{p.date}</span>
                <span style={{ color: palette.accent }}>· {p.tag}</span>
              </div>
              <div style={{ marginTop: 12, fontSize: 20, fontWeight: 700, color: palette.ink, lineHeight: 1.4 }}>
                {p.ja}
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: palette.sub, lineHeight: 1.6 }}>
                {p.en}
              </div>
            </a>
          ))}
        </div>
      </section>
    );
  }

  if (layout.blog === "minimal-index") {
    return (
      <section style={{ padding: "160px 80px", background: palette.paper }}>
        <SectionLabel theme={theme}>— {c.label.ja} · {c.label.en} —</SectionLabel>
        <H2 theme={theme} size={72} style={{ marginTop: 28 }}>{c.titleJa}</H2>
        <Rule theme={theme} style={{ background: palette.line, height: 1, margin: "56px 0 0" }} />
        {c.posts.map((p, i) => (
          <a key={p.date} style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: 80,
            alignItems: "baseline",
            padding: "56px 0",
            borderBottom: `1px solid ${palette.line}`,
            textDecoration: "none",
            color: "inherit",
          }}>
            <span style={{ fontFamily: theme.fonts.display, fontStyle: "italic", fontSize: 56, color: palette.ink }}>
              {String(i + 1).padStart(2, "0")}.
            </span>
            <div>
              <span style={{ fontFamily: theme.fonts.body, fontSize: 13, letterSpacing: "0.16em", color: palette.sub, marginRight: 16 }}>
                {p.date}
              </span>
              <span style={{ fontFamily: theme.fonts.body, fontSize: 12, letterSpacing: "0.2em", color: palette.ink, textTransform: "uppercase" }}>
                — {p.tag}
              </span>
              <div style={{ marginTop: 14, fontFamily: theme.fonts.display, fontStyle: "italic", fontSize: 34, color: palette.ink, lineHeight: 1.3 }}>
                {p.ja}
              </div>
            </div>
            <span style={{ fontFamily: theme.fonts.body, fontSize: 14, color: palette.sub }}>READ →</span>
          </a>
        ))}
      </section>
    );
  }

  if (layout.blog === "horizontal-strip") {
    return (
      <section style={{ padding: "120px 64px", background: palette.paper }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 48 }}>
          <div>
            <div style={{ background: palette.slab, color: palette.onSlab, padding: "10px 14px", display: "inline-block", fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 24 }}>
              ▍{c.label.ja}
            </div>
            <H2 theme={theme} size={64} style={{ fontWeight: 700, letterSpacing: -2 }}>{c.titleJa}</H2>
          </div>
          <span style={{ fontFamily: fonts.mono, fontSize: 12, color: palette.accent, letterSpacing: "0.2em" }}>
            VIEW JOURNAL →
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 18 }}>
          {c.posts.map((p, i) => (
            <a key={p.date} style={{
              background: palette.card,
              border: `1.5px solid ${palette.ink}`,
              padding: i === 0 ? 32 : 28,
              minHeight: i === 0 ? 380 : 320,
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              textDecoration: "none", color: "inherit",
            }}>
              <div>
                <div style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.24em", color: palette.accent, textTransform: "uppercase", marginBottom: 16 }}>
                  {p.tag} · {p.date}
                </div>
                <div style={{ fontSize: i === 0 ? 28 : 22, fontWeight: 700, color: palette.ink, lineHeight: 1.35 }}>
                  {p.ja}
                </div>
                <div style={{ marginTop: 10, fontSize: 13, color: palette.sub, lineHeight: 1.6, fontStyle: "italic" }}>
                  {p.en}
                </div>
              </div>
              <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${palette.line}`, paddingTop: 14, fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.22em", color: palette.ink }}>
                <span>NOTE.{String(i + 1).padStart(2, "0")}</span>
                <span>→</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    );
  }

  // newspaper-cols
  return (
    <section style={{ padding: "60px 56px", background: palette.paper, borderTop: `1px solid ${palette.line}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 12, borderBottom: `1px solid ${palette.line}`, marginBottom: 24 }}>
        <SectionLabel theme={theme} accent>§ Section IV — {c.label.ja}</SectionLabel>
        <span style={{ fontFamily: theme.fonts.body, fontSize: 12, color: palette.sub }}>p. 008</span>
      </div>
      <H2 theme={theme} size={52} style={{ marginBottom: 20 }}>{c.titleJa}</H2>
      <Rule theme={theme} style={{ background: palette.rule, height: 2, marginBottom: 28 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 30 }}>
        {c.posts.map((p, i) => (
          <article key={p.date} style={{ borderRight: i === 2 ? "none" : `1px solid ${palette.line}`, paddingRight: 24 }}>
            {i === 0 && (
              <div style={{ marginBottom: 18 }}>
                <PhotoBlock theme={theme} ratio="16/10" treatment="newsprint" caption="" />
              </div>
            )}
            <span style={{ fontFamily: theme.fonts.body, fontSize: 11, letterSpacing: "0.18em", color: palette.accent, textTransform: "uppercase" }}>
              {p.tag} · {p.date}
            </span>
            <h3 style={{ margin: "10px 0 0", fontFamily: theme.fonts.display, fontSize: i === 0 ? 30 : 22, lineHeight: 1.25, color: palette.ink, fontWeight: 400 }}>
              {p.ja}
            </h3>
            <p style={{ marginTop: 12, fontSize: 13, lineHeight: 1.8, color: palette.ink, margin: "12px 0 0" }}>
              {p.en}は、現場のリズムと数字のあいだに橋をかける小さな試みです。続きを読む。
            </p>
            <span style={{ display: "inline-block", marginTop: 10, fontSize: 11, color: palette.sub, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              → CONT. p. {String(i + 9).padStart(2, "0")}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// IKEDA MESSAGE
// ─────────────────────────────────────────────────────────────
function Ikeda({ theme }) {
  const { layout, palette, fonts } = theme;
  const c = COPY.ikeda;

  const portraitTreatments = {
    "portrait-left-quote": "duotoneWarm",
    "stacked-quote": "duotoneCool",
    "duotone-portrait": "grayscale",
    "framed-portrait": "warm",
    "byline-portrait": "newsprint",
  };
  const tr = portraitTreatments[layout.ikeda];

  if (layout.ikeda === "portrait-left-quote") {
    return (
      <section style={{ padding: "140px 80px", background: palette.paper, position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{ width: "100%", aspectRatio: "4/5", overflow: "hidden", border: `1px solid ${palette.line}` }}>
              <img src="assets/ikeda.jpeg" alt="池田弘明" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(.85) sepia(.18) brightness(.94)" }} />
            </div>
            <div style={{ marginTop: 16, fontFamily: fonts.mono, fontSize: 10, color: palette.sub, letterSpacing: "0.22em", textTransform: "uppercase" }}>
              Fig. 02 — Portrait of the Founder
            </div>
          </div>
          <div>
            <SectionLabel theme={theme} accent>— {c.label.ja}</SectionLabel>
            <div style={{ fontFamily: fonts.display, fontStyle: "italic", fontSize: 110, color: palette.accent, lineHeight: 0.6, marginBottom: -12 }}>
              "
            </div>
            <p style={{
              fontFamily: fonts.display,
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 36,
              lineHeight: 1.6,
              color: palette.ink,
              margin: 0,
              textWrap: "pretty",
            }}>
              {c.quoteJa}
            </p>
            <Rule theme={theme} style={{ background: palette.accent, height: 2, width: 60, margin: "40px 0" }} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              <span style={{ fontFamily: fonts.display, fontSize: 26, color: palette.ink }}>{c.name}</span>
              <span style={{ fontFamily: fonts.display, fontStyle: "italic", fontSize: 18, color: palette.sub }}>{c.nameEn}</span>
            </div>
            <div style={{ marginTop: 6, fontFamily: fonts.mono, fontSize: 12, letterSpacing: "0.22em", color: palette.sub, textTransform: "uppercase" }}>
              {c.role}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (layout.ikeda === "stacked-quote") {
    return (
      <section style={{ padding: "120px 64px", background: palette.bg }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 24, alignItems: "start" }}>
          <div style={{ gridColumn: "1 / span 4" }}>
            <SectionLabel theme={theme} accent>// {c.label.en}</SectionLabel>
            <div style={{ marginTop: 28 }}>
              <div style={{ width: 220, height: 220, overflow: "hidden", border: `1px solid ${palette.line}` }}>
                <img src="assets/ikeda.jpeg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(.4) hue-rotate(190deg) brightness(.85) contrast(1.05)" }} />
              </div>
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: palette.ink }}>{c.name}</div>
                <div style={{ fontSize: 14, color: palette.sub, marginTop: 2 }}>{c.nameEn}</div>
                <div style={{ marginTop: 8, fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.22em", color: palette.accent, textTransform: "uppercase" }}>
                  {c.role}
                </div>
              </div>
            </div>
          </div>
          <div style={{ gridColumn: "6 / span 7" }}>
            <Rule theme={theme} style={{ background: palette.line, height: 1, marginBottom: 32 }} />
            <p style={{ fontSize: 30, lineHeight: 1.7, color: palette.ink, margin: 0, fontWeight: 500, fontFamily: theme.fonts.body, textWrap: "pretty" }}>
              {c.quoteJa}
            </p>
            <Rule theme={theme} style={{ background: palette.line, height: 1, marginTop: 40 }} />
            <p style={{ marginTop: 24, fontSize: 14, lineHeight: 1.95, color: palette.sub, maxWidth: 580, fontStyle: "italic" }}>
              {c.quoteEn}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (layout.ikeda === "duotone-portrait") {
    return (
      <section style={{ padding: "160px 80px", background: palette.paper }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden" }}>
            <img src="assets/ikeda.jpeg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.05) brightness(.92)" }} />
          </div>
          <div>
            <SectionLabel theme={theme}>— {c.label.ja} —</SectionLabel>
            <div style={{ fontFamily: theme.fonts.display, fontStyle: "italic", fontSize: 140, color: palette.ink, lineHeight: 0.5, marginTop: 24, marginBottom: 0 }}>
              "
            </div>
            <p style={{ fontFamily: theme.fonts.display, fontStyle: "italic", fontSize: 34, lineHeight: 1.65, color: palette.ink, margin: "8px 0 0", fontWeight: 400 }}>
              {c.quoteJa}
            </p>
            <Rule theme={theme} style={{ background: palette.ink, height: 1, margin: "44px 0 20px", width: 80 }} />
            <div style={{ fontFamily: theme.fonts.display, fontSize: 24, color: palette.ink }}>
              {c.name} <span style={{ fontStyle: "italic", fontSize: 18, color: palette.sub }}>· {c.nameEn}</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: palette.sub, letterSpacing: "0.1em" }}>
              {c.role}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (layout.ikeda === "framed-portrait") {
    return (
      <section style={{ padding: "120px 64px", background: palette.bg }}>
        <div style={{ background: palette.slab, color: palette.onSlab, padding: 56, display: "grid", gridTemplateColumns: "0.9fr 1.6fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ background: palette.accent, padding: 12, marginBottom: 0 }}>
              <div style={{ width: "100%", aspectRatio: "4/5", overflow: "hidden" }}>
                <img src="assets/ikeda.jpeg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(1.1) contrast(1.05)" }} />
              </div>
            </div>
            <div style={{ marginTop: 18, fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.24em", color: palette.paper, opacity: 0.7, textTransform: "uppercase" }}>
              Co-founder · COO
            </div>
          </div>
          <div>
            <div style={{ display: "inline-block", padding: "8px 12px", background: palette.accent, color: palette.paper, fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 28 }}>
              ▍{c.label.ja}
            </div>
            <p style={{ fontFamily: theme.fonts.display, fontSize: 36, lineHeight: 1.55, margin: 0, fontWeight: 500, color: palette.paper }}>
              {c.quoteJa}
            </p>
            <Rule theme={theme} style={{ background: palette.paper, opacity: 0.4, margin: "36px 0", width: 60, height: 2 }} />
            <div style={{ fontSize: 26, fontWeight: 700 }}>
              {c.name}
            </div>
            <div style={{ marginTop: 4, fontSize: 14, opacity: 0.7 }}>
              {c.nameEn} · {c.role}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // byline-portrait (newspaper)
  return (
    <section style={{ padding: "60px 56px", background: palette.paper, borderTop: `1px solid ${palette.line}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 12, borderBottom: `1px solid ${palette.line}`, marginBottom: 28 }}>
        <SectionLabel theme={theme} accent>§ Section V — {c.label.ja} / FROM THE FOUNDER</SectionLabel>
        <span style={{ fontFamily: theme.fonts.body, fontSize: 12, color: palette.sub }}>p. 011</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "0.4fr 1.6fr", gap: 48, alignItems: "start" }}>
        <div>
          <div style={{ width: "100%", aspectRatio: "4/5", overflow: "hidden", border: `1px solid ${palette.line}` }}>
            <img src="assets/ikeda.jpeg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(.55) contrast(1.05) sepia(.12)" }} />
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: theme.fonts.display, fontSize: 22, color: palette.ink, lineHeight: 1.2 }}>
              {c.name}
            </div>
            <div style={{ marginTop: 2, fontStyle: "italic", fontSize: 13, color: palette.sub }}>{c.nameEn}</div>
            <div style={{ marginTop: 6, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.accent }}>{c.role}</div>
          </div>
        </div>
        <div>
          <span style={{ fontFamily: theme.fonts.body, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: palette.accent }}>
            Op-ed · 寄稿
          </span>
          <h3 style={{ margin: "12px 0 0", fontFamily: theme.fonts.display, fontSize: 60, lineHeight: 1.1, color: palette.ink, fontWeight: 400, textWrap: "balance" }}>
            焼くことに、続けられる<br />形をあげたい。
          </h3>
          <Rule theme={theme} style={{ background: palette.rule, height: 2, margin: "28px 0" }} />
          <div style={{ columns: 2, columnGap: 32, fontSize: 14.5, lineHeight: 1.95, color: palette.ink }}>
            <p style={{ margin: 0 }}>
              <span style={{ float: "left", fontFamily: theme.fonts.display, fontSize: 56, lineHeight: 0.8, paddingRight: 8, paddingTop: 4, color: palette.accent }}>「</span>
              {c.quoteJa}
            </p>
            <p style={{ margin: "12px 0 0", fontStyle: "italic", color: palette.sub }}>{c.quoteEn}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// CONTACT + FOOTER
// ─────────────────────────────────────────────────────────────
function Contact({ theme }) {
  const { layout, palette, fonts } = theme;
  const c = COPY.contact;

  if (layout.contact === "centered-rule") {
    return (
      <section style={{ padding: "150px 80px 100px", background: palette.bg, textAlign: "center" }}>
        <SectionLabel theme={theme} accent>— {c.label.ja} · {c.label.en} —</SectionLabel>
        <H2 theme={theme} size={76} style={{ margin: "28px auto 0", maxWidth: 820 }}>
          {c.titleJa}
        </H2>
        <div style={{ marginTop: 20, fontFamily: fonts.display, fontStyle: "italic", fontSize: 24, color: palette.sub }}>
          {c.titleEn}
        </div>
        <Rule theme={theme} style={{ background: palette.accent, width: 80, height: 2, margin: "40px auto" }} />
        <p style={{ fontSize: 17, lineHeight: 2, color: palette.ink, maxWidth: 620, margin: "0 auto" }}>
          {c.body}
        </p>
        <div style={{ marginTop: 44, display: "inline-flex", gap: 16, alignItems: "center" }}>
          <CtaPrimary theme={theme}>お問い合わせフォーム</CtaPrimary>
          <span style={{ fontFamily: fonts.mono, fontSize: 12, color: palette.sub, letterSpacing: "0.22em" }}>
            info@bakerization.com
          </span>
        </div>
      </section>
    );
  }

  if (layout.contact === "split-form") {
    return (
      <section style={{ padding: "110px 64px", background: palette.paper }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
          <div>
            <SectionLabel theme={theme} accent>// {c.label.en}</SectionLabel>
            <H2 theme={theme} size={54} style={{ marginTop: 14 }}>{c.titleJa}</H2>
            <p style={{ marginTop: 24, fontSize: 16, lineHeight: 1.95, color: palette.sub }}>
              {c.body}
            </p>
            <Rule theme={theme} style={{ background: palette.line, margin: "32px 0", height: 1 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, fontFamily: fonts.mono, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: palette.sub }}>
              <div>
                <div>EMAIL</div>
                <div style={{ marginTop: 6, color: palette.ink, fontSize: 14, letterSpacing: 0 }}>info@bakerization.com</div>
              </div>
              <div>
                <div>LOCATION</div>
                <div style={{ marginTop: 6, color: palette.ink, fontSize: 14, letterSpacing: 0 }}>Tokyo · Osaka</div>
              </div>
            </div>
          </div>
          <div style={{ background: palette.card, padding: 36, border: `1px solid ${palette.line}` }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.24em", color: palette.accent, marginBottom: 24 }}>
              ▎FORM
            </div>
            {["お名前 / Name", "メール / Email", "ご相談内容 / Message"].map((l, i) => (
              <div key={l} style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 12, color: palette.sub, marginBottom: 8, letterSpacing: "0.12em", textTransform: "uppercase" }}>{l}</div>
                <div style={{ height: i === 2 ? 88 : 38, borderBottom: `1.5px solid ${palette.line}` }} />
              </div>
            ))}
            <button style={{
              width: "100%", padding: "16px 24px", background: palette.accent, color: palette.paper,
              border: "none", fontFamily: fonts.body, fontSize: 14, fontWeight: 600, letterSpacing: 0.4, cursor: "pointer", marginTop: 12,
            }}>
              送信する  →
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (layout.contact === "single-line") {
    return (
      <section style={{ padding: "160px 80px", background: palette.paper, textAlign: "center" }}>
        <SectionLabel theme={theme}>— {c.label.ja} —</SectionLabel>
        <H2 theme={theme} size={88} style={{ marginTop: 36, maxWidth: 1020, marginLeft: "auto", marginRight: "auto" }}>
          {c.titleJa}
        </H2>
        <Rule theme={theme} style={{ background: palette.ink, height: 1, width: 120, margin: "64px auto 32px" }} />
        <p style={{ fontFamily: theme.fonts.body, fontSize: 18, lineHeight: 2, color: palette.ink, maxWidth: 600, margin: "0 auto" }}>
          {c.body}
        </p>
        <div style={{ marginTop: 56, display: "inline-flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontFamily: theme.fonts.display, fontStyle: "italic", fontSize: 40, color: palette.ink }}>
            info@bakerization.com
          </div>
          <Rule theme={theme} style={{ background: palette.ink, height: 1, width: "100%" }} />
        </div>
      </section>
    );
  }

  if (layout.contact === "block-button") {
    return (
      <section style={{ padding: "120px 64px", background: palette.accent, color: palette.paper }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ background: palette.slab, color: palette.onSlab, padding: "10px 14px", display: "inline-block", fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 28 }}>
              ▍{c.label.ja}
            </div>
            <H2 theme={theme} size={72} style={{ color: palette.paper, fontWeight: 700, letterSpacing: -2 }}>
              {c.titleJa}
            </H2>
            <p style={{ marginTop: 24, fontSize: 17, lineHeight: 1.95, opacity: 0.92, maxWidth: 540 }}>
              {c.body}
            </p>
          </div>
          <div>
            <div style={{ background: palette.slab, color: palette.onSlab, padding: 32, display: "block" }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.24em", opacity: 0.7, marginBottom: 12 }}>EMAIL</div>
              <div style={{ fontSize: 26, fontWeight: 700 }}>info@bakerization.com</div>
              <Rule theme={theme} style={{ background: palette.onSlab, opacity: 0.2, margin: "20px 0", height: 1 }} />
              <button style={{
                width: "100%", padding: "20px 24px", background: palette.onSlab, color: palette.slab,
                border: "none", fontFamily: fonts.body, fontSize: 15, fontWeight: 700, letterSpacing: 0.5, cursor: "pointer",
              }}>
                お問い合わせフォームを開く →
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // classified (newspaper)
  return (
    <section style={{ padding: "60px 56px", background: palette.paper, borderTop: `2px solid ${palette.rule}` }}>
      <div style={{ textAlign: "center", borderBottom: `1px solid ${palette.line}`, paddingBottom: 14, marginBottom: 28 }}>
        <SectionLabel theme={theme} accent>— § Classified · {c.label.ja} —</SectionLabel>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr", gap: 40, alignItems: "start" }}>
        <div style={{ borderRight: `1px solid ${palette.line}`, paddingRight: 24 }}>
          <span style={{ fontFamily: theme.fonts.body, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.sub }}>
            For Bakeries
          </span>
          <p style={{ marginTop: 12, fontSize: 13, lineHeight: 1.9, color: palette.ink }}>
            人手不足、廃棄、需要のばらつき。日々の小さな違和感から、ご一緒に。
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <H2 theme={theme} size={56}>{c.titleJa}</H2>
          <Rule theme={theme} style={{ background: palette.rule, height: 2, width: 80, margin: "24px auto" }} />
          <div style={{ fontFamily: theme.fonts.display, fontSize: 32, color: palette.ink, fontWeight: 400 }}>
            info@bakerization.com
          </div>
          <button style={{
            marginTop: 24, padding: "14px 28px", background: palette.accent, color: palette.paper,
            border: "none", fontFamily: theme.fonts.body, fontSize: 13, fontWeight: 700, letterSpacing: 0.4, cursor: "pointer",
          }}>
            お問い合わせはこちら →
          </button>
        </div>
        <div style={{ borderLeft: `1px solid ${palette.line}`, paddingLeft: 24 }}>
          <span style={{ fontFamily: theme.fonts.body, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.sub }}>
            For Communities
          </span>
          <p style={{ marginTop: 12, fontSize: 13, lineHeight: 1.9, color: palette.ink }}>
            自治体・商店街・地域団体のみなさまへ。文化の継続のために。
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer({ theme }) {
  const { palette, fonts } = theme;
  return (
    <footer style={{
      padding: "48px 64px",
      background: palette.slab,
      color: palette.onSlab,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
    }}>
      <span style={{ fontFamily: fonts.display, fontStyle: theme.italicDisplay ? "italic" : "normal", fontSize: 18, letterSpacing: 0, textTransform: "none" }}>
        Bakerization
      </span>
      <span style={{ opacity: 0.65 }}>© 2026 Bakerization · We Bake the Future · ALL RIGHTS RESERVED</span>
      <span style={{ opacity: 0.85 }}>JA · EN</span>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// TOP PAGE — composes everything for one theme
// ─────────────────────────────────────────────────────────────
function TopPage({ theme }) {
  const t = theme._tweaks || {};
  const showNav = t.showNav !== false && theme.layout.hero !== "newspaper-masthead";
  return (
    <div style={{
      width: 1280,
      background: theme.palette.bg,
      color: theme.palette.ink,
      fontFamily: theme.fonts.body,
      fontSynthesis: "none",
      WebkitFontSmoothing: "antialiased",
    }}>
      {showNav ? <Nav theme={theme} /> : null}
      <Hero theme={theme} />
      <About theme={theme} />
      <Services theme={theme} />
      <Blog theme={theme} />
      <Ikeda theme={theme} />
      <Contact theme={theme} />
      <Footer theme={theme} />
    </div>
  );
}

Object.assign(window, { PhotoBlock, Blog, Ikeda, Contact, Footer, TopPage });
