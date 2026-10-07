// Scheduler for live preview iframes. Each one executes the artifact's
// scripts, so two caps apply: how many may be *loading* at once (network +
// parse pressure) and how many may stay *mounted* (memory). Loaded frames are
// kept alive when they scroll out of view so scrolling back is instant; only
// when the mounted cap is hit is the least-recently-seen off-screen frame
// recycled.

type Ctl = { mount: () => void; unmount: () => void };

type Entry = {
  ctl: Ctl;
  inView: boolean;
  eager: boolean;
  mounted: boolean;
  loaded: boolean;
  lastSeen: number;
  order: number;
};

function lowPowerDevice() {
  if (typeof window === "undefined") return false;
  const narrow = window.matchMedia?.("(max-width: 880px)").matches ?? false;
  const cores = typeof navigator !== "undefined" ? (navigator.hardwareConcurrency ?? 8) : 8;
  return narrow || cores <= 4;
}

let limits: { loading: number; mounted: number } | null = null;
function getLimits() {
  if (!limits) limits = lowPowerDevice() ? { loading: 3, mounted: 10 } : { loading: 6, mounted: 24 };
  return limits;
}

const entries = new Map<string, Entry>();
let seq = 0;
const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

function pump() {
  const { loading: maxLoading, mounted: maxMounted } = getLimits();
  const all = [...entries.values()];
  let loading = all.filter((e) => e.mounted && !e.loaded).length;
  let mounted = all.filter((e) => e.mounted).length;
  const wanting = all
    .filter((e) => !e.mounted && e.inView)
    .sort((a, b) => Number(b.eager) - Number(a.eager) || a.order - b.order);

  for (const entry of wanting) {
    if (loading >= maxLoading) break;
    if (mounted >= maxMounted) {
      const victim = all
        .filter((v) => v.mounted && !v.inView)
        .sort((a, b) => a.lastSeen - b.lastSeen)[0];
      if (!victim) break; // everything mounted is on screen: wait
      victim.mounted = false;
      victim.loaded = false;
      victim.ctl.unmount();
      mounted -= 1;
    }
    entry.mounted = true;
    entry.ctl.mount();
    mounted += 1;
    loading += 1;
  }
}

/**
 * Registers a preview. `key` must be unique per rendered thumb (useId), not
 * per artifact: the same artifact can appear twice on a page. `eager` thumbs
 * (above the fold) are treated as in view immediately.
 */
export function registerThumb(key: string, ctl: Ctl, eager: boolean) {
  const entry: Entry = { ctl, inView: eager, eager, mounted: false, loaded: false, lastSeen: now(), order: seq++ };
  entries.set(key, entry);
  pump();
  return {
    setInView(inView: boolean) {
      entry.inView = inView;
      if (inView) entry.lastSeen = now();
      pump();
    },
    setLoaded() {
      if (entry.loaded) return;
      entry.loaded = true;
      pump();
    },
    release() {
      entries.delete(key);
      pump();
    },
  };
}
