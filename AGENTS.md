# AGENTS.md

## Project

React + Django REST app.

## Stack

- Frontend: React + Tailwind CSS
- Backend: Django + Django REST Framework
- Auth: use existing project auth patterns
- Database: use current project config unless explicitly asked otherwise

## Working rules

- Inspect the existing code before editing.
- Make minimal, production-safe changes.
- Do not introduce new dependencies unless necessary.
- Preserve existing API contracts unless the task explicitly changes them.
- Prefer small patches over rewrites.
- Do not edit secrets, `.env`, or credential files.
- Do not commit generated/cache files.
- Do not commit `.claude/` unless explicitly requested.

## Backend workflow

- Before backend edits, inspect relevant Django app files.
- After backend edits, run: `cd backend && python manage.py test`.

## Frontend workflow

- Before frontend edits, inspect `frontend/package.json`.
- After frontend edits, run the available lint/build command if present.
- Preserve responsive behavior and Tailwind structure.

## Git workflow

Before changes, check:

- `git status --short`

After changes, summarize:

- files changed
- root cause
- tests run
- remaining risk

## Debugging rules

- Fix the smallest confirmed issue first.
- If a bug involves frontend/backend interaction, inspect both sides.
- For WebSocket/auth issues, check token handling, headers, cookies, CORS, and backend consumer logic.
- For deployment issues, inspect environment variables, allowed hosts, CORS, build logs, and runtime logs before patching.

## Preferred response style

- Be direct and implementation-focused.
- Show exact commands when needed.
- Avoid long explanations unless requested.
