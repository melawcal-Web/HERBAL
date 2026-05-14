import { PrismaClient, ProductType, Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { DEFAULT_SITE_TITLE, DEFAULT_VISION_SLIDES } from "../src/lib/home-vision";

const prisma = new PrismaClient();

const U = "auto=format&fit=crop&w=1600&q=85";

/** Fallback Unsplash URLs when `UNSPLASH_ACCESS_KEY` is unset or the API fails */
const IMG_RONIT = `https://images.unsplash.com/photo-1551836022-d5d88e9218df?${U}`;
const IMG_SHIRA = `https://images.unsplash.com/photo-1573496359142-b8d87734a5a?${U}`;
const IMG_MICHAEL = `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?${U}`;
const IMG_YAEL = `https://images.unsplash.com/photo-1594824476967-48c8b964273f?${U}`;

/** תמונת פרופיל דמו קבועה לערן כהן — https יציב לכרטיס ציבורי */
const IMG_ERAN_COHEN_CARD = `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?${U}`;
const IMG_DEMO_NOA_GOLAN = `https://images.unsplash.com/photo-1580489944761-15a19d654956?${U}`;
const IMG_DEMO_AMIR_SELIM = `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?${U}`;
const IMG_DEMO_DANA_EREZ = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?${U}`;

const IMG_ZOOM = `https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?${U}`;
const IMG_WORKSHOP = `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?${U}`;
const IMG_SUPERVISION = `https://images.unsplash.com/photo-1522071820081-009f0129c71c?${U}`;
const IMG_SHELF = `https://images.unsplash.com/photo-1470058869958-2a77ade41c02?${U}`;
const IMG_ZOOM2 = `https://images.unsplash.com/photo-1515378791036-0648a3c77a02?${U}`;

const FB_CHAMOMILE = `https://images.unsplash.com/photo-1587049633316-d646a567487c?${U}`;
const FB_LAVENDER = `https://images.unsplash.com/photo-1498579687545-d5a4fffb0ce9?${U}`;
const FB_MINT = `https://images.unsplash.com/photo-1620706857358-5c1c9caeb6a8?${U}`;
const FB_OATS = `https://images.unsplash.com/photo-1517686469429-8bdb88b9a906?${U}`;
const FB_HYSSOP = `https://images.unsplash.com/photo-1592417814088-3b2be6b3c6ff?${U}`;

async function unsplashImage(
  query: string,
  fallback: string,
  orientation?: "portrait" | "landscape",
): Promise<string> {
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!key) return fallback;
  try {
    const qs = new URLSearchParams({ query });
    if (orientation) qs.set("orientation", orientation);
    const res = await fetch(`https://api.unsplash.com/photos/random?${qs}`, {
      headers: { Authorization: `Client-ID ${key}` },
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as { urls?: { raw?: string; regular?: string } };
    const base = data.urls?.raw ?? data.urls?.regular;
    if (!base) return fallback;
    return base.includes("?") ? `${base}&w=1600&q=85&fit=crop&auto=format` : `${base}?w=1600&q=85&fit=crop&auto=format`;
  } catch {
    return fallback;
  }
}

function whenIso(d: string) {
  return new Date(d).toISOString();
}

/** פריטי קטלוג ישנים בלי `catalogKey` — ממפים לפי כותרת כדי למנוע כפילויות אחרי שדרוג */
async function attachLegacyCatalogKeys(map: Record<string, string>) {
  for (const [title, catalogKey] of Object.entries(map)) {
    const row = await prisma.product.findFirst({
      where: { catalogKey: null, title },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (row) await prisma.product.update({ where: { id: row.id }, data: { catalogKey } });
  }
}

async function upsertCatalogProduct(
  catalogKey: string,
  data: {
    type: ProductType;
    title: string;
    description: string;
    price: number;
    memberPrice: number;
    imageUrl: string | null;
    metadata?: Prisma.InputJsonValue;
    active?: boolean;
  },
) {
  await prisma.product.upsert({
    where: { catalogKey },
    create: {
      catalogKey,
      type: data.type,
      title: data.title,
      description: data.description,
      price: new Prisma.Decimal(data.price),
      memberPrice: new Prisma.Decimal(data.memberPrice),
      imageUrl: data.imageUrl,
      metadata: data.metadata ?? Prisma.JsonNull,
      active: data.active ?? true,
    },
    update: {
      type: data.type,
      title: data.title,
      description: data.description,
      price: new Prisma.Decimal(data.price),
      memberPrice: new Prisma.Decimal(data.memberPrice),
      imageUrl: data.imageUrl,
      metadata: data.metadata ?? Prisma.JsonNull,
      active: data.active ?? true,
    },
  });
}

async function main() {
  await attachLegacyCatalogKeys({
    "סדנת מסחטות ומשחות — רמת גן": "catalog-workshop-massages-rg",
    "סדנת חליטות וארומה — חיפה": "catalog-workshop-teas-haifa",
    "זום — בטיחות תרופתית וצמחים": "catalog-zoom-pharmacy-safety",
    "זום — עיכול ומיקרוביום": "catalog-zoom-digest-microbiome",
    "השגחה קבוצתית — פוריות ומחזור": "catalog-supervision-fertility-cycle",
  });

  const [
    imgRonit,
    imgShira,
    imgMichael,
    imgYael,
    covChamomile,
    covLavender,
    covMint,
    covOats,
    covHyssop,
    imgWorkshop,
    imgZoom,
    imgAnxiety,
    imgSupervision,
    imgDigest,
  ] = await Promise.all([
    unsplashImage("professional woman clinical portrait herbal medicine", IMG_RONIT, "portrait"),
    unsplashImage("woman therapist portrait natural light studio", IMG_SHIRA, "portrait"),
    unsplashImage("male doctor portrait professional headshot", IMG_MICHAEL, "portrait"),
    unsplashImage("woman wellness portrait soft professional", IMG_YAEL, "portrait"),
    unsplashImage("chamomile flowers botanical close up", FB_CHAMOMILE, "landscape"),
    unsplashImage("lavender field purple flowers botanical", FB_LAVENDER, "landscape"),
    unsplashImage("fresh mint leaves green macro", FB_MINT, "landscape"),
    unsplashImage("oat grains porridge healthy botanical", FB_OATS, "landscape"),
    unsplashImage("oregano herbs fresh green botanical", FB_HYSSOP, "landscape"),
    unsplashImage("herbal workshop mortar pestle plants", IMG_WORKSHOP, "landscape"),
    unsplashImage("online zoom learning laptop workshop", IMG_ZOOM, "landscape"),
    unsplashImage("meditation calm tea herbs workshop", IMG_ZOOM2, "landscape"),
    unsplashImage("team supervision meeting professional", IMG_SUPERVISION, "landscape"),
    unsplashImage("digestive health herbs kitchen shelf", IMG_SHELF, "landscape"),
  ]);

  const w1Starts = whenIso("2026-07-03T09:30");
  const w2Starts = whenIso("2026-07-18T17:00");
  const z1Starts = whenIso("2026-07-08T20:00");
  const z2Starts = whenIso("2026-07-22T19:30");
  const supStarts = whenIso("2026-07-11T08:30");

  await upsertCatalogProduct("catalog-workshop-massages-rg", {
    type: ProductType.workshop,
    title: "סדנת מסחטות ומשחות — רמת גן",
    description: `יום פרונטלי אחד, למטפלים מוסמכים · רמת גן · ${new Date(w1Starts).toLocaleString("he-IL")}`,
    price: 540,
    memberPrice: 460,
    imageUrl: imgWorkshop,
    metadata: {
      location: "רמת גן",
      startsAt: w1Starts,
      maxParticipants: 16,
      courseDetails:
        "יום מעשי עם ערכת חומרים: נלמד בסיסים של נוסחאות חיצוניות, בטיחות ריכוזים, סימון ותיעוד, והדגמות על עור תקין. כולל הפסקות, תרגול מודרך, ודיון קצר על תיעוד במרפאה.",
    },
  });

  await upsertCatalogProduct("catalog-workshop-teas-haifa", {
    type: ProductType.workshop,
    title: "סדנת חליטות וארומה — חיפה",
    description: `מפגש פרונטלי עם מעבדה · חיפה · ${new Date(w2Starts).toLocaleString("he-IL")}`,
    price: 410,
    memberPrice: 350,
    imageUrl: imgAnxiety,
    metadata: {
      location: "חיפה",
      startsAt: w2Starts,
      maxParticipants: 12,
      courseDetails:
        "חלק תאורטי קצר וחלק מעבדה: חליטות, טמפרטורות, זמני השריה, ושילוב זהיר לצד תרופות נפוצות — בהנחיית מדריך. מומלץ להביא מחברת סימון אישית.",
    },
  });

  await upsertCatalogProduct("catalog-zoom-pharmacy-safety", {
    type: ProductType.zoom,
    title: "זום — בטיחות תרופתית וצמחים",
    description: `מפגש מקוון · ${new Date(z1Starts).toLocaleString("he-IL")}`,
    price: 360,
    memberPrice: 300,
    imageUrl: imgZoom,
    metadata: {
      zoomUrl: "https://zoom.us/j/8001110001",
      startsAt: z1Starts,
      maxParticipants: 40,
      courseDetails:
        "כשעה וחצי כולל שאלות ותשובות: מקרים טיפוסיים, מתי להפנות לרופא/ה או לרוקח/ית, ותיעוד מקצועי. הקלטה תישלח למשתתפים לשבוע.",
    },
  });

  await upsertCatalogProduct("catalog-zoom-digest-microbiome", {
    type: ProductType.zoom,
    title: "זום — עיכול ומיקרוביום",
    description: `מפגש מקוון · ${new Date(z2Starts).toLocaleString("he-IL")}`,
    price: 118,
    memberPrice: 95,
    imageUrl: imgDigest,
    metadata: {
      zoomUrl: "https://zoom.us/j/8001110002",
      startsAt: z2Starts,
      maxParticipants: 60,
      courseDetails:
        "מבוא מעודכן לצמחי עיכול נפוצים, גבולות טיפול, ושיח עם דיאטנית — חלק שני פתוח לשאלות מהקהל.",
    },
  });

  await upsertCatalogProduct("catalog-supervision-fertility-cycle", {
    type: ProductType.supervision,
    title: "השגחה קבוצתית — פוריות ומחזור",
    description: `מעגל השגחה · ${new Date(supStarts).toLocaleString("he-IL")}`,
    price: 260,
    memberPrice: 260,
    imageUrl: imgSupervision,
    metadata: {
      startsAt: supStarts,
      maxParticipants: 10,
      courseDetails:
        "מעגל קטן: כל משתתף/ת מציגים מקרה קצר (כ־10 דקות), דיון מובנה, וסיכום תובנות. נדרשת הרשמה מראש ושמירת חיסיון מקצועי.",
    },
  });

  await upsertCatalogProduct("catalog-shelf-tea-assortment", {
    type: ProductType.shelf_product,
    title: "ערכת חליטות אישית — שישה צמחים נבחרים",
    description: "אריזת מתנה + כרטיסי הסבר בעברית · איסוף מרמת גן או משלוח לפי אזור.",
    price: 189,
    memberPrice: 159,
    imageUrl: covChamomile,
    metadata: {
      courseDetails:
        "הצמחים ארוזים בנפרד לאחסון נכון. בכל כרטיס: שם לטיני, חלק בשימוש, הצעה בסיסית להכנה, ואזהרות כלליות. ניתן לבקש החלפת צמח בודד לפי רגישות — ציינו בהזמנה.",
    },
  });

  await upsertCatalogProduct("catalog-shelf-ebook-formulas", {
    type: ProductType.shelf_product,
    title: "חוברת דיגיטלית — שתים־עשרה נוסחאות ביתיות בטוחות",
    description: "PDF להורדה מיידית · פרק על בטיחות, תיעוד במרפאה, ושילוב זהיר לצד תרופות נפוצות.",
    price: 79,
    memberPrice: 59,
    imageUrl: covMint,
    metadata: {
      courseDetails:
        "שתים־עשרה נוסחאות לחליטה ולטיפוח עדין, עם הסבר קצר על כל צמח, מינוני התחלה, ומתי להפסיק ולפנות לרופא/ה. הרישיון אישי לרוכש/ת — אין העתקה.",
    },
  });

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "admin", passwordHash, name: "מנהל המערכת" },
    create: {
      email: adminEmail,
      name: "מנהל המערכת",
      passwordHash,
      role: "admin",
      subStatus: "active",
    },
  });

  const demoTherapistEmail = process.env.DEMO_THERAPIST_EMAIL ?? "therapist@example.com";
  const demoTherapistPassword = process.env.DEMO_THERAPIST_PASSWORD ?? "Therapist123!";
  const thHash = await hash(demoTherapistPassword, 12);

  const therapistUser = await prisma.user.upsert({
    where: { email: demoTherapistEmail },
    update: {
      role: "therapist",
      passwordHash: thHash,
      name: "ד״ר רונית אלון",
      image: imgRonit,
    },
    create: {
      email: demoTherapistEmail,
      name: "ד״ר רונית אלון",
      passwordHash: thHash,
      role: "therapist",
      subStatus: "active",
      image: imgRonit,
    },
  });

  await prisma.therapistProfile.upsert({
    where: { userId: therapistUser.id },
    update: {
      slug: "ronit-alon",
      bio: "מטפלת בצמחי מרפא עם למעלה מ־15 שנות ניסיון קליני במרפאות ובבית חולים. אני מלווה בגישה שקטה ומדויקת — עיכול, חרדה קלה וליווי נשי — תוך שילוב תזונה רכה, שינה, והסברים ברורים שמאפשרים לכם להבין את הגוף ולא רק את הנוסחה.",
      clinicalExperience:
        "דוקטורט בבריאות הציבור; התמחות בצמחי מרפא קליניים. הרצאות וסדנאות למטפלים בנושאי בטיחות ואינטראקציות תרופתיות.",
      specialty1: "עיכול",
      specialty2: "חרדה",
      specialty3: "פוריות",
      contactInfo: {
        phone: "+972-52-100-1001",
        city: "רמת גן",
        whatsapp: "972521001001",
        email: "ronit.clinic@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/herbal-ronit",
        instagram: "ronit_herbal_il",
        facebook: "HerbalRonitDemo",
        tiktok: "ronit.herbs",
      },
      acceptsSupervisionRequests: true,
      supervisionHourlyRate: new Prisma.Decimal(420),
    },
    create: {
      userId: therapistUser.id,
      slug: "ronit-alon",
      bio: "מטפלת בצמחי מרפא עם למעלה מ־15 שנות ניסיון קליני במרפאות ובבית חולים. אני מלווה בגישה שקטה ומדויקת — עיכול, חרדה קלה וליווי נשי — תוך שילוב תזונה רכה, שינה, והסברים ברורים שמאפשרים לכם להבין את הגוף ולא רק את הנוסחה.",
      clinicalExperience:
        "דוקטורט בבריאות הציבור; התמחות בצמחי מרפא קליניים. הרצאות וסדנאות למטפלים בנושאי בטיחות ואינטראקציות תרופתיות.",
      specialty1: "עיכול",
      specialty2: "חרדה",
      specialty3: "פוריות",
      contactInfo: {
        phone: "+972-52-100-1001",
        city: "רמת גן",
        whatsapp: "972521001001",
        email: "ronit.clinic@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/herbal-ronit",
        instagram: "ronit_herbal_il",
        facebook: "HerbalRonitDemo",
        tiktok: "ronit.herbs",
      },
      acceptsSupervisionRequests: true,
      supervisionHourlyRate: new Prisma.Decimal(420),
    },
  });

  const shira = await prisma.user.upsert({
    where: { email: "shira.demo@example.com" },
    update: {
      name: "שירה לוי",
      role: "therapist",
      passwordHash: thHash,
      image: imgShira,
    },
    create: {
      email: "shira.demo@example.com",
      name: "שירה לוי",
      passwordHash: thHash,
      role: "therapist",
      subStatus: "active",
      image: imgShira,
    },
  });

  await prisma.therapistProfile.upsert({
    where: { userId: shira.id },
    update: {
      slug: "shira-levi-herbs",
      bio: "מעל עשר שנות ליווי בקליניקה ובקבוצות קטנות — עם דגש על עור רגיש, שינה, וסדנאות חווייתיות שמחברות בין צמח לבית. אני מאמינה בקצב איטי, בהסברים נקיים, ובתיעוד שמכבד אתכם ואת הרופאים המטפלים.",
      clinicalExperience:
        "תעודת מטפלת בצמחי מרפא; השלמות בדרמטולוגיה צמחית ובטיחות שימוש חיצוני.",
      specialty1: "עור רגיש",
      specialty2: "שינה",
      specialty3: "סדנאות",
      contactInfo: {
        phone: "+972-54-200-2002",
        city: "חיפה",
        whatsapp: "972542002002",
        email: "shira.herbs@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/shira-herbs",
        instagram: "shira_herbal_north",
        facebook: "ShiraHerbsDemo",
        tiktok: "shira.herbs.live",
      },
    },
    create: {
      userId: shira.id,
      slug: "shira-levi-herbs",
      bio: "מעל עשר שנות ליווי בקליניקה ובקבוצות קטנות — עם דגש על עור רגיש, שינה, וסדנאות חווייתיות שמחברות בין צמח לבית. אני מאמינה בקצב איטי, בהסברים נקיים, ובתיעוד שמכבד אתכם ואת הרופאים המטפלים.",
      clinicalExperience:
        "תעודת מטפלת בצמחי מרפא; השלמות בדרמטולוגיה צמחית ובטיחות שימוש חיצוני.",
      specialty1: "עור רגיש",
      specialty2: "שינה",
      specialty3: "סדנאות",
      contactInfo: {
        phone: "+972-54-200-2002",
        city: "חיפה",
        whatsapp: "972542002002",
        email: "shira.herbs@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/shira-herbs",
        instagram: "shira_herbal_north",
        facebook: "ShiraHerbsDemo",
        tiktok: "shira.herbs.live",
      },
    },
  });

  const michael = await prisma.user.upsert({
    where: { email: "michael.demo@example.com" },
    update: {
      name: "מיכאל ברק",
      role: "therapist",
      passwordHash: thHash,
      image: imgMichael,
    },
    create: {
      email: "michael.demo@example.com",
      name: "מיכאל ברק",
      passwordHash: thHash,
      role: "therapist",
      subStatus: "active",
      image: imgMichael,
    },
  });

  await prisma.therapistProfile.upsert({
    where: { userId: michael.id },
    update: {
      slug: "michael-barak-clinical",
      bio: "מטפל בצמחי מרפא עם יותר מ־12 שנות ניסיון בקופות חולים ובמרפאה פרטית. אני מתמקד במערכת נשימה, בחיסון בעונות מעבר, ובחרדה קלה — תמיד עם גבול ברור בין תמיכה צמחית לבין טיפול רפואי.",
      clinicalExperience:
        "הסמכה בצמחי מרפא קליניים; השלמות בפיזיולוגיה של מערכת הנשימה והחיסון.",
      specialty1: "נשימה",
      specialty2: "חיסון",
      specialty3: "חרדה",
      contactInfo: {
        phone: "+972-50-300-3003",
        city: "ירושלים",
        whatsapp: "972503003003",
        email: "michael.clinic@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/michael-herbal",
        instagram: "michael.herbal.md",
        facebook: "MichaelHerbalDemo",
        tiktok: "michael.herbs.talk",
      },
    },
    create: {
      userId: michael.id,
      slug: "michael-barak-clinical",
      bio: "מטפל בצמחי מרפא עם יותר מ־12 שנות ניסיון בקופות חולים ובמרפאה פרטית. אני מתמקד במערכת נשימה, בחיסון בעונות מעבר, ובחרדה קלה — תמיד עם גבול ברור בין תמיכה צמחית לבין טיפול רפואי.",
      clinicalExperience:
        "הסמכה בצמחי מרפא קליניים; השלמות בפיזיולוגיה של מערכת הנשימה והחיסון.",
      specialty1: "נשימה",
      specialty2: "חיסון",
      specialty3: "חרדה",
      contactInfo: {
        phone: "+972-50-300-3003",
        city: "ירושלים",
        whatsapp: "972503003003",
        email: "michael.clinic@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/michael-herbal",
        instagram: "michael.herbal.md",
        facebook: "MichaelHerbalDemo",
        tiktok: "michael.herbs.talk",
      },
    },
  });

  const yael = await prisma.user.upsert({
    where: { email: "yael.demo@example.com" },
    update: {
      name: "יעל כהן",
      role: "therapist",
      passwordHash: thHash,
      image: imgYael,
    },
    create: {
      email: "yael.demo@example.com",
      name: "יעל כהן",
      passwordHash: thHash,
      role: "therapist",
      subStatus: "active",
      image: imgYael,
    },
  });

  await prisma.therapistProfile.upsert({
    where: { userId: yael.id },
    update: {
      slug: "yael-cohen-herbal",
      bio: "מעל 11 שנות ליווי נשים בקליניקה — מחזור, פוריות, הריון והנקה — עם שפה צמחית עדינה ומדויקת. אני שמה דגש על הסברים שמבהירים מתי חובה להתייעץ עם רופאה, ועל תיעוד שמשרת אתכן לאורך זמן.",
      clinicalExperience:
        "מטפלת מוסמכת בצמחי מרפא; התמחות מעשית בגינקולוגיה צמחית ובהנקה.",
      specialty1: "פוריות",
      specialty2: "הריון",
      specialty3: "הנקה",
      contactInfo: {
        phone: "+972-52-400-4004",
        city: "רעננה",
        whatsapp: "972524004004",
        email: "yael.womens.herbs@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/yael-womens",
        instagram: "yael.herbal.women",
        facebook: "YaelHerbalWomen",
        tiktok: "yael.herbs",
      },
    },
    create: {
      userId: yael.id,
      slug: "yael-cohen-herbal",
      bio: "מעל 11 שנות ליווי נשים בקליניקה — מחזור, פוריות, הריון והנקה — עם שפה צמחית עדינה ומדויקת. אני שמה דגש על הסברים שמבהירים מתי חובה להתייעץ עם רופאה, ועל תיעוד שמשרת אתכן לאורך זמן.",
      clinicalExperience:
        "מטפלת מוסמכת בצמחי מרפא; התמחות מעשית בגינקולוגיה צמחית ובהנקה.",
      specialty1: "פוריות",
      specialty2: "הריון",
      specialty3: "הנקה",
      contactInfo: {
        phone: "+972-52-400-4004",
        city: "רעננה",
        whatsapp: "972524004004",
        email: "yael.womens.herbs@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/yael-womens",
        instagram: "yael.herbal.women",
        facebook: "YaelHerbalWomen",
        tiktok: "yael.herbs",
      },
    },
  });

  const eran = await prisma.user.upsert({
    where: { email: "dan.demo@example.com" },
    update: {
      name: "ערן כהן",
      role: "therapist",
      passwordHash: thHash,
      image: IMG_ERAN_COHEN_CARD,
    },
    create: {
      email: "dan.demo@example.com",
      name: "ערן כהן",
      passwordHash: thHash,
      role: "therapist",
      subStatus: "active",
      image: IMG_ERAN_COHEN_CARD,
    },
  });

  await prisma.therapistProfile.upsert({
    where: { userId: eran.id },
    update: {
      slug: "eran-cohen-herbal",
      bio: "מטפל בצמחי מרפא עם למעלה מ־13 שנות ניסיון בקליניקה ובליווי משפחות. אני מתמחה בילדים, במערכת נשימה, ובעיכול — עם שפה מקצועית שמחברת בין רגישות לבין גבולות ברורים מול הרפואה הקונבנציונלית.",
      clinicalExperience:
        "הסמכה בצמחי מרפא; קורסים מתקדמים בפרמקולוגיה צמחית וביוכימיה של צמחים.",
      specialty1: "ילדים",
      specialty2: "נשימה",
      specialty3: "עיכול",
      contactInfo: {
        phone: "+972-54-500-5005",
        city: "נס ציונה",
        whatsapp: "972545005005",
        email: "eran.herbs@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/eran-herbs",
        instagram: "eran.herbal.lab",
        facebook: "EranHerbalDemo",
        tiktok: "eran.herbs.lab",
      },
    },
    create: {
      userId: eran.id,
      slug: "eran-cohen-herbal",
      bio: "מטפל בצמחי מרפא עם למעלה מ־13 שנות ניסיון בקליניקה ובליווי משפחות. אני מתמחה בילדים, במערכת נשימה, ובעיכול — עם שפה מקצועית שמחברת בין רגישות לבין גבולות ברורים מול הרפואה הקונבנציונלית.",
      clinicalExperience:
        "הסמכה בצמחי מרפא; קורסים מתקדמים בפרמקולוגיה צמחית וביוכימיה של צמחים.",
      specialty1: "ילדים",
      specialty2: "נשימה",
      specialty3: "עיכול",
      contactInfo: {
        phone: "+972-54-500-5005",
        city: "נס ציונה",
        whatsapp: "972545005005",
        email: "eran.herbs@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/eran-herbs",
        instagram: "eran.herbal.lab",
        facebook: "EranHerbalDemo",
        tiktok: "eran.herbs.lab",
      },
    },
  });

  const noaGolan = await prisma.user.upsert({
    where: { email: "noa.herbal.demo@example.com" },
    update: {
      name: "נועה גולן",
      role: "therapist",
      passwordHash: thHash,
      image: IMG_DEMO_NOA_GOLAN,
    },
    create: {
      email: "noa.herbal.demo@example.com",
      name: "נועה גולן",
      passwordHash: thHash,
      role: "therapist",
      subStatus: "active",
      image: IMG_DEMO_NOA_GOLAN,
    },
  });

  await prisma.therapistProfile.upsert({
    where: { userId: noaGolan.id },
    update: {
      slug: "noa-golan-herbal",
      bio: "מטפלת בצמחי מרפא עם התמחות בספורט, בהתאוששות אחרי מאמץ, ובתזונה צמחית מעשית. אני מלווה אתכם בהיכרות עם הגוף — מתי לעצור, מתי להפנות לרופא/ה, ואיך לבנות שגרה בטוחה סביב אימונים וחיים עמוסים.",
      clinicalExperience:
        "הסמכה בצמחי מרפא; השלמות בתזונת ספורט ובשיקום עדין אחרי פציעות קלות.",
      specialty1: "ספורט",
      specialty2: "התאוששות",
      specialty3: "תזונה צמחית",
      contactInfo: {
        phone: "+972-52-610-6106",
        city: "תל אביב",
        whatsapp: "972526106106",
        email: "noa.sport.herbs@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/noa-sport-herbs",
        instagram: "noa.herbal.motion",
        facebook: "NoaHerbalSportDemo",
        tiktok: "noa.herbs.run",
      },
    },
    create: {
      userId: noaGolan.id,
      slug: "noa-golan-herbal",
      bio: "מטפלת בצמחי מרפא עם התמחות בספורט, בהתאוששות אחרי מאמץ, ובתזונה צמחית מעשית. אני מלווה אתכם בהיכרות עם הגוף — מתי לעצור, מתי להפנות לרופא/ה, ואיך לבנות שגרה בטוחה סביב אימונים וחיים עמוסים.",
      clinicalExperience:
        "הסמכה בצמחי מרפא; השלמות בתזונת ספורט ובשיקום עדין אחרי פציעות קלות.",
      specialty1: "ספורט",
      specialty2: "התאוששות",
      specialty3: "תזונה צמחית",
      contactInfo: {
        phone: "+972-52-610-6106",
        city: "תל אביב",
        whatsapp: "972526106106",
        email: "noa.sport.herbs@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/noa-sport-herbs",
        instagram: "noa.herbal.motion",
        facebook: "NoaHerbalSportDemo",
        tiktok: "noa.herbs.run",
      },
    },
  });

  const amirSelim = await prisma.user.upsert({
    where: { email: "amir.herbal.demo@example.com" },
    update: {
      name: "אמיר סלים",
      role: "therapist",
      passwordHash: thHash,
      image: IMG_DEMO_AMIR_SELIM,
    },
    create: {
      email: "amir.herbal.demo@example.com",
      name: "אמיר סלים",
      passwordHash: thHash,
      role: "therapist",
      subStatus: "active",
      image: IMG_DEMO_AMIR_SELIM,
    },
  });

  await prisma.therapistProfile.upsert({
    where: { userId: amirSelim.id },
    update: {
      slug: "amir-selim-herbal",
      bio: "מטפל בצמחי מרפא עם ניסיון בליווי גברים בגיל האמצע — לחץ, שינה, ועיכול — תוך שמירה על שפה ברורה ועל גבולות מול רפואה קונבנציונלית. הקליניקה שלי מדגישה הסברים, תיעוד, ומעקב הדוק אחרי שינויים.",
      clinicalExperience:
        "הסמכה בצמחי מרפא; קורסים בפסיכונוירואימונולוגיה ובפרמקולוגיה צמחית.",
      specialty1: "לחץ",
      specialty2: "שינה",
      specialty3: "עיכול",
      contactInfo: {
        phone: "+972-50-720-7207",
        city: "חולון",
        whatsapp: "972507207207",
        email: "amir.mens.herbs@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/amir-mens-herbs",
        instagram: "amir.herbal.calm",
        facebook: "AmirHerbalDemo",
        tiktok: "amir.herbs.talk",
      },
    },
    create: {
      userId: amirSelim.id,
      slug: "amir-selim-herbal",
      bio: "מטפל בצמחי מרפא עם ניסיון בליווי גברים בגיל האמצע — לחץ, שינה, ועיכול — תוך שמירה על שפה ברורה ועל גבולות מול רפואה קונבנציונלית. הקליניקה שלי מדגישה הסברים, תיעוד, ומעקב הדוק אחרי שינויים.",
      clinicalExperience:
        "הסמכה בצמחי מרפא; קורסים בפסיכונוירואימונולוגיה ובפרמקולוגיה צמחית.",
      specialty1: "לחץ",
      specialty2: "שינה",
      specialty3: "עיכול",
      contactInfo: {
        phone: "+972-50-720-7207",
        city: "חולון",
        whatsapp: "972507207207",
        email: "amir.mens.herbs@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/amir-mens-herbs",
        instagram: "amir.herbal.calm",
        facebook: "AmirHerbalDemo",
        tiktok: "amir.herbs.talk",
      },
    },
  });

  const danaErez = await prisma.user.upsert({
    where: { email: "dana.herbal.demo@example.com" },
    update: {
      name: "דנה ארזי",
      role: "therapist",
      passwordHash: thHash,
      image: IMG_DEMO_DANA_EREZ,
    },
    create: {
      email: "dana.herbal.demo@example.com",
      name: "דנה ארזי",
      passwordHash: thHash,
      role: "therapist",
      subStatus: "active",
      image: IMG_DEMO_DANA_EREZ,
    },
  });

  await prisma.therapistProfile.upsert({
    where: { userId: danaErez.id },
    update: {
      slug: "dana-erez-herbal",
      bio: "מטפלת בצמחי מרפא עם דגש על עור, אלרגיות עונתיות, ותמיכה בשגרת טיפוח ביתית בטוחה. אני מלווה תהליכים איטיים — עם בדיקות רגישות לתרופות חיצוניות, לילדים, ולרגישות עור.",
      clinicalExperience:
        "הסמכה בצמחי מרפא; השלמות בדרמטולוגיה צמחית ובשימוש חיצוני מבוקר.",
      specialty1: "עור",
      specialty2: "אלרגיה עונתית",
      specialty3: "טיפוח ביתי",
      contactInfo: {
        phone: "+972-54-830-8308",
        city: "רמת השרון",
        whatsapp: "972548308308",
        email: "dana.skin.herbs@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/dana-skin-herbs",
        instagram: "dana.herbal.skin",
        facebook: "DanaHerbalSkinDemo",
        tiktok: "dana.herbs.glow",
      },
    },
    create: {
      userId: danaErez.id,
      slug: "dana-erez-herbal",
      bio: "מטפלת בצמחי מרפא עם דגש על עור, אלרגיות עונתיות, ותמיכה בשגרת טיפוח ביתית בטוחה. אני מלווה תהליכים איטיים — עם בדיקות רגישות לתרופות חיצוניות, לילדים, ולרגישות עור.",
      clinicalExperience:
        "הסמכה בצמחי מרפא; השלמות בדרמטולוגיה צמחית ובשימוש חיצוני מבוקר.",
      specialty1: "עור",
      specialty2: "אלרגיה עונתית",
      specialty3: "טיפוח ביתי",
      contactInfo: {
        phone: "+972-54-830-8308",
        city: "רמת השרון",
        whatsapp: "972548308308",
        email: "dana.skin.herbs@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/dana-skin-herbs",
        instagram: "dana.herbal.skin",
        facebook: "DanaHerbalSkinDemo",
        tiktok: "dana.herbs.glow",
      },
    },
  });

  await prisma.user.updateMany({
    where: { role: "therapist" },
    data: { therapistVerification: "approved", registrationPersona: "therapist" },
  });

  await prisma.therapistProfile.updateMany({
    where: { userId: { in: [michael.id, eran.id, amirSelim.id] } },
    data: { publicTherapistTitle: "male" },
  });

  const profile = await prisma.therapistProfile.findUniqueOrThrow({
    where: { userId: therapistUser.id },
  });

  const articleDisclaimer =
    "\n\nמידע מקצועי כללי בלבד; אינו מהווה אבחון או טיפול אישי. בכל סימפטום, שינוי בתרופה או בהריון — יש להתייעץ עם רופא/ה או רוקח/ית.";

  await prisma.herbalArticle.upsert({
    where: { slug: "mallow-soothing" },
    update: {
      title: "קמומיל רפואי (Matricaria chamomilla) — רוגע עיכולי ושימוש חיצוני זהיר",
      category: "עיכול ודלקות",
      excerpt:
        "סקירה מקצועית לקמומיל: שימושים מסורתיים ברוגע עיכולי קל, תמיכה בשינה, ושימוש חיצוני בשיקום עור — לצד אזהרות הריון, אלרגיה לאסטים, ואינטראקציות תרופתיות אפשריות.",
      body:
        "קמומיל רפואי (Matricaria chamomilla) הוא אחד הצמחים הנפוצים ביותר במטבח ובמרפאה. הוא נחשב בעדינות יחסית, אך גם לו יש גבולות, רגישויות, ואינטראקציות שחשוב להכיר לפני המלצה למטופלים.\n\n" +
        "בחלק הראשון של המאמר נפרט על הבדלים בין זנים ומקורות, על איכות חומר גלם (יבש מול טרי), ועל השפעה של אחסון על הפעילות הארומטית והפוליפנולית. נדגיש את חשיבות התיעוד במרפאה: מינון, תדירות, תגובות, והפניות לרופא/ה כשמדובר בתסמינים חדשים או מתמשכים.\n\n" +
        "בחלק השני נעסוק בשימושים פנימיים נפוצים (חליטה, תמציות) ובשימוש חיצוני זהיר — כולל אזהרות בהריון ובגיל צעיר, ורגישות ידועה למשפחת המורכבים. נסיים במסגרת אתית: מה מקובל להבטיח למטופל, ומה חייבים להשאיר מחוץ לשיחה.\n\n" +
        "המאמר מיועד למטפלים מוסמכים ולקוראים מקצועיים המחפשים מסגרת שפה אחידה עם הרפואה הקונבנציונלית." +
        articleDisclaimer,
      coverImageUrl: covChamomile,
      published: true,
    },
    create: {
      therapistId: therapistUser.id,
      title: "קמומיל רפואי (Matricaria chamomilla) — רוגע עיכולי ושימוש חיצוני זהיר",
      slug: "mallow-soothing",
      category: "עיכול ודלקות",
      excerpt:
        "סקירה מקצועית לקמומיל: שימושים מסורתיים ברוגע עיכולי קל, תמיכה בשינה, ושימוש חיצוני בשיקום עור — לצד אזהרות הריון, אלרגיה לאסטים, ואינטראקציות תרופתיות אפשריות.",
      body:
        "קמומיל רפואי (Matricaria chamomilla) הוא אחד הצמחים הנפוצים ביותר במטבח ובמרפאה. הוא נחשב בעדינות יחסית, אך גם לו יש גבולות, רגישויות, ואינטראקציות שחשוב להכיר לפני המלצה למטופלים.\n\n" +
        "בחלק הראשון של המאמר נפרט על הבדלים בין זנים ומקורות, על איכות חומר גלם (יבש מול טרי), ועל השפעה של אחסון על הפעילות הארומטית והפוליפנולית. נדגיש את חשיבות התיעוד במרפאה: מינון, תדירות, תגובות, והפניות לרופא/ה כשמדובר בתסמינים חדשים או מתמשכים.\n\n" +
        "בחלק השני נעסוק בשימושים פנימיים נפוצים (חליטה, תמציות) ובשימוש חיצוני זהיר — כולל אזהרות בהריון ובגיל צעיר, ורגישות ידועה למשפחת המורכבים. נסיים במסגרת אתית: מה מקובל להבטיח למטופל, ומה חייבים להשאיר מחוץ לשיחה.\n\n" +
        "המאמר מיועד למטפלים מוסמכים ולקוראים מקצועיים המחפשים מסגרת שפה אחידה עם הרפואה הקונבנציונלית." +
        articleDisclaimer,
      coverImageUrl: covChamomile,
      published: true,
    },
  });

  await prisma.herbalArticle.upsert({
    where: { slug: "chamomile-gentle-demo" },
    update: {
      title: "לבנדר רפואי (Lavandula angustifolia) — רוגע, שינה ושמן אתרי בטוח",
      category: "רוגע ושינה",
      excerpt:
        "מבט מקצועי על לבנדר: שימושים בשינה קלה, ברוגע עצבי, ובשמן אתרי — כולל ריכוזים, רגישות עור, והנחיות זהירות לילדים ולבהריון.",
      body:
        "לבנדר הוא צמח ארומטי פופולרי. נבחן את ההבדל בין חליטה לשמן אתרי, נדבר על ריכוזים ובטיחות בעור, ונסביר מתי להימנע משימוש עצמאי.\n\n" +
        "המאמר מדגיש שיחה אתית עם מטופלים ותיעוד מקצועי." +
        articleDisclaimer,
      coverImageUrl: covLavender,
      published: true,
    },
    create: {
      therapistId: shira.id,
      title: "לבנדר רפואי (Lavandula angustifolia) — רוגע, שינה ושמן אתרי בטוח",
      slug: "chamomile-gentle-demo",
      category: "רוגע ושינה",
      excerpt:
        "מבט מקצועי על לבנדר: שימושים בשינה קלה, ברוגע עצבי, ובשמן אתרי — כולל ריכוזים, רגישות עור, והנחיות זהירות לילדים ולבהריון.",
      body:
        "לבנדר הוא צמח ארומטי פופולרי. נבחן את ההבדל בין חליטה לשמן אתרי, נדבר על ריכוזים ובטיחות בעור, ונסביר מתי להימנע משימוש עצמאי.\n\n" +
        "המאמר מדגיש שיחה אתית עם מטופלים ותיעוד מקצועי." +
        articleDisclaimer,
      coverImageUrl: covLavender,
      published: true,
    },
  });

  await prisma.herbalArticle.upsert({
    where: { slug: "ginger-warm-demo" },
    update: {
      title: "מנטה חריפה (Mentha × piperita) — עיכול, כאב ראש קל, ובטיחות מינון",
      category: "נשימה ועיכול",
      excerpt:
        "מנטה כצמח מרפא: שימושים מסורתיים בעיכול, בכאבי ראש קלים, ובמערכת נשימה — לצד אזהרות בגסטריטיס רפלוקס, בהנקה, ובשילוב עם תרופות מסוימות.",
      body:
        "המנטה החריפה נפוצה בחליטות ובטינקטורות. נסקור את הפרופיל הארומטי, את ההבדלים בין עלים טריים למיובשים, ואת דרכי ההכנה הבטוחות.\n\n" +
        "נדגיש את חשיבות האיכות והאחסון, ואת הצורך בהסבר ברור למטופלים על גבולות הידע הקליני." +
        articleDisclaimer,
      coverImageUrl: covMint,
      published: true,
    },
    create: {
      therapistId: michael.id,
      title: "מנטה חריפה (Mentha × piperita) — עיכול, כאב ראש קל, ובטיחות מינון",
      slug: "ginger-warm-demo",
      category: "נשימה ועיכול",
      excerpt:
        "מנטה כצמח מרפא: שימושים מסורתיים בעיכול, בכאבי ראש קלים, ובמערכת נשימה — לצד אזהרות בגסטריטיס רפלוקס, בהנקה, ובשילוב עם תרופות מסוימות.",
      body:
        "המנטה החריפה נפוצה בחליטות ובטינקטורות. נסקור את הפרופיל הארומטי, את ההבדלים בין עלים טריים למיובשים, ואת דרכי ההכנה הבטוחות.\n\n" +
        "נדגיש את חשיבות האיכות והאחסון, ואת הצורך בהסבר ברור למטופלים על גבולות הידע הקליני." +
        articleDisclaimer,
      coverImageUrl: covMint,
      published: true,
    },
  });

  await prisma.herbalArticle.upsert({
    where: { slug: "lemon-balm-calm-demo" },
    update: {
      title: "שיבולת שועל (Avena sativa) — תמיכה עדינה ברוגע ובמערכת עצבים",
      category: "עצבים ושינה",
      excerpt:
        "שיבולת שועל כצמח מרפא: שימושים מסורתיים ברוגע עצבי קל, בתמיכה בשינה, ובמסגרת ליווי תזונתי — עם דגש על איכות תכשיר ועל גבולות ההבטחה הקלינית.",
      body:
        "שיבולת השועל נתפסת לעיתים כ'מזון', אך גם כצמח מרפא בעדינות. במאמר נציג את המסגרת המקצועית לשיחה עם מטופלים: מה מקובל בשימוש, ואיך לשמור על גבול בריא.\n\n" +
        "נדגיש תיעוד, מעקב, והפניות כשמתעוררות תלונות חדשות." +
        articleDisclaimer,
      coverImageUrl: covOats,
      published: true,
    },
    create: {
      therapistId: yael.id,
      title: "שיבולת שועל (Avena sativa) — תמיכה עדינה ברוגע ובמערכת עצבים",
      slug: "lemon-balm-calm-demo",
      category: "עצבים ושינה",
      excerpt:
        "שיבולת שועל כצמח מרפא: שימושים מסורתיים ברוגע עצבי קל, בתמיכה בשינה, ובמסגרת ליווי תזונתי — עם דגש על איכות תכשיר ועל גבולות ההבטחה הקלינית.",
      body:
        "שיבולת השועל נתפסת לעיתים כ'מזון', אך גם כצמח מרפא בעדינות. במאמר נציג את המסגרת המקצועית לשיחה עם מטופלים: מה מקובל בשימוש, ואיך לשמור על גבול בריא.\n\n" +
        "נדגיש תיעוד, מעקב, והפניות כשמתעוררות תלונות חדשות." +
        articleDisclaimer,
      coverImageUrl: covOats,
      published: true,
    },
  });

  await prisma.herbalArticle.upsert({
    where: { slug: "nettle-nourish-demo" },
    update: {
      title: "אזוב מצוי (Origanum syriacum) — ארומה חזקה, עיכול, ושימוש זהיר בשמן אתרי",
      category: "ארומטיקה ועיכול",
      excerpt:
        "אזוב (זעתר בורא) כצמח מרפא: שימושים מסורתיים בעיכול, בארומה חזקה, ובשמן אתרי — כולל אזהרות לילדים, להריון, ולרגישות נשימתית.",
      body:
        "האזוב המצוי הוא צמח מקומי וריחני. נפרט על הבדלים בין חליטה לשמן אתרי, על ריכוזים ועל רגישות אפשרית. נדון גם בשילובים במטבח הבריא ככלי להעשרת התזונה.\n\n" +
        "המאמר מדגיש עבודה מקצועית: הסבר, תיעוד, והימנעות מהבטחות יתר." +
        articleDisclaimer,
      coverImageUrl: covHyssop,
      published: true,
    },
    create: {
      therapistId: eran.id,
      title: "אזוב מצוי (Origanum syriacum) — ארומה חזקה, עיכול, ושימוש זהיר בשמן אתרי",
      slug: "nettle-nourish-demo",
      category: "ארומטיקה ועיכול",
      excerpt:
        "אזוב (זעתר בורא) כצמח מרפא: שימושים מסורתיים בעיכול, בארומה חזקה, ובשמן אתרי — כולל אזהרות לילדים, להריון, ולרגישות נשימתית.",
      body:
        "האזוב המצוי הוא צמח מקומי וריחני. נפרט על הבדלים בין חליטה לשמן אתרי, על ריכוזים ועל רגישות אפשרית. נדון גם בשילובים במטבח הבריא ככלי להעשרת התזונה.\n\n" +
        "המאמר מדגיש עבודה מקצועית: הסבר, תיעוד, והימנעות מהבטחות יתר." +
        articleDisclaimer,
      coverImageUrl: covHyssop,
      published: true,
    },
  });

  await prisma.herbalArticle.upsert({
    where: { slug: "ashwagandha-stress-recovery" },
    update: {
      title: "וותניה נומניפרה (Ashwagandha) — עומס, שינה, והקשר לספורט",
      category: "עצבים, שינה, ספורט",
      excerpt:
        "מבט קליני-צמחי על אשווגנדה: שימושים מסורתיים בתמיכה בעומס ובשינה, שיקולי בטיחות, תרופות נפוצות, והפרדה בין ציפייה ריאלית לבין הייפ שיווקי.",
      body:
        "וותניה נומניפרה, המוכרת לרוב כאשווגנדה, היא שורש שמקורו ברפואה האיורוודית ונחקרה בעשורים האחרונים בהקשרים שונים של מתח, שינה, וביצועים. במאמר זה ננסח שפה מקצועית למטפלים: מה אפשר לדון עליו במסגרת ליווי, ומה חייבים להשאיר מחוץ לשיחה.\n\n" +
        "נפתח בהבחנה בין תכשירים שונים (אבקה, תמצית יבשה, טינקטורה) ולמה שווי מינון אינו טריוויאלי. נמשיך לנושאי בטיחות: הריון והנקה, מחלות אוטואימוניות, תרופות המשפיעות על המערכת העצבית, ולוח זמנים לפני ניתוחים. נדגיש תמיד מעקב אחרי תופעות לוואי והפניה לרופא/ה כשמופיעים סימנים חדשים.\n\n" +
        "בהקשר ספורטי נדבר על גבולות: אין להציג את הצמח כתחליף לאבחון רפואי של עייפות כרונית, אנמיה, או הפרעות שינה משניות. נסיים בתיעוד במרפאה — מה לרשום, מה לשאול במפגש הבא, ואיך לשלב את השיחה עם דיאטנית או פסיכולוג/ית כשצריך.\n\n" +
        "המאמר מיועד למטפלים מוסמכים בצמחי מרפא." +
        articleDisclaimer,
      coverImageUrl: covOats,
      published: true,
    },
    create: {
      therapistId: noaGolan.id,
      title: "וותניה נומניפרה (Ashwagandha) — עומס, שינה, והקשר לספורט",
      slug: "ashwagandha-stress-recovery",
      category: "עצבים, שינה, ספורט",
      excerpt:
        "מבט קליני-צמחי על אשווגנדה: שימושים מסורתיים בתמיכה בעומס ובשינה, שיקולי בטיחות, תרופות נפוצות, והפרדה בין ציפייה ריאלית לבין הייפ שיווקי.",
      body:
        "וותניה נומניפרה, המוכרת לרוב כאשווגנדה, היא שורש שמקורו ברפואה האיורוודית ונחקרה בעשורים האחרונים בהקשרים שונים של מתח, שינה, וביצועים. במאמר זה ננסח שפה מקצועית למטפלים: מה אפשר לדון עליו במסגרת ליווי, ומה חייבים להשאיר מחוץ לשיחה.\n\n" +
        "נפתח בהבחנה בין תכשירים שונים (אבקה, תמצית יבשה, טינקטורה) ולמה שווי מינון אינו טריוויאלי. נמשיך לנושאי בטיחות: הריון והנקה, מחלות אוטואימוניות, תרופות המשפיעות על המערכת העצבית, ולוח זמנים לפני ניתוחים. נדגיש תמיד מעקב אחרי תופעות לוואי והפניה לרופא/ה כשמופיעים סימנים חדשים.\n\n" +
        "בהקשר ספורטי נדבר על גבולות: אין להציג את הצמח כתחליף לאבחון רפואי של עייפות כרונית, אנמיה, או הפרעות שינה משניות. נסיים בתיעוד במרפאה — מה לרשום, מה לשאול במפגש הבא, ואיך לשלב את השיחה עם דיאטנית או פסיכולוג/ית כשצריך.\n\n" +
        "המאמר מיועד למטפלים מוסמכים בצמחי מרפא." +
        articleDisclaimer,
      coverImageUrl: covOats,
      published: true,
    },
  });

  await prisma.herbalArticle.upsert({
    where: { slug: "calendula-skin-barrier" },
    update: {
      title: "קלנדולה רפואית (Calendula officinalis) — עור רגיש, מחסום, ושימוש חיצוני",
      category: "עור וטיפוח קליני",
      excerpt:
        "קלנדולה כצמח לטיפוח עור: שימושים מסורתיים בשיקום עדין, בבחירת בסיסים (שמן, משחה), ובטיחות לצד אלרגיה לצמחי מורכבים או פצעים מזוהמים.",
      body:
        "הקלנדולה היא פרח מוכר בשדות ובגינות, ובמרפאות צמחי מרפא היא נפוצה כרכיב בשמנים, משחות, וטינקטורות חיצוניות. במאמר נפרק את השיקולים הקליניים: מתי שימוש חיצוני הגיוני כהשלמה לטיפול רפואי, ומתי הוא אסור או דורש הפניה מיידית.\n\n" +
        "נדבר על איכות חומר גלם: יבש מול רטוב, ריכוז שמן, וסיכון לראקציה בעור דק או שבור. נפרט על רגישות צולבת למשפחת המורכבים, ועל ההבדל בין גירוי קל לבין דלקת הדורשת אנטיביוטיקה. נציע מסגרת לשיחה עם מטופלים: איך להסביר שקלנדולה אינה 'מרפאת הכל', ואיך לתעד המלצות.\n\n" +
        "לבסוף ניגע בשילוב עם תרופות חיצוניות רוקחיות — איפה חובה לעצור ולשלוח לרוקח/ית או לרופא/ת עור.\n\n" +
        "המאמר מיועד למטפלים מוסמכים." +
        articleDisclaimer,
      coverImageUrl: covLavender,
      published: true,
    },
    create: {
      therapistId: danaErez.id,
      title: "קלנדולה רפואית (Calendula officinalis) — עור רגיש, מחסום, ושימוש חיצוני",
      slug: "calendula-skin-barrier",
      category: "עור וטיפוח קליני",
      excerpt:
        "קלנדולה כצמח לטיפוח עור: שימושים מסורתיים בשיקום עדין, בבחירת בסיסים (שמן, משחה), ובטיחות לצד אלרגיה לצמחי מורכבים או פצעים מזוהמים.",
      body:
        "הקלנדולה היא פרח מוכר בשדות ובגינות, ובמרפאות צמחי מרפא היא נפוצה כרכיב בשמנים, משחות, וטינקטורות חיצוניות. במאמר נפרק את השיקולים הקליניים: מתי שימוש חיצוני הגיוני כהשלמה לטיפול רפואי, ומתי הוא אסור או דורש הפניה מיידית.\n\n" +
        "נדבר על איכות חומר גלם: יבש מול רטוב, ריכוז שמן, וסיכון לראקציה בעור דק או שבור. נפרט על רגישות צולבת למשפחת המורכבים, ועל ההבדל בין גירוי קל לבין דלקת הדורשת אנטיביוטיקה. נציע מסגרת לשיחה עם מטופלים: איך להסביר שקלנדולה אינה 'מרפאת הכל', ואיך לתעד המלצות.\n\n" +
        "לבסוף ניגע בשילוב עם תרופות חיצוניות רוקחיות — איפה חובה לעצור ולשלוח לרוקח/ית או לרופא/ת עור.\n\n" +
        "המאמר מיועד למטפלים מוסמכים." +
        articleDisclaimer,
      coverImageUrl: covLavender,
      published: true,
    },
  });

  const visionJson = JSON.parse(JSON.stringify(DEFAULT_VISION_SLIDES)) as Prisma.InputJsonValue;

  await prisma.siteConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      heroSlides: [],
      siteTitle: DEFAULT_SITE_TITLE,
      visionSlides: visionJson,
    },
    update: {},
  });

  const existingCfg = await prisma.siteConfig.findUnique({ where: { id: "default" } });
  if (existingCfg?.siteTitle == null) {
    await prisma.siteConfig.update({
      where: { id: "default" },
      data: { siteTitle: DEFAULT_SITE_TITLE },
    });
  }
  if (existingCfg?.visionSlides == null) {
    await prisma.siteConfig.update({
      where: { id: "default" },
      data: { visionSlides: visionJson },
    });
  }

  const demoClientEmail = process.env.DEMO_CLIENT_EMAIL ?? "client@example.com";
  const demoClientPassword = process.env.DEMO_CLIENT_PASSWORD ?? "Client123!";
  const clHash = await hash(demoClientPassword, 12);

  await prisma.user.upsert({
    where: { email: demoClientEmail },
    update: { role: "client", passwordHash: clHash, name: "מיכל אהרון" },
    create: {
      email: demoClientEmail,
      name: "מיכל אהרון",
      passwordHash: clHash,
      role: "client",
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "seed.run",
      entityType: "System",
      metadata: { therapistSlug: profile.slug },
    },
  });

  // eslint-disable-next-line no-console
  console.log(`
——————————————————————————————————————————————————
  האתר מולא בתוכן התחלה (מוצרים, מטפלים, מאמרים, לקוח)
  עכשיו: היכנסו לממשק הניהול, עברו על הכל וערכו או מחקו.

  מנהל/ת
    מייל: ${adminEmail}
    סיסמה (ברירת מחדל): ${adminPassword}

  מטפלים (כולל ד״ר רונית) — סיסמה אחת לכולם אם לא הגדרתם אחרת:
    סיסמה: ${demoTherapistPassword}

  לקוח להתנסות
    מייל: ${demoClientEmail}
    סיסמה: ${demoClientPassword}

  מטפלים נוספים (אותה סיסמת מטפל): shira.demo@, michael.demo@,
  yael.demo@, dan.demo@ (ערן כהן), noa.herbal.demo@, amir.herbal.demo@, dana.herbal.demo@

  להריץ שוב אחרי עדכון קוד (מעדכן פריטים עם מפתח קטלוג; לא נוגע במה שיצרתם ידנית בלי מפתח):
    npm run db:seed
——————————————————————————————————————————————————
`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
