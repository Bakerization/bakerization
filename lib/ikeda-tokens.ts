import { getEncoding } from "js-tiktoken";
import { IKEDA } from "@/lib/ikeda-config";

let encoder: ReturnType<typeof getEncoding> | undefined;
function encoding() {
  return (encoder ??= getEncoding("o200k_base"));
}
export function tokenCount(text: string) {
  return encoding().encode(text).length;
}
export function trimTokens(text: string, max: number) {
  if (tokenCount(text) <= max) return text;
  const chars = Array.from(text);
  let low = 0,
    high = chars.length;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (tokenCount(chars.slice(0, middle).join("")) <= max) low = middle;
    else high = middle - 1;
  }
  return chars.slice(0, low).join("");
}
/** Sentence/paragraph boundaries first; long paragraphs get a bounded sliding window. */
export function chunkText(text: string) {
  const pieces: { start: number; end: number }[] = [];
  let start = 0;
  const addPiece = (end: number) => {
    const raw = text.slice(start, end);
    const trimmed = raw.trim();
    if (trimmed) {
      const offset = raw.indexOf(trimmed);
      pieces.push({
        start: start + offset,
        end: start + offset + trimmed.length,
      });
    }
  };
  for (const match of text.matchAll(/\n\s*\n|(?<=[。！？])\n/g)) {
    addPiece(match.index);
    start = match.index + match[0].length;
  }
  addPiece(text.length);
  const chunks: string[] = [];
  let current: { start: number; end: number } | undefined;
  for (const piece of pieces) {
    if (
      tokenCount(text.slice(current?.start ?? piece.start, piece.end)) <=
      IKEDA.chunkTokens
    ) {
      current = { start: current?.start ?? piece.start, end: piece.end };
      continue;
    }
    if (current) chunks.push(text.slice(current.start, current.end));
    current = undefined;
    const body = text.slice(piece.start, piece.end);
    if (tokenCount(body) <= IKEDA.chunkTokens) {
      current = piece;
      continue;
    }
    let rest = body;
    while (rest) {
      const head = trimTokens(rest, IKEDA.chunkTokens);
      chunks.push(head);
      if (head.length === rest.length) break;
      const points = Array.from(head);
      let tail = "";
      for (let i = points.length - 1; i >= 0; i--) {
        const candidate = points[i] + tail;
        if (tokenCount(candidate) > IKEDA.overlapTokens) break;
        tail = candidate;
      }
      rest = tail + rest.slice(head.length);
    }
  }
  if (current) chunks.push(text.slice(current.start, current.end));
  return chunks;
}
