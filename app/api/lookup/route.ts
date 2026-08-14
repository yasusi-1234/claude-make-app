import type { NextRequest } from "next/server";
import { lookupProduct } from "@/lib/lookup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const barcode = req.nextUrl.searchParams.get("barcode")?.trim();

  if (!barcode) {
    return Response.json({ error: "barcode is required" }, { status: 400 });
  }

  const result = await lookupProduct(barcode);
  if (!result) {
    return Response.json({ error: "not_found", barcode }, { status: 404 });
  }

  return Response.json(result);
}
