#!/usr/bin/env bash
# Pull pre-built images and restart the NutriFit stack on a VPS.
# Requires IMAGE_REGISTRY, IMAGE_TAG, and DEPLOY_PATH to be set.

set -euo pipefail

: "${IMAGE_REGISTRY:?IMAGE_REGISTRY is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"
: "${DEPLOY_PATH:?DEPLOY_PATH is required}"

COMPOSE_FILES=(-f docker-compose.yml -f docker-compose.prod.yml)
APP_SERVICES=(main-api ml-api frontend)

cd "$DEPLOY_PATH"

echo "Deploying ${IMAGE_REGISTRY}/*:${IMAGE_TAG} from ${DEPLOY_PATH}"

docker compose "${COMPOSE_FILES[@]}" pull "${APP_SERVICES[@]}"
docker compose "${COMPOSE_FILES[@]}" up -d --no-build "${APP_SERVICES[@]}"

echo "Waiting for main-api health check..."
for attempt in $(seq 1 30); do
  if docker compose "${COMPOSE_FILES[@]}" exec -T main-api curl -sf http://localhost:8080/health > /dev/null; then
    echo "main-api is healthy"
    docker compose "${COMPOSE_FILES[@]}" ps
    exit 0
  fi
  sleep 5
done

echo "main-api failed to become healthy within 150 seconds" >&2
docker compose "${COMPOSE_FILES[@]}" ps
docker compose "${COMPOSE_FILES[@]}" logs --tail=50 main-api >&2
exit 1
