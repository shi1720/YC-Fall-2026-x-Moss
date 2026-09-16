import { NextResponse } from "next/server";
import { getMossRuntime } from "@/lib/moss/runtime";
import { MOSS_COOKIE, SESSION_MS, mossSettingsSchema, mossToken, visitorMoss, isMossSettingsError } from "@/lib/moss/visitor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store", Vary: "Cookie", "X-Content-Type-Options": "nosniff" };
function allowed(req: Request) {
  const origin = req.headers.get("origin");
  const origins = [new URL(req.url).origin, process.env.RAKSHA_PUBLIC_URL, process.env.RAKSHA_WS_ORIGIN];
  if (!origin) return false;
  try { return origins.includes(origin) || (["http:", "https:"].includes(new URL(origin).protocol) && new URL(origin).host === req.headers.get("host")); } catch { return false; }
}
function cookie(response: NextResponse, req: Request, token: string, maxAge: number) {
  response.cookies.set(MOSS_COOKIE, token, { httpOnly: true, secure: new URL(req.url).protocol === "https:" || req.headers.get("x-forwarded-proto") === "https", sameSite: "strict", path: "/", maxAge });
  return response;
}
export async function GET(req: Request) {
  const state = visitorMoss().status(mossToken(req));
  const shared = await getMossRuntime();
  return NextResponse.json({ ...state, sharedMode: shared.info.mode }, { headers });
}
export async function POST(req: Request) {
  if (!allowed(req)) return NextResponse.json({ error: "Open Settings on Raksha to connect your project." }, { status: 403, headers });
  if (!req.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "Send JSON settings." }, { status: 415, headers });
  // Bound the stream, not just Content-Length, before parsing credentials.
  const reader = req.body?.getReader();
  if (!reader) return NextResponse.json({ error: "Enter your project settings." }, { status: 400, headers });
  let text = ""; const decoder = new TextDecoder(); let bytes = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 4096) { await reader.cancel(); return NextResponse.json({ error: "Settings are too large." }, { status: 413, headers }); }
    text += decoder.decode(value, { stream: true });
  }
  let input;
  try { input = mossSettingsSchema.safeParse(JSON.parse(text)); } catch { /* invalid JSON */ }
  if (!input?.success) return NextResponse.json({ error: "Enter a valid project ID, project API key and index name, and confirm the connection consent." }, { status: 400, headers });
  const previous = visitorMoss().get(mossToken(req));
  if (previous && previous.status !== "error") return NextResponse.json({ error: "Disconnect your current project before connecting another." }, { status: 409, headers });
  try {
    visitorMoss().remove(mossToken(req));
    const token = visitorMoss().start(input.data);
    const response = NextResponse.json({ status: "connecting" }, { status: 202, headers });
    return cookie(response, req, token, SESSION_MS / 1000);
  } catch (error) {
    return NextResponse.json({ error: isMossSettingsError(error) ? error.message : "Could not start Moss setup." }, { status: isMossSettingsError(error) ? error.status : 500, headers });
  }
}
export async function DELETE(req: Request) {
  if (!allowed(req)) return NextResponse.json({ error: "Open Settings on Raksha to disconnect." }, { status: 403, headers });
  visitorMoss().remove(mossToken(req));
  return cookie(NextResponse.json({ status: "disconnected" }, { headers }), req, "", 0);
}
