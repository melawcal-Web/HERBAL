"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { HeroSlide } from "@/lib/site-config";
import { writeAudit } from "@/lib/audit";

function assertHttpsUrl(url: string) {
  const u = url.trim();
  if (!u.startsWith("https://")) throw new Error("כתובת תמונה חייבת להתחיל ב-https");
  if (u.length > 2000) throw new Error("כתובת ארוכה מדי");
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
