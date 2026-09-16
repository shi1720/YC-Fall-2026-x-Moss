# Raksha product requirements

## Purpose and users

Give someone a moment to pause before a scam becomes a loss. Raksha identifies recognised pressure tactics, explains the evidence and helps the person reach someone they trust.

Initial users are people seeking help recognising scam-call tactics, family members acting as guardians, and evaluators exploring fast retrieval. Testing with older adults and families outside the development team is future work.

Live app: https://raksha-app.web.app

This document describes the shipped browser prototype. Commercial pricing, partner integrations, native call interception and broad real-world effectiveness have not been validated or implemented.

## Implemented experience

| Surface | User capability |
|---|---|
| Landing | Understand the idea, see runtime status and start without an account |
| Shield | Run 18 guided scenarios, use supported browser speech recognition, or upload a short recording |
| Intervention | Inspect tactics and transcript evidence, a sentence to say and a safe next step |
| Guardian | Join through a family-code link, follow the current call, send a message and query its context |
| Playbook | Explore and search the curated 409-line corpus |
| Latency lab | Compare timing categories against the active engine |
| Reporting | Explicitly share flagged caller lines as community knowledge when Moss is available |

The app cannot directly intercept cellular calls or hang up automatically. The person supplies a simulation, microphone input or recording. A safe score means no recognised concerning pattern was found, not that the caller is verified.

## Core requirements

| ID | Requirement | Status |
|---|---|---|
| F1 | Validate and analyse supported transcript fragments | Implemented |
| F2 | Retrieve playbook evidence through in-process Moss | Implemented and previously hosted-tested; currently blocked by exhausted Moss credits |
| F3 | Combine tactics, benign look-alikes and speaker context into explainable risk | Implemented with deterministic scoring |
| F4 | Display and optionally speak targeted guidance | Implemented; silent mode suppresses speech |
| F5 | Keep optional LLM coaching outside the detection path | Implemented with template fallback |
| F6 | Share guardian context and recover from reconnects | Implemented on the single-instance deployment |
| F7 | Query call-specific memory without mixing calls | Implemented; fallback supports lexical recall |
| F8 | Offer scam and genuine guided scenarios | 18 implemented |
| F9 | Validate bounded audio uploads and report provider failures clearly | Implemented with budgets and timeouts |
| F10 | Require an explicit action for community reporting | Implemented; cloud updates depend on Moss availability |
| F11 | Identify the active engine and separate timing categories | Implemented |
| F12 | Support mobile layouts and error recovery | E2E checks and visual review at 390 px |

## Judge walkthrough

1. Open the [digital-arrest simulation](https://raksha-app.web.app/shield?scenario=digital-arrest&silent=1&fast=1), wait for Connected and start the call.
2. Inspect the risk evidence and intervention, then end the call.
3. Open the Circle of trust guardian link in another tab, start a call, send a message and ask what the caller requested.
4. Try a genuine scenario and compare its evidence and risk.
5. Search the Playbook and run a small Latency lab benchmark. Check the engine label before interpreting measurements.

Full steps, microphone/recording instructions and runtime notes: [testing.md](submission/testing.md).

## Acceptance evidence

- 29 unit tests pass. Eight browser E2E tests passed against a freshly built local app and the final hosted revision.
- Eighteen scripted calls cover 264 utterances. All 10 scam fixtures reached danger. None of the 8 genuine fixtures reached danger, though some can reach caution. This is not a real-world accuracy claim.
- Call startup, end-state handling, guardian messages and reconnects, malformed input, scenarios, mobile navigation and recovery were checked.
- A synthetic recording was transcribed through the hosted endpoint. This does not establish acoustic microphone quality across devices and accents.
- The lab separates search, embedding plus search, server analysis and browser round-trip timing. Fallback timings are not Moss benchmarks.

See [verification.md](submission/verification.md) for conditions and limits. Passing these checks does not establish flawless operation under every real-world condition.

## Privacy and reliability

Live transcripts reach Raksha; browser speech services may process audio. Uploaded recordings go through Raksha to Groq. Optional coaching sends transcript context to the configured model provider. Raksha does not write recordings to disk. Completed call records remain in RAM up to ten minutes. Community reporting is a separate explicit action.

Family-code links are capability tokens, not signed invitations or verified identities. They should be shared only with trusted people. The current demo uses one Cloud Run instance because call and guardian state are in memory. Restarts lose that state. Multiple instances require a routing/state design first.

Resource bounds and fallbacks improve resilience, but browser speech, model and cloud retrieval services can fail. The UI must disclose the active retrieval mode and show actionable errors.

## Current release limitation

Moss credits were exhausted during final rollout on 16 September 2026. The app currently runs its disclosed offline TF-IDF detector and retries the real runtime automatically. The video and submission disclose this condition. Restoring credits is required for judges to exercise the intended semantic retrieval mode.

## Next measurements and roadmap

1. Restore Moss credits and recheck the hosted Moss path.
2. Evaluate consented conversations beyond fixtures, false danger/caution alerts, warning timing, comprehension and guardian usefulness.
3. Test with older adults and families, and measure speech quality across supported devices, accents and languages.
4. Add signed guardian invitations, stronger abuse controls and moderation for community reports.
5. Introduce shared routing and state before enabling multiple instances.
6. Evaluate Hindi and other Indian languages, on-device speech and native phone integration separately.

Family, banking and telecom distribution are hypotheses for later discovery. No partner pilots, prevented-loss totals, revenue results or commercial deployment claims are made for this prototype.
