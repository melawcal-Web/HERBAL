/** פרקים (אקורדיון) לתיאור תוכן — וידאו, פודקאסט, קורסים */
export type ContentChapter = {
  id: string;
  title: string;
  body: string;
};

export function parseContentChapters(raw: unknown): ContentChapter[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, i) => {
      if (item == null || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const title = typeof o.title === "string" ? o.title.trim() : "";
      const body = typeof o.body === "string" ? o.body.trim() : "";
      if (!title && !body) return null;
      const id = typeof o.id === "string" && o.id ? o.id : `ch-${i}`;
      return { id, title: title || `פרק ${i + 1}`, body };
    })
    .filter((x): x is ContentChapter => x != null);
}

export function serializeContentChapters(chapters: ContentChapter[]): ContentChapter[] {
  return chapters.map((c, i) => ({
    id: c.id || `ch-${i}`,
    title: c.title.trim(),
    body: c.body.trim(),
  }));
}
