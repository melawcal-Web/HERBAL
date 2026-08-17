import { prisma } from "@/lib/prisma";

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
}

/**
 * Ensures a known admin exists.
 * Production: only `SUPER_ADMIN_EMAIL` is promoted (never the first random signup).
 * Local/dev: if that env is unset and there are zero admins, the earliest user is promoted.
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

  if (isProductionRuntime()) return;

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
