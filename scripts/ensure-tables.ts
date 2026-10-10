/**
 * One-off: create / migrate the news and research tables and indexes.
 * (The old blog_posts table is no longer managed; its rows are left in place.)
 *   npm run ensure:tables            (reads .env)
 * Safe to re-run. Reads no longer run DDL on cold start, so run this once per
 * environment (and after a schema change) before the first request.
 */
import { ensureNewsTable } from "../lib/news-store";
import { ensureResearchTables } from "../lib/research-schema";

async function main() {
  await ensureNewsTable();
  console.log("news_posts: ok");
  await ensureResearchTables();
  console.log("research_projects / research_artifacts: ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
