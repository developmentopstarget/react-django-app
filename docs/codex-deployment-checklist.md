# Render Backend + Vercel Frontend Deployment Checklist

## 1. Render backend service setup

- Create a Render **Web Service** for the Django backend.
- Runtime: **Docker**.
- Root/build context: `backend`.
- Dockerfile: `backend/Dockerfile`.
- The Docker image installs `backend/requirements.txt`, runs `python manage.py collectstatic --noinput`, and uses `backend/entrypoint.sh`.
- Start command is already handled by the Docker `CMD`:

```bash
/app/entrypoint.sh
```

- `entrypoint.sh` runs migrations, then starts Daphne:

```bash
python manage.py migrate --noinput
daphne -b 0.0.0.0 -p "${PORT:-8000}" config.asgi:application
```

- TODO: Set the Render backend service name and final backend URL.

## 2. Render PostgreSQL and Redis requirements

- Create a Render PostgreSQL database for Django.
- Set backend `DATABASE_URL` to the Render PostgreSQL internal connection URL.
- Create a Render Redis / Key Value instance for Django Channels.
- Set backend `REDIS_URL` to the Render Redis internal connection URL.
- Production will fail at startup unless either `DATABASE_URL` or `DB_HOST` is set.

## 3. Required backend environment variables

Set these on the Render backend service:

```env
DJANGO_ENV=production
DEBUG=False
SECRET_KEY=<strong-render-secret>
ALLOWED_HOSTS=<render-backend-host>
CORS_ALLOWED_ORIGINS=<vercel-frontend-origin>
DATABASE_URL=<render-postgres-internal-url>
REDIS_URL=<render-redis-internal-url>
OPENAI_API_KEY=<openai-api-key-or-empty-if-ai-chat-is-not-used>
```

Alternative database envs supported by the repo, if not using `DATABASE_URL`:

```env
DB_NAME=<database-name>
DB_USER=<database-user>
DB_PASSWORD=<database-password>
DB_HOST=<database-host>
DB_PORT=5432
```

- TODO: Confirm whether `OPENAI_API_KEY` is required for the deployed feature set. `/ai` chat calls use it.

## 4. Backend test, build, and start commands

Run backend tests before deploy:

```bash
cd backend
python manage.py test
```

Optional local Docker build check:

```bash
docker build -t react-django-backend ./backend
```

Production start command used by the container:

```bash
/app/entrypoint.sh
```

Health check endpoint:

```bash
curl https://<render-backend-host>/api/health/
```

## 5. Vercel frontend setup

- Create a Vercel project for the frontend.
- Root directory: `frontend`.
- Framework preset: **Vite**.
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

- TODO: Set the final Vercel production domain.

## 6. Required frontend environment variables

Set these in Vercel:

```env
VITE_API_BASE_URL=https://<render-backend-host>
VITE_WS_BASE_URL=wss://<render-backend-host>
```

Notes:

- `VITE_API_URL` is also accepted by the code as a fallback, but `VITE_API_BASE_URL` is the clearer repo convention.
- For Vercel + Render, do not rely on the production default browser origin, because the backend is on a separate Render origin.

## 7. CORS, ALLOWED_HOSTS, and WebSocket origin risks

- `ALLOWED_HOSTS` must include the Render backend host without protocol.
- `CORS_ALLOWED_ORIGINS` must include the Vercel frontend origin with protocol, for example `https://<vercel-domain>`.
- `CSRF_TRUSTED_ORIGINS` is set from `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py`.
- WebSockets use `AllowedHostsOriginValidator`, so failed WebSocket connections may mean the request origin or backend host is not allowed.
- Frontend WebSocket URL must use `wss://` in production, not `ws://`.
- If adding preview deployments, TODO: decide whether to add each preview origin explicitly or implement a safer preview-origin policy.

## 8. Files and directories that must stay uncommitted

Do not commit secrets, generated files, local dependencies, or agent-local files:

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
staticfiles/
backend/db.sqlite3
*.sqlite3
__pycache__/
*.pyc
backend/.venv/
backend/.venv.old/
.claude/
cookies.txt
.DS_Store
```

Keep example env files commit-safe only:

```text
backend/.env.example
frontend/.env.example
```

## 9. Final smoke-test checklist

- Backend deploy finishes without migration errors.
- Backend health endpoint returns `{"status":"ok"}`:

```bash
curl https://<render-backend-host>/api/health/
```

- Vercel frontend loads over HTTPS.
- Register a new user.
- Log in and confirm the token-based auth flow works.
- Open dashboard/items and confirm API calls reach Render without CORS errors.
- Open chat and confirm WebSocket status reaches `Open`.
- Send a chat message and confirm it persists in chat history after refresh.
- If `OPENAI_API_KEY` is configured, send a `/ai <message>` chat command and confirm an AI response.
- Check browser console for CORS, mixed-content, `403`, `401`, or WebSocket origin errors.
- Check Render logs for Django startup, migration, database, Redis, and Daphne errors.
