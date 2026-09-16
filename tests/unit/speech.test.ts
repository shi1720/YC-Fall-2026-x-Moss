import { afterEach, describe, expect, it, vi } from "vitest";
import { speak, startRecognition, stopSpeaking } from "../../src/lib/client/speech";

afterEach(() => { vi.unstubAllGlobals(); });

describe("speech recovery", () => {
  it("settles interrupted speech even when the browser sends no end event", async () => {
    const cancel=vi.fn();
    vi.stubGlobal("window", { speechSynthesis:{ getVoices:()=>[], speak:vi.fn(), cancel } });
    vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(public text:string) {} });
    const speaking=speak("This narration will be interrupted.");
    stopSpeaking();
    await expect(speaking).resolves.toBeUndefined();
    expect(cancel).toHaveBeenCalledOnce();
  });
  it("does not restart recognition after microphone permission is denied", () => {
    const instance = { start: vi.fn(), stop: vi.fn(), onerror: vi.fn<(event: { error: string }) => void>(), onend: () => {} };
    function Recognition() { return instance; }
    vi.stubGlobal("window", { SpeechRecognition:Recognition });
    const onError=vi.fn();
    startRecognition({onInterim:vi.fn(),onFinal:vi.fn(),onError});
    instance!.onerror({error:"not-allowed"});instance!.onend();
    expect(instance!.start).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith("not-allowed");
  });
});
