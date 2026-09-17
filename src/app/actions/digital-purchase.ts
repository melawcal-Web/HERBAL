"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, type PriceCategory } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertTherapist } from "@/lib/formula";
import { writeAudit } from "@/lib/audit";
import { centerCommissionForAmount, decimalFromNumber } from "@/lib/commerce";
import { productTypeToContentKind } from "@/lib/content-kind";
import { isDigitalProductType } from "@/lib/product-metadata";
import { productAccessHref, publicProductHref } from "@/lib/product-href";
import { sendSiteTransactionalEmail } from "@/lib/site-mail";
import { publicSiteOrigin } from "@/lib/site-origin";
import {
  DIGITAL_UNPAID_STRIKE_LIMIT,
  digitalPurchaseBlockedMessage,
  isBuyerProfileComplete,
} from "@/lib/buyer-profile";
import { purchaseIntentActionPath, verifyPurchaseIntentAction } from "@/lib/purchase-intent-token";
import {
  enabledPaymentMethods,
  normalizeIlMobile,
  parseTherapistPaymentSettings,
  paymentMethodLabel as payLabel,
  type TherapistPaymentMethodId,
} from "@/lib/therapist-payments";

function newAccessToken(): string {
  return randomBytes(24).toString("base64url");
}

async function requireSignedInBuyer() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("יש להתחבר לחשבון כדי לרכוש");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      subStatus: true,
      digitalUnpaidStrikes: true,
    },
  });
  if (!user) throw new Error("החשבון לא נמצא");
  return user;
}

function money(n: number) {
  return `₪${Math.round(n)}`;
}

export async function createDigitalPurchaseIntent(input: {
  productId: string;
  paymentMethod: TherapistPaymentMethodId;
}): Promise<{ therapistEmailSent: boolean; alreadyPaidAccessPath: string | null }> {
  const method = input.paymentMethod;
  if (method !== "bit" && method !== "paybox" && method !== "grow") {
    throw new Error("אמצעי תשלום לא תקין");
  }

  const buyer = await requireSignedInBuyer();
  if (buyer.digitalUnpaidStrikes >= DIGITAL_UNPAID_STRIKE_LIMIT) {
    throw new Error(digitalPurchaseBlockedMessage());
  }
  if (!isBuyerProfileComplete(buyer)) {
    throw new Error("יש להשלים שם, אימייל וטלפון בפרופיל לפני רכישה");
  }
  const phone = normalizeIlMobile(buyer.phone ?? "") ?? "";

  const product = await prisma.product.findFirst({
    where: { id: input.productId, active: true },
    include: {
      therapist: {
        select: {
          id: true,
          name: true,
          email: true,
          therapistProfile: { select: { paymentSettings: true } },
        },
      },
    },
  });
  if (!product?.therapistId || !product.therapist) throw new Error("המוצר לא זמין לרכישה");
  if (product.isWaitlist || !isDigitalProductType(product.type)) {
    throw new Error("מוצר זה אינו נרכש כחומר דיגיטלי");
  }

  const settings = parseTherapistPaymentSettings(product.therapist.therapistProfile?.paymentSettings);
  if (!enabledPaymentMethods(settings).includes(method)) {
    throw new Error("אמצעי התשלום שנבחר אינו זמין למוצר זה");
  }

  const contentKind = productTypeToContentKind(product.type);

  const paid = await prisma.contentAcquisition.findFirst({
    where: {
      userId: buyer.id,
      contentId: product.id,
      eventType: "acquisition",
      purchaseStatus: "paid",
      accessToken: { not: null },
    },
    orderBy: { createdAt: "desc" },
  });
  if (paid?.accessToken) {
    return { therapistEmailSent: false, alreadyPaidAccessPath: productAccessHref(paid.accessToken) };
  }

  let priceCategory: PriceCategory = "regular";
  let amountNis = Number(product.price);
  if (buyer.subStatus === "active") {
    priceCategory = "member";
    amountNis = Number(product.memberPrice);
  }
  if (amountNis <= 0) {
    priceCategory = "free";
    amountNis = 0;
  }

  const existingPending = await prisma.contentAcquisition.findFirst({
    where: {
      userId: buyer.id,
      contentId: product.id,
      eventType: "acquisition",
      purchaseStatus: "pending",
    },
    orderBy: { createdAt: "desc" },
  });

  const intentMeta = {
    paymentMethod: method,
    source: "digital_product_checkout",
  } satisfies Record<string, string>;

  const row = existingPending
    ? await prisma.contentAcquisition.update({
        where: { id: existingPending.id },
        data: {
          guestEmail: buyer.email.toLowerCase(),
          guestName: buyer.name.trim(),
          guestPhone: phone,
          amountNis: decimalFromNumber(amountNis),
          priceCategory,
          metadata: intentMeta as Prisma.InputJsonValue,
        },
      })
    : await prisma.contentAcquisition.create({
        data: {
          therapistId: product.therapistId,
          userId: buyer.id,
          guestEmail: buyer.email.toLowerCase(),
          guestName: buyer.name.trim(),
          guestPhone: phone,
          contentKind,
          contentId: product.id,
          contentTitle: product.title,
          eventType: "acquisition",
          priceCategory,
          amountNis: decimalFromNumber(amountNis),
          centerCommissionNis: decimalFromNumber(0),
          purchaseStatus: "pending",
          metadata: intentMeta as Prisma.InputJsonValue,
        },
      });

  await writeAudit({
    actorId: buyer.id,
    action: "digital_purchase.intent",
    entityType: "ContentAcquisition",
    entityId: row.id,
    metadata: { productId: product.id, paymentMethod: method },
  });

  const origin = publicSiteOrigin();
  const dashboardUrl = `${origin}/dashboard/approvals`;
  let unpaidUrl = dashboardUrl;
  let paidUrl = dashboardUrl;
  try {
    unpaidUrl = `${origin}${purchaseIntentActionPath(row.id, "unpaid")}`;
    paidUrl = `${origin}${purchaseIntentActionPath(row.id, "paid")}`;
  } catch {
    // AUTH_SECRET missing — therapist can still act from the dashboard.
  }
  const productUrl = `${origin}${publicProductHref(product.id)}`;
  const when = new Date().toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" });

  const mail = await sendSiteTransactionalEmail({
    to: product.therapist.email,
    subject: `כוונת רכישה — ${product.title}`,
    text: [
      `שלום ${product.therapist.name},`,
      "",
      "נרשמה כוונת רכישה לחומר דיגיטלי באתר.",
      "",
      `מוצר: ${product.title}`,
      `קישור למוצר: ${productUrl}`,
      `אמצעי תשלום: ${payLabel(method)}`,
      `סכום: ${money(amountNis)}`,
      `זמן: ${when}`,
      "",
      "פרטי הרוכש/ת (מהפרופיל):",
      `שם: ${buyer.name.trim()}`,
      `אימייל: ${buyer.email}`,
      `טלפון: ${phone}`,
      "",
      "אם התשלום לא התקבל, לחצו (ואשרו בדף):",
      unpaidUrl,
      "",
      "לאשר תשלום ולשלוח גישה לרוכש/ת (ואשרו בדף):",
      paidUrl,
      "",
      "אפשר גם לפעול מלוח הבקרה: אישורים וצפיות.",
    ].join("\n"),
  });

  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/finance");
  revalidatePath(`/products/${product.id}`);

  return { therapistEmailSent: mail.ok, alreadyPaidAccessPath: null };
}

