import type { Thought } from "./ikeda-types";

/** A quoted passage in an interview is not proof of the narrator's own view. */
export function normalizeThoughtVoices(
  thought: Thought,
  text: string,
): Thought {
  const compact = (s: string) => s.replace(/\s+/g, "");
  const interview = /[－―—-]{2}/.test(text);
  const quoted = interview
    ? [...text.matchAll(/「([^」]{20,})」/g)].map((m) => compact(m[1]))
    : [];
  return {
    ...thought,
    claims: thought.claims.map((claim) => ({
      ...claim,
      voice:
        claim.voice !== "narrator"
          ? claim.voice
          : thought.authorship === "other_explicit"
            ? "other_author"
            : quoted.some((quote) => quote.includes(compact(claim.quote)))
              ? "unclear"
              : claim.voice,
    })),
  };
}

/** Stream exact short quotations only; paraphrases remain ordinary prose. */
export function createQuoteFilter(documents: string[]) {
  let pending = "",
    depth = 0,
    quotations = 0;
  return {
    push(delta: string) {
      let output = "";
      for (const ch of delta) {
        if (!depth && ch !== "「") {
          output += ch;
          continue;
        }
        pending += ch;
        if (ch === "「") depth++;
        if (ch === "」" && --depth === 0) {
          const quote = pending.slice(1, -1);
          if (
            quotations < 2 &&
            documents.some((text) => text.includes(quote))
          ) {
            output += pending;
            quotations++;
          } else output += quote.replace(/[「」]/g, "");
          pending = "";
        }
      }
      return output;
    },
    finish() {
      const rest = pending.replace(/[「」]/g, "");
      pending = "";
      depth = 0;
      return rest;
    },
  };
}
