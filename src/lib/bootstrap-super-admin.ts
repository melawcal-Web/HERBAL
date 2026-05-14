import { prisma } from "@/lib/prisma";

/**
 * Ensures at least one admin exists: prefers `SUPER_ADMIN_EMAIL`, otherwise promotes the earliest user.
 * Idempotent; safe to call from admin layout.
 */
export async function ensureBootstrapAdmins(): Promise<void> {
  const superEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  if (superEmail) {
    await prisma.user.updateMany({
      where: { email: superEmail },
      data: { role: "admin" },
    });
    return;
  }

  const adminCount = await prisma.user.count({ where: { role: "admin" } });
  if (adminCount > 0) return;

  const first = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (first) {
    await prisma.user.update({
      where: { id: first.id },
      data: { role: "admin" },
    });
  }
}
