"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { assertTherapist } from "@/lib/formula";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import type { ContentAudienceId } from "@/lib/content-audience";
import { storedImageUrlSchema } from "@/lib/stored-image-url";

const audienceSchema = z
  .array(z.enum(["therapist", "student", "interested"]))
  .min(1, "יש לבחור לפחות קהל יעד אחד")
  .optional();

const imageUrlField = storedImageUrlSchema;

function excerptFromBody(body: string): string {
  const flat = body.replace(/\s+/g, " ").trim();
  if (flat.length <= 480) return flat;
  return `${flat.slice(0, 477)}…`;
}

function articleSlug(): string {
  return `article-${randomBytes(9).toString("base64url").replace(/=/g, "").slice(0, 14)}`;
}

async function requireTherapistUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id || !assertTherapist(session.user.role)) {
    throw new Error("יש להתחבר כמטפל/ת");
  }
  return session.user.id;
}

async function revalidateTherapistPaths(userId: string): Promise<void> {
  const profile = await prisma.therapistProfile.findUnique({
    where: { userId },
    select: { id: true, slug: true },
  });
  if (profile) {
    revalidatePath(`/therapists/${profile.id}`);
    revalidatePath(`/t/${profile.slug}`);
    for (const kind of ["articles", "courses", "recipes", "lectures"] as const) {
      revalidatePath(`/therapists/${profile.id}/content/${kind}`);
    }
  }
  revalidatePath("/herbal-index");
  revalidatePath("/marketplace");
}

export async function createTherapistArticle(input: {
  title: string;
  content: string;
  category: string;
  imageUrl: string;
}): Promise<void> {
  const therapistId = await requireTherapistUserId();
  const schema = z.object({
    title: z.string().min(1).max(240),
    content: z.string().min(20),
    category: z.string().min(1).max(120),
    imageUrl: imageUrlField,
  });
  const p = schema.safeParse(input);
  if (!p.success) {
    const first = Object.values(p.error.flatten().fieldErrors)[0]?.[0];
    throw new Error(first ?? "נתוני מאמר לא תקינים");
  }

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
    actorId: therapistId,
    action: "therapist.article.create",
    entityType: "HerbalArticle",
    entityId: row.id,
    metadata: { title: row.title },
  });

  await revalidateTherapistPaths(therapistId);
}

export async function createTherapistPlantArticle(input: {
  title: string;
  content: string;
  plantName: string;
  imageUrl: string;
}): Promise<void> {
  const plant = input.plantName.trim();
  const category = plant.length ? `צמח · ${plant}` : "צמח";
  await createTherapistArticle({
    title: input.title,
    content: input.content,
    category,
    imageUrl: input.imageUrl,
  });
}

export async function createTherapistWorkshop(input: {
  title: string;
  location: string;
  startsAt: string;
  price: number;
  memberPrice: number;
  maxParticipants: number;
  imageUrl: string;
  courseDetails?: string;
  audience?: ContentAudienceId[];
}): Promise<void> {
  const therapistId = await requireTherapistUserId();
  const schema = z.object({
    title: z.string().min(1).max(200),
    location: z.string().min(1).max(200),
    startsAt: z.string().min(1),
    price: z.number().positive(),
    memberPrice: z.number().positive(),
    maxParticipants: z.number().int().positive().max(500),
    imageUrl: imageUrlField,
    courseDetails: z.string().max(8000).optional(),
    audience: audienceSchema,
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

  const row = await prisma.product.create({
    data: {
      therapistId,
      type: "workshop",
      title: p.data.title,
      description: `סדנה · ${p.data.location} · ${starts.toLocaleString("he-IL")}`,
      imageUrl: p.data.imageUrl,
      metadata,
      price: new Prisma.Decimal(p.data.price),
      memberPrice: new Prisma.Decimal(p.data.memberPrice),
      active: true,
      isWaitlist: true,
      minParticipants: p.data.maxParticipants > 0 ? Math.min(p.data.maxParticipants, 5) : 5,
      currentRegistered: 0,
      audience: (p.data.audience ?? []) as Prisma.InputJsonValue,
    },
  });

  await writeAudit({
    actorId: therapistId,
    action: "therapist.product.workshop.create",
    entityType: "Product",
    entityId: row.id,
    metadata: { title: row.title },
  });

  await revalidateTherapistPaths(therapistId);
}

export async function createTherapistZoomSession(input: {
  title: string;
  zoomUrl: string;
  startsAt: string;
  price: number;
  memberPrice: number;
  maxParticipants: number;
  imageUrl: string;
  courseDetails?: string;
  audience?: ContentAudienceId[];
}): Promise<void> {
  const therapistId = await requireTherapistUserId();
  const schema = z.object({
    title: z.string().min(1).max(200),
    zoomUrl: z.string().url().refine((u) => u.startsWith("https://"), "קישור זום חייב להתחיל ב-https"),
    startsAt: z.string().min(1),
    price: z.number().positive(),
    memberPrice: z.number().positive(),
    maxParticipants: z.number().int().positive().max(500),
    imageUrl: imageUrlField,
    courseDetails: z.string().max(8000).optional(),
    audience: audienceSchema,
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

  const row = await prisma.product.create({
    data: {
      therapistId,
      type: "zoom",
      title: p.data.title,
      description: `מפגש זום · ${starts.toLocaleString("he-IL")}`,
      imageUrl: p.data.imageUrl,
      metadata,
      price: new Prisma.Decimal(p.data.price),
      memberPrice: new Prisma.Decimal(p.data.memberPrice),
      active: true,
      isWaitlist: true,
      minParticipants: 5,
      currentRegistered: 0,
      audience: (p.data.audience ?? []) as Prisma.InputJsonValue,
    },
  });

  await writeAudit({
    actorId: therapistId,
    action: "therapist.product.zoom.create",
    entityType: "Product",
    entityId: row.id,
    metadata: { title: row.title },
  });

  await revalidateTherapistPaths(therapistId);
}

export async function createTherapistLecture(input: {
  title: string;
  startsAt: string;
  price: number;
  memberPrice: number;
  maxParticipants: number;
  imageUrl: string;
  courseDetails?: string;
  audience?: ContentAudienceId[];
}): Promise<void> {
  const therapistId = await requireTherapistUserId();
  const schema = z.object({
    title: z.string().min(1).max(200),
    startsAt: z.string().min(1),
    price: z.number().positive(),
    memberPrice: z.number().positive(),
    maxParticipants: z.number().int().positive().max(500),
    imageUrl: imageUrlField,
    courseDetails: z.string().max(8000).optional(),
    audience: audienceSchema,
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

  const row = await prisma.product.create({
    data: {
      therapistId,
      type: "lecture",
      title: p.data.title,
      description: `הרצאה · ${starts.toLocaleString("he-IL")}`,
      imageUrl: p.data.imageUrl,
      metadata,
      price: new Prisma.Decimal(p.data.price),
      memberPrice: new Prisma.Decimal(p.data.memberPrice),
      active: true,
      isWaitlist: true,
      minParticipants: 5,
      currentRegistered: 0,
      audience: (p.data.audience ?? []) as Prisma.InputJsonValue,
    },
  });

  await writeAudit({
    actorId: therapistId,
    action: "therapist.product.lecture.create",
    entityType: "Product",
    entityId: row.id,
    metadata: { title: row.title },
  });

  await revalidateTherapistPaths(therapistId);
}
