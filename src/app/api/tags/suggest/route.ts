import { NextResponse } from "next/server";
import { suggestTags } from "@/lib/search-tags";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const therapistId = searchParams.get("therapistId")?.trim() || undefined;
  const tags = await suggestTags(q, therapistId);
  return NextResponse.json({ tags });
}
