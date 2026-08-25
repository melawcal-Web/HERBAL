import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/formula";
import { writeAudit } from "@/lib/audit";
import { isStoredImageUrl } from "@/lib/stored-image-url";

const personaSchema = z.enum(["therapist", "student", "interested"]);

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  persona: personaSchema,
  /** אופציונלי בהרשמה — אפשר להעלות אחר כך בפרופיל */
  certificateUrl: z.string().optional(),
  phone: z.string().max(64).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "נתונים לא תקינים" }, { status: 400 });
  }

  const { name, email, password, persona, certificateUrl, phone } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "כתובת האימייל כבר בשימוש" }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);
  const role = persona === "therapist" ? "therapist" : "client";
  const certTrim = persona === "therapist" ? (certificateUrl ?? "").trim() : "";
  const hasCert = Boolean(certTrim && (certTrim.startsWith("https://") || isStoredImageUrl(certTrim)));
  const therapistVerification =
    persona !== "therapist" ? "none" : hasCert ? "pending_approval" : "none";

  const phoneTrim = (phone ?? "").trim().slice(0, 64) || null;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      registrationPersona: persona,
      therapistVerification,
      certificateUrl: hasCert ? certTrim : null,
      phone: phoneTrim,
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
    metadata: { persona, email, role, therapistVerification, hasCert },
  });

  return Response.json({
    ok: true,
    pendingTherapistApproval: persona === "therapist" && hasCert,
    needsCertificate: persona === "therapist" && !hasCert,
  });
}
