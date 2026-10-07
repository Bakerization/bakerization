import { notFound } from "next/navigation";

// Every unknown public path is rewritten to /{locale}/<path> and lands here,
// so it gets the branded not-found page (with fonts, nav and footer) instead of
// Next's bare built-in one. The 404 is cached like any other static response.
export const revalidate = 86400;

export default function CatchAllNotFound() {
  notFound();
}
