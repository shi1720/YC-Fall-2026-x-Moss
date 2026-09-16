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

PROJECT_NUMBER="$(gcloud projects describe "${PROJECT}" --format 'value(projectNumber)')"
REPO="raksha"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/${REPO}/raksha:$(git rev-parse --short HEAD 2>/dev/null || date +%s)"
gcloud artifacts repositories create "${REPO}" --repository-format docker --location "${REGION}" --quiet >/dev/null 2>&1 || true

# The service's own deterministic URL: the browser opens its WebSocket here even when the pages
# are served through Firebase Hosting (deploy/firebase.sh), which cannot proxy WebSockets.
RUN_URL="https://${SERVICE}-${PROJECT_NUMBER}.${REGION}.run.app"
PUBLIC_URL="$(gcloud run services describe "${SERVICE}" --region "${REGION}" --format json 2>/dev/null | python3 -c 'import json,sys
d=json.load(sys.stdin); env=d["spec"]["template"]["spec"]["containers"][0].get("env",[])
print(next((e.get("value","") for e in env if e.get("name")=="RAKSHA_PUBLIC_URL"),""))' 2>/dev/null || true)"

RUN_FLAGS=(
  --region "${REGION}" --platform managed --allow-unauthenticated
  --session-affinity --timeout 3600 --cpu 1 --memory 1Gi --concurrency 80
  --min-instances "${MIN_INSTANCES:-0}" --max-instances 3
  --set-env-vars "NODE_ENV=production,HOSTNAME=0.0.0.0,MOSS_MODEL_CACHE_DIR=/tmp/moss-models,MOSS_CACHE_PATH=/tmp/moss-cache,MOSS_EMBEDDING_INTRA_OP_THREADS=2,MOSS_PROJECT_ID=${MOSS_PROJECT_ID},MOSS_PROJECT_KEY=${MOSS_PROJECT_KEY},GROQ_API_KEY=${GROQ_API_KEY},RAKSHA_WS_ORIGIN=${RUN_URL}${PUBLIC_URL:+,RAKSHA_PUBLIC_URL=${PUBLIC_URL}}"
  --quiet
)

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1 && [[ "${BUILD_MODE:-local}" == "local" ]]; then
  # Build with the local Docker daemon (Cloud Shell has one) using YOUR credentials —
  # avoids the Cloud Build service-account permissions that fresh projects often lack.
  echo "Building ${IMAGE} with local Docker…"
  gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet
  docker build -t "${IMAGE}" .
  docker push "${IMAGE}"
  gcloud run deploy "${SERVICE}" --image "${IMAGE}" "${RUN_FLAGS[@]}"
else
  # Cloud Build path: needs the build service account to hold these roles.
  BUILD_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
  echo "Granting build roles to ${BUILD_SA}"
  for role in roles/cloudbuild.builds.builder roles/run.builder roles/artifactregistry.writer roles/storage.objectAdmin roles/logging.logWriter; do
    gcloud projects add-iam-policy-binding "${PROJECT}" --member "serviceAccount:${BUILD_SA}" --role "${role}" --quiet >/dev/null || echo "  could not grant ${role}"
  done
  sleep 10
  gcloud run deploy "${SERVICE}" --source . "${RUN_FLAGS[@]}"
fi

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
if [[ -n "${PUBLIC_URL}" ]]; then
  echo "Public URL (Firebase Hosting): ${PUBLIC_URL}"
else
  echo "Want a clean https://<name>.web.app URL? Run ./deploy/firebase.sh next."
fi
echo "Then set the GitHub repository variable DEPLOY_URL to the public URL so the keep-alive workflow pings it every 10 minutes."
