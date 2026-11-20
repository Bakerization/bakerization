import assert from "node:assert/strict";
import { test } from "node:test";
import { buildAlternates, sitemapEntries } from "../lib/seo";
import { HOME_VARIANTS } from "../lib/international";
import robots from "../app/robots";

test("all four translated home pages advertise reciprocal language URLs", () => {
  const expected = ["en", "ja", "ko", "x-default", "zh-Hans"];
  for (const locale of ["ja", "en"] as const) {
    const alternate = buildAlternates("/", locale);
    assert.deepEqual(Object.keys(alternate.languages ?? {}).sort(), expected);
    assert.equal(new URL(String(alternate.languages?.ko)).pathname, "/ko");
    assert.equal(new URL(String(alternate.languages?.["zh-Hans"])).pathname, "/zh");
    assert.equal(new URL(String(alternate.canonical)).search, locale === "en" ? "?lang=en" : "");
  }
  const entries = sitemapEntries("/");
  assert.equal(entries.length, HOME_VARIANTS.length);
  assert.equal(new Set(entries.map((entry) => entry.url)).size, 4);
  for (const entry of entries) {
    assert.deepEqual(entry.alternates?.languages, entries[0].alternates?.languages);
    assert.ok(Object.values(entry.alternates?.languages ?? {}).includes(entry.url));
  }
});

test("untranslated pages do not advertise Chinese or Korean copies", () => {
  const alternates = buildAlternates("/blog/example", "ja", ["ja"]);
  assert.equal(alternates.languages, undefined);
  const ordinary = buildAlternates("/about", "en");
  assert.deepEqual(Object.keys(ordinary.languages ?? {}).sort(), ["en", "ja", "x-default"]);
  assert.deepEqual(sitemapEntries("/blog/example", { available: ["ja"] }).map((x) => new URL(x.url).search), [""]);
});

test("public blog and news images are crawlable while other APIs stay excluded", () => {
  const previous = process.env.VERCEL_ENV;
  try {
    process.env.VERCEL_ENV = "production";
    const rules = robots().rules;
    const rule = Array.isArray(rules) ? rules[0] : rules;
    const allowed = [rule.allow].flat().filter((value): value is string => typeof value === "string");
    const denied = [rule.disallow].flat().filter((value): value is string => typeof value === "string");
    const mayCrawl = (path: string) => {
      const longestAllow = Math.max(-1, ...allowed.filter((prefix) => path.startsWith(prefix)).map((x) => x.length));
      const longestDisallow = Math.max(-1, ...denied.filter((prefix) => path.startsWith(prefix)).map((x) => x.length));
      return longestAllow >= longestDisallow;
    };
    assert.equal(mayCrawl("/api/blob/blog-assets/panlabo/photo.jpg"), true);
    assert.equal(mayCrawl("/api/blob/blog-assets/asahi-konopan/photo.jpg"), true);
    assert.equal(mayCrawl("/api/auth/session"), false);
    assert.equal(mayCrawl("/api/blob/private/report.html"), false);
    process.env.VERCEL_ENV = "preview";
    assert.deepEqual(robots().rules, [{ userAgent: "*", disallow: "/" }]);
  } finally {
    if (previous === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previous;
  }
});
