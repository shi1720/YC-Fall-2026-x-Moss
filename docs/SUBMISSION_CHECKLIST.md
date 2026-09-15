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

## Deploy (≈ 10 minutes, free, no card)

Hugging Face now requires a PRO plan for Docker Spaces, so the reference host is **Render** (free web service, 512 MB; Raksha needs ~300 MB with the model loaded).

1. **Moss** (done): the `raksha-playbook` index is seeded in project `9eb21c80…`.
2. **Render**: sign in at https://dashboard.render.com with GitHub (no card). Then either
   * *Option A — let Claude do it:* Account settings → API Keys → create key; Workspace settings → copy the workspace/owner ID (starts with `tea-`). Send both; the service is created via the API with `render.yaml` settings and the three secrets.
   * *Option B — click-through:* New → Blueprint → select `shi1720/YC-Fall-2026-x-Moss` (`main`) → Apply. Then in the service's *Environment* tab add `MOSS_PROJECT_ID`, `MOSS_PROJECT_KEY`, `GROQ_API_KEY`.
3. First build takes ~6 minutes. Open the service URL: the shield header should read **Moss · in-process**.
4. **GitHub → Settings → Secrets and variables → Actions → Variables**: `DEPLOY_URL` = the Render URL. The *Keep the deployed shield warm* workflow then pings it every 10 minutes so it never spins down (Render free sleeps after 15 idle minutes).
5. Paste the URL into `docs/DEVPOST.md` and the Devpost form.

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
