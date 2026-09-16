#!/usr/bin/env bash
# Rebuild and update an existing Raksha deployment without re-entering its secrets.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PROJECT="${GCP_PROJECT:-$(gcloud config get-value project 2>/dev/null)}"
REGION="${REGION:-asia-south1}"
SERVICE="${SERVICE:-raksha}"
[[ -n "$PROJECT" && "$PROJECT" != '(unset)' ]] || { echo 'Set GCP_PROJECT first.' >&2; exit 1; }
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm run test:e2e
IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/raksha/raksha:$(git rev-parse --short HEAD)-$(date +%s)"
# Uses existing Cloud Build permissions. No source code or keys are passed in environment arguments.
gcloud builds submit --project "$PROJECT" --tag "$IMAGE" .
# A single instance keeps the protected phone and guardian in the same in-memory call manager.
gcloud run deploy "$SERVICE" --project "$PROJECT" --region "$REGION" --image "$IMAGE" \
  --cpu 2 --max-instances 1 --session-affinity --timeout 3600 --quiet
URL="$(gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format='value(status.url)')"
curl --fail --retry 8 --retry-delay 5 "$URL/api/health"
echo
printf 'Updated Cloud Run: %s\nFirebase URL: https://raksha-app.web.app\n' "$URL"
