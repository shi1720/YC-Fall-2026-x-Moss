import Link from "next/link";
import { ArrowRight, Ear, Gauge, HeartHandshake, Lock, PhoneCall, ShieldAlert, Sparkles, Users, Waves } from "lucide-react";
import { LatencyBars } from "@/components/landing/LatencyBars";
import { LiveStats } from "@/components/landing/LiveStats";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <div className="max-w-3xl">
            <div className="chip chip-saffron mb-5">YC Fall 2026 × Moss · Real-Time Voice & Conversational AI</div>
            <h1 className="display text-5xl leading-[1.02] text-text sm:text-7xl">
              A second listener.
              <br />
              <span className="text-saffron-2">A moment to pause.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
              Scam callers use fear, urgency and secrecy. Raksha helps you recognise the pressure, find the words to end the call and bring in someone you trust. Try the guided demo, or connect your own Moss project to test live semantic retrieval.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shield?scenario=digital-arrest" className="btn btn-primary text-base">
                <PhoneCall className="h-5 w-5" /> Try a scam-call simulation
              </Link>
              <Link href="/shield?mode=live" className="btn btn-ghost text-base">
                Try it with your microphone <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-faint">
              <span>No account needed</span>
              <span>Your own Moss key is optional</span>
              <span>Simulations work without a microphone</span>
            </div>
          </div>
          <div className="mt-14">
            <LiveStats />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-saffron">The problem</div>
            <h2 className="display mt-3 text-4xl leading-tight text-text">Caller-ID tells you who is calling. Raksha helps you recognise the pressure.</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              A caller claims to be the police. A bank account will be frozen. A family member needs money now. Under pressure, even a careful person can skip the moment of verification.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Raksha looks for familiar combinations: <em>authority → fear → secrecy → the ask</em>. It shows the conversation evidence behind a warning and gives the person a concrete next step.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["409 lines", "a curated playbook of scam tactics and legitimate look-alikes"],
              ["2 views", "a shield for the person on the call and a dashboard for their guardian"],
              ["Your Moss", "connect your own project to measure real semantic retrieval"],
              ["18 calls", "scripted scenarios include ten scams and eight genuine conversations"],
            ].map(([n, d]) => (
              <div key={n} className="card p-5">
                <div className="display text-4xl text-saffron-2">{n}</div>
                <div className="mt-2 text-sm text-muted">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-line bg-ink-2/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="text-xs uppercase tracking-[0.25em] text-moss">How it works</div>
          <h2 className="display mt-3 max-w-3xl text-4xl leading-tight text-text">Fast recognition. Clear advice. A person you trust.</h2>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                icon: Ear,
                title: "1 · Listen",
                body: "Speech becomes text in the browser (its built-in speech engine; Whisper for uploaded recordings). Live mode sends text to Raksha. Uploaded audio passes through the server to Groq for transcription. Call details stay in RAM for up to ten minutes after the call ends. Every fragment, even mid-sentence, is a query.",
              },
              {
                icon: Gauge,
                title: "2 · Recognise the pattern",
                body: "With Moss connected, each fragment is embedded and matched against the 409-line playbook inside the server process. A deterministic risk engine combines the evidence. Without a Moss connection, a clearly labeled text detector keeps the demo usable.",
              },
              {
                icon: ShieldAlert,
                title: "3 · Pause and get support",
                body: "When pressure meets an ask, the shield interrupts: it says stop, gives you one sentence to end the call, and alerts your guardian. An optional AI coach adds context outside the detection path.",
              },
            ].map((s) => (
              <div key={s.title} className="card p-6">
                <s.icon className="h-6 w-6 text-saffron" />
                <div className="mt-4 text-lg font-semibold text-text">{s.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why speed */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-moss">Why latency is the product</div>
            <h2 className="display mt-3 text-4xl leading-tight text-text">A scam is won or lost inside one sentence.</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              “Read me the six digits, quickly.” A warning is useful while someone can still pause. Moss keeps embedding and search inside the server process, so detection does not wait for a remote vector database or language-model verdict. The Lab separates retrieval, analysis and network timings. Speech services and network conditions still affect the experience.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/lab" className="btn btn-ghost">
                <Waves className="h-4 w-4" /> Open the latency lab
              </Link>
              <a href="https://docs.moss.dev" target="_blank" rel="noreferrer" className="btn btn-ghost">
                Moss docs <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="card p-6">
            <LatencyBars />
          </div>
        </div>
      </section>

      {/* Moss usage */}
      <section className="border-y border-line bg-ink-2/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="text-xs uppercase tracking-[0.25em] text-moss">Moss in the loop</div>
          <h2 className="display mt-3 max-w-3xl text-4xl leading-tight text-text">Four ways the retrieval layer does real work here.</h2>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { icon: Gauge, title: "Loaded playbook index", body: "The curated scam playbook lives in a Moss cloud index, loaded into your session after connection and queried in-memory with a raw cosine score for every fragment." },
              { icon: Sparkles, title: "Call memory in a Moss session", body: "Substantive caller turns are written into a local, in-process Moss session tagged with the call id. The guardian can ask “what did they ask for?” and get filtered semantic recall. This memory is not published to Moss Cloud; its turns are removed at call end." },
              { icon: Users, title: "Community intel with hot-swap", body: "The shared-runtime integration supports explicit caller reports to a second Moss index and automatic refresh. This depends on shared-project credits. Publishing is disabled for personal project sessions." },
              { icon: Lock, title: "Multi-index, one query", body: "The shared runtime can combine playbook and community indexes in one query. Personal sessions query only their verified playbook. Benign look-alikes help the risk engine distinguish legitimate conversations." },
            ].map((s) => (
              <div key={s.title} className="card flex gap-4 p-5">
                <s.icon className="mt-0.5 h-5 w-5 shrink-0 text-moss" />
                <div>
                  <div className="font-semibold text-text">{s.title}</div>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guardian + business */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="card p-6">
            <HeartHandshake className="h-6 w-6 text-saffron" />
            <h3 className="display mt-4 text-3xl text-text">The circle of trust</h3>
            <p className="mt-3 leading-relaxed text-muted">
              Scams work by isolating the victim: “tell no one”. Raksha breaks the isolation. A family code links a parent’s phone to a son or daughter’s dashboard. When risk
              rises they see the transcript highlights, can speak through the shield, and can ask the call’s memory a question. Human and agent, in the same session.
            </p>
            <Link href="/guardian" className="mt-4 inline-flex items-center gap-1.5 text-saffron hover:underline">
              Open the guardian view <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="card p-6">
            <Sparkles className="h-6 w-6 text-moss" />
            <h3 className="display mt-4 text-3xl text-text">Built to learn from real use</h3>
            <ul className="mt-3 space-y-2 leading-relaxed text-muted">
              <li><span className="text-text">Today:</span> a browser prototype with guided calls, recording uploads, live speech input and a guardian view.</li>
              <li><span className="text-text">Next:</span> consented testing with families, more accents and languages, and stronger guardian invitations.</li>
              <li><span className="text-text">Before broader use:</span> evaluate real-world false alarms, strengthen abuse controls and add shared state before scaling.</li>
            </ul>
            <p className="mt-3 text-sm text-faint">Raksha is a decision aid. It does not intercept cellular calls, verify identities or guarantee fraud prevention.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="card card-strong flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="display text-3xl text-text">See how a digital-arrest warning works.</div>
            <div className="mt-1 text-muted">Voices on. Watch the dial, the transcript and the intervention.</div>
          </div>
          <Link href="/shield?scenario=digital-arrest" className="btn btn-primary text-base">
            <PhoneCall className="h-5 w-5" /> Start the demo
          </Link>
        </div>
      </section>
    </div>
  );
}
