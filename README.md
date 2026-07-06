# NutriFit

Athletic nutrition and fitness tracking application.

| Service | Stack | Role |
|---------|-------|------|
| `frontend` | React + Vite + nginx | SPA, HTTPS termination, API proxy |
| `main-api` | Spring Boot | Auth, user data, business logic |
| `ml-api` | FastAPI | ML-powered food recommendations |
| `postgres` | PostgreSQL 16 | Primary database |

## First-time local setup

1. **Copy environment file**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your local credentials. The values in `.env.example` are dev placeholders only.

2. **Generate TLS certificates** (nginx HTTPS)

   ```bash
   ./scripts/generate-dev-certs.sh
   ```

   Creates self-signed certs in `certs/tls/` for `https://localhost`.

3. **Generate JWT signing keys** (main-api)

   ```bash
   ./scripts/generate-jwt-keys.sh
   ```

   Creates RSA key pair in `certs/jwt/` and copies them to `services/main-api/src/main/resources/certs/` for local non-Docker runs.

4. **Start the stack**

   ```bash
   docker compose up --build
   ```

   Open [https://localhost](https://localhost). Accept the browser warning for the self-signed TLS cert.

## Secrets management

### Development

| Secret | Location | Committed? |
|--------|----------|------------|
| Database credentials | `.env` | No (gitignored) |
| TLS certificates | `certs/tls/*.pem` | No (gitignored) |
| JWT signing keys | `certs/jwt/*.pem` | No (gitignored) |
| JWT keys (local Spring) | `services/main-api/src/main/resources/certs/` | No (gitignored) |

Docker Compose reads `${POSTGRES_*}` from `.env` at parse time and builds connection URLs for `main-api` and `ml-api` — credentials are never hardcoded in `docker-compose.yml`.

### Production

Never commit production secrets. Inject them via one of:

- **Environment variables** — set `POSTGRES_PASSWORD`, `DB_PASSWORD`, `RSA_PUBLIC_KEY`, `RSA_PRIVATE_KEY`, etc. in your deployment platform
- **Mounted secret files** — place PEM files on a read-only volume (e.g. `/run/secrets/jwt/`) and point `RSA_PUBLIC_KEY` / `RSA_PRIVATE_KEY` at `file:/run/secrets/jwt/public.pem`
- **Secrets manager** — store values in your vault (AWS Secrets Manager, HashiCorp Vault, GitHub Actions secrets, etc.) and inject at deploy time

In Docker, `main-api` loads JWT keys from a mounted volume at `/run/secrets/jwt/` — keys are not baked into the JAR image, so you can rotate them without rebuilding.

### What must never be committed

- `.env`
- `certs/jwt/*.pem`
- `certs/tls/*.pem`
- `services/main-api/src/main/resources/certs/*.pem`

Test-only JWT keys under `services/main-api/src/test/resources/certs/` are safe to commit (used only by unit tests).

## JWT key rotation

Rotating JWT signing keys **invalidates all active sessions**. Users must sign in again.

1. Generate a new key pair in a secure environment:

   ```bash
   ./scripts/generate-jwt-keys.sh --force
   ```

   Or generate equivalent PEM files in your secrets manager.

2. Store the private key in your secrets manager / CI secret / mounted secret volume. Never commit it.

3. Deploy the new key files to the runtime mount path (`/run/secrets/jwt/` in Docker, or equivalent in your platform).

4. Perform a rolling restart of all `main-api` instances.

5. **Session impact:** existing JWTs become invalid immediately. Access tokens expire after 15 minutes (`jwt.access-token-expiry-seconds=900`), so users who do not re-authenticate will be logged out within that window.

6. Retire the old key pair after the maximum token TTL plus a safety buffer.

> **Future enhancement:** zero-downtime dual-key rotation (accepting tokens signed by either the old or new key during a transition window) is not implemented yet.

## TLS certificate rotation

### Development

Re-run `./scripts/generate-dev-certs.sh` to regenerate self-signed certs. Browsers will show a new certificate warning.

### Production

Replace `certs/tls/fullchain.pem` and `certs/tls/privkey.pem` with certificates from your CA (e.g. Let's Encrypt). No nginx config changes are required — the same paths are used. Reload or restart the `frontend` container after replacing the files.

## Running services outside Docker

When running individual services locally (without `docker compose`):

| Service | Required configuration |
|---------|------------------------|
| `main-api` | `SPRING_DATASOURCE_URL`, `DB_USERNAME`, `DB_PASSWORD`, JWT keys in `src/main/resources/certs/` (run `generate-jwt-keys.sh`) |
| `ml-api` | `DATABASE_URL` with full connection string |
| `frontend` | `npm run dev` at `http://localhost:5173`; set `CORS_ALLOWED_ORIGINS=http://localhost:5173` and `APP_COOKIE_SECURE=false` in `.env` |

See `.env.example` for the full list of environment variables.
