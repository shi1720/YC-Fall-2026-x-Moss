import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/config → runtime settings the browser needs before it can connect.
 *
 * `wsOrigin` lets the pages be served through a CDN/proxy that cannot carry WebSockets
 * (Firebase Hosting in front of Cloud Run) while the shield socket still goes straight
 * to the origin server. Empty means "same origin as the page".
 */
export async function GET() {
  const wsOrigin = (process.env.RAKSHA_WS_ORIGIN ?? "").trim().replace(/\/+$/, "") || null;
  const publicUrl = (process.env.RAKSHA_PUBLIC_URL ?? "").trim().replace(/\/+$/, "") || null;
  return NextResponse.json({ wsOrigin, publicUrl }, { headers: { "Cache-Control": "no-store" } });
}
