# Release verification

Date: 16 September 2026
Public app: https://raksha-app.web.app

## Automated checks

- Unit tests: 29 passed.
- End-to-end tests: 8 passed locally and 8 passed against Firebase Hosting.
- Production build, ESLint and TypeScript: passed.
- npm dependency audit after clean installation: zero reported vulnerabilities.

The end-to-end suite checks health, semantic retrieval, scam intervention with a second guardian tab, a genuine-call control, reporting after a call ends, invalid socket messages, invalid query sizes, recording type validation, mobile widths on all five pages, the live-microphone entry link, benchmark failure recovery and clearing stale search results.

## Hosted scenario replay

`node scripts/verify-hosted.mjs` sent all 264 utterances from all 18 committed scenarios through the live WebSocket server and real Moss runtime. All ten scripted scams reached danger. None of the eight genuine calls reached danger. Some genuine conversations can reach caution, so these results should not be described as zero warnings.

Initial run on the one-vCPU service during mixed verification traffic: server analysis p50 16.89 ms, p95 82.87 ms. These are server timings, not speech-to-warning or browser network timings. The final release's measurements are recorded below after rollout.

## Audio upload

A synthetic WAV containing the demo's opening sentence was submitted to the hosted recording endpoint. HTTP 200. Groq returned the correct sentence. Reported transcription latency: 409 ms. No ambient microphone audio or private recording was used.

## Known prototype boundaries

- Fixture results do not establish real-world accuracy, fairness across accents, or resistance to novel scams.
- Live microphone transcription depends on browser support, permissions and the browser vendor's speech service. Acoustic microphone input was not used in this release audit.
- A safe score is not identity verification. Raksha does not intercept or disconnect cellular calls.
- Call state is in process memory. The demo stays on one instance. Scaling out requires shared state and routing.
- Completed call records remain in RAM for up to ten minutes. Moss call-memory entries are deleted at call end. Optional community reporting shares flagged caller text and should not contain personal information.
- The public recording endpoint has an hourly demo budget. Other public API abuse protections remain suitable for a prototype, not a full production threat model.

## Submission readiness

The story, video metadata and judge instructions are included in `docs/submission`; current architecture and product requirements are in `docs/ARCHITECTURE.md` and `docs/PRD.md`. Devpost confirmed submission at https://devpost.com/software/raksha-0g1hyf. HiDevs profile completion, LinkedIn connection and hackathon registration are verified. HiDevs also saved the architecture and PRD as the current Raksha submission at 1:12 PM IST on 16 September. Final project and Dr. Agent repository submissions still await GitHub OAuth approval; see `devpost-fields.md` for current status.

## Final rollout dependency

The final rollout encountered Moss HTTP 429 with `USAGE_LIMIT_EXCEEDED` and `credit_exhausted`. The app recovered through its offline text detector. The earlier successful real-Moss replay is preserved in `hosted-moss-evaluation.json`. No fallback timing is presented as a Moss benchmark. Restoring the existing project's cloud credits is required for cloud-index startup; no additional credit purchase was made.

The supported local Moss session API was also checked. Session indexing worked, but its rank-normalized scores cannot safely replace the detector's calibrated cosine scores. The production detector was not switched to an uncalibrated scoring path.

During visual verification, generated coach advice invented an inappropriate contact source. The app now fixes the exit sentence and next action in code, while retaining model explanations. Two regression tests verify invented contact and payment instructions are not relayed. Offline guardian search now filters filler words and expands the three suggested questions, with two evidence-relevance tests.

## Final deployed revision

Cloud Run revision: `raksha-00007-9c7`, 2 vCPU, one bounded instance, behind https://raksha-app.web.app.

All eight end-to-end tests pass against the final source and hosted release. Local end-to-end runs now build the application first and refuse to reuse a potentially stale server. The suite also verifies that rejoining a guardian code does not duplicate intervention history.

The final detector replay passed all 18 scenarios and 264 utterances in disclosed offline mode: p50 0.58 ms, p95 2.13 ms. These are text-detector server timings, not Moss benchmarks. The earlier real-Moss run is recorded separately above.

Video verification: 116.76 seconds, 1920 x 1080 H.264, AAC narration, burned captions and an embedded English subtitle track. Peak audio level -1.4 dB. Key frames were visually reviewed. The narration and on-screen labels disclose fallback mode.

The public video is https://www.youtube.com/watch?v=yy0Ek4Ot_mE. YouTube reported no copyright or Community Guidelines issues, and playback was verified. GitHub CI passed for the release changes.

## Personal Moss settings release

The shared demo intentionally uses `RAKSHA_DEMO_OFFLINE=1`. Judges can connect their own funded Moss project in Settings, with optional consent to create a new playbook. Existing indexes are validated against the complete dataset and never overwritten. Credentials remain in a bounded server-memory session; community publishing is disabled for visitor projects.

Local validation: 39 unit tests, eleven E2E tests, ESLint, TypeScript and a production build pass. New tests cover session isolation, expiry, cancellation, bounded setup, credential sanitization, SDK setup and index validation, private call/guardian runtime selection, connection consent, no key storage in the browser, request origins and bounded request bodies. Browser layout checks now include Settings. A real Moss request with deliberately invalid test credentials returned the expected sanitized rejection, and disconnect restored demo mode.

Positive SDK orchestration is verified with test doubles. No newly funded visitor-project credentials were available, so a successful live BYO connection is not claimed. Earlier hosted real-Moss evidence remains separate. Hosted checks for this release are recorded after deployment.
