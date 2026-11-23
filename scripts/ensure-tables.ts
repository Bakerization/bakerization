/**
 * One-off: create / migrate the blog, news and research tables and indexes.
 *   npm run ensure:tables            (reads .env)
 * Safe to re-run. Reads no longer run DDL on cold start, so run this once per
 * environment (and after a schema change) before the first request.
 */
import { ensureNewsTable } from "../lib/news-store";
import { ensureResearchTables } from "../lib/research-schema";
import { ensureBlogTable } from "../lib/blog-store";
import { ensureIkedaTables } from "../lib/ikeda-schema";
import { ensureBlogTranslations } from "../lib/blog-translations";

async function main() {
  await ensureBlogTable();
  await ensureIkedaTables();
  await ensureBlogTranslations();
  console.log("blog_posts: ok");
  await ensureNewsTable();
  console.log("news_posts: ok");
  await ensureResearchTables();
  console.log("research_projects / research_artifacts: ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
