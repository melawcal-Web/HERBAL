/** Homepage hero / vision carousel slide (DB + admin) */
export type VisionSlide = {
  id: string;
  eyebrow?: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  /** CSS colors e.g. #e3f2e4 — shown behind/under image */
  gradientFrom?: string | null;
  gradientTo?: string | null;
};

const UNSPLASH =
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=80";
const UNSPLASH2 =
  "https://images.unsplash.com/photo-1515378791036-0648a3c77a02?auto=format&fit=crop&w=1400&q=80";
const UNSPLASH3 =
  "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&w=1400&q=80";
const UNSPLASH4 =
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=80";
const UNSPLASH5 =
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=80";

export const DEFAULT_VISION_SLIDES: VisionSlide[] = [
  {
    id: "v1",
    eyebrow: "המרכז למטפלים בצמחי מרפא",
    title: "בית דיגיטלי למקצוע הצמחים",
    body: "המרכז מחבר מטפלים, לקוחות וידע — מקום שבו אפשר ללמוד, לשתף, לנהל יומן קליני, ולגלות תוכן איכותי על צמחי מרפא.",
    imageUrl: UNSPLASH,
    gradientFrom: "#f0faf0",
    gradientTo: "#d4ead6",
  },
  {
    id: "v2",
    eyebrow: "ערכים",
    title: "מקצועיות, שקיפות וקהילה",
    body: "אנחנו מאמינים בליווי מבוסס מדע ומסורת, בכבוד הדדי בין מטפלים ללקוחות, ובכלים שמקלים על העבודה היומיומית בקליניקה.",
    imageUrl: UNSPLASH2,
    gradientFrom: "#eef8ef",
    gradientTo: "#c8e4ca",
  },
  {
    id: "v3",
    eyebrow: "למטפלים",
    title: "כלי עבודה במקום אחד",
    body: "דפי נחיתה אישיים, EMR, תיעוד טיפולים, ומחשבון נוסחאות — כדי שתוכלו להתמקד במטופלים, לא בבירוקרטיה.",
    imageUrl: UNSPLASH3,
    gradientFrom: "#f4faf4",
    gradientTo: "#9dce9f",
  },
  {
    id: "v4",
    eyebrow: "לקהילה רחבה",
    title: "קורסים וסדנאות, מאמרים וצמיחה",
    body: "קורסים וסדנאות עם הרצאות, מפגשים ומוצרים, לצד אינדקס צמחים עם מאמרים מקוריים ממטפלים רשומים — הכל עם ממשק נקי ונוח לנייד.",
    imageUrl: UNSPLASH4,
    gradientFrom: "#e3f2e4",
    gradientTo: "#6fb072",
  },
  {
    id: "v5",
    eyebrow: "תזונה ומרחב",
    title: "מרחב בטוח ללמוד ולהתפתח",
    body: "תכנים מגוונים, שפה נגישה, ודגש על בטיחות ובהירות — כדי שמטפלים ולקוחות ירגישו בבית.",
    imageUrl: UNSPLASH5,
    gradientFrom: "#f6faf6",
    gradientTo: "#b6d9b8",
  },
];

function strip(s: unknown): string | undefined {
  if (typeof s !== "string") return undefined;
  const t = s.trim();
  return t.length ? t : undefined;
}

function parseColor(s: unknown): string | undefined {
  const t = strip(s);
  if (!t) return undefined;
  if (/^#[0-9A-Fa-f]{3,8}$/.test(t)) return t;
  if (/^rgba?\(/.test(t)) return t;
  return undefined;
}

export function parseVisionSlides(raw: unknown): VisionSlide[] {
  if (!Array.isArray(raw)) return DEFAULT_VISION_SLIDES;
  const out: VisionSlide[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = strip(o.id);
    const title = strip(o.title);
    const body = strip(o.body);
    if (!id || !title || !body) continue;
    const imageUrl = strip(o.imageUrl);
    if (imageUrl && !imageUrl.startsWith("https://")) continue;
    out.push({
      id,
      eyebrow: strip(o.eyebrow),
      title,
      body,
      imageUrl: imageUrl ?? null,
      gradientFrom: parseColor(o.gradientFrom) ?? null,
      gradientTo: parseColor(o.gradientTo) ?? null,
    });
  }
  return out.length ? out : DEFAULT_VISION_SLIDES;
}

export const DEFAULT_SITE_TITLE = "המרכז למטפלים בצמחי מרפא";

/** Copy above/below the homepage vision carousel (admin-editable, DB-backed) */
export const DEFAULT_HOME_HERO_MAIN_TITLE = "המרכז למטפלים בצמחי מרפא";
export const DEFAULT_HOME_HERO_HEADLINE = "חזון, ערכים ומה מחכה לכם כאן";
export const DEFAULT_HOME_HERO_SLIDER_HINT =
  "הזיזו בגרירה או עם החיצים — לולאה אינסופית בין השקופיות (ללא גלילה אוטומטית).";

export type HomeHeroCopy = {
  mainTitle: string;
  headline: string;
  sliderHint: string;
};
