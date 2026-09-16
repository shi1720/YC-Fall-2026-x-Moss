<p align="center">
  <img src="src/app/icon.svg" width="72" alt="Raksha" />
</p>

<h1 align="center">Raksha. the real-time scam-call shield</h1>

<p align="center">
  <em>Every scam follows a script. Now your phone knows the script.</em><br/>
  A second listener for scam calls, built around <a href="https://moss.dev">Moss</a> retrieval.
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="docs/PRD.md">PRD</a> ·
  <a href="docs/ARCHITECTURE.md">Architecture</a> ·
  <a href="docs/eval/REPORT.md">Evaluation</a> ·
  <a href="docs/PRIVACY.md">Privacy</a> ·
  <a href="docs/VIDEO_SCRIPT.md">Video script</a> ·
  <a href="docs/DEVPOST.md">Submission</a>
</p>

---

Built for the **YC Fall 2026 × Moss: Zero Latency Builder Sprint** (theme: Real-Time Voice & Conversational AI, inspired by YC's *"Proving you're human"* and *"AI for the aging population"* requests). By **Shivam Gupta**, with Claude.

> **Live:** https://raksha-app.web.app. try [the digital-arrest scenario](https://raksha-app.web.app/shield?scenario=digital-arrest) · [health](https://raksha-app.web.app/api/health)

**Current runtime:** the shared demo intentionally uses an offline TF-IDF detector. Connect your own funded Moss project in [Settings](https://raksha-app.web.app/settings) to test live semantic retrieval. Demo timings are not Moss benchmarks.

**Release verification:** 29 unit tests, 8 E2E tests against both local and hosted builds, and 18 scripted calls covering 264 utterances. All 10 scam fixtures reached danger; none of the 8 genuine fixtures reached danger. Some genuine calls can reach caution. These are fixture results, not real-world accuracy claims. Earlier real-Moss and final fallback measurements are documented separately in [release verification](docs/submission/verification.md). Historical development measurements remain in [the evaluation report](docs/eval/REPORT.md).

[Submitted Devpost project](https://devpost.com/software/raksha-0g1hyf) · [Narrated demo with captions](https://www.youtube.com/watch?v=yy0Ek4Ot_mE)

## The problem

A scam caller can combine authority, fear, urgency and isolation before asking for money, a code or device access. Someone under pressure needs a clear action and a trusted person. Raksha explores how transcript evidence and fast retrieval can help at that moment.

## What Raksha does

Raksha checks supported transcript fragments against a curated playbook, explains recognised pressure tactics and offers words to end the call. A connected guardian can follow the same evidence and send a message. The browser prototype uses simulations, microphone input or uploaded recordings. It does not intercept cellular calls, hang up automatically or guarantee that a risky action will be prevented.

| | |
|---|---|
| ![Shield](docs/screenshots/shield-intervention.png) | ![Guardian](docs/screenshots/guardian.png) |
| **The shield** explains a detected tactic and gives one sentence to say. | **The guardian** follows the call, sends a message through the shield and searches its context. |

* **Detection path:** Moss loads a 409-line playbook for in-process embedding and search. A deterministic engine credits tactics and recognised benign look-alikes to compute safe, caution or danger. The disclosed TF-IDF fallback is active when Moss cannot load.
* **Asynchronous coaching:** an optional model explains the evidence outside the detection path. Exit sentences and safe next steps are fixed in code; template guidance remains available on provider failure.
* **Circle of trust:** a family code links a phone to a guardian's dashboard. Human and agent share the same call session.
* **Community intel:** report a call and its flagged lines are upserted into a second Moss index; every running shield hot-swaps it in. New scam variants propagate without a redeploy.
* **Three ways to try it:** replay one of eighteen scripted calls (ten scams, eight genuine) with two synthetic voices, use your own microphone (phone on speaker), or upload a recording (transcribed by Whisper).
* **Privacy, precisely:** live speech recognition can use the browser vendor's speech service. Raksha receives the resulting transcript and retains completed call records in RAM for up to ten minutes. Uploaded recordings pass through Raksha to Groq transcription and are not written to disk by Raksha. Optional coaching sends transcript context to the model provider. Community reports explicitly share flagged caller lines with Moss Cloud. See the [privacy details](docs/PRIVACY.md) before using personal conversations.

## How Moss is used

| Moss capability | In Raksha |
|---|---|
| Loaded index, in-process query (`loadIndex`, `query`, `alpha: 1.0`) | The hot path. Raw cosine scores calibrated into tactic confidence. |
| Auto-refresh hot-swap (`autoRefresh`) | Playbook and community intel stay fresh with zero query downtime. |
| Sessions (`client.session`, `addDocs`, `query` + metadata filter, `deleteDocs`) | One local session per process holds every live call's turns tagged by call id; the guardian asks it questions; a call's turns are deleted at call end. Never pushed. |
| Multi-index search (`queryMultiIndex`) | Curated playbook + community intel, one global top-K. |
| Metadata filtering fields | `family`, `tactics`, `severity`, `kind` (tactic / benign look-alike), `stage`, `region`. |

Measured on the committed evaluation (18 full call transcripts): see [docs/eval/REPORT.md](docs/eval/REPORT.md) and `npm run eval:bench` (writes `docs/eval/latency.json` with hardware details). The **Latency lab** page benchmarks the running instance live.

![Architecture](docs/diagrams/architecture.png)

Read the full [architecture document](docs/ARCHITECTURE.md).

## Quick start

```bash
git clone https://github.com/shi1720/YC-Fall-2026-x-Moss.git raksha && cd raksha
npm install
cp deploy/env.example .env            # add MOSS_PROJECT_ID, MOSS_PROJECT_KEY, GROQ_API_KEY
npm run moss:seed               # builds the "raksha-playbook" index in Moss Cloud (once)
npm run dev                     # http://localhost:3000
```

Without Moss credentials the app still runs, on an offline lexical fallback (so CI and forks work). the UI says so. Without a Groq key the coach uses templates.

| Script | What it does |
|---|---|
| `npm run dev` | Custom server (Next.js + WebSocket) with hot reload |
| `npm run build && npm start` | Production build and server (what the Docker image runs) |
| `npm run moss:seed [-- --reset]` | Create / upsert the playbook index from `data/playbook.json` |
| `npm run moss:status` | List indexes in the Moss project |
| `npm run eval` · `npm run eval:bench` | Replay all scenarios through the engine → `docs/eval/REPORT.md` · retrieval latency benchmark → `docs/eval/latency.json` |
| `npm test` · `npm run test:e2e` | Unit tests (vitest) · end-to-end (Playwright, offline runtime) |
| `npm run lint` · `npm run typecheck` | ESLint · `tsc --noEmit` |

### Environment

| Variable | Purpose |
|---|---|
| `MOSS_PROJECT_ID`, `MOSS_PROJECT_KEY` | Moss credentials (server only). From the [Moss portal](https://portal.usemoss.dev). |
| `MOSS_INDEX_PLAYBOOK`, `MOSS_INDEX_INTEL` | Index names (defaults `raksha-playbook`, `raksha-intel`). |
| `MOSS_REFRESH_SECONDS` | Auto-refresh polling interval (default 120). |
| `GROQ_API_KEY` | LLM coach + Whisper transcription (free tier). Any OpenAI-compatible endpoint works via `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`. |
| `RAKSHA_SCORE_FLOOR`, `RAKSHA_SCORE_CEIL`, `RAKSHA_ALPHA`, `RAKSHA_TOPK` | Retrieval calibration knobs (tuned by `npm run eval`). |

### Deploy

Use `./deploy/gcloud.sh`, then `./deploy/firebase.sh` for a clean `*.web.app` URL. Use `./deploy/update.sh` for the documented update flow. See [deployment instructions](deploy/README.md). The public demo is capped at one Cloud Run instance because calls and guardian state are in RAM. A restart loses that state; cold starts remain possible.

## Repository

```
server/          custom Next.js + WebSocket server
src/app/         pages (/, /shield, /guardian, /playbook, /lab) and /api routes
src/lib/engine/  risk engine, call manager, retriever interface, offline fallback
src/lib/moss/    Moss runtime, retriever, community intel
src/lib/llm/     coach (provider-agnostic chat client)
data/            playbook.json (409 lines, 31 scam families), 18 scenario transcripts
scripts/         seed / status / eval / build
tests/           unit + e2e
docs/            PRD, architecture, privacy, evaluation, research, video script, deck
```

## Demo scripts (for judges)

* **60 seconds:** open `/shield?scenario=digital-arrest`, voices on, *Start the call*. Watch the dial, the tactic chips on each line, and the intervention at the first "ask". Click *Keep listening* to see the targeted "Do NOT transfer" warnings.
* **Multiplayer:** copy the guardian link from the shield page into a second window before starting. Send a message from the guardian; it is spoken on the shield. Ask "what money did they ask for?".
* **Latency:** open `/lab`, run 5 × 10 queries. Open `/playbook` and type anything a scammer might say.
* **Robustness:** run a genuine-call scenario and inspect its benign evidence. The committed genuine fixtures do not reach danger; some can reach caution. A safe result does not verify the caller's identity.

## Credits

Built by **Shivam Gupta** with Claude for the YC Fall 2026 × Moss Zero Latency Builder Sprint. Scam playbook lines are paraphrased from public advisories (I4C, RBI, TRAI, FTC, FBI IC3, Action Fraud, Scamwatch) and news reconstructions; they are not verbatim quotes of any victim's call. If you or someone you know is on such a call in India: hang up and call **1930** or report at [cybercrime.gov.in](https://cybercrime.gov.in).

License: MIT.


## Release verification and submission

The release adds validated socket messages, bounded inputs, explicit reporting consent, reliable call startup, post-call reporting, connection-loss recovery, speech cancellation recovery and responsive layouts. Local verification: 29 unit tests, 8 end-to-end tests, lint, typecheck and a production build. Hosted verification is documented in `docs/submission/verification.md`.

The public demo is deliberately limited to one Cloud Run instance because call and guardian state lives in process memory. Session affinity alone does not share that state between instances. Horizontal scaling needs shared state and routing.

- [Project story](docs/submission/story.md)
- [Judge testing instructions](docs/submission/testing.md)
- [Video title and description](docs/submission/youtube.md)
- [Judging evidence](docs/submission/checklist.md)

A safe score means no recognised scam pattern, not that a caller is verified. Scripted fixtures are not a real-world accuracy study. See [privacy](docs/PRIVACY.md) for audio providers, in-memory retention and opt-in community sharing.

### Current hosted service status

The release is live at https://raksha-app.web.app. No shared credit top-up is required: judges can connect a funded personal Moss project in Settings. The guided demo remains available without a key. See [release verification](docs/submission/verification.md) for evidence and verification limits.

Demo with narration and captions: https://www.youtube.com/watch?v=yy0Ek4Ot_mE

## Test with your own Moss project

Open [Moss settings](https://raksha-app.web.app/settings). Enter your project ID and project API key, select an existing current Raksha playbook or explicitly create a new one, and wait for the connected state. Creating a playbook uploads the 409 curated lines and may consume your own project credits. Keys are used only for a temporary server-memory session, lasting up to 30 minutes or until disconnect or restart. A session cookie connects this browser to its private runtime. Existing indexes are never overwritten; created cloud indexes remain after disconnect.

Shield calls, guardian recall, Playbook search and the Lab then use that runtime. Personal sessions cannot publish community reports. The shared demo intentionally stays in offline mode via `RAKSHA_DEMO_OFFLINE=1`; no shared credit top-up is required. Full steps and current verification limits are in [testing instructions](docs/submission/testing.md).
