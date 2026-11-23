import {
  isTranslationLanguage,
  type TranslationLanguage,
} from "@/lib/blog-language";
import { blogText } from "@/lib/blog-copy";
import { isIP } from "node:net";
import {
  getBlogTranslation,
  translationSource,
  claimBlogTranslation,
  releaseBlogTranslation,
  translateBlogArticle,
  saveBlogTranslation,
} from "@/lib/blog-translations";
import { BLOG_TRANSLATION as C } from "@/lib/blog-translation-config";
import { reserveIkedaRequest, recordIkedaUsage } from "@/lib/ikeda-quota";
import { revalidatePath } from "next/cache";
import { sanitizeBlogHtml } from "@/lib/blog-html";
export const maxDuration = 300;
const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};
export async function POST(request: Request) {
  if (
    request.headers.get("origin") !== new URL(request.url).origin ||
    ["cross-site", "same-site"].includes(
      request.headers.get("sec-fetch-site") || "",
    )
  )
    return Response.json(
      { error: "Open this article on Bakerization to translate it." },
      { status: 403, headers },
    );
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json")
    return Response.json(
      { error: "Invalid request." },
      { status: 415, headers },
    );
  let slug: string;
  let language: TranslationLanguage = "en";
  try {
    if (
      !request.body ||
      Number(request.headers.get("content-length")) > C.requestBytes
    )
      throw Error();
    const reader = request.body.getReader();
    let size = 0,
      raw = "";
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > C.requestBytes) {
          await reader.cancel();
          throw Error();
        }
        raw += decoder.decode(value, { stream: true });
      }
      raw += decoder.decode();
    } finally {
      reader.releaseLock();
    }
    const body = JSON.parse(raw);
    slug = body.slug;
    if (body.language !== undefined) {
      if (!isTranslationLanguage(body.language)) throw Error();
      language = body.language;
    }
    if (typeof slug !== "string" || !/^[a-z0-9-]{1,160}$/.test(slug))
      throw Error();
  } catch {
    return Response.json(
      { error: "Invalid article." },
      { status: 400, headers },
    );
  }
  let hash = "";
  try {
    const source = await translationSource(slug);
    if (!source)
      return Response.json(
        { error: "Article not found." },
        { status: 404, headers },
      );
    if (language === "en" && source.title_en && source.content_html_en)
      return Response.json(
        {
          title: source.title_en,
          excerpt: source.excerpt_en,
          contentHtml: sanitizeBlogHtml(source.content_html_en),
        },
        { headers },
      );
    const existing = await getBlogTranslation(slug, language);
    if (existing?.contentHtml)
      return Response.json(
        { ...existing, contentHtml: sanitizeBlogHtml(existing.contentHtml) },
        { headers },
      );
    hash = source.source_hash;
    if (!(await claimBlogTranslation(slug, hash, language)))
      return Response.json(
        { pending: true },
        { status: 202, headers: { ...headers, "Retry-After": "5" } },
      );
    const address =
      request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() || "";
    const quota = await reserveIkedaRequest(
      isIP(address) ? address : "unknown",
    );
    if (!quota.allowed) {
      await releaseBlogTranslation(slug, hash, language);
      return Response.json(
        {
          error: blogText(
            language,
            "",
            "Translation limit reached. Please try again later.",
          ),
        },
        { status: 429, headers },
      );
    }
    const translated = await translateBlogArticle(
      source,
      AbortSignal.any([
        request.signal,
        AbortSignal.timeout(C.articleTimeoutMs),
      ]),
      language,
    );
    translated.contentHtml = sanitizeBlogHtml(translated.contentHtml);
    await saveBlogTranslation(slug, translated, language);
    await recordIkedaUsage(
      translated.inputTokens,
      translated.outputTokens,
    ).catch(() => console.error("[blog translation] usage update failed"));
    revalidatePath(`/${language}/blog/${slug}`);
    revalidatePath(`/${language}/blog`);
    revalidatePath("/sitemap.xml");
    return Response.json(
      {
        title: translated.title,
        excerpt: translated.excerpt,
        contentHtml: translated.contentHtml,
      },
      { headers },
    );
  } catch (e) {
    if (hash)
      await releaseBlogTranslation(slug, hash, language).catch(() => {});
    console.error("[blog translation]", e instanceof Error ? e.name : "Error");
    return Response.json(
      {
        error: blogText(
          language,
          "",
          "Translation is temporarily unavailable. The original article is shown below.",
        ),
      },
      { status: 503, headers },
    );
  }
}
