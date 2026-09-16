# Deploying Raksha

## Google Cloud Run (recommended, one command)

```bash
gcloud auth login && gcloud config set project <your-project-id>   # once
./deploy/gcloud.sh
```

The script enables the APIs, builds the Docker image (with your local Docker daemon when one exists, e.g. in Cloud Shell; otherwise with Cloud Build), pushes it to Artifact Registry, deploys to `asia-south1` with WebSocket-friendly settings (session affinity, 1-hour timeout, 1 vCPU / 1 GiB), injects the three keys from `./.env`, and prints the URL once the Moss runtime reports `"mode":"moss"`.

Options: `REGION=us-central1`, `SERVICE=raksha-demo`, `MIN_INSTANCES=1` (no cold starts, small idle cost), `BUILD_MODE=cloud` to force Cloud Build.

Then set the GitHub repository variable `DEPLOY_URL` to the printed URL so `.github/workflows/keepalive.yml` pings it every 10 minutes.

## Any Docker host

```bash
docker build -t raksha .
docker run -p 8080:8080 -e PORT=8080 --env-file .env raksha
```

`render.yaml` (Render Blueprint) and `railway.json` are also included.
