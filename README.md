# NutriFit

Athletic nutrition and fitness tracking application.

| Service | Stack | Role |
|---------|-------|------|
| `frontend` | React + Vite + nginx | SPA, HTTPS termination, API proxy, edge rate limiting |
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

## Rate limiting

Rate limiting is applied in two layers:

1. **nginx (edge)** — a coarse global limit of 300 requests/min per IP on all `/api/` traffic (`limit_req_zone` in [frontend/nginx.conf](frontend/nginx.conf)).
2. **main-api (application)** — per-endpoint limits keyed on client IP (from `X-Forwarded-For` / `X-Real-IP` set by nginx):

| Path | Rate |
|------|------|
| `POST /api/v1/auth/login` | 5/min |
| `POST /api/v1/auth/register` | 3/hour |
| `POST /api/v1/auth/refresh` | 20/min |
| `POST /api/v1/auth/change-password` | 5/min |
| `GET /api/v1/foods/search` | 60/min |
| `GET /api/v1/recommendations` | 15/min |

Exceeded limits return HTTP 429. Application-level limits live in [RateLimitingService](services/main-api/src/main/java/ai/nutrifit/main_api/shared/ratelimit/RateLimitingService.java).

To verify after starting the stack:

```bash
docker compose exec frontend nginx -t

for i in $(seq 1 10); do
  curl -sk -o /dev/null -w "%{http_code}\n" \
    -X POST https://localhost/api/v1/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

Expect 401 responses initially, then 429 once the login limit is exhausted.

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

- **Environment variables** — set `POSTGRES_PASSWORD`, `DB_PASSWORD`, `RSA_PUBLIC_KEY`, `RSA_PRIVATE_KEY`, `MAIL_*`, `APP_FRONTEND_URL`, etc. in your deployment platform
- **Mounted secret files** — place PEM files on a read-only volume (e.g. `/run/secrets/jwt/`) and point `RSA_PUBLIC_KEY` / `RSA_PRIVATE_KEY` at `file:/run/secrets/jwt/public.pem`
- **Secrets manager** — store values in your vault (AWS Secrets Manager, HashiCorp Vault, GitHub Actions secrets, etc.) and inject at deploy time

In Docker, `main-api` loads JWT keys from a mounted volume at `/run/secrets/jwt/` — keys are not baked into the JAR image, so you can rotate them without rebuilding.

### What must never be committed

- `.env`
- `certs/jwt/*.pem`
- `certs/tls/*.pem`
- `services/main-api/src/main/resources/certs/*.pem`

Test-only JWT keys under `services/main-api/src/test/resources/certs/` are safe to commit (used only by unit tests).

## Email (SMTP)

Registration, email verification, and password reset send links via SMTP. Configure in `.env`:

| Variable | Purpose |
|----------|---------|
| `APP_FRONTEND_URL` | Base URL for links in emails (e.g. `https://your-domain.com/verify?token=...`) |
| `MAIL_HOST` | SMTP server hostname |
| `MAIL_PORT` | SMTP port (typically `587` with STARTTLS) |
| `MAIL_USERNAME` | SMTP username |
| `MAIL_PASSWORD` | SMTP password or app-specific token |

Without valid SMTP credentials, users can register but will not receive verification or reset emails, and login requires a verified email.

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
| `main-api` | `SPRING_DATASOURCE_URL`, `DB_USERNAME`, `DB_PASSWORD`, JWT keys in `src/main/resources/certs/` (run `generate-jwt-keys.sh`); for auth emails: `APP_FRONTEND_URL`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` |
| `ml-api` | `DATABASE_URL` with full connection string |
| `frontend` | `npm run dev` at `http://localhost:5173`; set `CORS_ALLOWED_ORIGINS=http://localhost:5173`, `APP_COOKIE_SECURE=false`, and `APP_FRONTEND_URL=http://localhost:5173` in `.env` |

See `.env.example` for the full list of environment variables.

## CI/CD

GitHub Actions runs automated build, test, and deploy pipelines defined in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) and [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### What runs when

| Trigger | Workflow | Jobs |
|---------|----------|------|
| Pull request to `main` | CI | `main-api` tests, `frontend` build, `ml-api` smoke check |
| Push to `main` | CI | Same as above |
| CI succeeds on `main` push | Deploy | Build and push Docker images to GHCR, then deploy to VPS |

Images are tagged with the git commit SHA and `latest`:

- `ghcr.io/<owner>/nutrifit-frontend:<sha>`
- `ghcr.io/<owner>/nutrifit-main-api:<sha>`
- `ghcr.io/<owner>/nutrifit-ml-api:<sha>`

Production deploys use [`docker-compose.prod.yml`](docker-compose.prod.yml) to pull pre-built images instead of building on the server.

### GitHub secrets

Configure these under **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `DEPLOY_HOST` | VPS IP or hostname |
| `DEPLOY_USER` | SSH user (e.g. `deploy`) |
| `DEPLOY_SSH_KEY` | Private SSH key for the deploy user |
| `DEPLOY_PATH` | Absolute path to the repo on the VPS (e.g. `/opt/nutrifit`) |

Production runtime secrets (database password, JWT keys, TLS certificates) stay on the VPS — they are not injected through GitHub Actions.

### VPS bootstrap (one-time)

Before the first automated deploy:

1. Install Docker Engine and the Compose plugin.
2. Clone this repository to `DEPLOY_PATH`.
3. Create a production `.env` from [`.env.example`](.env.example) with real credentials.
4. Place TLS certificates in `certs/tls/` and JWT keys in `certs/jwt/`.
5. Open ports 80 and 443; set production values in `.env`:
   - `CORS_ALLOWED_ORIGINS=https://your-domain.com`
   - `APP_COOKIE_SECURE=true`
   - `APP_FRONTEND_URL=https://your-domain.com` (links in verification and password-reset emails)
   - `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` (SMTP for email verification and password reset)
6. Add the deploy user's public SSH key to the VPS.
7. Run `docker compose up -d` once manually to create the `postgres_data` volume.
8. Configure GHCR pull access on the VPS (`docker login ghcr.io` with a PAT, or set packages to public).

### Rollback

On the VPS, redeploy a previous commit's images:

```bash
cd /opt/nutrifit
export IMAGE_REGISTRY=ghcr.io/<owner>
export IMAGE_TAG=<previous-commit-sha>
./scripts/deploy-remote.sh
```

Check workflow status in the GitHub **Actions** tab.
