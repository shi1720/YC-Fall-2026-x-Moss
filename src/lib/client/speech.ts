"use client";

/**
 * Browser speech helpers: Web Speech API recognition (Chrome/Edge/Safari) for live mode
 * and speechSynthesis for simulations and spoken interventions. Zero API keys.
 */

type SR = typeof window extends { SpeechRecognition: infer T } ? T : unknown;

export function speechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export interface RecognitionHandle {
  stop: () => void;
}

export function startRecognition(opts: {
  lang?: string;
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError?: (err: string) => void;
  onEnd?: () => void;
}): RecognitionHandle | null {
  if (!speechRecognitionSupported()) return null;
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
  const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition)!;
  const rec = new Ctor();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = opts.lang ?? "en-IN";
  let stopped = false;
  rec.onresult = (ev) => {
    let interim = "";
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const r = ev.results[i];
      const text = r[0].transcript.trim();
      if (!text) continue;
      if (r.isFinal) opts.onFinal(text);
      else interim += " " + text;
    }
    if (interim.trim()) opts.onInterim(interim.trim());
  };
  rec.onerror = (ev) => {
    if (ev.error === "no-speech" || ev.error === "aborted") return;
    opts.onError?.(ev.error);
  };
  rec.onend = () => {
    // Chrome stops continuous recognition every ~60 s; restart until told to stop.
    if (!stopped) {
      try {
        rec.start();
      } catch {
        opts.onEnd?.();
      }
    } else opts.onEnd?.();
  };
  rec.start();
  return {
    stop: () => {
      stopped = true;
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    },
  };
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

// ---- Text to speech ----

let voicesCache: SpeechSynthesisVoice[] = [];
function voices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  if (voicesCache.length === 0) voicesCache = window.speechSynthesis.getVoices();
  return voicesCache;
}
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    voicesCache = window.speechSynthesis.getVoices();
  };
}

export type VoiceRole = "caller" | "user" | "shield";

function pickVoice(role: VoiceRole): SpeechSynthesisVoice | undefined {
  const all = voices();
  if (all.length === 0) return undefined;
  const en = all.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const pool = en.length ? en : all;
  const byName = (re: RegExp) => pool.find((v) => re.test(v.name));
  if (role === "shield") return byName(/Google UK English Female|Samantha|Karen|Moira|Female/i) ?? pool[0];
  if (role === "caller") return byName(/Google UK English Male|Daniel|Rishi|Male|Aaron/i) ?? pool[pool.length - 1];
  return byName(/Google US English|Victoria|Tessa|Female|Zira/i) ?? pool[Math.min(1, pool.length - 1)];
}

export function speak(text: string, role: VoiceRole = "shield", opts: { rate?: number; pitch?: number; interrupt?: boolean } = {}): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return resolve();
    const synth = window.speechSynthesis;
    if (opts.interrupt) synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(role);
    if (v) u.voice = v;
    u.rate = opts.rate ?? (role === "shield" ? 1.0 : 1.02);
    u.pitch = opts.pitch ?? (role === "caller" ? 0.85 : role === "user" ? 1.1 : 1.0);
    u.onend = () => resolve();
    u.onerror = () => resolve();
    synth.speak(u);
  });
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
