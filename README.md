

# React + Tailwind CSS + Django Starter

A modern full-stack template: **React (Vite) + Tailwind CSS** on the frontend, **Django + Django REST Framework** on the backend. Comes with CORS configured, environment variables, and a clear dev workflow.

## Features
- ⚡ Vite + React with Tailwind CSS and ESLint
- 🐍 Django REST API with Django REST Framework
- 🔐 .env support (frontend & backend)
- 🔁 Hot reload on both servers
- 🌐 CORS preconfigured (frontend ↔ backend)
- ✅ Prewired formatting (Prettier) and linting (ESLint/flake8 optional)

## Tech Stack
**Frontend:** Vite, React, Tailwind CSS  
**Backend:** Python, Django, Django REST Framework, django-cors-headers  
**DB (default):** SQLite (swap via \`DATABASE_URL\`)

## Project Structure

.  
├─ backend/  
│ ├─ manage.py  
│ ├─ requirements.txt  
│ ├─.env.example  
│ ├─ config/ # Django project (settings, urls, wsgi/asgi)  
│ └─ api/ # Example app (views/serializers/models)  
└─ frontend/  
├─ index.html  
├─ package.json  
├─.env.example  
├─ src/  
│ ├─ main.tsx /.jsx  
│ ├─ App.tsx /.jsx  
│ └─ lib/api.ts # API helper uses VITE\_API\_URL  
└─ tailwind.config.js

### 2) Backend (Django)

**`backend/.env.example`**

### 3) Frontend (React + Tailwind)

Open a new terminal:

**`frontend/.env.example`**

Now visit the frontend dev server (Vite prints the URL, usually `http://localhost:5173`).

## Scripts

**Frontend**

- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview build
- `npm run lint` – run ESLint
- `npm run format` – run Prettier

**Backend**

- `python manage.py runserver` – start Django dev server
- `python manage.py migrate` – apply DB migrations
- `python manage.py createsuperuser` – admin user

## API Example

- `GET /api/health/` → `{ "status": "ok" }`
- `GET /api/items/` → list items
- `POST /api/items/` → create item (JSON body)

(Endpoints live under `backend/api/`. Feel free to delete/replace the sample app.)

## Configuration Notes

### CORS

Set `CORS_ALLOWED_ORIGINS` in `backend/.env` to your frontend URL(s). The starter includes `django-cors-headers` and middleware wiring.

### Environment Variables

- **Backend:**`backend/.env` (loaded in Django settings)
- **Frontend:**`frontend/.env` (Vite exposes variables prefixed with `VITE_`)

### Database

- Default is SQLite (no config needed).
- For Postgres, set `DATABASE_URL` in `backend/.env` and add `psycopg[binary]` to `requirements.txt`.

## Deployment (outline)

- **Backend:** Deploy to services like Railway, Render, Fly.io, or a VPS. Set `DEBUG=False`, add your domain to `ALLOWED_HOSTS`, run `collectstatic` if using static files.
- **Frontend:**`npm run build` then serve the `dist/` folder (Netlify, Vercel, or any static host). Set `VITE_API_URL` to your backend’s public URL.

## Testing (optional)

- Backend: `pytest` or Django’s test runner
- Frontend: `vitest` + React Testing Library

## Linting & Formatting (optional)

- Backend: `flake8`, `black`, `isort`
- Frontend: ESLint + Prettier (already set up in this template)

## Contributing

PRs and issues welcome. Keep commits small and focused.

## License

Choose one: MIT (permissive), Apache-2.0 (patent protection), GPL-3.0 (copyleft). Replace this section with your choice.

## Acknowledgements

- React, Vite, Tailwind CSS
- Django, Django REST Framework

## Python

backend/.venv/  
backend/ **pycache** /  
backend/*.sqlite3  
backend/\*\*/*.pyc

## Node

frontend/node\_modules/  
frontend/dist/

## Env files

\*\*/.env  
\*\*/.env.local