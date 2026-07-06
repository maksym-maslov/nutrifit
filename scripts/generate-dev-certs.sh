#!/usr/bin/env bash
# Generate self-signed TLS certificates for local HTTPS development.
# Run once before the first `docker compose up` with the HTTPS nginx config.
#
# Certificates are written to certs/tls/ and mounted into the frontend container.
# For production, replace fullchain.pem and privkey.pem with Let's Encrypt certs
# at the same paths (no nginx changes required).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CERT_DIR="$PROJECT_ROOT/certs/tls"

mkdir -p "$CERT_DIR"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$CERT_DIR/privkey.pem" \
  -out "$CERT_DIR/fullchain.pem" \
  -subj "/CN=localhost"

echo "Certificates created in $CERT_DIR"
echo "  fullchain.pem"
echo "  privkey.pem"
