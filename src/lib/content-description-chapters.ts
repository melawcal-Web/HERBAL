import type { ContentChapter } from "@/lib/content-chapters";
import { parseContentChapters } from "@/lib/content-chapters";

/** פרקי אקורדיון ממטא-דאטה, או פירוק תיאור לפסקאות */
export function chaptersFromProductMeta(
  metadata: unknown,
  description: string,
  courseDetails?: string,
): ContentChapter[] {
  const fromMeta = parseContentChapters(
    metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>).chapters
      : null,
  );
  if (fromMeta.length > 0) return fromMeta;

  const parts: string[] = [];
  if (courseDetails?.trim()) parts.push(courseDetails.trim());
  if (description.trim()) parts.push(description.trim());

  const blob = parts.join("\n\n");
  if (!blob) return [];

  const paragraphs = blob.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length <= 1) {
    return [{ id: "ch-0", title: "תיאור", body: blob }];
  }

  return paragraphs.map((body, i) => ({
    id: `ch-${i}`,
    title: `פרק ${i + 1}`,
    body,
  }));
}

export function chaptersFromArticleBody(body: string, excerpt: string): ContentChapter[] {
  const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length <= 1) {
    const text = body.trim() || excerpt.trim();
    return text ? [{ id: "ch-0", title: "תוכן המאמר", body: text }] : [];
  }
  return paragraphs.map((p, i) => ({
    id: `ch-${i}`,
    title: `פרק ${i + 1}`,
    body: p,
  }));
}
