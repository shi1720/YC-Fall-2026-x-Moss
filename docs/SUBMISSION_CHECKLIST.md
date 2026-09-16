# Submission checklist (for Shivam)

Deadline: **20 Sep 2026, 11:59 PM IST** (Devpost). Everything below is ready in the repo unless marked ☐.

## Required by Devpost

| Item | Where | Status |
|---|---|---|
| Architecture diagram | `docs/diagrams/architecture.png` (SVG source alongside; also in README and deck) | ✅ |
| PRD | `docs/PRD.md` · PDF: `docs/pdf/Raksha-PRD.pdf` | ✅ |
| GitHub repository | https://github.com/shi1720/YC-Fall-2026-x-Moss (merge the branch to `main` before submitting) | ☐ merge |
| Deployed link of the agent | Google Cloud Run via `./deploy/gcloud.sh` (see *Deploy* below) | ☐ run the script |
| Video demo | Record with `docs/VIDEO_SCRIPT.md` (3-minute cut + 60-second teaser); upload to YouTube (unlisted is fine) | ☐ record |
| Submission text | `docs/DEVPOST.md` — paste each section into the Devpost form; update the deployed URL and video link | ☐ paste |
| Pitch deck (optional, strongly recommended) | `docs/deck/Raksha-Pitch.pptx` and `.pdf` | ✅ |

## Deploy (Google Cloud Run, one command)

```bash
git clone https://github.com/shi1720/YC-Fall-2026-x-Moss.git && cd YC-Fall-2026-x-Moss
printf 'MOSS_PROJECT_ID=...\nMOSS_PROJECT_KEY=...\nGROQ_API_KEY=...\n' > .env   # the three keys
gcloud auth login && gcloud config set project <your-project-id>            # once; billing must be linked
./deploy/gcloud.sh
```

The script prints the URL and waits until `/api/health` reports `"mode":"moss"`. Then:
1. GitHub → Settings → Secrets and variables → Actions → Variables: `DEPLOY_URL` = the URL (keep-alive ping every 10 minutes).
2. Send the URL to Claude to fold into the README, Devpost text and deck, or paste it yourself.

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
