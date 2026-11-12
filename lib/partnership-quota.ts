import { createHmac } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const DAILY_LIMIT = 60;
const VISITOR_LIMIT = 5;

export async function reservePartnershipRequest(databaseUrl: string, address: string, secret: string) {
  const sql = neon(databaseUrl, { fetchOptions: { signal: AbortSignal.timeout(8_000) } });
  const visitor = createHmac("sha256", secret).update(address).digest("hex");

  const reserve = () => sql`
    WITH expired AS (
      DELETE FROM partnership_daily_usage
      WHERE day < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Tokyo')::date - 1
    )
    INSERT INTO partnership_daily_usage (day, request_count, visitors)
    VALUES ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Tokyo')::date, 1, jsonb_build_object(${visitor}::text, 1))
    ON CONFLICT (day) DO UPDATE
    SET request_count = partnership_daily_usage.request_count + 1,
        visitors = partnership_daily_usage.visitors || jsonb_build_object(
          ${visitor}::text, COALESCE((partnership_daily_usage.visitors ->> ${visitor}::text)::int, 0) + 1
        )
    WHERE partnership_daily_usage.request_count < ${DAILY_LIMIT}
      AND COALESCE((partnership_daily_usage.visitors ->> ${visitor}::text)::int, 0) < ${VISITOR_LIMIT}
    RETURNING request_count
  `;

  try {
    return (await reserve()).length > 0;
  } catch (error) {
    if ((error as { code?: string }).code !== "42P01") throw error;
  }

  // Concurrent first requests serialize table creation. Later requests skip DDL.
  await sql.transaction([
    sql`SELECT pg_advisory_xact_lock(614903125)`,
    sql`CREATE TABLE IF NOT EXISTS partnership_daily_usage (
      day DATE PRIMARY KEY,
      request_count INTEGER NOT NULL,
      visitors JSONB NOT NULL
    )`,
  ]);
  return (await reserve()).length > 0;
}
