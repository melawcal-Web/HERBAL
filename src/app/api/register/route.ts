import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/formula";
import { writeAudit } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["client", "therapist"]),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "נתונים לא תקינים" }, { status: 400 });
  }

  const { name, email, password, role } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "כתובת האימייל כבר בשימוש" }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
    },
  });

  if (role === "therapist") {
    let slug = slugify(name) || `therapist-${user.id.slice(0, 8)}`;
    const taken = await prisma.therapistProfile.findUnique({ where: { slug } });
    if (taken) slug = `${slug}-${user.id.slice(0, 6)}`;
    await prisma.therapistProfile.create({
      data: {
        userId: user.id,
        slug,
        bio: "עדכנו את הביוגרפיה שלכם מלוח הבקרה.",
        specialty1: "מומחיות ראשונה",
        specialty2: "מומחיות שנייה",
        specialty3: "מומחיות שלישית",
        contactInfo: { phone: "", city: "", whatsapp: "", email: "" },
        socialLinks: { website: "", instagram: "", facebook: "" },
      },
    });
  }

  await writeAudit({
    action: "user.register",
    entityType: "User",
    entityId: user.id,
    metadata: { role, email },
  });

  return Response.json({ ok: true });
}
