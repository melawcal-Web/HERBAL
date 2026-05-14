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

/** Marketplace / workshop visuals */
const IMG_ZOOM = `https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?${U}`;
const IMG_WORKSHOP = `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?${U}`;
const IMG_SUPERVISION = `https://images.unsplash.com/photo-1522071820081-009f0129c71c?${U}`;
const IMG_SHELF = `https://images.unsplash.com/photo-1470058869958-2a77ade41c02?${U}`;
const IMG_ZOOM2 = `https://images.unsplash.com/photo-1515378791036-0648a3c77a02?${U}`;

/** Herbal article covers */
const COVER_MALLOW = `https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?${U}`;
const COVER_CHAMOMILE = `https://images.unsplash.com/photo-1501004318641-b39e6451bec6?${U}`;
const COVER_GINGER = `https://images.unsplash.com/photo-1615485290382-441e4d049cb5?${U}`;
const COVER_MELISSA = `https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?${U}`;
const COVER_NETTLE = `https://images.unsplash.com/photo-1416879595882-3373a0480b5b?${U}`;

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
  await ensureProduct({
    type: ProductType.zoom,
    title: "זום חי — צמחי מרפא לשינה עמוקה",
    description:
      "מפגש מקוון של 75 דקות: עקרונות בטיחות, צמחים מרגיעים נפוצים, ושאלות מהקהל. מתאים למטפלים ולציבור הרחב המעוניין בהעשרה מקצועית.",
    price: 129,
    memberPrice: 99,
    imageUrl: IMG_ZOOM,
  });
  await ensureProduct({
    type: ProductType.workshop,
    title: "סדנה פרקטית — טינקטורות ותמציות ביתיות",
    description:
      "יום עיון חווייתי: עקרונות מסחיטה, אלכוהול ושמנים נשאים, תיוג ואחסון. חומרי גלם לדוגמה וחוברת דיגיטלית.",
    price: 480,
    memberPrice: 410,
    imageUrl: IMG_WORKSHOP,
  });
  await ensureProduct({
    type: ProductType.supervision,
    title: "השגחה מקצועית חודשית — מעגל מטפלים",
    description:
      "מפגש קבוצתי חודשי לתיעוד מקרים, אתיקה ופרוטוקולים. מוגבל ל־12 משתתפים רשומים במרכז.",
    price: 220,
    memberPrice: 185,
    imageUrl: IMG_SUPERVISION,
  });
  await ensureProduct({
    type: ProductType.shelf_product,
    title: "ערכת \"מרפאה בבית\" — תערובות יבשות לאינפוזיות",
    description:
      "אריזת הדגמה: חבילות צמחים יבשים מאורגנות לפי נושאים (עיכול / רוגע / חורף), הוראות שימוש וקישור לסרטון הדרכה.",
    price: 195,
    memberPrice: 165,
    imageUrl: IMG_SHELF,
  });
  await ensureProduct({
    type: ProductType.zoom,
    title: "מיני-זום — נשימה, עצבים וצמחי מרפא יומיומיים",
    description:
      "45 דקות ממוקדות: טכניקות נשימה קצרות + צמחים מוכרים לשגרה. מפגש מודרך עם מצגת ומקורות מידע מהימנים.",
    price: 89,
    memberPrice: 69,
    imageUrl: IMG_ZOOM2,
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
        "דוקטורט בבריאות הציבור, התמחות בצמחי מרפא קליניים (מכללה אירופאית מוכרת). מעל 12 שנות ניסיון במרפאות פרטיות ובית חולים ציבורי — ליווי לפני ואחרי ניתוחים, תמיכה אונקולוגית משלימה, והדרכת צוותים רפואיים.\n" +
        "מנחה סדנאות למטפלים בנושאי בטיחות, אינטראקציות תרופתיות, ותקשורת עם רופאים משפחה.",
      specialty1: "תמציות וטינקטורות קליניות",
      specialty2: "תמיכה במערכת עיכול ומיקרוביום",
      specialty3: "נשים, ילדים וגיל ההתבגרות",
      contactInfo: {
        phone: "+972-52-0000000",
        city: "תל אביב והמרכז",
        whatsapp: "972520000000",
        email: "ronit.contact@example.com",
      },
      socialLinks: {
        website: "https://example.com",
        instagram: "",
        facebook: "https://www.facebook.com/facebook",
      },
    },
    create: {
      userId: therapistUser.id,
      slug: "ronit-alon",
      bio: "אני מאמינה בליווי רגיש ובמדויק: כל מטופל מגיע עם סיפור גוף–נפש משלו. בקליניקה משלבת צמחי מרפא מודרניים עם תזונה רכה והדרכה פרקטית לשינה, עיכול ואנרגיה. העבודה מתחילה מהקשבה, ממשיכה בהסברים ברורים, ונשענת על תיעוד מסודר כדי שתדעו בדיוק מה קורה בכל שלב.",
      clinicalExperience:
        "דוקטורט בבריאות הציבור, התמחות בצמחי מרפא קליניים (מכללה אירופאית מוכרת). מעל 12 שנות ניסיון במרפאות פרטיות ובית חולים ציבורי — ליווי לפני ואחרי ניתוחים, תמיכה אונקולוגית משלימה, והדרכת צוותים רפואיים.\n" +
        "מנחה סדנאות למטפלים בנושאי בטיחות, אינטראקציות תרופתיות, ותקשורת עם רופאים משפחה.",
      specialty1: "תמציות וטינקטורות קליניות",
      specialty2: "תמיכה במערכת עיכול ומיקרוביום",
      specialty3: "נשים, ילדים וגיל ההתבגרות",
      contactInfo: {
        phone: "+972-52-0000000",
        city: "תל אביב והמרכז",
        whatsapp: "972520000000",
        email: "ronit.contact@example.com",
      },
      socialLinks: {
        website: "https://example.com",
        instagram: "",
        facebook: "https://www.facebook.com/facebook",
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
        "תעודת מטפלת בצמחי מרפא (4 שנות לימודים), קורסים מתקדמים בדרמטולוגיה צמחית ובטיחות שימוש חיצוני.\n" +
        "8 שנות ליווי פרטי וקבוצתי; הרצאות אורח במרכזי יוגה ובתי ספר להורים.",
      specialty1: "עור רגיש ודלקות קלות",
      specialty2: "סדנאות חווייתיות לצמחים",
      specialty3: "ליווי אחד־על־אחד",
      contactInfo: { phone: "+972-54-0000000", city: "חיפה והצפון", whatsapp: "", email: "" },
      socialLinks: { instagram: "@shira_herbs_demo", website: "https://example.org/shira", facebook: "" },
    },
    create: {
      userId: shira.id,
      slug: "shira-levi-herbs",
      bio: "הגעתי לצמחי מרפא דרך עולם העיצוב והרוח — ומצאתי כאן שפה מדויקת לגוף. אני אוהבת לעבוד לאט: תהליכי עור, רגישות עצבית, ושגרה שמכבדת גם את המטבח וגם את הקליניקה. בקבוצות קטנות אנחנו נוגעים, מריחים, מתעדים — ויוצאים עם כלים לבית.",
      clinicalExperience:
        "תעודת מטפלת בצמחי מרפא (4 שנות לימודים), קורסים מתקדמים בדרמטולוגיה צמחית ובטיחות שימוש חיצוני.\n" +
        "8 שנות ליווי פרטי וקבוצתי; הרצאות אורח במרכזי יוגה ובתי ספר להורים.",
      specialty1: "עור רגיש ודלקות קלות",
      specialty2: "סדנאות חווייתיות לצמחים",
      specialty3: "ליווי אחד־על־אחד",
      contactInfo: { phone: "+972-54-0000000", city: "חיפה והצפון", whatsapp: "", email: "" },
      socialLinks: { instagram: "@shira_herbs_demo", website: "https://example.org/shira", facebook: "" },
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
        "ניסיון בקופות חולים קהילתיות ובמרפאה פרטית; חבר בצוותי טיפול משלים בבית חולים.",
      specialty1: "שינה ומערכת עצבים",
      specialty2: "נשימה וחיסון",
      specialty3: "תזונה צמחית מעשית",
      contactInfo: {
        phone: "+972-50-0000000",
        city: "ירושלים והסביבה",
        whatsapp: "",
        email: "michael.public@example.com",
      },
      socialLinks: { website: "", instagram: "", facebook: "" },
    },
    create: {
      userId: michael.id,
      slug: "michael-barak-clinical",
      bio: "אחרי שנים ברפואה משלימה הבנתי כמה כוח יש בצמח פשוט כשמשתמשים בו נכון. אני מלווה מבוגרים ומתבגרים בתסמינים של שינה, חרדה קלה ומערכת נשימה — תמיד בשיתוף עם הרופא המטפל כשצריך.",
      clinicalExperience:
        "הסמכה בצמחי מרפא קליניים, השלמות בפיזיולוגיה של מערכת הנשימה והחיסון.\n" +
        "ניסיון בקופות חולים קהילתיות ובמרפאה פרטית; חבר בצוותי טיפול משלים בבית חולים.",
      specialty1: "שינה ומערכת עצבים",
      specialty2: "נשימה וחיסון",
      specialty3: "תזונה צמחית מעשית",
      contactInfo: {
        phone: "+972-50-0000000",
        city: "ירושלים והסביבה",
        whatsapp: "",
        email: "michael.public@example.com",
      },
      socialLinks: { website: "", instagram: "", facebook: "" },
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
        "מטפלת מוסמכת; התמחות מעשית בגינקולוגיה צמחית ובהנקה.\n" +
        "שיתופי פעולה עם מיילדות ויועצות הנקה; הרצאות למדריכות הורים.",
      specialty1: "בריאות האישה לאורך חיים",
      specialty2: "הריון, לידה והנקה",
      specialty3: "תמציות ובטיחות צמחית",
      contactInfo: { phone: "+972-52-1111111", city: "רעננה והשרון", whatsapp: "", email: "yael.demo@example.com" },
      socialLinks: { website: "https://example.org/yael", instagram: "", facebook: "" },
    },
    create: {
      userId: yael.id,
      slug: "yael-cohen-herbal",
      bio: "ליווי נשים דורש דיוק, עדינות ולוח זמנים ברור. אני מסבירה מה בטוח ומה דורש התייעצות רפואית, ובוחרת יחד איתכן צמחים שמתאימים לשלב החיים שלכן — מחזור, הריון, הנקה או גיל ביניים.",
      clinicalExperience:
        "מטפלת מוסמכת; התמחות מעשית בגינקולוגיה צמחית ובהנקה.\n" +
        "שיתופי פעולה עם מיילדות ויועצות הנקה; הרצאות למדריכות הורים.",
      specialty1: "בריאות האישה לאורך חיים",
      specialty2: "הריון, לידה והנקה",
      specialty3: "תמציות ובטיחות צמחית",
      contactInfo: { phone: "+972-52-1111111", city: "רעננה והשרון", whatsapp: "", email: "yael.demo@example.com" },
      socialLinks: { website: "https://example.org/yael", instagram: "", facebook: "" },
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
        "ניסיון במעבדות קטנות ובליווי ספורטאים חובבים.",
      specialty1: "פורמולות קליניות מותאמות",
      specialty2: "עיכול, נפחת ומיקרוביום",
      specialty3: "אנרגיה וספורט חובבני",
      contactInfo: { phone: "+972-54-2222222", city: "באר שבע והנגב", whatsapp: "", email: "" },
      socialLinks: { website: "", instagram: "@dan_herbs_demo", facebook: "" },
    },
    create: {
      userId: dan.id,
      slug: "dan-rosen-formulas",
      bio: "אני נהנה לפתור 'חידות' עיכול: מה מחמם מדי, מה מייבש, ואיך משלבים צמחים בלי להעמיס. המטופלים שלי מקבלים הסברים על הלוגיקה מאחורי הנוסחה — כדי שתבינו את הגוף, לא רק את הבקבוק.",
      clinicalExperience:
        "הסמכה בצמחי מרפא; קורסים מתקדמים בפרמקולוגיה וביוכימיה של צמחים.\n" +
        "ניסיון במעבדות קטנות ובליווי ספורטאים חובבים.",
      specialty1: "פורמולות קליניות מותאמות",
      specialty2: "עיכול, נפחת ומיקרוביום",
      specialty3: "אנרגיה וספורט חובבני",
      contactInfo: { phone: "+972-54-2222222", city: "באר שבע והנגב", whatsapp: "", email: "" },
      socialLinks: { website: "", instagram: "@dan_herbs_demo", facebook: "" },
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
      title: "חלמית רפואית — ריכוך ותמיכה במערכת עיכול ועור",
      excerpt:
        "Althaea officinalis: רקע בוטני, שימושים מסורתיים במריחה ובשתייה, והתאמה לילדים ומבוגרים — עם דגש על בטיחות ובחירת מינון.",
      body:
        "חלמית רפואית היא צמח לח בעל ריריות עשירה — תכונה שמקושרת בשימוש המסורתי לשיכוך ולתמיכה ברקמות יבשות או מגורות.\n\n" +
        "במאמר זה נסקור את החלקים המשמשים (שורש עלים), צורות הכנה נפוצות (דקוקציה, משחה חיצונית), ואת חשיבות ההפרדה בין שימוש חיצוני לפנימי.\n\n" +
        "נעגן גם במחקר עדכני ובמגבלות הידע הקליני." +
        articleDisclaimer,
      coverImageUrl: COVER_MALLOW,
      published: true,
    },
    create: {
      therapistId: therapistUser.id,
      title: "חלמית רפואית — ריכוך ותמיכה במערכת עיכול ועור",
      slug: "mallow-soothing",
      excerpt:
        "Althaea officinalis: רקע בוטני, שימושים מסורתיים במריחה ובשתייה, והתאמה לילדים ומבוגרים — עם דגש על בטיחות ובחירת מינון.",
      body:
        "חלמית רפואית היא צמח לח בעל ריריות עשירה — תכונה שמקושרת בשימוש המסורתי לשיכוך ולתמיכה ברקמות יבשות או מגורות.\n\n" +
        "במאמר זה נסקור את החלקים המשמשים (שורש עלים), צורות הכנה נפוצות (דקוקציה, משחה חיצונית), ואת חשיבות ההפרדה בין שימוש חיצוני לפנימי.\n\n" +
        "נעגן גם במחקר עדכני ובמגבלות הידע הקליני." +
        articleDisclaimer,
      coverImageUrl: COVER_MALLOW,
      published: true,
    },
  });

  await prisma.herbalArticle.upsert({
    where: { slug: "chamomile-gentle-demo" },
    update: {
      title: "קמומיל גרמני — עדינות לעיכול ולשעות הערב",
      excerpt:
        "Matricaria recutita: סקירה על שימושים מוכרים, תחושת חום פנימי, ושילוב בצמחי מרפא נוספים בטיפול תומך.",
      body:
        "הקמומיל נחשב לאחד הצמחים המוכרים ביותר במטבח ובקליניקה. נפרט בין קמומיל גרמני לזן אחר, נדבר על אלרגיה לאזובייה, ועל טעימות וריכוזים שונים.\n\n" +
        "יישום מעשי: אינפוזיה, טינקטורה עדינה, ושימוש חיצוני מוגבל." +
        articleDisclaimer,
      coverImageUrl: COVER_CHAMOMILE,
      published: true,
    },
    create: {
      therapistId: therapistUser.id,
      title: "קמומיל גרמני — עדינות לעיכול ולשעות הערב",
      slug: "chamomile-gentle-demo",
      excerpt:
        "Matricaria recutita: סקירה על שימושים מוכרים, תחושת חום פנימי, ושילוב בצמחי מרפא נוספים בטיפול תומך.",
      body:
        "הקמומיל נחשב לאחד הצמחים המוכרים ביותר במטבח ובקליניקה. נפרט בין קמומיל גרמני לזן אחר, נדבר על אלרגיה לאזובייה, ועל טעימות וריכוזים שונים.\n\n" +
        "יישום מעשי: אינפוזיה, טינקטורה עדינה, ושימוש חיצוני מוגבל." +
        articleDisclaimer,
      coverImageUrl: COVER_CHAMOMILE,
      published: true,
    },
  });

  await prisma.herbalArticle.upsert({
    where: { slug: "ginger-warm-demo" },
    update: {
      title: "זנגביל — חום מכוון לתמיכה בעיכול",
      excerpt:
        "Zingiber officinale: מסורת הודית-סינית, שימושים מודרניים, והיזהרות מריכוזים גבוהים במצבי דלקת חריפה.",
      body:
        "הזנגביל משלב חריפות ארומטית עם פעילות תומכת במערכת עיכול. במאמר נבחן מתי מתאים לשלבים חמים של הגוף, ומתי עדיף לצמצם.\n\n" +
        "נדגים הכנות: חליטה, טינקטורה, ושילוב במרקים." +
        articleDisclaimer,
      coverImageUrl: COVER_GINGER,
      published: true,
    },
    create: {
      therapistId: therapistUser.id,
      title: "זנגביל — חום מכוון לתמיכה בעיכול",
      slug: "ginger-warm-demo",
      excerpt:
        "Zingiber officinale: מסורת הודית-סינית, שימושים מודרניים, והיזהרות מריכוזים גבוהים במצבי דלקת חריפה.",
      body:
        "הזנגביל משלב חריפות ארומטית עם פעילות תומכת במערכת עיכול. במאמר נבחן מתי מתאים לשלבים חמים של הגוף, ומתי עדיף לצמצם.\n\n" +
        "נדגים הכנות: חליטה, טינקטורה, ושילוב במרקים." +
        articleDisclaimer,
      coverImageUrl: COVER_GINGER,
      published: true,
    },
  });

  await prisma.herbalArticle.upsert({
    where: { slug: "lemon-balm-calm-demo" },
    update: {
      title: "מליסה רפואית — רוגע קל ומרענן לשגרה",
      excerpt:
        "Melissa officinalis: פרופיל טעם, שילוב עם צמחים מרגיעים נוספים, ושימוש בערב ובשעות המסך.",
      body:
        "מליסה היא צמח מנטה-לייט עם נוכחות סיטרוסית עדינה. נפרט על השפעה על מערכת עצבים מרכזית בתחושה סובייקטיבית, ועל בחירת זמן היום לשתייה.\n\n" +
        "נדגיש את ההבדל בין חליטה קצרה לארוכה." +
        articleDisclaimer,
      coverImageUrl: COVER_MELISSA,
      published: true,
    },
    create: {
      therapistId: therapistUser.id,
      title: "מליסה רפואית — רוגע קל ומרענן לשגרה",
      slug: "lemon-balm-calm-demo",
      excerpt:
        "Melissa officinalis: פרופיל טעם, שילוב עם צמחים מרגיעים נוספים, ושימוש בערב ובשעות המסך.",
      body:
        "מליסה היא צמח מנטה-לייט עם נוכחות סיטרוסית עדינה. נפרט על השפעה על מערכת עצבים מרכזית בתחושה סובייקטיבית, ועל בחירת זמן היום לשתייה.\n\n" +
        "נדגיש את ההבדל בין חליטה קצרה לארוכה." +
        articleDisclaimer,
      coverImageUrl: COVER_MELISSA,
      published: true,
    },
  });

  await prisma.herbalArticle.upsert({
    where: { slug: "nettle-nourish-demo" },
    update: {
      title: "סרפד — תזונה צמחית, מינרלים ושימושים מסורתיים",
      excerpt:
        "Urtica dioica: עלים מול שורש, איסוף עונתי, ותמיכה בתחושת חיוניות — עם הערות בטיחות לגירוד העור.",
      body:
        "הסרפד עשיר בחומרים יוצרי-ריריות ומינרלים. נבדיל בין שימוש כמזון ירוק מבושל לבין תמציות ריכוזיות, ונדון בצורך בהתאמה אישית.\n\n" +
        "נסיים בתזכורת על רגישות בעור בעת מגע עם הצמח הטרי." +
        articleDisclaimer,
      coverImageUrl: COVER_NETTLE,
      published: true,
    },
    create: {
      therapistId: therapistUser.id,
      title: "סרפד — תזונה צמחית, מינרלים ושימושים מסורתיים",
      slug: "nettle-nourish-demo",
      excerpt:
        "Urtica dioica: עלים מול שורש, איסוף עונתי, ותמיכה בתחושת חיוניות — עם הערות בטיחות לגירוד העור.",
      body:
        "הסרפד עשיר בחומרים יוצרי-ריריות ומינרלים. נבדיל בין שימוש כמזון ירוק מבושל לבין תמציות ריכוזיות, ונדון בצורך בהתאמה אישית.\n\n" +
        "נסיים בתזכורת על רגישות בעור בעת מגע עם הצמח הטרי." +
        articleDisclaimer,
      coverImageUrl: COVER_NETTLE,
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
