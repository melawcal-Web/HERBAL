"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type ProductType } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { assertAdmin } from "@/lib/formula";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { storedImageUrlSchema } from "@/lib/stored-image-url";
import {
  isProductFileUrl,
  PRODUCT_TYPE_OPTIONS,
  productTypeUsesWaitlist,
  withProductDownloadUrl,
} from "@/lib/product-metadata";

const PRODUCT_TYPES = PRODUCT_TYPE_OPTIONS.map((o) => o.id) as [ProductType, ...ProductType[]];

const audienceIds = z.array(z.enum(["therapist", "student", "interested"]));
const audienceRequired = audienceIds.min(1, "יש לבחור לפחות קהל יעד אחד");

const optionalTherapistId = z.preprocess((v) => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}, z.string().min(1).max(64).optional());

const optionalDownloadUrl = z.preprocess((v) => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}, z
  .string()
  .max(2000)
  .refine((u) => isProductFileUrl(u), "קישור ההורדה חייב להיות כתובת https או נתיב קובץ באתר")
  .optional());

const productFieldsSchema = z.object({
  type: z.enum(PRODUCT_TYPES),
  title: z.string().min(1, "יש למלא כותרת").max(200),
  description: z.string().trim().min(1, "יש למלא תיאור").max(8000),
  price: z.coerce.number().positive("המחיר חייב להיות חיובי"),
  memberPrice: z.coerce.number().positive("מחיר החברים חייב להיות חיובי"),
  imageUrl: storedImageUrlSchema,
  audience: audienceRequired,
  therapistId: optionalTherapistId,
  downloadUrl: optionalDownloadUrl,
});

const updateSchema = productFieldsSchema.omit({ audience: true }).extend({
  id: z.string().min(1).max(64),
  audience: audienceIds,
});

export type AdminProductState =
  | { ok: true; message: string }
  | { ok: false; error: string };

/** @deprecated use AdminProductState */
export type CreateAdminProductState = AdminProductState;

function firstZodError(error: z.ZodError): string {
  const msg = error.flatten().fieldErrors;
  return Object.values(msg)[0]?.[0] ?? "נתונים לא תקינים";
}

async function requireAdminActorId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id || !assertAdmin(session.user.role)) {
    throw new Error("אין הרשאה");
  }
  return session.user.id;
}

function formAudience(formData: FormData): string[] {
  return formData
    .getAll("audience")
    .map((v) => (typeof v === "string" ? v : ""))
    .filter(Boolean);
}

async function assertTherapistId(therapistId: string | undefined): Promise<string | null> {
  if (!therapistId) return null;
  const user = await prisma.user.findUnique({
    where: { id: therapistId },
    select: { id: true, role: true, therapistProfile: { select: { id: true } } },
  });
  if (!user) throw new Error("המטפל/ת שנבחר/ה לא נמצא/ה");
  if (user.role !== "therapist" && user.role !== "admin" && !user.therapistProfile) {
    throw new Error("יש לבחור משתמש עם פרופיל מטפל/ת");
  }
  return user.id;
}

async function revalidateProductSurfaces(therapistIds: Array<string | null | undefined>): Promise<void> {
  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath("/search");
  revalidatePath("/content-hub");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products", "layout");
  revalidatePath("/dashboard/products");

  const ids = [...new Set(therapistIds.filter((id): id is string => Boolean(id)))];
  if (ids.length === 0) return;

  const profiles = await prisma.therapistProfile.findMany({
    where: { userId: { in: ids } },
    select: { id: true, slug: true },
  });
  for (const profile of profiles) {
    revalidatePath(`/therapists/${profile.id}`);
    revalidatePath(`/t/${profile.slug}`);
    for (const kind of ["articles", "courses", "recipes", "lectures"] as const) {
      revalidatePath(`/therapists/${profile.id}/content/${kind}`);
    }
  }
}

