import { PrismaClient, ProductType, type Prisma } from "@prisma/client";
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

async function ensureProduct(data: {
  type: ProductType;
  title: string;
  description: string;
  price: number;
  memberPrice: number;
  imageUrl: string;
}) {
  const existing = await prisma.product.findFirst({ where: { title: data.title } });
  if (existing) {
    await prisma.product.update({ where: { id: existing.id }, data });
  } else {
    await prisma.product.create({ data });
  }
}

async function main() {
  /** Fresh demo catalog for קורסים וסדנאות (avoid duplicate rows when titles change) */
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

  await ensureProduct({
    type: ProductType.workshop,
    title: "סדנת מסחטות ומשחות — רוקחות טבעית למטפלים",
    description:
      "מפגש ידיים מסודר: בחירת חומרי גלם, יחסי חילוץ, אלכוהול ושמני בסיס, תיוג ואחסון בטוח. כולל תבניות תיעוד ודגשים משפטיים לעבודה מקצועית.",
    price: 540,
    memberPrice: 460,
    imageUrl: imgWorkshop,
  });
  await ensureProduct({
    type: ProductType.zoom,
    title: "זום מקצועי — ליווי צמחי בגיל מבוגר ובטיחות תרופתית",
    description:
      "ארבעה מפגשים: מיפוי תרופות נפוצות, נקודות הפסקה, תיעוד בקליניקה, ושיחה עם רופא/ת משפחה. מיועד למטפלים מוסמכים בצמחי מרפא.",
    price: 380,
    memberPrice: 310,
    imageUrl: imgZoom,
  });
  await ensureProduct({
    type: ProductType.workshop,
    title: "סדנת חרדה קלה — חליטות, ריח, וכלים לבית",
    description:
      "קבוצה קטנה, קצב רגוע: הדגמות בטוחות, טעימות מבוקרות, ותרגילי רוגע. מתאים גם למדריכי הורים ולמטפלים המחפשים חוויה מקצועית.",
    price: 425,
    memberPrice: 365,
    imageUrl: imgAnxiety,
  });
  await ensureProduct({
    type: ProductType.supervision,
    title: "השגחה קבוצתית — פוריות, מחזור וליווי צמחי עדין",
    description:
      "מעגל חודשי למטפלים העוסקים בנשים: ניסוח שאלות לרופאות, תיעוד, וצמחים בשלבים שונים של החיים. עד 10 משתתפים.",
    price: 275,
    memberPrice: 235,
    imageUrl: imgSupervision,
  });
  await ensureProduct({
    type: ProductType.zoom,
    title: "זום — מיקרוביום ועיכול: מהמחקר לפרקטיקה",
    description:
      "שעה וחצי מרוכזת: צמחי מרה, סיבים תזונתיים, וקריאה ביקורתית של מאמרים. כולל שאלות ותשובות וחומרי עזר דיגיטליים.",
    price: 118,
    memberPrice: 95,
    imageUrl: imgDigest,
  });
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