async function loadPendingIntent(acquisitionId: string) {
  return prisma.contentAcquisition.findFirst({
    where: { id: acquisitionId, eventType: "acquisition", purchaseStatus: "pending" },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, digitalUnpaidStrikes: true } },
      therapist: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function confirmDigitalPurchasePaid(acquisitionId: string): Promise<{ accessPath: string; emailSent: boolean }> {
  const req = await loadPendingIntent(acquisitionId);
  if (!req) throw new Error("הכוונה לא נמצאה או כבר טופלה");

  const amount = Number(req.amountNis);
  const commission = centerCommissionForAmount(amount, req.priceCategory);
  const token = newAccessToken();

  await prisma.contentAcquisition.update({
    where: { id: req.id },
    data: {
      purchaseStatus: "paid",
      accessToken: token,
      centerCommissionNis: decimalFromNumber(commission),
    },
  });

  await writeAudit({
    actorId: req.therapistId,
    action: "digital_purchase.paid",
    entityType: "ContentAcquisition",
    entityId: req.id,
  });

  const accessPath = productAccessHref(token);
  const accessUrl = `${publicSiteOrigin()}${accessPath}`;
  const buyerEmail = req.user?.email ?? req.guestEmail;
  const buyerName = req.user?.name ?? req.guestName ?? "אורח/ת";
  let emailSent = false;
  if (buyerEmail) {
    const mail = await sendSiteTransactionalEmail({
      to: buyerEmail,
      subject: `קישור גישה — ${req.contentTitle}`,
      text: [
        `שלום ${buyerName},`,
        "",
        `התשלום אושר. הגישה לתוכן: ${req.contentTitle}`,
        "",
        accessUrl,
        "",
        "שמרו את הקישור.",
      ].join("\n"),
    });
    emailSent = mail.ok;
  }

  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/reports");
  revalidatePath(accessPath);
  revalidatePath(`/products/${req.contentId}`);

  return { accessPath, emailSent };
}

export async function markDigitalPurchaseUnpaid(acquisitionId: string): Promise<{ buyerEmailSent: boolean; strikes: number }> {
  const req = await loadPendingIntent(acquisitionId);
  if (!req) throw new Error("הכוונה לא נמצאה או כבר טופלה");

  const buyerId = req.userId;
  const nextStrikes = buyerId
    ? await prisma.$transaction(async (tx) => {
        await tx.contentAcquisition.update({
          where: { id: req.id },
          data: { purchaseStatus: "unpaid" },
        });
        if (!buyerId) return 0;
        const updated = await tx.user.update({
          where: { id: buyerId },
          data: { digitalUnpaidStrikes: { increment: 1 } },
          select: { digitalUnpaidStrikes: true },
        });
        return updated.digitalUnpaidStrikes;
      })
    : 0;

  if (!buyerId) {
    await prisma.contentAcquisition.update({
      where: { id: req.id },
      data: { purchaseStatus: "unpaid" },
    });
  }

  await writeAudit({
    actorId: req.therapistId,
    action: "digital_purchase.unpaid",
    entityType: "ContentAcquisition",
    entityId: req.id,
    metadata: { buyerUserId: buyerId, strikes: nextStrikes },
  });

  const buyerEmail = req.user?.email ?? req.guestEmail;
  const buyerName = req.user?.name ?? req.guestName ?? "אורח/ת";
  let buyerEmailSent = false;
  if (buyerEmail) {
    const blockedNote =
      nextStrikes >= DIGITAL_UNPAID_STRIKE_LIMIT
        ? `\n\nנא לדעת: לאחר ${DIGITAL_UNPAID_STRIKE_LIMIT} הודעות כאלה, רכישות דיגיטליות בחשבון זה נחסמות.`
        : "";
    const mail = await sendSiteTransactionalEmail({
      to: buyerEmail,
      subject: `התשלום לא התקבל — ${req.contentTitle}`,
      text: [
        `שלום ${buyerName},`,
        "",
        "התשלום לא התקבל",
        "",
        `המטפל/ת סימן/ה שתשלום עבור «${req.contentTitle}» לא התקבל.`,
        "לא נפתחה גישה לתוכן. אם שילמתם — פנו למטפל/ת עם אסמכתא.",
        blockedNote,
      ].join("\n"),
    });
    buyerEmailSent = mail.ok;
  }

  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/finance");
  revalidatePath(`/products/${req.contentId}`);

  return { buyerEmailSent, strikes: nextStrikes };
}

export async function confirmDigitalPurchasePaidForTherapist(acquisitionId: string) {
  const therapistId = await requireTherapistSession();
  const row = await prisma.contentAcquisition.findFirst({
    where: { id: acquisitionId, therapistId, purchaseStatus: "pending" },
    select: { id: true },
  });
  if (!row) throw new Error("הכוונה לא נמצאה");
  return confirmDigitalPurchasePaid(row.id);
}

export async function markDigitalPurchaseUnpaidForTherapist(acquisitionId: string) {
  const therapistId = await requireTherapistSession();
  const row = await prisma.contentAcquisition.findFirst({
    where: { id: acquisitionId, therapistId, purchaseStatus: "pending" },
    select: { id: true },
  });
  if (!row) throw new Error("הכוונה לא נמצאה");
  return markDigitalPurchaseUnpaid(row.id);
}

export async function executeSignedPurchaseIntentAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");
  const sig = String(formData.get("sig") ?? "");

  if ((action !== "unpaid" && action !== "paid") || !verifyPurchaseIntentAction(id, action, sig)) {
    redirect("/purchase-intents/done?ok=0&kind=unpaid&error=" + encodeURIComponent("קישור לא תקין או פג תוקף"));
  }

  let donePath: string;
  try {
    if (action === "unpaid") {
      const res = await markDigitalPurchaseUnpaid(id);
      const q = new URLSearchParams({
        ok: "1",
        kind: "unpaid",
        strikes: String(res.strikes),
        mail: res.buyerEmailSent ? "1" : "0",
      });
      donePath = `/purchase-intents/done?${q.toString()}`;
    } else {
      const res = await confirmDigitalPurchasePaid(id);
      const q = new URLSearchParams({
        ok: "1",
        kind: "paid",
        mail: res.emailSent ? "1" : "0",
        access: res.accessPath,
      });
      donePath = `/purchase-intents/done?${q.toString()}`;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "שגיאה";
    redirect(`/purchase-intents/done?ok=0&kind=${action}&error=${encodeURIComponent(msg)}`);
  }
  redirect(donePath);
}

async function requireTherapistSession(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id || !assertTherapist(session.user.role)) {
    throw new Error("אין הרשאה");
  }
  return session.user.id;
}

export type PendingDigitalIntentRow = {
  id: string;
  contentTitle: string;
  amountNis: number;
  createdAt: string;
  paymentMethod: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string | null;
};

export async function getTherapistPendingDigitalIntents(): Promise<PendingDigitalIntentRow[]> {
  const therapistId = await requireTherapistSession();
  const rows = await prisma.contentAcquisition.findMany({
    where: { therapistId, eventType: "acquisition", purchaseStatus: "pending" },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, email: true, phone: true } } },
  });
  return rows.map((r) => {
    const meta = r.metadata && typeof r.metadata === "object" && !Array.isArray(r.metadata)
      ? (r.metadata as Record<string, unknown>)
      : {};
    const method = typeof meta.paymentMethod === "string" ? meta.paymentMethod : "";
    return {
      id: r.id,
      contentTitle: r.contentTitle,
      amountNis: Number(r.amountNis),
      createdAt: r.createdAt.toISOString(),
      paymentMethod: method,
      buyerName: r.user?.name ?? r.guestName ?? "רוכש/ת",
      buyerEmail: r.user?.email ?? r.guestEmail ?? "",
      buyerPhone: r.user?.phone ?? r.guestPhone,
    };
  });
}
