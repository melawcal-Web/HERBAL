import { PrismaClient, ProductType, type Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { DEFAULT_SITE_TITLE, DEFAULT_VISION_SLIDES } from "../src/lib/home-vision";

const prisma = new PrismaClient();

const U = "auto=format&fit=crop&w=1600&q=85";

/** High-quality Unsplash portraits & scenes for demo therapists */
const IMG_RONIT = `https://images.unsplash.com/photo-1551836022-d5d88e9218df?${U}`;
const IMG_SHIRA = `https://images.unsplash.com/photo-1573496359142-b8d87734a5a?${U}`;
const IMG_MICHAEL = `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?${U}`;
const IMG_YAEL = `https://images.unsplash.com/photo-1594824476967-48c8b964273f?${U}`;
const IMG_DAN = `https://images.unsplash.com/photo-1582750433449-648ed127bb54?${U}`;

/** Courses & workshops placeholder visuals */
const IMG_ZOOM = `https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?${U}`;
const IMG_WORKSHOP = `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?${U}`;
const IMG_SUPERVISION = `https://images.unsplash.com/photo-1522071820081-009f0129c71c?${U}`;
const IMG_SHELF = `https://images.unsplash.com/photo-1470058869958-2a77ade41c02?${U}`;
const IMG_ZOOM2 = `https://images.unsplash.com/photo-1515378791036-0648a3c77a02?${U}`;

/** Herbal index — botanical / spice photography (Unsplash) */
const COVER_CURCUMA = `https://images.unsplash.com/photo-1578662996442-48f60103fc96?${U}`;
const COVER_ASHWAGANDHA = `https://images.unsplash.com/photo-1608571423902-eed4ae3ffa5a?${U}`;
const COVER_SAGE = `https://images.unsplash.com/photo-1464226184884-fa280b87c399?${U}`;
const COVER_GINKGO = `https://images.unsplash.com/photo-1470058869958-2a77ade41c02?${U}`;
const COVER_ROSEMARY = `https://images.unsplash.com/photo-1509440159596-0249088772ff?${U}`;

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

  await ensureProduct({
    type: ProductType.workshop,
    title: "סדנת רוקחות טבעית — טינקטורות ומשחות ביתיות",
    description:
      "יום עיון מעשי למטפלים ולחובבי צמחי מרפא: בחירת חומרי גלם, יחסי מסחיטה, אלכוהול ושמני בסיס, תיוג ואחסון בטוח. כולל חוברת דיגיטלית ותבניות לתיעוד מקצועי.",
    price: 520,
    memberPrice: 440,
    imageUrl: IMG_WORKSHOP,
  });
  await ensureProduct({
    type: ProductType.zoom,
    title: "קורס זום — ניקוי רעלים צמחי: עקרונות ופרוטוקול בטוח",
    description:
      "ארבעה מפגשים מקוונים: הבחנה בין תמיכה עיכולית לבין טרנדים; צמחי מרה וכליה; שילוב עם תזונה; מתי להפנות לרופא/ה. מתאים למטפלים מוסמכים.",
    price: 360,
    memberPrice: 295,
    imageUrl: IMG_ZOOM,
  });
  await ensureProduct({
    type: ProductType.workshop,
    title: "סדנת צמחי מרפא לחרדה קלה ולמערכת עצבים",
    description:
      "מפגש חווייתי לקבוצות קטנות: חליטות, הדגמות ריח, ותרגילי רוגע. דגש על בטיחות, מינונים עדינים, ותיעוד לקוח. כולל ערכת טעימות לדוגמה.",
    price: 410,
    memberPrice: 350,
    imageUrl: IMG_ZOOM2,
  });
  await ensureProduct({
    type: ProductType.supervision,
    title: "השגחה חודשית — פוריות משלימה וליווי צמחי מותאם",
    description:
      "מעגל מקצועי צמוד למטפלים העוסקים בליווי נשי: ניסוח שאלות לרופאות, תיעוד, וצמחים בשלבי מחזור שונים. מוגבל ל־10 משתתפים.",
    price: 260,
    memberPrice: 220,
    imageUrl: IMG_SUPERVISION,
  });
  await ensureProduct({
    type: ProductType.zoom,
    title: "זום מקצועי — עיכול ומיקרוביום: מהמעבדה לקליניקה",
    description:
      "שעה ורבע של תוכן מרוכז: צמחי מרה, ריכוז בטיחות, ושיחה על קריאה ביקורתית של מחקרים. מתאים למטפלים בצמחי מרפא ובתזונה.",
    price: 110,
    memberPrice: 89,
    imageUrl: IMG_SHELF,
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
      image: IMG_RONIT,
    },
    create: {
      email: demoTherapistEmail,
      name: "ד״ר רונית אלון",
      passwordHash: thHash,
      role: "therapist",
      subStatus: "active",
      image: IMG_RONIT,
    },
  });

  await prisma.therapistProfile.upsert({
    where: { userId: therapistUser.id },
    update: {
      slug: "ronit-alon",
      bio: "אני מאמינה בליווי רגיש ובמדויק: כל מטופל מגיע עם סיפור גוף–נפש משלו. בקליניקה משלבת צמחי מרפא מודרניים עם תזונה רכה והדרכה פרקטית לשינה, עיכול ואנרגיה. העבודה מתחילה מהקשבה, ממשיכה בהסברים ברורים, ונשענת על תיעוד מסודר כדי שתדעו בדיוק מה קורה בכל שלב.",
      clinicalExperience:
        "דוקטורט בבריאות הציבור, התמחות בצמחי מרפא קליניים (מכללה אירופאית מוכרת). למעלה מ־15 שנות עבודה במרפאות פרטיות ובית חולים ציבורי — ליווי לפני ואחרי ניתוחים, תמיכה אונקולוגית משלימה, והדרכת צוותים רפואיים.\n" +
        "מרצה ומנחה סדנאות למטפלים בנושאי בטיחות, אינטראקציות תרופתיות, ותקשורת עם רופאים משפחה.",
      specialty1: "עיכול ומערכת מיקרוביום",
      specialty2: "חרדה ורוגע עצבי",
      specialty3: "פוריות וליווי נשי",
      contactInfo: {
        phone: "+972-52-100-1001",
        city: "תל אביב והמרכז",
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
      bio: "אני מאמינה בליווי רגיש ובמדויק: כל מטופל מגיע עם סיפור גוף–נפש משלו. בקליניקה משלבת צמחי מרפא מודרניים עם תזונה רכה והדרכה פרקטית לשינה, עיכול ואנרגיה. העבודה מתחילה מהקשבה, ממשיכה בהסברים ברורים, ונשענת על תיעוד מסודר כדי שתדעו בדיוק מה קורה בכל שלב.",
      clinicalExperience:
        "דוקטורט בבריאות הציבור, התמחות בצמחי מרפא קליניים (מכללה אירופאית מוכרת). למעלה מ־15 שנות עבודה במרפאות פרטיות ובית חולים ציבורי — ליווי לפני ואחרי ניתוחים, תמיכה אונקולוגית משלימה, והדרכת צוותים רפואיים.\n" +
        "מרצה ומנחה סדנאות למטפלים בנושאי בטיחות, אינטראקציות תרופתיות, ותקשורת עם רופאים משפחה.",
      specialty1: "עיכול ומערכת מיקרוביום",
      specialty2: "חרדה ורוגע עצבי",
      specialty3: "פוריות וליווי נשי",
      contactInfo: {
        phone: "+972-52-100-1001",
        city: "תל אביב והמרכז",
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
      image: IMG_SHIRA,
    },
    create: {
      email: "shira.demo@example.com",
      name: "שירה לוי",
      passwordHash: thHash,
      role: "therapist",
      subStatus: "active",
      image: IMG_SHIRA,
    },
  });

  await prisma.therapistProfile.upsert({
    where: { userId: shira.id },
    update: {
      slug: "shira-levi-herbs",
      bio: "הגעתי לצמחי מרפא דרך עולם העיצוב והרוח — ומצאתי כאן שפה מדויקת לגוף. אני אוהבת לעבוד לאט: תהליכי עור, רגישות עצבית, ושגרה שמכבדת גם את המטבח וגם את הקליניקה. בקבוצות קטנות אנחנו נוגעים, מריחים, מתעדים — ויוצאים עם כלים לבית.",
      clinicalExperience:
        "תעודת מטפלת בצמחי מרפא (ארבע שנות לימודים אקדמיים), השלמות בדרמטולוגיה צמחית ובטיחות שימוש חיצוני.\n" +
        "מעל עשר שנות ניסיון בקליניקה פרטית, בליווי קבוצות קטנות ובהרצאות אורח במרכזי יוגה ובתי ספר להורים.",
      specialty1: "עיכול רגיש ודלקות עור קלות",
      specialty2: "חרדה קלה ושינה",
      specialty3: "סדנאות חווייתיות לצמחים",
      contactInfo: {
        phone: "+972-54-200-2002",
        city: "חיפה והצפון",
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
      bio: "הגעתי לצמחי מרפא דרך עולם העיצוב והרוח — ומצאתי כאן שפה מדויקת לגוף. אני אוהבת לעבוד לאט: תהליכי עור, רגישות עצבית, ושגרה שמכבדת גם את המטבח וגם את הקליניקה. בקבוצות קטנות אנחנו נוגעים, מריחים, מתעדים — ויוצאים עם כלים לבית.",
      clinicalExperience:
        "תעודת מטפלת בצמחי מרפא (ארבע שנות לימודים אקדמיים), השלמות בדרמטולוגיה צמחית ובטיחות שימוש חיצוני.\n" +
        "מעל עשר שנות ניסיון בקליניקה פרטית, בליווי קבוצות קטנות ובהרצאות אורח במרכזי יוגה ובתי ספר להורים.",
      specialty1: "עיכול רגיש ודלקות עור קלות",
      specialty2: "חרדה קלה ושינה",
      specialty3: "סדנאות חווייתיות לצמחים",
      contactInfo: {
        phone: "+972-54-200-2002",
        city: "חיפה והצפון",
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
      image: IMG_MICHAEL,
    },
    create: {
      email: "michael.demo@example.com",
      name: "מיכאל ברק",
      passwordHash: thHash,
      role: "therapist",
      subStatus: "active",
      image: IMG_MICHAEL,
    },
  });

  await prisma.therapistProfile.upsert({
    where: { userId: michael.id },
    update: {
      slug: "michael-barak-clinical",
      bio: "אחרי שנים ברפואה משלימה הבנתי כמה כוח יש בצמח פשוט כשמשתמשים בו נכון. אני מלווה מבוגרים ומתבגרים בתסמינים של שינה, חרדה קלה ומערכת נשימה — תמיד בשיתוף עם הרופא המטפל כשצריך.",
      clinicalExperience:
        "הסמכה בצמחי מרפא קליניים, השלמות בפיזיולוגיה של מערכת הנשימה והחיסון.\n" +
        "יותר מ־12 שנות ניסיון בקופות חולים קהילתיות, במרפאה פרטית ובצוותי טיפול משלים בבית חולים.",
      specialty1: "חרדה קלה ומערכת עצבים",
      specialty2: "שינה ונשימה",
      specialty3: "חיסון ותמיכה בעונות מעבר",
      contactInfo: {
        phone: "+972-50-300-3003",
        city: "ירושלים והסביבה",
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
      bio: "אחרי שנים ברפואה משלימה הבנתי כמה כוח יש בצמח פשוט כשמשתמשים בו נכון. אני מלווה מבוגרים ומתבגרים בתסמינים של שינה, חרדה קלה ומערכת נשימה — תמיד בשיתוף עם הרופא המטפל כשצריך.",
      clinicalExperience:
        "הסמכה בצמחי מרפא קליניים, השלמות בפיזיולוגיה של מערכת הנשימה והחיסון.\n" +
        "יותר מ־12 שנות ניסיון בקופות חולים קהילתיות, במרפאה פרטית ובצוותי טיפול משלים בבית חולים.",
      specialty1: "חרדה קלה ומערכת עצבים",
      specialty2: "שינה ונשימה",
      specialty3: "חיסון ותמיכה בעונות מעבר",
      contactInfo: {
        phone: "+972-50-300-3003",
        city: "ירושלים והסביבה",
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
      image: IMG_YAEL,
    },
    create: {
      email: "yael.demo@example.com",
      name: "יעל כהן",
      passwordHash: thHash,
      role: "therapist",
      subStatus: "active",
      image: IMG_YAEL,
    },
  });

  await prisma.therapistProfile.upsert({
    where: { userId: yael.id },
    update: {
      slug: "yael-cohen-herbal",
      bio: "ליווי נשים דורש דיוק, עדינות ולוח זמנים ברור. אני מסבירה מה בטוח ומה דורש התייעצות רפואית, ובוחרת יחד איתכן צמחים שמתאימים לשלב החיים שלכן — מחזור, הריון, הנקה או גיל ביניים.",
      clinicalExperience:
        "מטפלת מוסמכת בצמחי מרפא; התמחות מעשית בגינקולוגיה צמחית, בהנקה ובליווי נשי לאורך חיים.\n" +
        "מעל 11 שנות ניסיון קליני; שיתופי פעולה עם מיילדות ויועצות הנקה והרצאות למדריכות הורים.",
      specialty1: "פוריות ומחזור",
      specialty2: "הריון, לידה והנקה",
      specialty3: "גיל ביניים ואיזון הורמונלי",
      contactInfo: {
        phone: "+972-52-400-4004",
        city: "רעננה והשרון",
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
      bio: "ליווי נשים דורש דיוק, עדינות ולוח זמנים ברור. אני מסבירה מה בטוח ומה דורש התייעצות רפואית, ובוחרת יחד איתכן צמחים שמתאימים לשלב החיים שלכן — מחזור, הריון, הנקה או גיל ביניים.",
      clinicalExperience:
        "מטפלת מוסמכת בצמחי מרפא; התמחות מעשית בגינקולוגיה צמחית, בהנקה ובליווי נשי לאורך חיים.\n" +
        "מעל 11 שנות ניסיון קליני; שיתופי פעולה עם מיילדות ויועצות הנקה והרצאות למדריכות הורים.",
      specialty1: "פוריות ומחזור",
      specialty2: "הריון, לידה והנקה",
      specialty3: "גיל ביניים ואיזון הורמונלי",
      contactInfo: {
        phone: "+972-52-400-4004",
        city: "רעננה והשרון",
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

  const dan = await prisma.user.upsert({
    where: { email: "dan.demo@example.com" },
    update: {
      name: "דן רוזן",
      role: "therapist",
      passwordHash: thHash,
      image: IMG_DAN,
    },
    create: {
      email: "dan.demo@example.com",
      name: "דן רוזן",
      passwordHash: thHash,
      role: "therapist",
      subStatus: "active",
      image: IMG_DAN,
    },
  });

  await prisma.therapistProfile.upsert({
    where: { userId: dan.id },
    update: {
      slug: "dan-rosen-formulas",
      bio: "אני נהנה לפתור 'חידות' עיכול: מה מחמם מדי, מה מייבש, ואיך משלבים צמחים בלי להעמיס. המטופלים שלי מקבלים הסברים על הלוגיקה מאחורי הנוסחה — כדי שתבינו את הגוף, לא רק את הבקבוק.",
      clinicalExperience:
        "הסמכה בצמחי מרפא; קורסים מתקדמים בפרמקולוגיה וביוכימיה של צמחים.\n" +
        "מעל 13 שנות ניסיון במעבדות קטנות, בקליניקה פרטית ובליווי ספורטאים חובבים.",
      specialty1: "עיכול, נפחת ומיקרוביום",
      specialty2: "אנרגיה וסיבולת בספורט חובבני",
      specialty3: "פורמולות קליניות מותאמות אישית",
      contactInfo: {
        phone: "+972-54-500-5005",
        city: "באר שבע והנגב",
        whatsapp: "972545005005",
        email: "dan.digest@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/dan-formulas",
        instagram: "dan.herbal.lab",
        facebook: "DanHerbalFormulas",
        tiktok: "dan.herbs.lab",
      },
    },
    create: {
      userId: dan.id,
      slug: "dan-rosen-formulas",
      bio: "אני נהנה לפתור 'חידות' עיכול: מה מחמם מדי, מה מייבש, ואיך משלבים צמחים בלי להעמיס. המטופלים שלי מקבלים הסברים על הלוגיקה מאחורי הנוסחה — כדי שתבינו את הגוף, לא רק את הבקבוק.",
      clinicalExperience:
        "הסמכה בצמחי מרפא; קורסים מתקדמים בפרמקולוגיה וביוכימיה של צמחים.\n" +
        "מעל 13 שנות ניסיון במעבדות קטנות, בקליניקה פרטית ובליווי ספורטאים חובבים.",
      specialty1: "עיכול, נפחת ומיקרוביום",
      specialty2: "אנרגיה וסיבולת בספורט חובבני",
      specialty3: "פורמולות קליניות מותאמות אישית",
      contactInfo: {
        phone: "+972-54-500-5005",
        city: "באר שבע והנגב",
        whatsapp: "972545005005",
        email: "dan.digest@herbal-demo.il",
      },
      socialLinks: {
        website: "https://example.com/dan-formulas",
        instagram: "dan.herbal.lab",
        facebook: "DanHerbalFormulas",
        tiktok: "dan.herbs.lab",
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
      title: "כורכום (Curcuma longa) — שימושים תומכים ונקודות בטיחות קליניות",
      excerpt:
        "סקירה מקצועית לכורכום ולקורקומין: שימושים מסורתיים בעיכול ובדלקות, תרומה מדעית נבחרת, והפרדה בין תוסף תזונה לבין ליווי רפואי פעיל.",
      body:
        "הכורכום הוא צמח מרכזי במטבחים ובמרפאות צמחים ברחבי העולם. במאמר נפרט על חלקי הצמח, על הבדלים בין אבקה לריכוזים סטנדרטיים, ועל שאלות נפוצות של מטופלים.\n\n" +
        "נדגיש את חשיבות ההתאמה האישית, את הצורך בהפסקות טיפוליות לפני הליכים רפואיים, ואת הערנות לאינטראקציות תרופתיות אפשריות.\n\n" +
        "המאמר מיועד למטפלים מוסמכים ולציבור מבין כהשראה מקצועית בלבד." +
        articleDisclaimer,
      coverImageUrl: COVER_CURCUMA,
      published: true,
    },
    create: {
      therapistId: therapistUser.id,
      title: "כורכום (Curcuma longa) — שימושים תומכים ונקודות בטיחות קליניות",
      slug: "mallow-soothing",
      excerpt:
        "סקירה מקצועית לכורכום ולקורקומין: שימושים מסורתיים בעיכול ובדלקות, תרומה מדעית נבחרת, והפרדה בין תוסף תזונה לבין ליווי רפואי פעיל.",
      body:
        "הכורכום הוא צמח מרכזי במטבחים ובמרפאות צמחים ברחבי העולם. במאמר נפרט על חלקי הצמח, על הבדלים בין אבקה לריכוזים סטנדרטיים, ועל שאלות נפוצות של מטופלים.\n\n" +
        "נדגיש את חשיבות ההתאמה האישית, את הצורך בהפסקות טיפוליות לפני הליכים רפואיים, ואת הערנות לאינטראקציות תרופתיות אפשריות.\n\n" +
        "המאמר מיועד למטפלים מוסמכים ולציבור מבין כהשראה מקצועית בלבד." +
        articleDisclaimer,
      coverImageUrl: COVER_CURCUMA,
      published: true,
    },
  });

  await prisma.herbalArticle.upsert({
    where: { slug: "chamomile-gentle-demo" },
    update: {
      title: "אשוגנדה (Withania somnifera) — עמידות, שינה והתאמה למטפלים",
      excerpt:
        "מבט מקצועי על אשוגנדה במסורת האיורוודה ובפרקטיקה המודרנית: מתי לשקול שילוב, איך לדבר עם מטופלים על ציפיות, ומה חשוב לתעד בקליניקה.",
      body:
        "אשוגנדה נחשבת לצמח 'מסגל' במסורת ההודית, ואצלנו היא נפוצה בשיחות על עומס, שינה ושחיקה. במאמר נבחן את ההבדל בין תמצית יבשה לטינקטורה, נדבר על רגישות בבחירת מינון, ונסביר מתי להפנות בהחלטות לרופא/ה.\n\n" +
        "נכלול גם דוגמאות לשיחה אתית עם מטופלים ולסיכום מקצועי." +
        articleDisclaimer,
      coverImageUrl: COVER_ASHWAGANDHA,
      published: true,
    },
    create: {
      therapistId: shira.id,
      title: "אשוגנדה (Withania somnifera) — עמידות, שינה והתאמה למטפלים",
      slug: "chamomile-gentle-demo",
      excerpt:
        "מבט מקצועי על אשוגנדה במסורת האיורוודה ובפרקטיקה המודרנית: מתי לשקול שילוב, איך לדבר עם מטופלים על ציפיות, ומה חשוב לתעד בקליניקה.",
      body:
        "אשוגנדה נחשבת לצמח 'מסגל' במסורת ההודית, ואצלנו היא נפוצה בשיחות על עומס, שינה ושחיקה. במאמר נבחן את ההבדל בין תמצית יבשה לטינקטורה, נדבר על רגישות בבחירת מינון, ונסביר מתי להפנות בהחלטות לרופא/ה.\n\n" +
        "נכלול גם דוגמאות לשיחה אתית עם מטופלים ולסיכום מקצועי." +
        articleDisclaimer,
      coverImageUrl: COVER_ASHWAGANDHA,
      published: true,
    },
  });

  await prisma.herbalArticle.upsert({
    where: { slug: "ginger-warm-demo" },
    update: {
      title: "מרווה משולשת (Salvia fruticosa) — ארומטיקה מקומית ושימושים מסורתיים",
      excerpt:
        "מרווה ארץ-ישראלית: שימושים בשתייה, בשמנים ארומטיים ובטיפוח, לצד הערות זהירות בהריון ובמצבי רגישות נוירולוגית.",
      body:
        "המרווה המשולשת מוכרת מהגינה, מהמטבח ומהקליניקה. נסקור את הפרופיל הארומטי, את ההבדלים בין זנים קרובים, ואת דרכי ההכנה הבטוחות.\n\n" +
        "נדגיש את חשיבות האיכות והאחסון, ואת הצורך בהסבר ברור למטופלים על גבולות הידע הקליני." +
        articleDisclaimer,
      coverImageUrl: COVER_SAGE,
      published: true,
    },
    create: {
      therapistId: michael.id,
      title: "מרווה משולשת (Salvia fruticosa) — ארומטיקה מקומית ושימושים מסורתיים",
      slug: "ginger-warm-demo",
      excerpt:
        "מרווה ארץ-ישראלית: שימושים בשתייה, בשמנים ארומטיים ובטיפוח, לצד הערות זהירות בהריון ובמצבי רגישות נוירולוגית.",
      body:
        "המרווה המשולשת מוכרת מהגינה, מהמטבח ומהקליניקה. נסקור את הפרופיל הארומטי, את ההבדלים בין זנים קרובים, ואת דרכי ההכנה הבטוחות.\n\n" +
        "נדגיש את חשיבות האיכות והאחסון, ואת הצורך בהסבר ברור למטופלים על גבולות הידע הקליני." +
        articleDisclaimer,
      coverImageUrl: COVER_SAGE,
      published: true,
    },
  });

  await prisma.herbalArticle.upsert({
    where: { slug: "lemon-balm-calm-demo" },
    update: {
      title: "גינקו בילובה — מבט צמחי מקצועי על שימושים ועל בטיחות",
      excerpt:
        "Ginkgo biloba: רקע בוטני, שימושים מקובלים בתמיכה קוגניטיבית ובזרימה היקפית, וסקירה קצרה של אזהרות מרכזיות בתרופות נפוצות.",
      body:
        "עץ הגינקו הוא מהעתיקים בעולם הצמחים. במאמר נציג את המסגרת המקצועית לשיחה עם מטופלים: מה מוכח חלקית, מה שנוי במחלוקת, ואיך לשמור על גבול בריא בין תמיכה לבין טיפול רפואי.\n\n" +
        "נדגיש תיעוד, מעקב, והפניות כשמתעוררות תלונות חדשות." +
        articleDisclaimer,
      coverImageUrl: COVER_GINKGO,
      published: true,
    },
    create: {
      therapistId: yael.id,
      title: "גינקו בילובה — מבט צמחי מקצועי על שימושים ועל בטיחות",
      slug: "lemon-balm-calm-demo",
      excerpt:
        "Ginkgo biloba: רקע בוטני, שימושים מקובלים בתמיכה קוגניטיבית ובזרימה היקפית, וסקירה קצרה של אזהרות מרכזיות בתרופות נפוצות.",
      body:
        "עץ הגינקו הוא מהעתיקים בעולם הצמחים. במאמר נציג את המסגרת המקצועית לשיחה עם מטופלים: מה מוכח חלקית, מה שנוי במחלוקת, ואיך לשמור על גבול בריא בין תמיכה לבין טיפול רפואי.\n\n" +
        "נדגיש תיעוד, מעקב, והפניות כשמתעוררות תלונות חדשות." +
        articleDisclaimer,
      coverImageUrl: COVER_GINKGO,
      published: true,
    },
  });

  await prisma.herbalArticle.upsert({
    where: { slug: "nettle-nourish-demo" },
    update: {
      title: "רוזמרין רפואי (Rosmarinus officinalis) — ארומה, עיכול ושימוש חיצוני זהיר",
      excerpt:
        "רוזמרין כצמח מרפא: חומרים פעילים, שימושים מסורתיים במערכת עיכול, והנחיות בטיחות לשימוש בשמנים אתריים ובמגע עם העור.",
      body:
        "רוזמרין הוא צמח חזק וריחני. נפרט על הבדלים בין חליטה לשמן אתרי, על ריכוזים ועל רגישות אפשרית בעור. נדון גם בשילובים במטבח הבריא ככלי להעשרת התזונה.\n\n" +
        "המאמר מדגיש עבודה מקצועית: הסבר, תיעוד, והימנעות מהבטחות יתר." +
        articleDisclaimer,
      coverImageUrl: COVER_ROSEMARY,
      published: true,
    },
    create: {
      therapistId: dan.id,
      title: "רוזמרין רפואי (Rosmarinus officinalis) — ארומה, עיכול ושימוש חיצוני זהיר",
      slug: "nettle-nourish-demo",
      excerpt:
        "רוזמרין כצמח מרפא: חומרים פעילים, שימושים מסורתיים במערכת עיכול, והנחיות בטיחות לשימוש בשמנים אתריים ובמגע עם העור.",
      body:
        "רוזמרין הוא צמח חזק וריחני. נפרט על הבדלים בין חליטה לשמן אתרי, על ריכוזים ועל רגישות אפשרית בעור. נדון גם בשילובים במטבח הבריא ככלי להעשרת התזונה.\n\n" +
        "המאמר מדגיש עבודה מקצועית: הסבר, תיעוד, והימנעות מהבטחות יתר." +
        articleDisclaimer,
      coverImageUrl: COVER_ROSEMARY,
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
    "dan.demo@example.com",
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
