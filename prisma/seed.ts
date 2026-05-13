import { PrismaClient, ProductType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const IMG_DEMO =
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80";
const IMG_SHIRA =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a?auto=format&fit=crop&w=800&q=80";
const IMG_MICHAEL =
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80";

async function main() {
  if ((await prisma.product.count()) === 0) {
    await prisma.product.createMany({
      data: [
        {
          type: ProductType.zoom,
          title: "מפגש זום — תזונה צמחית",
          description: "שעה של שאלות ותשובות עם מטפל/ת בכיר/ה.",
          price: 120,
          memberPrice: 90,
        },
        {
          type: ProductType.workshop,
          title: "סדנת הכנת תמציות",
          description: "יום עיון פרקטי במעבדה.",
          price: 450,
          memberPrice: 380,
        },
        {
          type: ProductType.supervision,
          title: "השגחה מקצועית חודשית",
          description: "מפגש קבוצתי למטפלים רשומים.",
          price: 200,
          memberPrice: 160,
        },
        {
          type: ProductType.shelf_product,
          title: "ערכת צמחי מרפא לבית",
          description: "מוצר פיזי לדוגמה.",
          price: 180,
          memberPrice: 150,
        },
      ],
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
      image: IMG_DEMO,
    },
    create: {
      email: demoTherapistEmail,
      name: "ד״ר רונית אלון",
      passwordHash: thHash,
      role: "therapist",
      subStatus: "active",
      image: IMG_DEMO,
    },
  });

  await prisma.therapistProfile.upsert({
    where: { userId: therapistUser.id },
    update: {
      slug: "ronit-alon",
      bio: "מטפלת בצמחי מרפא קלינית מעל עשור — ליווי תזונתי, תמציות מותאמות אישית, והדרכת משפחות. מרפאה חמה ומקצועית במרכז הארץ.",
      specialty1: "תמציות וטינקטורות",
      specialty2: "תמיכה במערכת עיכול",
      specialty3: "נשים וילדים",
    },
    create: {
      userId: therapistUser.id,
      slug: "ronit-alon",
      bio: "מטפלת בצמחי מרפא קלינית מעל עשור — ליווי תזונתי, תמציות מותאמות אישית, והדרכת משפחות. מרפאה חמה ומקצועית במרכז הארץ.",
      specialty1: "תמציות וטינקטורות",
      specialty2: "תמיכה במערכת עיכול",
      specialty3: "נשים וילדים",
      contactInfo: { phone: "+972-52-0000000", city: "תל אביב" },
      socialLinks: { website: "https://example.com" },
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
      bio: "מטפלת מוסמכת המתמחה בצמחי מרפא לעור ולרגיעה — שילוב של מסורת ומחקר עדכני. סדנאות קטנות וליווי אחד־על־אחד.",
      specialty1: "עור ורגיעה",
      specialty2: "סדנאות צמחים",
      specialty3: "ליווי אישי",
    },
    create: {
      userId: shira.id,
      slug: "shira-levi-herbs",
      bio: "מטפלת מוסמכת המתמחה בצמחי מרפא לעור ולרגיעה — שילוב של מסורת ומחקר עדכני. סדנאות קטנות וליווי אחד־על־אחד.",
      specialty1: "עור ורגיעה",
      specialty2: "סדנאות צמחים",
      specialty3: "ליווי אישי",
      contactInfo: { phone: "+972-54-0000000", city: "חיפה" },
      socialLinks: { instagram: "@shira_herbs_demo" },
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
      bio: "מטפל קליני בצמחי מרפא — דגש על תמיכה במערכת נשימה, שינה, ואנרגיה יומיומית. חויב בהשגחה מקצועית וממשיך ללמוד מדי שנה.",
      specialty1: "שינה ורוגע",
      specialty2: "נשימה וחיסון",
      specialty3: "תזונה צמחית",
    },
    create: {
      userId: michael.id,
      slug: "michael-barak-clinical",
      bio: "מטפל קליני בצמחי מרפא — דגש על תמיכה במערכת נשימה, שינה, ואנרגיה יומיומית. חויב בהשגחה מקצועית וממשיך ללמוד מדי שנה.",
      specialty1: "שינה ורוגע",
      specialty2: "נשימה וחיסון",
      specialty3: "תזונה צמחית",
      contactInfo: { phone: "+972-50-0000000", city: "ירושלים" },
      socialLinks: {},
    },
  });

  const profile = await prisma.therapistProfile.findUniqueOrThrow({
    where: { userId: therapistUser.id },
  });

  await prisma.herbalArticle.upsert({
    where: { slug: "mallow-soothing" },
    update: {},
    create: {
      therapistId: therapistUser.id,
      title: "חלמית — צמח מרגיע לעור",
      slug: "mallow-soothing",
      excerpt: "סקירה קצרה על שימושים בטוחים ומינון כללי.",
      body:
        "חלמית (Althaea officinalis) נמצאת בשימוש מסורתי לתמיכה במערכת עיכול רגועה ולשיכוך עור חיצוני.\n\n" +
        "טקסט לדוגמה בלבד — אין זה ייעוץ רפואי.",
      published: true,
    },
  });

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
