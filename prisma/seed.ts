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
const IMG_ERAN = `https://images.unsplash.com/photo-1582750433449-648ed127bb54?${U}`;

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

async function main() {
  /** Fresh demo catalog for קורסים וסדנאות */
  await prisma.product.deleteMany({});

  const [
    imgRonit,
    imgShira,
    imgMichael,
    imgYael,
    imgEran,
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
    unsplashImage("young man professional portrait outdoor", IMG_ERAN, "portrait"),
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

  const workshopSeeds: Array<{
    title: string;
    description: string;
    price: number;
    memberPrice: number;
    imageUrl: string;
    metadata: { location: string; startsAt: string; maxParticipants: number };
  }> = [
    {
      title: "סדנת מסחטות ומשחות — רמת גן",
      description: "קורס פרונטלי · רמת גן",
      price: 540,
      memberPrice: 460,
      imageUrl: imgWorkshop,
      metadata: { location: "רמת גן", startsAt: whenIso("2026-07-03T09:30"), maxParticipants: 16 },
    },
    {
      title: "סדנת חליטות וארומה — חיפה",
      description: "קורס פרונטלי · חיפה",
      price: 410,
      memberPrice: 350,
      imageUrl: imgAnxiety,
      metadata: { location: "חיפה", startsAt: whenIso("2026-07-18T17:00"), maxParticipants: 12 },
    },
    {
      title: "יום עיון רוקחות טבעית — ירושלים",
      description: "קורס פרונטלי · ירושלים",
      price: 590,
      memberPrice: 500,
      imageUrl: imgDigest,
      metadata: { location: "ירושלים", startsAt: whenIso("2026-08-01T09:00"), maxParticipants: 20 },
    },
    {
      title: "סדנת עור רגיש וצמחים — רעננה",
      description: "קורס פרונטלי · רעננה",
      price: 480,
      memberPrice: 410,
      imageUrl: imgWorkshop,
      metadata: { location: "רעננה", startsAt: whenIso("2026-08-12T18:30"), maxParticipants: 10 },
    },
    {
      title: "מעבדת נוסחאות ביתיות — נס ציונה",
      description: "קורס פרונטלי · נס ציונה",
      price: 520,
      memberPrice: 440,
      imageUrl: imgAnxiety,
      metadata: { location: "נס ציונה", startsAt: whenIso("2026-09-05T10:00"), maxParticipants: 14 },
    },
  ];

  for (const w of workshopSeeds) {
    const desc = `${w.description} · ${new Date(w.metadata.startsAt).toLocaleString("he-IL")}`;
    await prisma.product.create({
      data: {
        type: ProductType.workshop,
        title: w.title,
        description: desc,
        price: w.price,
        memberPrice: w.memberPrice,
        imageUrl: w.imageUrl,
        metadata: w.metadata as Prisma.InputJsonValue,
        active: true,
      },
    });
  }

  const zoomSeeds: Array<{
    title: string;
    price: number;
    memberPrice: number;
    imageUrl: string;
    metadata: { zoomUrl: string; startsAt: string; maxParticipants: number };
  }> = [
    {
      title: "זום — בטיחות תרופתית וצמחים",
      price: 360,
      memberPrice: 300,
      imageUrl: imgZoom,
      metadata: {
        zoomUrl: "https://zoom.us/j/8001110001",
        startsAt: whenIso("2026-07-08T20:00"),
        maxParticipants: 40,
      },
    },
    {
      title: "זום — עיכול ומיקרוביום",
      price: 118,
      memberPrice: 95,
      imageUrl: imgDigest,
      metadata: {
        zoomUrl: "https://zoom.us/j/8001110002",
        startsAt: whenIso("2026-07-22T19:30"),
        maxParticipants: 60,
      },
    },
    {
      title: "זום — חרדה קלה וצמחי הרגעה",
      price: 140,
      memberPrice: 115,
      imageUrl: imgZoom,
      metadata: {
        zoomUrl: "https://zoom.us/j/8001110003",
        startsAt: whenIso("2026-08-04T20:15"),
        maxParticipants: 35,
      },
    },
    {
      title: "זום — פוריות משלימה — שאלות למומחים",
      price: 220,
      memberPrice: 185,
      imageUrl: imgZoom,
      metadata: {
        zoomUrl: "https://zoom.us/j/8001110004",
        startsAt: whenIso("2026-08-20T19:00"),
        maxParticipants: 25,
      },
    },
    {
      title: "זום — תיעוד קליני ואתיקה",
      price: 95,
      memberPrice: 79,
      imageUrl: imgDigest,
      metadata: {
        zoomUrl: "https://zoom.us/j/8001110005",
        startsAt: whenIso("2026-09-02T18:00"),
        maxParticipants: 50,
      },
    },
  ];

  for (const z of zoomSeeds) {
    const desc = `מפגש זום · ${new Date(z.metadata.startsAt).toLocaleString("he-IL")}`;
    await prisma.product.create({
      data: {
        type: ProductType.zoom,
        title: z.title,
        description: desc,
        price: z.price,
        memberPrice: z.memberPrice,
        imageUrl: z.imageUrl,
        metadata: z.metadata as Prisma.InputJsonValue,
        active: true,
      },
    });
  }

  const supervisionSeeds: Array<{
    title: string;
    price: number;
    imageUrl: string;
    metadata: { startsAt: string; maxParticipants: number };
  }> = [
    {
      title: "השגחה קבוצתית — פוריות ומחזור",
      price: 260,
      imageUrl: imgSupervision,
      metadata: { startsAt: whenIso("2026-07-11T08:30"), maxParticipants: 10 },
    },
    {
      title: "השגחה — עבודה עם מתבגרים",
      price: 240,
      imageUrl: imgSupervision,
      metadata: { startsAt: whenIso("2026-07-25T08:30"), maxParticipants: 8 },
    },
    {
      title: "השגחה — אינטראקציות תרופתיות",
      price: 280,
      imageUrl: imgSupervision,
      metadata: { startsAt: whenIso("2026-08-08T08:30"), maxParticipants: 12 },
    },
    {
      title: "השגחה — תסקיר מקרה קליני",
      price: 200,
      imageUrl: imgSupervision,
      metadata: { startsAt: whenIso("2026-08-29T08:30"), maxParticipants: 6 },
    },
    {
      title: "השגחה — פתיחת קליניקה חדשה",
      price: 310,
      imageUrl: imgSupervision,
      metadata: { startsAt: whenIso("2026-09-14T08:30"), maxParticipants: 10 },
    },
  ];

  for (const s of supervisionSeeds) {
    const desc = `השגחה מקצועית · ${new Date(s.metadata.startsAt).toLocaleString("he-IL")}`;
    await prisma.product.create({
      data: {
        type: ProductType.supervision,
        title: s.title,
        description: desc,
        price: s.price,
        memberPrice: s.price,
        imageUrl: s.imageUrl,
        metadata: s.metadata as Prisma.InputJsonValue,
        active: true,
      },
    });
  }
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "admin", passwordHash, name: "מנהל/ת מערכת" },
    create: {
      email: adminEmail,
      name: "מנהל/ת מערכת",
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
      image: imgEran,
    },
    create: {
      email: "dan.demo@example.com",
      name: "ערן כהן",
      passwordHash: thHash,
      role: "therapist",
      subStatus: "active",
      image: imgEran,
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

  const profile = await prisma.therapistProfile.findUniqueOrThrow({
    where: { userId: therapistUser.id },
  });

  const articleDisclaimer =
    "\n\nהמאמר לצורכי הדגמה והשראה מקצועית בלבד — אינו מהווה ייעוץ רפואי או תחליף לחוות דעת רופא/ה.";

  await prisma.herbalArticle.upsert({
    where: { slug: "mallow-soothing" },
    update: {
      title: "קמומיל רפואי (Matricaria chamomilla) — רוגע עיכולי ושימוש חיצוני זהיר",
      category: "עיכול ודלקות",
      excerpt:
        "סקירה מקצועית לקמומיל: שימושים מסורתיים ברוגע עיכולי קל, תמיכה בשינה, ושימוש חיצוני בשיקום עור — לצד אזהרות הריון, אלרגיה לאסטים, ואינטראקציות תרופתיות אפשריות.",
      body:
        "הקמומיל הוא צמח מוכר במטבח ובקליניקה. במאמר נפרט על הבדלים בין זנים, על איכות חומר הגלם, ועל דרכי הכנה בטוחות.\n\n" +
        "נדגיש תיעוד, מעקב אחר תופעות לוואי, והפניה לרופא/ה כשמדובר בתסמינים חדשים או מתמשכים.\n\n" +
        "המאמר מיועד למטפלים מוסמכים ולציבור מבין כהשראה מקצועית בלבד." +
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
        "הקמומיל הוא צמח מוכר במטבח ובקליניקה. במאמר נפרט על הבדלים בין זנים, על איכות חומר הגלם, ועל דרכי הכנה בטוחות.\n\n" +
        "נדגיש תיעוד, מעקב אחר תופעות לוואי, והפניה לרופא/ה כשמדובר בתסמינים חדשים או מתמשכים.\n\n" +
        "המאמר מיועד למטפלים מוסמכים ולציבור מבין כהשראה מקצועית בלבד." +
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
    update: { role: "client", passwordHash: clHash, name: "לקוח/ה לדוגמה" },
    create: {
      email: demoClientEmail,
      name: "לקוח/ה לדוגמה",
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
  console.log(
    "Seed complete. Admin:",
    adminEmail,
    "Therapists:",
    demoTherapistEmail,
    "shira.demo@example.com",
    "michael.demo@example.com",
    "yael.demo@example.com",
    "dan.demo@example.com (ערן כהן)",
    "Client:",
    demoClientEmail,
  );
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
