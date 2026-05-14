import { prisma } from "@/lib/prisma";

/** Canonical public URL for a therapist profile (stable `TherapistProfile.id`). */
export function therapistPublicHref(profileId: string): string {
  return `/therapists/${profileId}`;
}

/**
 * Resolves a therapist for public pages. Accepts either profile `id` (cuid) or legacy `slug`
 * so bookmarks and old links keep working.
 */
export async function findTherapistProfileForPublicRoute(param: string) {
  const trimmed = param.trim();
  if (!trimmed.length) return null;
  return prisma.therapistProfile.findFirst({
    where: { OR: [{ id: trimmed }, { slug: trimmed }] },
    include: { user: { select: { name: true, image: true } } },
  });
}