export async function createAdminProduct(
  _prev: AdminProductState | undefined,
  formData: FormData,
): Promise<AdminProductState> {
  try {
    const actorId = await requireAdminActorId();
    const parsed = productFieldsSchema.safeParse({
      type: formData.get("type"),
      title: formData.get("title"),
      description: formData.get("description"),
      price: formData.get("price"),
      memberPrice: formData.get("memberPrice"),
      imageUrl: formData.get("imageUrl"),
      audience: formAudience(formData),
      therapistId: formData.get("therapistId"),
      downloadUrl: formData.get("downloadUrl"),
    });

    if (!parsed.success) {
      return { ok: false as const, error: firstZodError(parsed.error) };
    }

    const { type, title, description, price, memberPrice, imageUrl, audience, downloadUrl } = parsed.data;
    const therapistId = await assertTherapistId(parsed.data.therapistId);
    const metadata = withProductDownloadUrl(null, downloadUrl);

    const created = await prisma.product.create({
      data: {
        type,
        title,
        description,
        imageUrl,
        price: new Prisma.Decimal(price),
        memberPrice: new Prisma.Decimal(memberPrice),
        active: true,
        isWaitlist: productTypeUsesWaitlist(type),
        therapistId,
        audience: audience as Prisma.InputJsonValue,
        metadata,
      },
    });

    await writeAudit({
      actorId,
      action: "admin.product.create",
      entityType: "Product",
      entityId: created.id,
      metadata: { title, type },
    });

    await revalidateProductSurfaces([therapistId]);
    revalidatePath(`/admin/products/${created.id}`);
    revalidatePath(`/products/${created.id}`);

    return { ok: true as const, message: "המוצר נוסף ומוצג בקורסים וסדנאות (ובדף המטפל אם שויך)." };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "שגיאה בשמירה" };
  }
}

export async function updateAdminProduct(
  _prev: AdminProductState | undefined,
  formData: FormData,
): Promise<AdminProductState> {
  try {
    const actorId = await requireAdminActorId();
    const parsed = updateSchema.safeParse({
      id: formData.get("id"),
      type: formData.get("type"),
      title: formData.get("title"),
      description: formData.get("description"),
      price: formData.get("price"),
      memberPrice: formData.get("memberPrice"),
      imageUrl: formData.get("imageUrl"),
      audience: formAudience(formData),
      therapistId: formData.get("therapistId"),
      downloadUrl: formData.get("downloadUrl"),
    });

    if (!parsed.success) {
      return { ok: false as const, error: firstZodError(parsed.error) };
    }

    const existing = await prisma.product.findUnique({
      where: { id: parsed.data.id },
      select: { id: true, therapistId: true, metadata: true, type: true },
    });
    if (!existing) {
      return { ok: false as const, error: "המוצר לא נמצא" };
    }

    const { type, title, description, price, memberPrice, imageUrl, audience, downloadUrl } = parsed.data;
    const therapistId = await assertTherapistId(parsed.data.therapistId);
    const metadata = withProductDownloadUrl(existing.metadata, downloadUrl);

    await prisma.product.update({
      where: { id: existing.id },
      data: {
        type,
        title,
        description,
        imageUrl,
        price: new Prisma.Decimal(price),
        memberPrice: new Prisma.Decimal(memberPrice),
        therapistId,
        audience: audience as Prisma.InputJsonValue,
        metadata,
        ...(existing.type !== type ? { isWaitlist: productTypeUsesWaitlist(type) } : {}),
      },
    });

    await writeAudit({
      actorId,
      action: "admin.product.update",
      entityType: "Product",
      entityId: existing.id,
      metadata: { title, type },
    });

    await revalidateProductSurfaces([existing.therapistId, therapistId]);
    revalidatePath(`/admin/products/${existing.id}`);
    revalidatePath(`/products/${existing.id}`);

    return { ok: true as const, message: "המוצר עודכן." };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "שגיאה בשמירה" };
  }
}

export async function setAdminProductActive(productId: string, active: boolean): Promise<void> {
  const actorId = await requireAdminActorId();
  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, title: true, therapistId: true },
  });
  if (!existing) throw new Error("המוצר לא נמצא");

  await prisma.product.update({
    where: { id: existing.id },
    data: { active },
  });

  await writeAudit({
    actorId,
    action: active ? "admin.product.activate" : "admin.product.deactivate",
    entityType: "Product",
    entityId: existing.id,
    metadata: { title: existing.title, active },
  });

  await revalidateProductSurfaces([existing.therapistId]);
  revalidatePath(`/admin/products/${existing.id}`);
  revalidatePath(`/products/${existing.id}`);
}
