import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/transcribe (multipart: file=<audio>) → { text }
 * Fallback speech-to-text for browsers without the Web Speech API, and for uploaded
 * call recordings. Uses Groq's hosted Whisper (free tier). Audio is not stored.
 */
export async function POST(req: Request) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return NextResponse.json({ error: "Transcription disabled: GROQ_API_KEY not set." }, { status: 501 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof Blob)) return NextResponse.json({ error: "file missing" }, { status: 400 });
  if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: "file too large (25 MB max)" }, { status: 413 });
  const upstream = new FormData();
  upstream.append("file", file, (file as File).name || "audio.webm");
  upstream.append("model", process.env.STT_MODEL ?? "whisper-large-v3-turbo");
  upstream.append("response_format", "verbose_json");
  const lang = form.get("language");
  if (typeof lang === "string" && lang) upstream.append("language", lang);
  const t0 = Date.now();
  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { authorization: `Bearer ${key}` },
    body: upstream,
  });
  if (!res.ok) return NextResponse.json({ error: `STT failed: ${res.status}` }, { status: 502 });
  const data = (await res.json()) as { text: string; segments?: Array<{ start: number; end: number; text: string }> };
  return NextResponse.json({ text: data.text, segments: data.segments ?? [], latencyMs: Date.now() - t0 });
}
