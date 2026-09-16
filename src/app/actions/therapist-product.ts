"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type ProductType } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { assertTherapist, therapistCanEditProfile } from "@/lib/formula";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { storedImageUrlSchema } from "@/lib/stored-image-url";
import type { ContentAudienceId } from "@/lib/content-audience";
import {
  isProductFileUrl,
  PRODUCT_TYPE_OPTIONS,
  productTypeUsesWaitlist,
  withProductDownloadUrl,
} from "@/lib/product-metadata";

const PRODUCT_TYPES = PRODUCT_TYPE_OPTIONS.map((o) => o.id) as [ProductType, ...ProductType[]];

const audienceSchema = z
  .array(z.enum(["therapist", "student", "interested"]))
  .min(1, "יש לבחור לפחות קהל יעד אחד");

const optionalDownloadUrl = z.preprocess((v) => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}, z
  .string()
  .max(2000)
  .refine((u) => isProductFileUrl(u), "קישור ההורדה חייב להיות כתובת https או נתיב קובץ באתר")
  .optional());

const fieldsSchema = z.object({
  type: z.enum(PRODUCT_TYPES),
  title: z.string().min(1, "יש למלא כותרת").max(200),
  description: z.string().trim().min(1, "יש למלא תיאור").max(8000),
  price: z.number().positive("המחיר חייב להיות חיובי"),
  memberPrice: z.number().positive("מחיר החברים חייב להיות חיובי"),
  imageUrl: storedImageUrlSchema,
  audience: audienceSchema,
  downloadUrl: optionalDownloadUrl,
});

function firstZodError(error: z.ZodError): string {
  const msg = error.flatten().fieldErrors;
  return Object.values(msg)[0]?.[0] ?? "נתונים לא תקינים";
}

async function requireTherapistPublisher(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id || !assertTherapist(session.user.role)) {
    throw new Error("יש להתחבר כמטפל/ת");
  }
  if (session.user.role === "therapist") {
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { certificateUrl: true },
    });
    if (!therapistCanEditProfile(session.user.role, me?.certificateUrl)) {
      throw new Error("יש להעלות תעודה לפני פרסום תוכן");
    }
  }
  return session.user.id;
}

async function revalidateTherapistProductSurfaces(userId: string, productId?: string): Promise<void> {
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
  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath("/search");
  revalidatePath("/content-hub");
  revalidatePath("/dashboard/content");
  revalidatePath("/dashboard/products");
  if (productId) revalidatePath(`/dashboard/products/${productId}`);
}

export type TherapistDigitalProductInput = {
  type: ProductType;
  title: string;
  description: string;
  price: number;
  memberPrice: number;
  imageUrl: string;
  audience: ContentAudienceId[];
  downloadUrl?: string;
};

export async function createTherapistDigitalProduct(input: TherapistDigitalProductInput): Promise<void> {
  const therapistId = await requireTherapistPublisher();
  const parsed = fieldsSchema.safeParse(input);
  if (!parsed.success) throw new Error(firstZodError(parsed.error));

  const { type, title, description, price, memberPrice, imageUrl, audience, downloadUrl } = parsed.data;
  const metadata = withProductDownloadUrl(null, downloadUrl);

  const row = await prisma.product.create({
    data: {
      therapistId,
      type,
      title,
      description,
      imageUrl,
      metadata,
      price: new Prisma.Decimal(price),
      memberPrice: new Prisma.Decimal(memberPrice),
      active: true,
      isWaitlist: productTypeUsesWaitlist(type),
      audience: audience as Prisma.InputJsonValue,
    },
  });

  await writeAudit({
    actorId: therapistId,
    action: "therapist.product.digital.create",
    entityType: "Product",
    entityId: row.id,
    metadata: { title, type },
  });

  await revalidateTherapistProductSurfaces(therapistId, row.id);
}

export async function updateTherapistDigitalProduct(
  productId: string,
  input: TherapistDigitalProductInput,
): Promise<void> {
  const therapistId = await requireTherapistPublisher();
  const parsed = fieldsSchema.safeParse(input);
  if (!parsed.success) throw new Error(firstZodError(parsed.error));

  const existing = await prisma.product.findFirst({
    where: { id: productId, therapistId },
    select: { id: true, metadata: true, type: true },
  });
  if (!existing) throw new Error("המוצר לא נמצא או אינו שייך לחשבון זה");

  const { type, title, description, price, memberPrice, imageUrl, audience, downloadUrl } = parsed.data;
  const metadata = withProductDownloadUrl(existing.metadata, downloadUrl);

  await prisma.product.update({
    where: { id: existing.id },
    data: {
      type,
      title,
      description,
      imageUrl,
      metadata,
      price: new Prisma.Decimal(price),
      memberPrice: new Prisma.Decimal(memberPrice),
      audience: audience as Prisma.InputJsonValue,
      ...(existing.type !== type ? { isWaitlist: productTypeUsesWaitlist(type) } : {}),
    },
  });

  await writeAudit({
    actorId: therapistId,
    action: "therapist.product.digital.update",
    entityType: "Product",
    entityId: existing.id,
    metadata: { title, type },
  });

  await revalidateTherapistProductSurfaces(therapistId, existing.id);
}

export async function setTherapistProductActive(productId: string, active: boolean): Promise<void> {
  const therapistId = await requireTherapistPublisher();
  const existing = await prisma.product.findFirst({
    where: { id: productId, therapistId },
    select: { id: true, title: true },
  });
  if (!existing) throw new Error("המוצר לא נמצא או אינו שייך לחשבון זה");

  await prisma.product.update({
    where: { id: existing.id },
    data: { active },
  });

  await writeAudit({
    actorId: therapistId,
    action: active ? "therapist.product.activate" : "therapist.product.deactivate",
    entityType: "Product",
    entityId: existing.id,
    metadata: { title: existing.title, active },
  });

  await revalidateTherapistProductSurfaces(therapistId, existing.id);
}
