// app.jsx — v4b Warm Bold Poster, locked theme (Midnight / Bold / Amber)
// Single tweak surface: editorial marker (蛍光ペン) on/off.

const BASE = THEMES.find((t) => t.id === "v4b-warm-bold-poster");

// Locked palette: Midnight + amber accent
const ACCENT = "#e89a1f";
const PALETTE = {
  bg: "#0e0700",
  paper: "#f6e7c9",
  card: "#1b0e02",
  ink: "#f6e7c9",
  sub: "#a88a5e",
  line: "#3a2710",
  rule: "#f6e7c9",
  tag: "#f6e7c9",
  slab: "#1b0e02",
  onSlab: "#f6e7c9",
  accent: ACCENT,
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "marker": true
}/*EDITMODE-END*/;

function buildTheme() {
  return {
    ...BASE,
    palette: { ...BASE.palette, ...PALETTE },
    _tweaks: { headlineIntensity: "bold", showNav: true },
  };
}

function ScaledStage({ children, className }) {
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const measure = () => setScale(Math.min(1, window.innerWidth / 1280));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return (
    <div
      className={className}
      style={{
        width: 1280 * scale,
        margin: "0 auto",
        transformOrigin: "top left",
      }}
    >
      <div style={{ width: 1280, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {children}
      </div>
    </div>
  );
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = React.useMemo(() => buildTheme(), []);

  // Drive the highlighter color from the accent so it always matches.
  React.useEffect(() => {
    document.documentElement.style.setProperty("--mk-color",     "rgba(232,154,31,.62)");
    document.documentElement.style.setProperty("--mk-color-end", "rgba(232,154,31,.42)");
  }, []);

  return (
    <React.Fragment>
      <ScaledStage className={tweaks.marker ? "marker-on" : ""}>
        <TopPage theme={theme} />
      </ScaledStage>

      <TweaksPanel title="Editorial">
        <TweakSection label="蛍光ペン · Marker">
          <TweakToggle
            label="重要語にマーカー"
            value={tweaks.marker}
            onChange={(v) => setTweak("marker", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
