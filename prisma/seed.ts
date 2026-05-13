import { PrismaClient, ProductType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

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
    update: { role: "therapist", passwordHash: thHash, name: "מטפל/ת לדוגמה" },
    create: {
      email: demoTherapistEmail,
      name: "מטפל/ת לדוגמה",
      passwordHash: thHash,
      role: "therapist",
      subStatus: "active",
    },
  });

  await prisma.therapistProfile.upsert({
    where: { userId: therapistUser.id },
    update: {},
    create: {
      userId: therapistUser.id,
      slug: "demo-therapist",
      bio: "מטפל/ת לדוגמה במרכז — עדכנו טקסט זה לאחר ההתקנה.",
      specialty1: "תמציות",
      specialty2: "תזונה",
      specialty3: "ילדים",
      contactInfo: { phone: "+972-00-0000000", city: "תל אביב" },
      socialLinks: { website: "https://example.com" },
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
  console.log("Seed complete. Admin:", adminEmail, "Therapist:", demoTherapistEmail, "Client:", demoClientEmail);
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
