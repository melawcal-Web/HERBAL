"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { HeroSlide } from "@/lib/site-config";
import type { VisionSlide } from "@/lib/home-vision";
import { writeAudit } from "@/lib/audit";

function assertHttpsUrl(url: string) {
  const u = url.trim();
  if (!u.startsWith("https://")) throw new Error("כתובת תמונה חייבת להתחיל ב-https");
  if (u.length > 2000) throw new Error("כתובת ארוכה מדי");
}

function parseOptionalColor(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const t = raw.trim();
  if (!t.length) return null;
  if (/^#[0-9A-Fa-f]{3,8}$/.test(t)) return t;
  if (/^rgba?\(/.test(t)) return t;
  throw new Error("צבע רקע לא תקין (השתמשו ב-#RRGGBB או rgba)");
}

export async function updateSiteServiceUsernames(input: {
  githubUsername: string;
  vercelUsername: string;
  railwayUsername: string;
}) {
  await prisma.siteConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      heroSlides: [],
      siteTitle: null,
      visionSlides: null,
      githubUsername: input.githubUsername.trim() || null,
      vercelUsername: input.vercelUsername.trim() || null,
      railwayUsername: input.railwayUsername.trim() || null,
    },
    update: {
      githubUsername: input.githubUsername.trim() || null,
      vercelUsername: input.vercelUsername.trim() || null,
      railwayUsername: input.railwayUsername.trim() || null,
    },
  });

  await writeAudit({
    action: "site_config.services",
    entityType: "SiteConfig",
    entityId: "default",
    metadata: { keys: ["github", "vercel", "railway"] },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/links");
}

export async function updateSiteHeroSlides(slides: HeroSlide[]) {
  if (slides.length > 12) throw new Error("עד 12 שקופיות");
  const cleaned: HeroSlide[] = [];
  for (const s of slides) {
    assertHttpsUrl(s.imageUrl);
    const cap = s.caption.trim();
    if (!cap || cap.length > 500) throw new Error("טקסט קצר או ארוך מדי לכל שקופית");
    cleaned.push({ imageUrl: s.imageUrl.trim(), caption: cap });
  }
  if (cleaned.length === 0) throw new Error("חובה לפחות שקופית אחת");

  const json = cleaned as unknown as Prisma.InputJsonValue;

  await prisma.siteConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      heroSlides: json,
      siteTitle: null,
      visionSlides: null,
    },
    update: {
      heroSlides: json,
    },
  });

  await writeAudit({
    action: "site_config.hero",
    entityType: "SiteConfig",
    entityId: "default",
    metadata: { count: cleaned.length },
  });

  revalidatePath("/", "layout");
}

export async function updateSiteTitle(title: string) {
  const t = title.trim().slice(0, 255);
  if (!t.length) throw new Error("כותרת האתר ריקה");

  await prisma.siteConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      heroSlides: [],
      siteTitle: t,
      visionSlides: null,
    },
    update: { siteTitle: t },
  });

  await writeAudit({
    action: "site_config.title",
    entityType: "SiteConfig",
    entityId: "default",
    metadata: { length: t.length },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
}

export async function updateVisionSlides(slides: VisionSlide[]) {
  if (slides.length > 12) throw new Error("עד 12 שקופיות");
  if (slides.length === 0) throw new Error("חובה לפחות שקופית אחת");

  const cleaned: VisionSlide[] = [];
  for (const s of slides) {
    const id = s.id.trim();
    const title = s.title.trim();
    const body = s.body.trim();
    if (!id || !title || !body) throw new Error("מזהה, כותרת ותיאור נדרשים לכל שקופית");
    const eyebrow = s.eyebrow?.trim() || undefined;
    let imageUrl: string | null | undefined = s.imageUrl?.trim() || null;
    if (imageUrl) {
      assertHttpsUrl(imageUrl);
      imageUrl = imageUrl.trim();
    } else {
      imageUrl = null;
    }
    const gradientFrom = parseOptionalColor(s.gradientFrom ?? null);
    const gradientTo = parseOptionalColor(s.gradientTo ?? null);
    cleaned.push({
      id,
      eyebrow,
      title,
      body,
      imageUrl,
      gradientFrom,
      gradientTo,
    });
  }

  const json = cleaned as unknown as Prisma.InputJsonValue;

  await prisma.siteConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      heroSlides: [],
      siteTitle: null,
      visionSlides: json,
    },
    update: { visionSlides: json },
  });

  await writeAudit({
    action: "site_config.vision",
    entityType: "SiteConfig",
    entityId: "default",
    metadata: { count: cleaned.length },
  });

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/admin/content");
}
