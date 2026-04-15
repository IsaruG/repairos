import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { globalSearch } from "@/lib/search";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const me = await getSession();
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const result = await globalSearch(q, me);
  return NextResponse.json(result);
}
