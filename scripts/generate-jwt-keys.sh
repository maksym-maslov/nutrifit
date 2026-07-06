#!/usr/bin/env bash
# Generate RSA key pair for JWT signing (main-api).
# Run once before the first `docker compose up` or local Spring Boot run.
#
# Keys are written to certs/jwt/ and copied into
# services/main-api/src/main/resources/certs/ for non-Docker development.
# In Docker, keys are mounted from certs/jwt/ at runtime (not baked into the JAR).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
JWT_DIR="$PROJECT_ROOT/certs/jwt"
RESOURCES_CERT_DIR="$PROJECT_ROOT/services/main-api/src/main/resources/certs"

FORCE=false
if [[ "${1:-}" == "--force" ]]; then
  FORCE=true
fi

if [[ -f "$JWT_DIR/private.pem" || -f "$JWT_DIR/public.pem" ]] && [[ "$FORCE" != "true" ]]; then
  echo "JWT keys already exist in $JWT_DIR"
  echo "Use --force to overwrite (this invalidates all active sessions)."
  exit 1
fi

mkdir -p "$JWT_DIR" "$RESOURCES_CERT_DIR"

openssl genpkey -algorithm RSA -out "$JWT_DIR/private.pem" -pkeyopt rsa_keygen_bits:2048
openssl rsa -in "$JWT_DIR/private.pem" -pubout -out "$JWT_DIR/public.pem"

cp "$JWT_DIR/private.pem" "$RESOURCES_CERT_DIR/private.pem"
cp "$JWT_DIR/public.pem" "$RESOURCES_CERT_DIR/public.pem"

echo "JWT keys created in $JWT_DIR"
echo "  private.pem"
echo "  public.pem"
echo "Copied to $RESOURCES_CERT_DIR for local non-Docker development."
