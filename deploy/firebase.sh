#!/usr/bin/env bash
# Put a clean https://<site>.web.app URL in front of the Cloud Run service. one command.
#
#   ./deploy/gcloud.sh      # first: the app itself, on Cloud Run
#   ./deploy/firebase.sh    # then: Firebase Hosting rewrite → Cloud Run
#
# Optional: FIREBASE_SITE=my-name (→ https://my-name.web.app); otherwise the first free one of
# raksha, raksha-shield, raksha-app, raksha-<project> is used. Re-running is safe.
#
# Firebase Hosting proxies HTTP but not WebSockets, so the script also tells the Cloud Run
# service its own URL (RAKSHA_WS_ORIGIN); the browser fetches it from /api/config and opens
# the shield socket straight against Cloud Run. Everything else goes through the .web.app CDN.
set -euo pipefail

SERVICE="${SERVICE:-raksha}"
REGION="${REGION:-asia-south1}"
PROJECT="${GCP_PROJECT:-$(gcloud config get-value project 2>/dev/null || true)}"
if [[ -z "${PROJECT}" || "${PROJECT}" == "(unset)" ]]; then
  echo "No gcloud project configured. Run:  gcloud config set project <your-project-id>" >&2; exit 1
fi

if ! command -v firebase >/dev/null 2>&1; then
  echo "Installing firebase-tools…"; npm install -g firebase-tools >/dev/null
fi
gcloud services enable firebase.googleapis.com firebasehosting.googleapis.com --project "${PROJECT}" --quiet

RUN_URL="$(gcloud run services describe "${SERVICE}" --region "${REGION}" --project "${PROJECT}" --format 'value(status.url)' 2>/dev/null || true)"
if [[ -z "${RUN_URL}" ]]; then
  echo "Cloud Run service '${SERVICE}' not found in ${REGION}. Run ./deploy/gcloud.sh first." >&2; exit 1
fi

fb() { firebase --non-interactive --project "${PROJECT}" "$@"; }

echo "▲ Firebase Hosting for ${SERVICE} (${RUN_URL}). project ${PROJECT}"
# Is the CLI signed in? (Cloud Shell's default credentials usually work; otherwise log in.)
if ! projects="$(fb projects:list --json 2>&1)"; then
  echo "${projects}" >&2
  echo "Firebase CLI is not authenticated. Run:  firebase login --no-localhost   then re-run." >&2
  exit 1
fi
# Attach Firebase to the GCP project once.
if ! grep -q "\"projectId\": *\"${PROJECT}\"" <<<"${projects}"; then
  echo "Adding Firebase to project ${PROJECT}…"
  fb projects:addfirebase "${PROJECT}" >/dev/null
fi

# Pick / create the site (site IDs are global; the id is the subdomain).
existing="$(fb hosting:sites:list --json 2>/dev/null | grep -o '"name": *"[^"]*"' | sed 's#.*/##; s#"##g' || true)"
SITE=""
for cand in ${FIREBASE_SITE:-} raksha raksha-shield raksha-app "raksha-${PROJECT}"; do
  [[ -z "${cand}" ]] && continue
  if grep -qx "${cand}" <<<"${existing}"; then SITE="${cand}"; break; fi
  if fb hosting:sites:create "${cand}" >/dev/null 2>&1; then SITE="${cand}"; break; fi
  echo "  ${cand}.web.app is taken, trying the next name…"
done
[[ -n "${SITE}" ]] || { echo "Could not create a hosting site; set FIREBASE_SITE=<unique-name> and re-run." >&2; exit 1; }
SITE_URL="https://${SITE}.web.app"

# Point the "raksha" hosting target in firebase.json at that site (.firebaserc is git-ignored).
cat > .firebaserc <<JSON
{ "projects": { "default": "${PROJECT}" }, "targets": { "${PROJECT}": { "hosting": { "raksha": ["${SITE}"] } } } }
JSON

# Keep firebase.json's rewrite in step with the service/region actually deployed.
if [[ "${SERVICE}" != "raksha" || "${REGION}" != "asia-south1" ]]; then
  sed -i "s#\"serviceId\": \"[^\"]*\"#\"serviceId\": \"${SERVICE}\"#; s#\"region\": \"[^\"]*\"#\"region\": \"${REGION}\"#" firebase.json
fi

# Tell Cloud Run its own URL (for the WebSocket) and its public URL (for share links).
gcloud run services update "${SERVICE}" --region "${REGION}" --project "${PROJECT}" --quiet \
  --update-env-vars "RAKSHA_WS_ORIGIN=${RUN_URL},RAKSHA_PUBLIC_URL=${SITE_URL}" >/dev/null

fb deploy --only "hosting:raksha"

echo
echo "✔ Live: ${SITE_URL}"
echo "  Health: ${SITE_URL}/api/health"
echo "  Demo:   ${SITE_URL}/shield?scenario=digital-arrest"
for i in $(seq 1 12); do
  if curl -fsS "${SITE_URL}/api/health" 2>/dev/null | grep -q '"mode":"moss"'; then echo "✔ Serving through Firebase Hosting → Cloud Run."; break; fi
  sleep 5
done
echo "Next: set the GitHub repository variable DEPLOY_URL=${SITE_URL} (keep-alive ping), and use ${SITE_URL} in the submission."
