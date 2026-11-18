import { createHmac } from "node:crypto";
import { IKEDA } from "@/lib/ikeda-config";
import { ikedaSql } from "@/lib/ikeda-schema";

export async function reserveIkedaRequest(address: string) {
  const secret =
    process.env.BETTER_AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.DATABASE_URL!;
  const visitor = createHmac("sha256", secret).update(address).digest("hex");
  const rows =
    await ikedaSql()`INSERT INTO ikeda_daily_usage (day,request_count,visitors)
    VALUES ((NOW() AT TIME ZONE 'Asia/Tokyo')::date,1,jsonb_build_object(${visitor}::text,1,'_minute',floor(extract(epoch FROM NOW())/60)::bigint,'_minute_count',1))
    ON CONFLICT (day) DO UPDATE SET request_count = ikeda_daily_usage.request_count + 1,
      visitors = ikeda_daily_usage.visitors || jsonb_build_object(${visitor}::text,COALESCE((ikeda_daily_usage.visitors->>${visitor}::text)::int,0)+1,
        '_minute',floor(extract(epoch FROM NOW())/60)::bigint,'_minute_count',CASE WHEN (ikeda_daily_usage.visitors->>'_minute')::bigint=floor(extract(epoch FROM NOW())/60)::bigint THEN COALESCE((ikeda_daily_usage.visitors->>'_minute_count')::int,0)+1 ELSE 1 END)
    WHERE ikeda_daily_usage.request_count < ${IKEDA.dailyRequests}
      AND COALESCE((ikeda_daily_usage.visitors->>${visitor}::text)::int,0) < ${IKEDA.visitorDailyRequests}
      AND ikeda_daily_usage.input_tokens < ${IKEDA.dailyInputTokens} AND ikeda_daily_usage.output_tokens < ${IKEDA.dailyOutputTokens}
      AND ((ikeda_daily_usage.visitors->>'_minute') IS NULL OR (ikeda_daily_usage.visitors->>'_minute')::bigint<>floor(extract(epoch FROM NOW())/60)::bigint OR COALESCE((ikeda_daily_usage.visitors->>'_minute_count')::int,0)<${IKEDA.minuteRequests})
    RETURNING day`;
  if (rows.length) return { allowed: true as const };
  const current =
    await ikedaSql()`SELECT request_count,input_tokens,output_tokens,COALESCE((visitors->>${visitor}::text)::int,0) AS visitor_count FROM ikeda_daily_usage WHERE day=(NOW() AT TIME ZONE 'Asia/Tokyo')::date`;
  const r = current[0];
  const daily =
    r &&
    (r.request_count >= IKEDA.dailyRequests ||
      r.visitor_count >= IKEDA.visitorDailyRequests ||
      Number(r.input_tokens) >= IKEDA.dailyInputTokens ||
      Number(r.output_tokens) >= IKEDA.dailyOutputTokens);
  return {
    allowed: false as const,
    reason: daily ? ("daily" as const) : ("minute" as const),
  };
}
export async function recordIkedaUsage(input: number, output: number) {
  await ikedaSql()`UPDATE ikeda_daily_usage SET input_tokens = input_tokens + ${input},output_tokens = output_tokens + ${output}
    WHERE day = (NOW() AT TIME ZONE 'Asia/Tokyo')::date`;
}
