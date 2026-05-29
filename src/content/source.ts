import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { contentEntrySchema, type ContentEntry } from "@/content/schema";

const contentRoot = path.join(process.cwd(), "content");

function walkMdxFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walkMdxFiles(entryPath);
    }

    if (entry.isFile() && entry.name.endsWith(".mdx")) {
      return [entryPath];
    }

    return [];
  });
}

function normalizeDate(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value;
}

export function getContentEntries(locale = "en"): ContentEntry[] {
  return walkMdxFiles(path.join(contentRoot, locale))
    .map((filePath) => {
      const source = fs.readFileSync(filePath, "utf8");
      const { data } = matter(source);

      return contentEntrySchema.parse({
        ...data,
        date: normalizeDate(data.date),
      });
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}
