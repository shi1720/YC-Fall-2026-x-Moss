import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const MAX_BYTES = 25 * 1024 * 1024;
const recent: number[] = [];

/** Audio is sent to Groq for transcription and is never written to disk. */
export async function POST(req: Request) {
  if (Number(req.headers.get("content-length")) > MAX_BYTES + 65536) return NextResponse.json({ error: "Recording too large (25 MB maximum)." }, { status: 413 });
  let form: FormData;
  try { form = await req.formData(); } catch { return NextResponse.json({ error: "Upload a recording using a multipart form." }, { status: 400 }); }
  const file = form.get("file");
  if (!(file instanceof Blob) || !file.size) return NextResponse.json({ error: "Choose a nonempty audio file." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Recording too large (25 MB maximum)." }, { status: 413 });
  if (!/^(audio\/|video\/mp4|video\/webm|application\/octet-stream)/.test(file.type)) return NextResponse.json({ error: "Choose an MP3, M4A, WAV, OGG or WebM recording." }, { status: 415 });
  const key = process.env.GROQ_API_KEY;
  if (!key) return NextResponse.json({ error: "Recording transcription is unavailable. Try a simulated call or live microphone." }, { status: 503 });
  const now = Date.now();
  while (recent.length && recent[0] < now - 3600_000) recent.shift();
  if (recent.length >= 30) return NextResponse.json({ error: "The demo transcription budget is busy. Please try a simulation." }, { status: 429 });
  recent.push(now);
  const upstream = new FormData();
  upstream.append("file", file, (file as File).name || "audio.webm");
  upstream.append("model", process.env.STT_MODEL ?? "whisper-large-v3-turbo");
  upstream.append("response_format", "verbose_json");
  const lang = form.get("language");
  if (typeof lang === "string" && /^[a-z]{2}$/.test(lang)) upstream.append("language", lang);
  try {
    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST", headers: { authorization: `Bearer ${key}` }, body: upstream, signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) return NextResponse.json({ error: "Transcription is temporarily unavailable. Try again or use a simulation." }, { status: 502 });
    const data = await res.json() as { text?: string; segments?: Array<{ start: number; end: number; text: string }> };
    if (!data.text?.trim()) return NextResponse.json({ error: "No speech found. Try a clearer recording." }, { status: 422 });
    return NextResponse.json({ text: data.text, segments: data.segments ?? [], latencyMs: Date.now() - now });
  } catch { return NextResponse.json({ error: "Transcription timed out. Please try a shorter recording." }, { status: 504 }); }
}
