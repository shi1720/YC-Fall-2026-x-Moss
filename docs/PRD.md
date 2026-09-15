# Raksha — Product Requirements Document

| | |
|---|---|
| **Product** | Raksha — the real-time scam-call shield |
| **Version** | 1.0 (hackathon MVP, production-shaped) |
| **Authors** | Shivam Gupta, with Claude |
| **Event** | YC Fall 2026 × Moss — Zero Latency Builder Sprint |
| **Theme** | Real-Time Voice & Conversational AI (with Local-First and Multiplayer elements) |
| **YC RFS inspiration** | *Proving You're Human* (Max Kolysh) · *AI for the Aging Population* (Max Kolysh) |
| **Status** | Built, tested, deployed |

---

## 1. Problem

### 1.1 The one-line version

Phone scams are conversations with a script. Nobody protects people *during* the conversation.

### 1.2 Evidence

* Indians reported **₹22,845 crore** lost to cyber fraud in 2024 (up 206% year-on-year, ~10× 2022) across 22.68 lakh complaints; 2025 was flat at ₹22,495 crore. Cumulatively ≈ ₹53,000 crore over six years. *(MHA, Lok Sabha Q.432, Dec 2025)*
* **Digital arrest** — fake police/CBI/customs officers who keep a victim on a video call and drain their savings — took **₹1,918 crore from 1,23,672 people in 2024** (+465% year-on-year); average loss per case ≈ ₹1.5–3.7 lakh. The Supreme Court took *suo motu* cognisance in October 2025. *(MHA data; SMW(Crl) 3/2025)*
* Losses concentrate on the elderly: single victims have lost ₹1.5 cr (a senior couple), ₹3.09 cr (Karnataka), ₹2 cr (a 92-year-old).
* Globally: FTC 2025 reported **$15.9B** in fraud losses; phone calls have the **highest median loss of any channel ($1,835)**, and **41% of $10k+ losses by older adults began with a phone call**. FBI IC3 2025: victims aged 60+ lost **$7.7B**, average > $38,000. *(FTC, IC3)*
* The Arup case: one finance employee wired **US$25.6M** after a video call with a deepfaked CFO and colleagues. *(CNN, 2024)*

Full sourced fact sheet: [research/market-facts.md](research/market-facts.md).

### 1.3 Why existing protection fails

| Approach | Examples | Gap |
|---|---|---|
| Number reputation / spam labels | Truecaller (454M MAU), Airtel & Jio network AI, iOS 26 call screening, DoT Sanchar Saathi | Knows *who* is calling, not *what they are doing to you*. Crews rotate numbers; the script never changes. |
| Voice-liveness only | Truecaller AI Call Scanner | Detects synthetic voice, not social engineering by a human. |
| Content analysis, limited reach | Google Pixel Scam Detection (Pixel 9+, < 1% of Indian phones); Hiya AI Phone (cloud, US-only, $9.99/mo) | Right idea, wrong distribution and wrong latency model for India. |
| Bank/telco signals | CBA–Telstra "Scam Indicator" | Knows *that* a call is happening at the moment of a transfer, not what was said. |
| Awareness campaigns | Mann Ki Baat "Ruko, Socho, Action Lo", caller tunes | Victims *know* the rules; the scam works by putting them in an emotional state where rules don't apply ("the ether"). |

**Whitespace:** multi-OEM, script-level detection with an *intervention* step (say this, alert a guardian, stop the transfer), fast enough to act inside one sentence.

### 1.4 Why now

* Token and embedding costs fall ~10×/year; on-device semantic search now runs in single-digit milliseconds (Moss).
* Regulation is moving liability onto banks: UK PSR mandatory reimbursement (Oct 2024, £354M reimbursed in 2025); **RBI's June 2026 directions make Indian banks compensate scam-induced losses from 1 Jan 2027** — the first time authorised-push-payment fraud carries a mandated cost for the bank.
* Deepfake voice makes "trust the voice" obsolete; the only durable signal left is the *script*.

