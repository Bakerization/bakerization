import { IKEDA_ARTICLE_SLUG } from "@/lib/ikeda-sources";
import { z } from "zod";
import { IKEDA, IKEDA_THEMES } from "@/lib/ikeda-config";

export const thoughtSchema = z.object({
  authorship: z.enum([
    "ikeda_explicit",
    "other_explicit",
    "collective_unknown",
  ]),
  authorshipEvidence: z.string(),
  summary: z.string(),
  themes: z.array(
    z.enum(IKEDA_THEMES.map((t) => t.id) as [string, ...string[]]),
  ),
  question: z.string(),
  concepts: z.array(z.string()),
  claims: z.array(
    z.object({
      statement: z.string(),
      basis: z.string(),
      quote: z.string(),
      voice: z.enum(["narrator", "interviewee", "other_author", "unclear"]),
    }),
  ),
});
export type Thought = z.infer<typeof thoughtSchema>;
export type IkedaSource = {
  number: number;
  slug: string;
  title: string;
  date: string;
  url: string;
  excerpt: string;
  themes: string[];
  thought?: Thought;
};
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: IkedaSource[];
};
export const chatRequestSchema = z.strictObject({
  locale: z.enum(["ja", "en", "zh", "ko"]).default("ja"),
  question: z.string().trim().min(1).max(IKEDA.questionCharacters),
  history: z
    .array(
      z.strictObject({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(5000),
      }),
    )
    .max(IKEDA.historyMessages)
    .default([]),
  theme: z.string().max(30).optional(),
  year: z.number().int().min(2009).max(2100).optional(),
  article: z.string().regex(IKEDA_ARTICLE_SLUG).optional(),
});
export type ChatEvent =
  | { type: "sources"; sources: IkedaSource[] }
  | { type: "delta"; text: string }
  | {
      type: "done";
      sources: IkedaSource[];
      usage: {
        inputTokens: number;
        outputTokens: number;
        contextTokens: number;
      };
    }
  | { type: "error"; message: string };
