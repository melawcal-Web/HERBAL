"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function joinProductWaitlist(input: {
  productId: string;
  guestName: string;
  guestEmail: string;
}): Promise<void> {
  const schema = z.object({
    productId: z.string().min(1),
    guestName: z.string().min(1).max(120),
    guestEmail: z.string().email().max(191),
  });
  const p = schema.safeParse(input);
  if (!p.success) throw new Error("פרטים לא תקינים");

  const product = await prisma.product.findFirst({
    where: { id: p.data.productId, active: true, isWaitlist: true },
  });
  if (!product) throw new Error("הפריט לא זמין לרשימת המתנה");

  const session = await auth();
  const email = p.data.guestEmail.trim().toLowerCase();

  const existing = await prisma.waitlistEntry.findUnique({
    where: { productId_guestEmail: { productId: product.id, guestEmail: email } },
  });
  if (existing) throw new Error("כבר נרשמתם לרשימה זו");

  await prisma.$transaction([
    prisma.waitlistEntry.create({
      data: {
        productId: product.id,
        guestEmail: email,
        guestName: p.data.guestName.trim(),
        userId: session?.user?.id ?? null,
      },
    }),
    prisma.product.update({
      where: { id: product.id },
      data: { currentRegistered: { increment: 1 } },
    }),
  ]);

  revalidatePath("/marketplace");
  if (product.therapistId) {
    const tp = await prisma.therapistProfile.findUnique({
      where: { userId: product.therapistId },
      select: { id: true },
    });
    if (tp) revalidatePath(`/therapists/${tp.id}`);
  }
}
