import { pickDemoImage } from "@/lib/demo-placeholders";
import { publicDisplayImageUrl } from "@/lib/blob-image-url";
import { isStoredImageUrl, normalizeHttpsImageReference } from "@/lib/stored-image-url";

/**
 * Stable seed so home, directory carousel, and the public landing page
 * share the same fallback when a therapist has not uploaded a profile photo.
 */
export function therapistAvatarSeed(profileId: string): string {
  return `therapist-hero-${profileId}`;
}

/**
 * Single source of truth for a therapist portrait: `User.image` (profile avatar),
 * otherwise one deterministic placeholder keyed by profile id — never a random
 * substitute that disagrees with the other surfaces.
 */
export function therapistAvatarSrc(image: string | null | undefined, profileId: string): string {
  const raw = image?.trim();
  if (raw && isStoredImageUrl(raw)) {
    return publicDisplayImageUrl(normalizeHttpsImageReference(raw));
  }
  return pickDemoImage(therapistAvatarSeed(profileId), "therapists");
}
