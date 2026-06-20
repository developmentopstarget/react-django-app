# Full-Stack Chat Application with React, Django, and Hybrid AI

## Description
A modern full-stack web application featuring user authentication, real-time chat, and hybrid AI/human support. The frontend is built with React and Tailwind CSS, while the backend is powered by Django and Django REST Framework, utilizing Django Channels for WebSocket communication.

## Key Features
*   **User Authentication:** Secure user registration and login with token-based authentication (Djoser).
*   **Real-time Chat:** Instant messaging capabilities using WebSockets (Django Channels and `react-use-websocket`).
*   **Hybrid AI Integration:** AI-powered responses in the chat using the OpenAI API, allowing for automated assistance.
*   **Admin Panel:** Django's built-in administration interface for managing users and viewing chat messages.
*   **Dedicated AI User:** AI-generated messages are attributed to a dedicated "AI" user for clarity.

## Tech Stack
**Frontend:**
*   React (Vite)
*   Tailwind CSS
*   Axios
*   React Router DOM
*   React Use WebSocket

**Backend:**
*   Python
*   Django
*   Django REST Framework
*   Django Channels
*   Channels Redis
*   Daphne
*   Djoser
*   OpenAI Python Library
*   python-dotenv

**Database:**
*   SQLite (default, easily configurable for PostgreSQL)

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites
*   Python 3.8+
*   Node.js (LTS version)
*   npm or Yarn
*   Redis Server (running on `localhost:6379`)

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd react-django-app
```

### 2. Backend Setup (Django)

Navigate to the `backend` directory:
```bash
cd backend
```

**Create and Activate Virtual Environment:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Install Python Dependencies:**
```bash
pip install -r requirements.txt
```

**Configure Environment Variables:**
Create a `.env` file in the `backend/` directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```
Replace `your_openai_api_key_here` with your actual OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys).

**Run Database Migrations:**
```bash
python3 manage.py migrate
```

**Create a Superuser (for Admin Panel access):**
```bash
python3 manage.py createsuperuser
```
Follow the prompts to create your admin user.

**Start the Backend Servers:**
This project requires two backend servers to run simultaneously:
*   **Daphne:** For WebSocket connections (real-time chat).
*   **Django Development Server:** For the admin panel and other standard HTTP requests.

In one terminal, start the **Daphne server** on port 8001:
```bash
daphne -b 0.0.0.0 -p 8001 config.asgi:application
```
Keep this terminal running.

In a **new terminal**, start the **Django development server** on port 8000:
```bash
python3 manage.py runserver 0.0.0.0:8000
```
Keep this terminal running.

### 3. Frontend Setup (React)

Open a **third terminal** and navigate to the `frontend` directory:
```bash
cd ../frontend
```

**Install Node.js Dependencies:**
```bash
npm install
```

**Start the React Development Server:**
```bash
npm run dev
```
Keep this terminal running.

### 4. Running Tests

**Backend:**
```bash
cd backend
python manage.py test
```

**Frontend (production build check):**
```bash
cd frontend
npm run build
```

## Docker Compose

The Docker Compose stack runs Postgres, Redis, Django (Daphne), and a React build
served by Nginx — all with a single command.

`db`, `migrate`, and `backend` read environment variables from `backend/.env`.
The `frontend` service contains the React app compiled into its Nginx image at build
time; it does not use `backend/.env`.

**Prerequisites:** copy `backend/.env.example` to `backend/.env` and fill in at minimum
`DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `SECRET_KEY`.

**Start the stack:**
```bash
docker compose --env-file backend/.env up
```

**Stop the stack (preserves Postgres data):**
```bash
docker compose --env-file backend/.env down
```

> **Warning:** Do **not** add `-v` to the down command unless you intend to permanently
> delete all Postgres data. The `-v` flag removes the `postgres_data` named volume.

**Verify the stack is up** (Compose maps host port 80 → container port 80 on `frontend`):
```bash
curl -I http://localhost           # Nginx returns 200
curl http://localhost/api/items/   # returns 401 unless authenticated
```

## CI / GitHub Actions

The `.github/workflows/ci.yml` workflow runs on every push and pull request to `main`
with three parallel jobs:

| Job | What it does |
|---|---|
| `backend-tests` | Installs Python 3.13 deps and runs `python manage.py test` |
| `frontend-build` | Installs Node 22 deps (`npm ci`) and runs `npm run build` |
| `docker-build` | Builds the `backend` and `frontend` Docker images |

## Accessing the Application

*   **Frontend — Vite local dev:** [http://localhost:5173](http://localhost:5173)
*   **Frontend — Docker/Nginx:** [http://localhost](http://localhost)
*   **Admin Panel:** [http://localhost:8000/admin/](http://localhost:8000/admin/)

Log in to the admin panel with your superuser credentials to view and manage chat messages.

## Usage

1.  Open your web browser and navigate to the frontend URL.
2.  **Register** a new user or **Log in** with your superuser credentials.
3.  Navigate to the `/chat` page.
4.  **Send a message to the AI:** In the chat input, type a message starting with `/ai ` (e.g., `/ai What is the capital of France?`). The AI will respond.
5.  **Real-time Chat:** Open another browser window (or incognito tab), log in with a different user, and navigate to the `/chat` page. Messages sent from either user will appear in both windows.

## Contributing
Feel free to fork the repository, open issues, or submit pull requests.

## License
[Choose your license, e.g., MIT License]

## Acknowledgements
*   React, Vite, Tailwind CSS
*   Django, Django REST Framework, Django Channels
*   OpenAI