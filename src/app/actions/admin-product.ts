"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { assertAdmin } from "@/lib/formula";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";

const schema = z.object({
  title: z.string().min(1).max(200),
  price: z.coerce.number().positive(),
  memberPrice: z.coerce.number().positive(),
  imageUrl: z.string().url().refine((u) => u.startsWith("https://"), "יש להזין כתובת https מלאה"),
});

export type CreateAdminProductState =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function createAdminProduct(
  _prev: CreateAdminProductState | undefined,
  formData: FormData,
): Promise<CreateAdminProductState> {
  const session = await auth();
  if (!session?.user?.id || !assertAdmin(session.user.role)) {
    return { ok: false as const, error: "אין הרשאה" };
  }

  const parsed = schema.safeParse({
    title: formData.get("title"),
    price: formData.get("price"),
    memberPrice: formData.get("memberPrice"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    const first = Object.values(msg)[0]?.[0];
    return { ok: false as const, error: first ?? "נתונים לא תקינים" };
  }

  const { title, price, memberPrice, imageUrl } = parsed.data;
  const description = `קורסים וסדנאות — ${title}`;

  const created = await prisma.product.create({
    data: {
      type: "workshop",
      title,
      description,
      imageUrl,
      price: new Prisma.Decimal(price),
      memberPrice: new Prisma.Decimal(memberPrice),
      active: true,
    },
  });

  await writeAudit({
    actorId: session.user.id,
    action: "admin.product.create",
    entityType: "Product",
    entityId: created.id,
    metadata: { title },
  });

  revalidatePath("/");
  revalidatePath("/marketplace");

  return { ok: true as const, message: "המוצר נוסף ומוצג בדף הבית ובדף קורסים וסדנאות." };
}