## 2. Users

| Persona | Situation | Job to be done |
|---|---|---|
| **Sunita, 68, retired teacher, Bengaluru** (protected person) | Gets a call from a "Mumbai Crime Branch officer". Alone at home, frightened, told not to tell anyone. | *"When someone is pressuring me, tell me clearly what is happening and what to say, before I do something I can't undo."* |
| **Anita, 41, her daughter, Pune** (guardian) | At work. Cannot answer every call; worries constantly. | *"Know the moment Mummy is in a dangerous call, and be able to reach her through the pressure."* |
| **Fraud-prevention lead at a bank** (buyer) | Owns reimbursement costs and 1930 escalations. | *"Stop the transfer before it happens, at a cost per customer far below the loss."* |
| **Finance staff at a company** (protected person, B2B) | "CFO" on a video call wants three urgent confidential wires. | *"Enforce the callback rule even when my boss is on the screen."* |

## 3. Goals and non-goals

**Goals (MVP)**

1. Recognise a scam script from a live transcript **within one spoken sentence** of the first "ask", with the retrieval step in **< 10 ms**.
2. Intervene in a way a stressed, older person can act on: one headline, one sentence to say, one action, spoken aloud.
3. Never cry wolf on the calls that resemble scams most (a genuine bank fraud call, a courier, a hospital).
4. Break the isolation: a trusted person sees risk live and can speak into the call.
5. Learn from the network: a reported script protects every device within minutes, with no redeploy.
6. Be demonstrable by anyone in 60 seconds without a scam caller (scripted simulations with voices).

**Non-goals (MVP)**

* Deepfake audio detection (roadmap; complementary, not substitutable).
* Native telephony integration (Android call-audio capture, telco SIP hooks) — the web app is the reference implementation of the runtime; the phone app is the distribution vehicle.
* Languages beyond English/Hinglish transcripts (playbook lines include Hinglish; STT language is configurable).
* Accounts, storage of calls, analytics.

## 4. Product

### 4.1 Surfaces

