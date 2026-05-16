/** Stable Unsplash placeholders for homepage grid demos when DB has no image. */

const THERAPIST = [
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
];

const COURSES_WORKSHOPS = [
  "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1515378791036-0648a3c77a02?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80",
];

const HERBAL = [
  "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1515583244297-bf05a7603467?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80",
];

function hashToIndex(key: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return mod ? h % mod : 0;
}

export function pickDemoImage(
  key: string,
  category: "therapists" | "courses_workshops" | "herbal",
): string {
  const pool = category === "therapists" ? THERAPIST : category === "courses_workshops" ? COURSES_WORKSHOPS : HERBAL;
  return pool[hashToIndex(key, pool.length)] ?? pool[0]!;
}

/** תמונת דמו שונה מ־`avoidUrl` (לגיבוי כש־`onError` על הראשית). */
export function pickDistinctDemoImage(
  key: string,
  category: "therapists" | "courses_workshops" | "herbal",
  avoidUrl: string,
): string {
  const suffixes = ["fb1", "fb2", "fb3", "fb4", "fb5", "fb6"];
  for (const s of suffixes) {
    const u = pickDemoImage(`${s}-${key}`, category);
    if (u !== avoidUrl) return u;
  }
  return pickDemoImage(`fbx-${key}-${avoidUrl.length}`, category);
}
