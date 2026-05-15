"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { assertAdmin } from "@/lib/formula";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";

const httpsUrl = z.string().url().refine((u) => u.startsWith("https://"), "יש להזין כתובת https מלאה");

function excerptFromBody(body: string): string {
  const flat = body.replace(/\s+/g, " ").trim();
  if (flat.length <= 480) return flat;
  return `${flat.slice(0, 477)}…`;
}

function articleSlug(): string {
  return `article-${randomBytes(9).toString("base64url").replace(/=/g, "").slice(0, 14)}`;
}

async function requireAdminActorId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id || !assertAdmin(session.user.role)) {
    throw new Error("אין הרשאה");
  }
  return session.user.id;
}

async function defaultArticleTherapistId(): Promise<string> {
  const u = await prisma.user.findFirst({
    where: { role: "therapist" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!u) throw new Error("לא נמצא מטפל לשיוך מאמר");
  return u.id;
}

export async function createAdminArticle(input: {
  title: string;
  content: string;
  category: string;
  imageUrl: string;
}): Promise<void> {
  const actorId = await requireAdminActorId();
  const schema = z.object({
    title: z.string().min(1).max(240),
    content: z.string().min(20),
    category: z.string().min(1).max(120),
    imageUrl: httpsUrl,
  });
  const p = schema.safeParse(input);
  if (!p.success) {
    const first = Object.values(p.error.flatten().fieldErrors)[0]?.[0];
    throw new Error(first ?? "נתוני מאמר לא תקינים");
  }

  const therapistId = await defaultArticleTherapistId();
  let slug = articleSlug();
  for (let i = 0; i < 6; i++) {
    // eslint-disable-next-line no-await-in-loop
    const taken = await prisma.herbalArticle.findUnique({ where: { slug } });
    if (!taken) break;
    slug = articleSlug();
  }

  const row = await prisma.herbalArticle.create({
    data: {
      therapistId,
      title: p.data.title,
      slug,
      category: p.data.category,
      body: p.data.content,
      excerpt: excerptFromBody(p.data.content),
      coverImageUrl: p.data.imageUrl,
      published: true,
    },
  });

  await writeAudit({
    actorId,
    action: "admin.article.create",
    entityType: "HerbalArticle",
    entityId: row.id,
    metadata: { title: row.title },
  });

  revalidatePath("/");
  revalidatePath("/herbal-index");
  revalidatePath(`/herbal-index/${row.slug}`);
}

export async function createAdminFrontalCourse(input: {
  title: string;
  location: string;
  startsAt: string;
  price: number;
  memberPrice: number;
  maxParticipants: number;
  imageUrl: string;
  courseDetails?: string;
}): Promise<void> {
  const actorId = await requireAdminActorId();
  const schema = z.object({
    title: z.string().min(1).max(200),
    location: z.string().min(1).max(200),
    startsAt: z.string().min(1),
    price: z.number().positive(),
    memberPrice: z.number().positive(),
    maxParticipants: z.number().int().positive().max(500),
    imageUrl: httpsUrl,
    courseDetails: z.string().max(8000).optional(),
  });
  const p = schema.safeParse(input);
  if (!p.success) {
    const first = Object.values(p.error.flatten().fieldErrors)[0]?.[0];
    throw new Error(first ?? "נתונים לא תקינים");
  }

  const starts = new Date(p.data.startsAt);
  if (Number.isNaN(starts.getTime())) throw new Error("מועד לא תקין");

  const metadata = {
    location: p.data.location,
    startsAt: starts.toISOString(),
    maxParticipants: p.data.maxParticipants,
    ...(p.data.courseDetails?.trim() ? { courseDetails: p.data.courseDetails.trim() } : {}),
  };

  const description = `קורס פרונטלי · ${p.data.location} · ${starts.toLocaleString("he-IL")}`;

  const row = await prisma.product.create({
    data: {
      type: "workshop",
      title: p.data.title,
      description,
      imageUrl: p.data.imageUrl,
      metadata,
      price: new Prisma.Decimal(p.data.price),
      memberPrice: new Prisma.Decimal(p.data.memberPrice),
      active: true,
      isWaitlist: true,
      minParticipants: p.data.maxParticipants > 0 ? Math.min(p.data.maxParticipants, 5) : 5,
      currentRegistered: 0,
    },
  });

  await writeAudit({
    actorId,
    action: "admin.product.workshop.create",
    entityType: "Product",
    entityId: row.id,
    metadata: { title: row.title },
  });

  revalidatePath("/");
  revalidatePath("/marketplace");
}

export async function createAdminZoomSession(input: {
  title: string;
  zoomUrl: string;
  startsAt: string;
  price: number;
  memberPrice: number;
  maxParticipants: number;
  imageUrl: string;
  courseDetails?: string;
}): Promise<void> {
  const actorId = await requireAdminActorId();
  const schema = z.object({
    title: z.string().min(1).max(200),
    zoomUrl: z.string().url().refine((u) => u.startsWith("https://"), "קישור זום חייב להתחיל ב-https"),
    startsAt: z.string().min(1),
    price: z.number().positive(),
    memberPrice: z.number().positive(),
    maxParticipants: z.number().int().positive().max(500),
    imageUrl: httpsUrl,
    courseDetails: z.string().max(8000).optional(),
  });
  const p = schema.safeParse(input);
  if (!p.success) {
    const first = Object.values(p.error.flatten().fieldErrors)[0]?.[0];
    throw new Error(first ?? "נתונים לא תקינים");
  }

  const starts = new Date(p.data.startsAt);
  if (Number.isNaN(starts.getTime())) throw new Error("מועד לא תקין");

  const metadata = {
    zoomUrl: p.data.zoomUrl,
    startsAt: starts.toISOString(),
    maxParticipants: p.data.maxParticipants,
    ...(p.data.courseDetails?.trim() ? { courseDetails: p.data.courseDetails.trim() } : {}),
  };

  const description = `מפגש זום · ${starts.toLocaleString("he-IL")}`;

  const row = await prisma.product.create({
    data: {
      type: "zoom",
      title: p.data.title,
      description,
      imageUrl: p.data.imageUrl,
      metadata,
      price: new Prisma.Decimal(p.data.price),
      memberPrice: new Prisma.Decimal(p.data.memberPrice),
      active: true,
      isWaitlist: true,
      minParticipants: 5,
      currentRegistered: 0,
    },
  });

  await writeAudit({
    actorId,
    action: "admin.product.zoom.create",
    entityType: "Product",
    entityId: row.id,
    metadata: { title: row.title },
  });

  revalidatePath("/");
  revalidatePath("/marketplace");
}

export async function createAdminSupervisionSession(input: {
  topic: string;
  startsAt: string;
  price: number;
  maxParticipants: number;
  imageUrl: string;
  courseDetails?: string;
}): Promise<void> {
  const actorId = await requireAdminActorId();
  const schema = z.object({
    topic: z.string().min(1).max(200),
    startsAt: z.string().min(1),
    price: z.number().positive(),
    maxParticipants: z.number().int().positive().max(200),
    imageUrl: httpsUrl,
    courseDetails: z.string().max(8000).optional(),
  });
  const p = schema.safeParse(input);
  if (!p.success) {
    const first = Object.values(p.error.flatten().fieldErrors)[0]?.[0];
    throw new Error(first ?? "נתונים לא תקינים");
  }

  const starts = new Date(p.data.startsAt);
  if (Number.isNaN(starts.getTime())) throw new Error("מועד לא תקין");

  const metadata = {
    startsAt: starts.toISOString(),
    maxParticipants: p.data.maxParticipants,
    ...(p.data.courseDetails?.trim() ? { courseDetails: p.data.courseDetails.trim() } : {}),
  };

  const description = `השגחה מקצועית · ${starts.toLocaleString("he-IL")}`;

  const row = await prisma.product.create({
    data: {
      type: "supervision",
      title: p.data.topic,
      description,
      imageUrl: p.data.imageUrl,
      metadata,
      price: new Prisma.Decimal(p.data.price),
      memberPrice: new Prisma.Decimal(p.data.price),
      active: true,
      isWaitlist: true,
      minParticipants: Math.max(3, p.data.maxParticipants),
      currentRegistered: 0,
    },
  });

  await writeAudit({
    actorId,
    action: "admin.product.supervision.create",
    entityType: "Product",
    entityId: row.id,
    metadata: { title: row.title },
  });

  revalidatePath("/");
  revalidatePath("/marketplace");
}
