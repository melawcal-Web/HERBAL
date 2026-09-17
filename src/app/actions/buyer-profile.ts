"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeIlMobile } from "@/lib/therapist-payments";
import { isBuyerProfileComplete } from "@/lib/buyer-profile";

export async function updateBuyerAccountProfile(input: {
  name: string;
  phone: string;
}): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("יש להתחבר");

  const name = input.name.trim();
  const phone = normalizeIlMobile(input.phone);
  if (name.length < 2) throw new Error("יש למלא שם מלא");
  if (!phone) throw new Error("מספר טלפון חייב להיות נייד ישראלי תקין (05xxxxxxxx)");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, phone },
  });

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true },
  });
  if (!isBuyerProfileComplete(me)) {
    throw new Error("יש למלא שם, אימייל וטלפון תקינים");
  }

  revalidatePath("/account/profile");
  revalidatePath("/products");
}
