import { z } from "zod";

export const partnershipRequest = z.strictObject({
  company: z.string().trim().min(1).max(100).regex(/[\p{L}\p{N}]/u).refine((name) => !/\p{Cc}/u.test(name)),
  website: z.string().trim().max(300).default(""),
  locale: z.enum(["ja", "en"]).default("ja"),
});

const proposal = z.object({
  title: z.string(),
  concept: z.string(),
  partnerRole: z.string(),
  bakerizationRole: z.string(),
  revenue: z.string(),
  pilot: z.string(),
});

export const partnershipOutput = z.object({
  status: z.enum(["found", "needs_website"]),
  company: z.string(),
  profile: z.string(),
  sourceUrls: z.array(z.string()),
  proposals: z.array(proposal),
});

export type PartnershipResult = {
  company: string;
  profile: string;
  sources: { title: string; url: string }[];
  proposals: z.infer<typeof proposal>[];
};

export type PartnershipError = "invalid_input" | "needs_website" | "rate_limited" | "unavailable";
