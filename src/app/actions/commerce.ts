"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AcquisitionEventType, ContentKind, PriceCategory } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertTherapist } from "@/lib/formula";
import { centerCommissionForAmount, decimalFromNumber } from "@/lib/commerce";

const logSchema = z.object({
  therapistId: z.string().min(1),
  contentKind: z.enum([
    "video",
    "podcast",
    "article",
    "recipe",
    "lecture",
    "course",
    "zoom",
    "supervision",
    "shelf_product",
  ]),
  contentId: z.string().min(1),
  contentTitle: z.string().min(1).max(300),
  eventType: z.enum(["acquisition", "view"]),
  priceCategory: z.enum(["free", "member", "regular"]),
  amountNis: z.number().min(0).optional(),
  guestEmail: z.string().email().optional(),
  guestName: z.string().max(120).optional(),
});

export async function logContentEvent(input: z.infer<typeof logSchema>): Promise<void> {
  const p = logSchema.safeParse(input);
  if (!p.success) throw new Error("נתונים לא תקינים");

  const session = await auth();
  const amount = p.data.amountNis ?? 0;
  const commission = centerCommissionForAmount(amount, p.data.priceCategory as PriceCategory);

  await prisma.contentAcquisition.create({
    data: {
      therapistId: p.data.therapistId,
      userId: session?.user?.id ?? null,
      guestEmail: p.data.guestEmail?.toLowerCase() ?? session?.user?.email ?? null,
      guestName: p.data.guestName ?? session?.user?.name ?? null,
      contentKind: p.data.contentKind as ContentKind,
      contentId: p.data.contentId,
      contentTitle: p.data.contentTitle,
      eventType: p.data.eventType as AcquisitionEventType,
      priceCategory: p.data.priceCategory as PriceCategory,
      amountNis: decimalFromNumber(amount),
      centerCommissionNis: decimalFromNumber(commission),
    },
  });
}

export async function requestManualAccess(input: {
  therapistId: string;
  contentKind: ContentKind;
  contentId: string;
  contentTitle: string;
  priceCategory: PriceCategory;
  amountNis: number;
  paymentNote?: string;
  guestEmail: string;
  guestName?: string;
}): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("יש להתחבר עם Google");

  await prisma.manualAccessRequest.create({
    data: {
      therapistId: input.therapistId,
      userId: session.user.id,
      guestEmail: input.guestEmail.toLowerCase(),
      guestName: input.guestName ?? session.user.name ?? null,
      contentKind: input.contentKind,
      contentId: input.contentId,
      contentTitle: input.contentTitle,
      priceCategory: input.priceCategory,
      amountNis: decimalFromNumber(input.amountNis),
      paymentNote: input.paymentNote?.trim() || null,
      status: "pending",
    },
  });

  revalidatePath("/dashboard/approvals");
}

async function requireTherapistId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id || !assertTherapist(session.user.role)) {
    throw new Error("אין הרשאה");
  }
  return session.user.id;
}

export async function approveManualAccess(requestId: string): Promise<void> {
  const therapistId = await requireTherapistId();

  const req = await prisma.manualAccessRequest.findFirst({
    where: { id: requestId, therapistId, status: "pending" },
  });
  if (!req) throw new Error("בקשה לא נמצאה");

  const amount = Number(req.amountNis);
  const commission = centerCommissionForAmount(amount, req.priceCategory);

  await prisma.$transaction(async (tx) => {
    await tx.manualAccessRequest.update({
      where: { id: req.id },
      data: { status: "approved", approvedAt: new Date() },
    });

    await tx.contentAcquisition.create({
      data: {
        therapistId: req.therapistId,
        userId: req.userId,
        guestEmail: req.guestEmail,
        guestName: req.guestName,
        contentKind: req.contentKind,
        contentId: req.contentId,
        contentTitle: req.contentTitle,
        eventType: "acquisition",
        priceCategory: req.priceCategory,
        amountNis: req.amountNis,
        centerCommissionNis: decimalFromNumber(commission),
        manualRequestId: req.id,
      },
    });
  });

  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/reports");
}

export async function rejectManualAccess(requestId: string): Promise<void> {
  const therapistId = await requireTherapistId();
  await prisma.manualAccessRequest.updateMany({
    where: { id: requestId, therapistId, status: "pending" },
    data: { status: "rejected" },
  });
  revalidatePath("/dashboard/approvals");
}

export type ViewReportRow = {
  id: string;
  userName: string;
  contentName: string;
  contentKind: ContentKind;
  accessedAt: string;
  priceCategory: PriceCategory;
  eventType: AcquisitionEventType;
};

export async function getTherapistViewReport(): Promise<ViewReportRow[]> {
  const therapistId = await requireTherapistId();
  const rows = await prisma.contentAcquisition.findMany({
    where: { therapistId },
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { user: { select: { name: true, email: true } } },
  });

  return rows.map((r) => ({
    id: r.id,
    userName: r.user?.name ?? r.guestName ?? r.guestEmail ?? "אורח/ת",
    contentName: r.contentTitle,
    contentKind: r.contentKind,
    accessedAt: r.createdAt.toISOString(),
    priceCategory: r.priceCategory,
    eventType: r.eventType,
  }));
}

export type FinanceLedgerRow = {
  id: string;
  userName: string;
  contentTitle: string;
  priceCategory: PriceCategory;
  amountNis: number;
  commissionNis: number;
  createdAt: string;
};

export async function getTherapistFinanceLedger(): Promise<{
  rows: FinanceLedgerRow[];
  totalCommissionOwed: number;
}> {
  const therapistId = await requireTherapistId();
  const rows = await prisma.contentAcquisition.findMany({
    where: { therapistId, eventType: "acquisition" },
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { user: { select: { name: true, email: true } } },
  });

  const mapped: FinanceLedgerRow[] = rows.map((r) => ({
    id: r.id,
    userName: r.user?.name ?? r.guestName ?? r.guestEmail ?? "אורח/ת",
    contentTitle: r.contentTitle,
    priceCategory: r.priceCategory,
    amountNis: Number(r.amountNis),
    commissionNis: Number(r.centerCommissionNis),
    createdAt: r.createdAt.toISOString(),
  }));

  const totalCommissionOwed = mapped.reduce((sum, r) => sum + r.commissionNis, 0);

  return { rows: mapped, totalCommissionOwed };
}

export async function getTherapistPendingApprovals() {
  const therapistId = await requireTherapistId();
  return prisma.manualAccessRequest.findMany({
    where: { therapistId, status: "pending" },
    orderBy: { createdAt: "desc" },
    include: { client: { select: { name: true, email: true, image: true } } },
  });
}
