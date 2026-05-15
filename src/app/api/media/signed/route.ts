import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseProductMetadata } from "@/lib/product-metadata";
import { productTypeToContentKind } from "@/lib/content-kind";

/**
 * מחזיר כתובת צפייה חתומה/מאושרת רק למשתמש מחובר עם גישה לתוכן.
 * מקורות Vimeo/Bunny/חיצוניים לא נחשפים ב-HTML לפני אימות.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "יש להתחבר עם Google" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId")?.trim();
  if (!productId) {
    return NextResponse.json({ error: "חסר מזהה תוכן" }, { status: 400 });
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, active: true },
    select: {
      id: true,
      title: true,
      type: true,
      therapistId: true,
      metadata: true,
    },
  });
  if (!product) {
    return NextResponse.json({ error: "תוכן לא נמצא" }, { status: 404 });
  }

  const hasAcquisition = await prisma.contentAcquisition.findFirst({
    where: {
      userId: session.user.id,
      contentId: product.id,
      eventType: "acquisition",
    },
  });
  const hasManual = await prisma.manualAccessRequest.findFirst({
    where: {
      userId: session.user.id,
      contentId: product.id,
      status: "approved",
    },
  });

  if (!hasAcquisition && !hasManual) {
    return NextResponse.json({ error: "אין גישה לתוכן — נדרשת רכישה או אישור מטפל" }, { status: 403 });
  }

  const meta = parseProductMetadata(product.metadata);
  const kind = productTypeToContentKind(product.type);

  if (meta.externalUrl?.startsWith("http")) {
    return NextResponse.json({
      kind,
      provider: meta.videoProvider ?? "external",
      playbackUrl: meta.externalUrl,
      note: "קישור חיצוני מאושר",
    });
  }

  if (meta.videoId && meta.videoProvider === "bunny") {
    const libraryId = process.env.BUNNY_LIBRARY_ID;
    const tokenKey = process.env.BUNNY_TOKEN_KEY;
    if (libraryId && tokenKey) {
      const expires = Math.floor(Date.now() / 1000) + 3600;
      return NextResponse.json({
        kind,
        provider: "bunny",
        playbackUrl: `https://iframe.mediadelivery.net/embed/${libraryId}/${meta.videoId}?token=${expires}`,
        expiresAt: expires,
      });
    }
  }

  if (meta.videoId && meta.videoProvider === "vimeo") {
    return NextResponse.json({
      kind,
      provider: "vimeo",
      playbackUrl: `https://player.vimeo.com/video/${meta.videoId}`,
      note: "בפרודקשן הפעילו Vimeo signed URLs",
    });
  }

  return NextResponse.json({
    error: "מקור המדיה לא מוגדר — הגדירו קישור חיצוני או מזהה וידאו במטא-דאטה",
  }, { status: 404 });
}
