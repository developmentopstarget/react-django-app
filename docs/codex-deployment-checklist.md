# Codex Deployment Checklist: Render Backend + Vercel Frontend

Concise checklist for deploying the current React + Django Channels app with a Render backend and Vercel frontend.

## 1. Render backend

- Create a Render Web Service for the Django backend.
- Runtime: Docker.
- Dockerfile: `backend/Dockerfile`.
- TODO: Confirm Render root directory and build context. If the root is `backend`, use Dockerfile path `Dockerfile`. If the root is the repo root, use Dockerfile path `backend/Dockerfile`.
- Container start command is handled by `backend/entrypoint.sh`:

```bash
python manage.py migrate --noinput
daphne -b 0.0.0.0 -p "${PORT:-8000}" config.asgi:application
```

## 2. Backend environment variables

Required on Render:

```env
DJANGO_ENV=production
DEBUG=False
SECRET_KEY=<strong-secret>
ALLOWED_HOSTS=<render-backend-host>,<vercel-frontend-host>
CORS_ALLOWED_ORIGINS=https://<vercel-frontend-host>
DATABASE_URL=<render-postgres-internal-url>
REDIS_URL=<render-redis-internal-url>
```

Optional:

```env
OPENAI_API_KEY=<openai-api-key>
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_CHAT_MAX_TOKENS=150
OPENAI_CHAT_TIMEOUT_SECONDS=10
OPENAI_CHAT_RATE_LIMIT_PER_MINUTE=5
CHAT_WEBSOCKET_AUTH_TIMEOUT_SECONDS=10
```

Alternative database variables supported if not using `DATABASE_URL`:

```env
DB_NAME=<database-name>
DB_USER=<database-user>
DB_PASSWORD=<database-password>
DB_HOST=<database-host>
DB_PORT=5432
```

## 3. Backend commands

Run tests before deploy:

```bash
cd backend
python manage.py test
```

Optional local Docker build check:

```bash
docker build -t react-django-backend ./backend
```

Health check after deploy:

```bash
curl https://<render-backend-host>/api/health/
```

## 4. Database and Redis

- PostgreSQL is required in production. `DJANGO_ENV=production` fails startup unless `DATABASE_URL` or `DB_HOST` is set.
- Redis is required in production. `DJANGO_ENV=production` fails startup unless `REDIS_URL` is set.
- Django Channels uses `channels_redis.pubsub.RedisPubSubChannelLayer`, so the Render backend must be able to reach the Redis internal URL.

## 5. Vercel frontend

- Create a Vercel project with root directory `frontend`.
- Framework preset: Vite.
- Install command:

```bash
npm ci
```

- Build command:

```bash
npm run build
```

- Output directory:

```text
dist
```

- Optional pre-deploy lint/build check:

```bash
cd frontend
npm run lint
npm run build
```

## 6. Frontend environment variables

Required on Vercel:

```env
VITE_API_BASE_URL=https://<render-backend-host>
VITE_WS_BASE_URL=wss://<render-backend-host>
```

Do not rely on the production browser-origin fallback for Vercel + Render. Without these variables, the frontend will target the Vercel origin instead of the Render backend.

## 7. CORS, hosts, and WebSocket risks

- `ALLOWED_HOSTS` must include the Render backend host without protocol.
- `ALLOWED_HOSTS` should include the Vercel frontend host without protocol because WebSockets use `AllowedHostsOriginValidator` in `backend/config/asgi.py`.
- `CORS_ALLOWED_ORIGINS` must include the Vercel frontend origin with protocol.
- `CSRF_TRUSTED_ORIGINS` is currently copied from `CORS_ALLOWED_ORIGINS`.
- Production WebSocket URL must use `wss://`, not `ws://`.
- TODO: Decide how Vercel preview deployment origins will be handled. Add explicit preview origins or implement a controlled preview-origin policy.

## 8. Do not commit

Do not commit secrets, generated files, local dependencies, or local agent files:

```text
.env
backend/.env
frontend/.env
node_modules/
frontend/node_modules/
dist/
frontend/dist/
build/
backend/staticfiles/
backend/db.sqlite3
*.sqlite3
__pycache__/
*.pyc
backend/.venv/
.claude/
.DS_Store
```

## 9. Smoke test

- Backend deploy completes migrations.
- `curl https://<render-backend-host>/api/health/` returns healthy output.
- Vercel frontend loads over HTTPS.
- Register and log in.
- Confirm authenticated API calls reach Render without CORS errors.
- Open chat and confirm WebSocket connects.
- Send a chat message and confirm it persists after refresh.
- If `OPENAI_API_KEY` is set, test `/ai <message>`.
- Check Render logs for database, Redis, Daphne, migration, CORS, and WebSocket origin errors.
