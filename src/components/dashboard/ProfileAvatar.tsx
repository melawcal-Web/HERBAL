import { pickDemoImage } from "@/lib/demo-placeholders";
import { publicDisplayImageUrl } from "@/lib/blob-image-url";
import { normalizeHttpsImageReference } from "@/lib/stored-image-url";

function resolveImageSrc(url: string | null | undefined, seed: string): string {
  const raw = url?.trim();
  const u = raw ? publicDisplayImageUrl(normalizeHttpsImageReference(raw)) : "";
  if (!u) return pickDemoImage(seed, "therapists");
  if (u.startsWith("https://") || u.startsWith("http://")) return u.startsWith("http://") ? u.replace("http://", "https://") : u;
  if (u.startsWith("/")) return u;
  return pickDemoImage(seed, "therapists");
}

export function ProfileAvatar({
  imageUrl,
  name,
  seed,
  size = "md",
  className = "",
  /** "natural" — ללא שחור־לבן (למשל תמונת כיסוי בדף ציבורי) */
  imageTreatment = "default",
}: {
  imageUrl: string | null | undefined;
  name: string;
  seed: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  imageTreatment?: "default" | "natural";
}) {
  const src = resolveImageSrc(imageUrl, seed);
  const sizeClass =
    size === "sm"
      ? "h-10 w-10"
      : size === "lg"
        ? "h-24 w-24 ring-4"
        : size === "xl"
          ? "h-32 w-32 ring-4 sm:h-36 sm:w-36"
          : "h-16 w-16 ring-2";

  const imgClass =
    imageTreatment === "natural"
      ? "h-full w-full object-cover object-center"
      : "therapist-photo-bw h-full w-full object-cover object-center";

  return (
    <div
      className={`relative aspect-square shrink-0 overflow-hidden rounded-full border border-white/40 bg-herbal-100 shadow-md ring-herbal-200/80 ${sizeClass} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        className={imgClass}
      />
    </div>
  );
}
