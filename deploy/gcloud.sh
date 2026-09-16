#!/usr/bin/env bash
# Deploy Raksha to Google Cloud Run with one command.
#
#   ./deploy/gcloud.sh                # uses the gcloud default project, region asia-south1 (Mumbai)
#   GCP_PROJECT=my-proj ./deploy/gcloud.sh
#
# Prerequisites (one-time): `gcloud auth login` and a project with billing enabled
# (Cloud Run's free tier covers this app; billing must merely be linked).
# Secrets are read from ./.env (MOSS_PROJECT_ID, MOSS_PROJECT_KEY, GROQ_API_KEY).
set -euo pipefail

SERVICE="${SERVICE:-raksha}"
REGION="${REGION:-asia-south1}"
PROJECT="${GCP_PROJECT:-$(gcloud config get-value project 2>/dev/null || true)}"

if [[ -z "${PROJECT}" || "${PROJECT}" == "(unset)" ]]; then
  echo "No gcloud project configured. Run:  gcloud auth login && gcloud config set project <your-project-id>" >&2
  exit 1
fi
if [[ ! -f .env ]]; then
  cat >&2 <<'MSG'
Missing ./.env. Create it with your keys, then re-run:
  MOSS_PROJECT_ID=...
  MOSS_PROJECT_KEY=...
  GROQ_API_KEY=...
MSG
  exit 1
fi
set -a; source ./.env; set +a
: "${MOSS_PROJECT_ID:?missing in .env}" "${MOSS_PROJECT_KEY:?missing in .env}" "${GROQ_API_KEY:?missing in .env}"

echo "▲ Deploying ${SERVICE} to Cloud Run — project ${PROJECT}, region ${REGION}"
gcloud config set project "${PROJECT}" >/dev/null
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --quiet

# On new projects Cloud Build runs as the default compute service account, which lacks
# the roles it needs to read the uploaded source, push the image and write logs.
PROJECT_NUMBER="$(gcloud projects describe "${PROJECT}" --format 'value(projectNumber)')"
BUILD_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
echo "Granting build roles to ${BUILD_SA}"
for role in roles/cloudbuild.builds.builder roles/run.builder roles/artifactregistry.writer roles/storage.objectAdmin roles/logging.logWriter; do
  gcloud projects add-iam-policy-binding "${PROJECT}" --member "serviceAccount:${BUILD_SA}" --role "${role}" --quiet >/dev/null 2>&1 || true
done
sleep 10  # IAM propagation

# Build with Cloud Build (no local Docker needed) and deploy in one step.
# - session affinity + 1h timeout keep WebSockets stable
# - 1 vCPU / 1 GiB fits the Moss runtime (~300 MB RSS with the model loaded)
# - min-instances 0 keeps it inside the free tier; the GitHub keep-alive ping keeps it warm
gcloud run deploy "${SERVICE}" \
  --source . \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --session-affinity \
  --timeout 3600 \
  --cpu 1 --memory 1Gi \
  --concurrency 80 \
  --min-instances "${MIN_INSTANCES:-0}" --max-instances 3 \
  --set-env-vars "NODE_ENV=production,HOSTNAME=0.0.0.0,MOSS_MODEL_CACHE_DIR=/tmp/moss-models,MOSS_CACHE_PATH=/tmp/moss-cache,MOSS_EMBEDDING_INTRA_OP_THREADS=2,MOSS_PROJECT_ID=${MOSS_PROJECT_ID},MOSS_PROJECT_KEY=${MOSS_PROJECT_KEY},GROQ_API_KEY=${GROQ_API_KEY}" \
  --quiet

URL="$(gcloud run services describe "${SERVICE}" --region "${REGION}" --format 'value(status.url)')"
echo
echo "✔ Deployed: ${URL}"
echo "  Health:   ${URL}/api/health"
echo "  Demo:     ${URL}/shield?scenario=digital-arrest"
echo
echo "Waiting for the Moss runtime to load…"
for i in $(seq 1 30); do
  if curl -fsS "${URL}/api/health" 2>/dev/null | grep -q '"mode":"moss"'; then
    echo "✔ Moss runtime is live (in-process)."; break
  fi
  sleep 5
done
echo "Next: set the GitHub repository variable DEPLOY_URL=${URL} so the keep-alive workflow pings it every 10 minutes."