| Surface | What it does |
|---|---|
| **Shield** (`/shield`) | The protected person's view. Modes: *Simulate* (9 scripted calls, two synthetic voices, real-time or fast, silent option), *Live mic* (Web Speech API, phone on speaker), *Recording* (upload → Whisper → replay). Risk dial, sparkline, transcript with tactic chips and per-line latency, playbook matches, coach card, full-screen intervention with spoken coaching, post-call summary and *Report this script*. |
| **Guardian** (`/guardian?code=…`) | Live dial and transcript highlights of a protected phone; interventions as they happen; *Speak through the shield* (shown and read aloud on the phone); *Ask the call* (semantic recall over the call's Moss session). |
| **Playbook** (`/playbook`) | Explore 31 scam families and 409 lines; live semantic search with engine/in-process/round-trip latencies; family detail with script arc and advice. |
| **Latency lab** (`/lab`) | Live benchmark against the running instance; the committed detection evaluation (detection rate, false alarms, family accuracy, time-to-danger, p50/p95/p99). |
| **Landing** (`/`) | Story, live runtime stats, how it works, why latency is the product, who pays. |

### 4.2 The intervention ladder

| Level | Trigger | What the person experiences |
|---|---|---|
| **Caution** (25–59) | First pressure tactics with confidence, or a coach "suspicious" | Amber toast: *"Careful — this call is starting to sound like a scam."* + one sentence to say. Guardian notified. |
| **Danger** (≥ 60) | The triad (pressure + ask), 4 distinct tactics, or coach "scam" | Full-screen red overlay, spoken aloud: script name, why, *"Say this, then hang up"*, helpline. Simulation pauses. Guardian alerted. |
| **Targeted ask** (at danger) | A new ask tactic (OTP, transfer, remote access, personal info) | Louder, specific: *"Do NOT read out the OTP."* |
| **Compliance** (≥ 85) | The person begins to comply under pressure | *"STOP. Put the phone down."* — immediate, not rate-limited. |

### 4.3 Functional requirements

| ID | Requirement | Priority | Status |
|---|---|---|---|
| F1 | Analyse interim STT fragments (≥ 4 words) every ≤ 500 ms and final segments on pause | P0 | ✅ |
| F2 | Retrieve top-K playbook lines per fragment with raw cosine scores, in-process | P0 | ✅ Moss `query`, alpha 1.0 |
| F3 | Deterministic risk state per call: tactics, family, stage, score, level, reasons | P0 | ✅ `risk.ts`, unit-tested |
| F4 | Benign look-alike suppression using benign lines in the same index | P0 | ✅ 75 benign lines |
| F5 | Speaker-aware crediting (person's words = compliance only) | P0 | ✅ |
| F6 | Intervention ladder with spoken output and rate limiting | P0 | ✅ |
| F7 | LLM coach on transitions with JSON contract and template fallback | P1 | ✅ Groq / any OpenAI-compatible |
| F8 | Guardian rooms by family code; replay state on late join; speak-through; ask-the-call | P1 | ✅ Moss session query |
| F9 | Community intel: opt-in report → upsert → hot-swap on all instances | P1 | ✅ `raksha-intel`, autoRefresh |
| F10 | Nine scripted scenarios incl. two benign controls, playable with voices | P0 | ✅ |
| F11 | Live microphone mode (Chrome/Edge/Safari) with region-aware STT language | P1 | ✅ |
| F12 | Recording upload → Whisper → replay | P2 | ✅ |
| F13 | Health endpoint with runtime, LLM, latency stats | P1 | ✅ |
| F14 | Offline fallback retriever so the product runs without credentials | P1 | ✅ TF-IDF cosine |
| F15 | Evaluation harness with committed report | P1 | ✅ |

### 4.4 Non-functional requirements

| Area | Requirement | How it is met |
|---|---|---|
| Latency | Retrieval + scoring ≤ 10 ms p95 on a laptop-class CPU; intervention visible within one sentence | Moss in-process; risk engine O(tactics); interim fragments; measured in Latency lab and eval |
| Cost | Zero marginal cost per fragment; LLM only on transitions (≤ ~6 calls per call) | Local Moss queries unmetered; coach gated; free tiers sufficient for MVP |
| Privacy | No audio leaves the device in live mode; transcript in RAM only; reports share caller lines only; no accounts | Architecture §8 |
| Reliability | Runs with any subset of credentials; reconnecting WebSocket; call ends cleanly on disconnect | Fallbacks + tests |
| Accessibility | Large type, high contrast, spoken output, single-action buttons | Design system |
| Portability | One container, any Docker host; Node 22 | `Dockerfile` |

## 5. Success metrics

| Metric | Target (MVP) | Measured |
|---|---|---|
| Scam scenarios reaching DANGER | 100% of 7 | see [eval/REPORT.md](eval/REPORT.md) |
| Benign scenarios reaching DANGER | 0% of 2 | see report |
| Turns from first "ask" to DANGER | ≤ 1 | see report |
| Retrieval p95 (embed + search) | < 10 ms | see report / Latency lab |
| Demo-ability | Any judge can watch a scam stopped in ≤ 60 s with no setup | `/shield?scenario=digital-arrest` |

North-star metric for the product: **₹ of transfers prevented per 1,000 protected calls**, measured by bank partners.

## 6. Business model and unit economics

**Who pays**

1. **Banks and payment apps (B2B2C, primary).** From 1 Jan 2027 RBI makes banks compensate scam-induced losses; UK banks already reimburse ~61% of APP fraud. LexisNexis puts the all-in cost of $1 of fraud at > $5. A per-protected-customer licence (₹5–15/month) that stops even a fraction of transfers is cheaper than any refund, and the bank gets a "transfer hold" signal it can act on in real time (the CBA–Telstra pattern, but with content).
2. **Telcos and OEMs.** A "protected line" add-on (₹49–99/month) on any Android phone, not just a Pixel; DoT's kill-switch ambitions need exactly this signal.
3. **Families (B2C).** A ₹99/month circle that protects parents — the price band where family-safety apps already convert (Life360: 2.8M paying circles, ARPPC $143/yr).

**Unit cost per protected call** (10-minute call, ~120 fragments):

| Item | Cost |
|---|---|
| Moss local queries | ₹0 (unmetered) |
| Moss index storage/egress | fractions of a paisa amortised |
| STT | on-device (free) in the app; Whisper for recordings only |
| LLM coach (≤ 6 calls × ~600 tokens on an 8B model) | ≈ ₹0.02 |
| Hosting | one small container serves thousands of concurrent calls |

**≈ ₹0.02 per protected call.** A single prevented ₹1.5-lakh digital-arrest transfer pays for ~7 million protected calls.

## 7. Competitive positioning

*"Truecaller tells you who is calling. Raksha tells you what they are doing to you — and what to say back."*

Defensibility comes from (a) the tactic-tagged playbook and the benign counter-set, which improve with every report, (b) the intervention UX validated on real people under stress, and (c) distribution through banks who now carry the liability.

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| False alarms erode trust | Benign look-alikes in the index; speaker-aware crediting; coach veto; targeted rather than generic warnings; eval with benign controls. |
| Scripts drift (new pretexts) | Semantic matching generalises across paraphrase; community intel adds variants within minutes; playbook is data, not code. |
| STT quality in noisy rooms / Indian languages | Interim fragments tolerate partial text; region-aware STT; Whisper fallback; Hinglish lines in the playbook. Roadmap: on-device Indic STT. |
| Adversarial scammers slow down or split the ask | Evidence persists across the whole call; the triad fires whenever pressure and ask co-occur, however far apart. |
| Privacy concerns from listening | On-device STT; text-only, RAM-only; opt-in reporting of caller lines only; no accounts. |
| Platform access to call audio | Android supports accessibility/call-screening APIs; telco integration via SIP for the B2B path; the web reference implementation proves the runtime. |

## 9. Roadmap

| Horizon | Milestone |
|---|---|
| Now (MVP) | Everything in §4, deployed. |
| +4 weeks | Android app with in-call audio capture; Hindi/Tamil/Telugu STT; playbook lines in 5 languages; bank "transfer hold" webhook. |
| +3 months | Hot path fully on-device with the Moss browser/mobile SDKs (custom authenticator), so no text leaves the phone at all; deepfake-voice liveness signal fused into the risk model; pilot with one bank and one senior-living network. |
| +6 months | Federated playbook: reports from partners feed a shared intel index with regional variants; regulator reporting (1930/NCRP) from the app in one tap. |

## 10. Open questions

* What is the right default for *who* can add a guardian — the protected person, or a family member during setup?
* How should the bank-side signal be priced: per protected customer, or per prevented transfer?
* Should the intervention ever auto-disconnect the call (Truecaller's family-protection can hang up remotely)? Our current stance: never without a human — the guardian or the person — in the loop.

## Appendix A — The playbook

409 lines across 31 families (17 India-specific, 8 global, 5 US, 2 UK/AU), each tagged with 1–4 of 21 tactics, a severity (1–5), a script stage and a region; 75 benign look-alikes; 26 "victim about to comply" lines. Source and methodology: [research/scam-corpus.md](research/scam-corpus.md). Data file: [`data/playbook.json`](../data/playbook.json).

## Appendix B — The tactic taxonomy

Authority · Urgency · Fear · Secrecy · Isolation · Payment demand · OTP/PIN request · Remote access · Skip verification · Too good to be true · Reciprocity · Personal-info request · Social proof · Escalation · Keep you on the line · Video-call demand · Legal threat · Account compromised · Relationship pretext · Tech pretext · You are about to comply.

Grounded in Cialdini's principles of influence, Stajano & Wilson's *seven principles* (2011), the FTC's *Four Signs of a Scam*, and I4C/RBI advisories on digital arrest.
