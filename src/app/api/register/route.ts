import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/formula";
import { writeAudit } from "@/lib/audit";

const personaSchema = z.enum(["therapist", "student", "interested"]);

const schema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    persona: personaSchema,
    certificateUrl: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.persona !== "therapist") return;
    const u = (data.certificateUrl ?? "").trim();
    if (!u.startsWith("https://")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "certificate_https",
        path: ["certificateUrl"],
      });
    }
  });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const certErr = parsed.error.flatten().fieldErrors.certificateUrl;
    if (certErr?.length) {
      return Response.json({ error: "למסלול מטפל/ת נדרש קישור https לקובץ התעודה (העלאה לענן והדבקת כתובת)" }, { status: 400 });
    }
    return Response.json({ error: "נתונים לא תקינים" }, { status: 400 });
  }

  const { name, email, password, persona, certificateUrl } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "כתובת האימייל כבר בשימוש" }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);
  const role = persona === "therapist" ? "therapist" : "client";
  const therapistVerification = persona === "therapist" ? "pending_approval" : "none";
  const certTrim = persona === "therapist" ? (certificateUrl ?? "").trim() : null;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      registrationPersona: persona,
      therapistVerification,
      certificateUrl: certTrim,
    },
  });

  if (persona === "therapist") {
    let slug = slugify(name) || `therapist-${user.id.slice(0, 8)}`;
    const taken = await prisma.therapistProfile.findUnique({ where: { slug } });
    if (taken) slug = `${slug}-${user.id.slice(0, 6)}`;
    await prisma.therapistProfile.create({
      data: {
        userId: user.id,
        slug,
        publicTherapistTitle: "female",
        bio: "עדכנו את הביוגרפיה שלכם מלוח הבקרה.",
        specialty1: "מומחיות ראשונה",
        specialty2: "מומחיות שנייה",
        specialty3: "מומחיות שלישית",
        contactInfo: { phone: "", city: "", whatsapp: "", email: "" },
        socialLinks: { website: "", instagram: "", facebook: "", tiktok: "" },
      },
    });
  }

  await writeAudit({
    action: "user.register",
    entityType: "User",
    entityId: user.id,
    metadata: { persona, email, role, therapistVerification },
  });

  return Response.json({ ok: true, pendingTherapistApproval: persona === "therapist" });
}
