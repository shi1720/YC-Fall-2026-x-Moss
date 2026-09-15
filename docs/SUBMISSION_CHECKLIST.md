# Submission checklist (for Shivam)

Deadline: **20 Sep 2026, 11:59 PM IST** (Devpost). Everything below is ready in the repo unless marked ☐.

## Required by Devpost

| Item | Where | Status |
|---|---|---|
| Architecture diagram | `docs/diagrams/architecture.png` (SVG source alongside; also in README and deck) | ✅ |
| PRD | `docs/PRD.md` · PDF: `docs/pdf/Raksha-PRD.pdf` | ✅ |
| GitHub repository | https://github.com/shi1720/YC-Fall-2026-x-Moss (merge the branch to `main` before submitting) | ☐ merge |
| Deployed link of the agent | Hugging Face Space (see *Deploy* below) | ☐ needs keys |
| Video demo | Record with `docs/VIDEO_SCRIPT.md` (3-minute cut + 60-second teaser); upload to YouTube (unlisted is fine) | ☐ record |
| Submission text | `docs/DEVPOST.md` — paste each section into the Devpost form; update the deployed URL and video link | ☐ paste |
| Pitch deck (optional, strongly recommended) | `docs/deck/Raksha-Pitch.pptx` and `.pdf` | ✅ |

## Deploy (≈ 10 minutes, all free tiers)

1. **Moss**: portal.usemoss.dev → create project → copy Project ID → API Keys → create key.
2. **Groq**: console.groq.com → API Keys → create.
3. **Hugging Face**: huggingface.co/new-space → name `raksha`, SDK **Docker**, hardware **CPU basic (free)**, visibility public. Then *Settings → Variables and secrets* → add secrets `MOSS_PROJECT_ID`, `MOSS_PROJECT_KEY`, `GROQ_API_KEY`.
4. **Seed the index once** from your laptop (or let Claude do it): `npm run moss:seed` with the same two Moss variables in `.env`.
5. **GitHub → Settings → Secrets and variables → Actions**: secret `HF_TOKEN` (write token), variables `HF_SPACE` = `<your-hf-username>/raksha`, `DEPLOY_URL` = `https://<your-hf-username>-raksha.hf.space`.
6. Merge to `main`. The *Deploy to Hugging Face Space* workflow pushes the code; the Space builds the Docker image (~5 min). The *Keep the deployed shield warm* workflow pings it every 30 minutes.
7. Open the Space URL → the shield header should read **Moss · in-process** (not "offline fallback"). Run `/lab` once and `npm run eval` locally with Moss credentials, then commit the regenerated `docs/eval/` so the numbers in the README, lab and deck reflect the real runtime.

## Before you record the video

* Chrome, 125% zoom, system audio captured (the simulation voices and the shield's spoken intervention matter).
* Two windows side by side: `/shield?scenario=digital-arrest` and the guardian link from the *Circle of trust* card.
* Follow the shot list in `docs/VIDEO_SCRIPT.md`; the *"Say this"* overlay is the emotional peak — hold on it.

## Judging rubric — where each criterion is answered

| Criterion | Evidence |
|---|---|
| Product & UX — real problem, compelling experience | Landing story + stats; the intervention overlay (one headline, one sentence, one action, spoken); guardian circle; nine playable scenarios |
| Technical execution — architecture & AI pipeline | `docs/ARCHITECTURE.md`; fast/slow path; unit-tested risk engine; e2e tests; Dockerised single process; offline fallback |
| Speed & latency — Moss used effectively | In-process loaded index on every fragment; sessions per call; auto-refresh hot-swap; multi-index; Latency lab measured live; eval report |
| Demo & presentation | Video script; deck; README demo scripts; `?scenario=…&fast=1&silent=1` judge links |
