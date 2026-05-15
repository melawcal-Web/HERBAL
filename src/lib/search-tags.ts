import { prisma } from "@/lib/prisma";
import { parseProductTags } from "@/lib/product-metadata";

function tagsFromJson(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((t): t is string => typeof t === "string" && t.trim().length > 0).map((t) => t.trim());
}

/** אוסף תגיות ייחודיות מהמסד (מוצרים + מאמרים + התמחויות מטפלים) */
export async function collectSiteTags(limit = 200): Promise<string[]> {
  const [products, articles, profiles] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, select: { tags: true, title: true } }),
    prisma.herbalArticle.findMany({ where: { published: true }, select: { tags: true, category: true } }),
    prisma.therapistProfile.findMany({
      select: { specialty1: true, specialty2: true, specialty3: true },
    }),
  ]);

  const set = new Set<string>();
  for (const p of products) {
    for (const t of parseProductTags(p.tags)) set.add(t);
    if (p.title.trim()) set.add(p.title.trim().slice(0, 40));
  }
  for (const a of articles) {
    for (const t of tagsFromJson(a.tags)) set.add(t);
    if (a.category?.trim()) set.add(a.category.trim());
  }
  for (const pr of profiles) {
    for (const s of [pr.specialty1, pr.specialty2, pr.specialty3]) {
      if (s?.trim()) set.add(s.trim());
    }
  }

  return [...set].sort((a, b) => a.localeCompare(b, "he")).slice(0, limit);
}

export async function suggestTags(query: string, therapistUserId?: string, limit = 12): Promise<string[]> {
  const q = query.trim();
  if (q.length < 1) return [];

  let pool = await collectSiteTags(300);
  if (therapistUserId) {
    const [products, articles, profile] = await Promise.all([
      prisma.product.findMany({
        where: { active: true, therapistId: therapistUserId },
        select: { tags: true, title: true },
      }),
      prisma.herbalArticle.findMany({
        where: { published: true, therapistId: therapistUserId },
        select: { tags: true, category: true },
      }),
      prisma.therapistProfile.findUnique({
        where: { userId: therapistUserId },
        select: { specialty1: true, specialty2: true, specialty3: true },
      }),
    ]);
    pool = [];
    const set = new Set<string>();
    for (const p of products) {
      for (const t of parseProductTags(p.tags)) set.add(t);
      if (p.title.trim()) set.add(p.title.trim().slice(0, 40));
    }
    for (const a of articles) {
      for (const t of tagsFromJson(a.tags)) set.add(t);
      if (a.category?.trim()) set.add(a.category.trim());
    }
    if (profile) {
      for (const s of [profile.specialty1, profile.specialty2, profile.specialty3]) {
        if (s?.trim()) set.add(s.trim());
      }
    }
    pool = [...set].sort((a, b) => a.localeCompare(b, "he"));
  }

  const lower = q.toLowerCase();
  return pool.filter((t) => t.includes(q) || t.toLowerCase().includes(lower)).slice(0, limit);
}
