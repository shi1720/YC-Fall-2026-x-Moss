# Submission checklist (for Shivam)

Deadline: **20 Sep 2026, 11:59 PM IST** (Devpost). Everything below is ready in the repo unless marked ☐.

## Required by Devpost

| Item | Where | Status |
|---|---|---|
| Architecture diagram | `docs/diagrams/architecture.png` (SVG source alongside; also in README and deck) | ✅ |
| PRD | `docs/PRD.md` · PDF: `docs/pdf/Raksha-PRD.pdf` | ✅ |
| GitHub repository | https://github.com/shi1720/YC-Fall-2026-x-Moss (merge the branch to `main` before submitting) | ☐ merge |
| Deployed link of the agent | Render free web service (see *Deploy* below) | ☐ needs Render account |
| Video demo | Record with `docs/VIDEO_SCRIPT.md` (3-minute cut + 60-second teaser); upload to YouTube (unlisted is fine) | ☐ record |
| Submission text | `docs/DEVPOST.md` — paste each section into the Devpost form; update the deployed URL and video link | ☐ paste |
| Pitch deck (optional, strongly recommended) | `docs/deck/Raksha-Pitch.pptx` and `.pdf` | ✅ |

## Deploy (free, ≈ 10 minutes)

Hugging Face now requires a PRO plan for Docker Spaces, so pick one of these. The app is a single Docker image (`Dockerfile`); it needs ~300 MB RAM with the model loaded and benefits from a real CPU core for the embedding step.

| Host | Cost | CPU for the embedding step | What Claude needs from you |
|---|---|---|---|
| **Railway** (recommended) | $5 one-time trial credit, no card, lasts through judging | full shared vCPU → ~10–20 ms per fragment | Sign in at https://railway.com with GitHub → Account settings → Tokens → create an *account token*; send it. `railway.json` is in the repo. |
| **Render** | free forever, no card | 0.1 vCPU → ~100 ms per fragment (still in-process, but slower numbers in the Latency lab) | Sign in at https://dashboard.render.com with GitHub → Account settings → API Keys; plus the workspace ID (`tea-…`) from Workspace settings. `render.yaml` is in the repo. Or click New → Blueprint yourself and add the three secrets. |
| **Google Cloud Run** | free tier (card on file) | 1 vCPU while serving → fastest | A GCP project with billing enabled and a service-account key with Cloud Run + Artifact Registry roles. |

After deploy:
1. Open the URL: the shield header should read **Moss · in-process** and `/api/health` should show `"mode":"moss"`.
2. GitHub → Settings → Secrets and variables → Actions → Variables: `DEPLOY_URL` = the URL. The *Keep the deployed shield warm* workflow pings it every 10 minutes.
3. Paste the URL into `docs/DEVPOST.md`, the README, and the Devpost form.

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
