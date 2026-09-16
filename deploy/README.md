# Deploying Raksha

## Google Cloud Run (recommended, one command)

```bash
gcloud auth login && gcloud config set project <your-project-id>   # once
./deploy/gcloud.sh
```

The script enables the APIs, builds the Docker image (with your local Docker daemon when one exists, e.g. in Cloud Shell; otherwise with Cloud Build), pushes it to Artifact Registry, deploys to `asia-south1` with WebSocket-friendly settings (session affinity, 1-hour timeout, 2 vCPU / 1 GiB), injects the three keys from `./.env`, and prints the URL once the Moss runtime reports `"mode":"moss"`.

Options: `REGION=us-central1`, `SERVICE=raksha-demo`, `MIN_INSTANCES=1` (no cold starts, small idle cost), `BUILD_MODE=cloud` to force Cloud Build.

## Clean URL with Firebase Hosting (optional, one command)

```bash
./deploy/firebase.sh                      # → https://raksha.web.app (first free of raksha, raksha-shield, raksha-app, raksha-<project>)
FIREBASE_SITE=my-name ./deploy/firebase.sh  # → https://my-name.web.app
```

Firebase Hosting rewrites every path to the Cloud Run service (`firebase.json`) and serves `/_next/static` from its CDN. Hosting cannot proxy WebSockets, so the script sets `RAKSHA_WS_ORIGIN` on the service; the browser reads it from `/api/config` and opens the shield socket directly against Cloud Run. Needs the Firebase CLI (pre-installed in Cloud Shell; `firebase login --no-localhost` if it asks).

Then set the GitHub repository variable `DEPLOY_URL` to the public URL so `.github/workflows/keepalive.yml` pings it every 10 minutes.

## Any Docker host

```bash
docker build -t raksha .
docker run -p 8080:8080 -e PORT=8080 --env-file .env raksha
```

`render.yaml` (Render Blueprint) and `railway.json` are also included.

## Update the existing public demo

Use `GCP_PROJECT=epilogue-508616 ./deploy/update.sh` after authenticating gcloud. It checks the source, builds a new container and updates the existing service while preserving its environment configuration. Source archives exclude local credentials and generated media. Install the Playwright Chromium runtime with `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM` to an installed Chrome executable.

The stable public address is https://raksha-app.web.app. Firebase already forwards requests to the Raksha service, so an app-only container update does not require a second Hosting release.

Keep this in-memory demo at one instance. Session affinity does not guarantee that independently opened phone and guardian connections will land on the same instance when the service scales out.
