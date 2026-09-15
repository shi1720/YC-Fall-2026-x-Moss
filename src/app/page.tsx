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
              Every scam follows a script.
              <br />
              <span className="text-saffron-2">Now your phone knows the script.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
              Raksha listens with you during a call, recognises the scam playbook in <span className="mono text-moss">about 10 ms</span> with Moss, and steps in before you
              read out the OTP. It coaches you with the exact words to say, and quietly alerts someone you trust.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shield?scenario=digital-arrest" className="btn btn-primary text-base">
                <PhoneCall className="h-5 w-5" /> Watch a scam get stopped
              </Link>
              <Link href="/shield" className="btn btn-ghost text-base">
                Try it with your microphone <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-faint">
              <span>No account needed</span>
              <span>Nothing is recorded</span>
              <span>Works in any browser</span>
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
            <h2 className="display mt-3 text-4xl leading-tight text-text">Caller-ID tells you who is calling. Nobody tells you what they are doing to you.</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Indians reported <span className="text-text">₹22,845 crore</span> lost to cyber fraud in 2024, ten times the figure two years earlier. “Digital arrest” alone took
              ₹1,900 crore from 1.23 lakh people. In the US, phone calls carry the highest median loss of any scam channel, and 41% of the biggest losses by older adults began
              with a call.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Every one of those calls followed a script: <em>authority → fear → secrecy → the ask</em>. Scam-blocking today is number reputation. By the time a number is
              flagged, the crew has a new one. The words never change.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["₹22,845 cr", "reported cyber-fraud losses, India, 2024 (MHA)"],
              ["41%", "of $10k+ losses by older adults in the US began with a phone call (FTC, 2025)"],
              ["$25.6M", "wired by one employee to a deepfaked CFO on a video call (Arup, 2024)"],
              ["< 1%", "of Indian phones can run the only shipping on-device scam detector (Pixel 9+)"],
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
          <h2 className="display mt-3 max-w-3xl text-4xl leading-tight text-text">A fast path that never waits for the cloud, and a slow path that knows what to say.</h2>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                icon: Ear,
                title: "1 · Listen",
                body: "Speech becomes text on the device (Web Speech API, or Whisper for recordings). Every fragment, even mid-sentence, is a query.",
              },
              {
                icon: Gauge,
                title: "2 · Recognise, in about ten milliseconds",
                body: "Moss holds a 400-line scam playbook in memory. Each fragment is embedded and matched in-process — no vector database, no round-trip — in roughly 10 ms end-to-end, with the search itself under a millisecond. The engine credits persuasion tactics (authority, urgency, secrecy, the ask) and a noisy-OR risk model decides.",
              },
              {
                icon: ShieldAlert,
                title: "3 · Intervene, before the OTP leaves your mouth",
                body: "When pressure meets an ask, the shield interrupts: it says stop, gives you one sentence to end the call, and alerts your guardian. An LLM coach adds plain-language context only on risk transitions.",
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
              “Read me the six digits, quickly.” takes about two and a half seconds to say. A cloud vector search spends a third of that on the network before it has an
              answer; an LLM classifier spends all of it. Moss answers in the time it takes to say a syllable, so the shield can interrupt <em>while</em> the request is being
              made, and it can do that for every fragment of every call at zero marginal cost, because local queries are never metered.
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
              { icon: Gauge, title: "Loaded playbook index", body: "The curated scam playbook lives in a Moss cloud index, loaded into the process at boot and queried in-memory with a raw cosine score for every fragment." },
              { icon: Sparkles, title: "Per-call session", body: "Each call opens a Moss session: a local, in-memory index of the call’s own turns. The guardian can ask “what did they ask for?” and get semantic recall in milliseconds. Sessions are never pushed — call memory dies with the call." },
              { icon: Users, title: "Community intel with hot-swap", body: "When someone reports a call, the caller’s flagged lines are upserted into a second index. Every running shield has it loaded with auto-refresh, so a new script variant reaches every device without a redeploy." },
              { icon: Lock, title: "Multi-index, one query", body: "Playbook and community intel are searched together in one call for a single global top-K, and legitimate look-alikes in the index suppress false alarms." },
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
            <h3 className="display mt-4 text-3xl text-text">Who pays, and why it scales</h3>
            <ul className="mt-3 space-y-2 leading-relaxed text-muted">
              <li>
                <span className="text-text">Banks:</span> from 2027 RBI makes banks compensate scam-induced losses; the UK already reimburses £354M a year. A shield that fires
                before the transfer is cheaper than any refund.
              </li>
              <li>
                <span className="text-text">Telcos and OEMs:</span> a differentiated “protected line”, per subscriber per month, on any phone, not just a Pixel.
              </li>
              <li>
                <span className="text-text">Families:</span> a ₹99/month circle that protects parents, in the price band where family-safety apps already convert.
              </li>
            </ul>
            <p className="mt-3 text-sm text-faint">Unit cost: local Moss queries are unmetered, and the LLM runs only on risk transitions, so a protected call costs a fraction of a paisa.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="card card-strong flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="display text-3xl text-text">See it stop a digital arrest in 60 seconds.</div>
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
