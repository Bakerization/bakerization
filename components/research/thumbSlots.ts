// Caps how many preview iframes are mounted at once (each one executes the
// artifact's scripts). Thumbs that scroll out of view release their slot.
const MAX_ACTIVE = 12;
const active = new Set<string>();
const queue: Array<{ id: string; grant: () => void }> = [];

function pump() {
  while (active.size < MAX_ACTIVE && queue.length > 0) {
    const next = queue.shift()!;
    active.add(next.id);
    next.grant();
  }
}

/** Requests a slot; `grant` fires (sync or later) when one is available. Returns release(). */
export function acquireThumbSlot(id: string, grant: () => void): () => void {
  if (active.size < MAX_ACTIVE) {
    active.add(id);
    grant();
  } else {
    queue.push({ id, grant });
  }
  return () => {
    active.delete(id);
    const qi = queue.findIndex((q) => q.id === id);
    if (qi >= 0) queue.splice(qi, 1);
    pump();
  };
}
