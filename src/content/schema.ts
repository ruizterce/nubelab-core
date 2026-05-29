import { z } from "zod";

export const contentKindSchema = z.enum([
  "architecture",
  "integration",
  "lab",
  "field-note",
  "system",
]);

export const contentEntrySchema = z.object({
  title: z.string(),
  slug: z.string(),
  kind: contentKindSchema,
  summary: z.string(),
  maturity: z.enum(["draft", "mapped", "active", "stable"]),
  date: z.string(),
  tags: z.array(z.string()).default([]),
  locale: z.enum(["en", "es"]).default("en"),
});

export type ContentEntry = z.infer<typeof contentEntrySchema>;
