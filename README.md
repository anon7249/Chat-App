# Chat App

A full-stack real-time chat application. Users can register, log in, search for other users, start direct conversations, and exchange messages that arrive instantly over WebSockets.

Built as a learning project to practise a FastAPI + React stack end to end: authentication, relational data modelling, a layered backend, and real-time messaging.

<!-- Add a screenshot here: ![Chat screenshot](docs/screenshot.png) -->

## Features

- **Authentication**: registration and login with JWT access tokens (OAuth2 password flow), passwords hashed with `pwdlib`
- **Protected routes**: frontend route guard plus backend dependency (`get_current_active_user`) on every private endpoint
- **User search**: find other users by username (debounced, excludes yourself, returns only `id` and `username`)
- **Direct conversations**: the first message to a user creates the conversation; later messages reuse it
- **Inbox**: lists your conversations with the other person's name and the last message, newest first
- **Real-time messages**: new messages are pushed to the recipient over a WebSocket, with no reload or polling
- **Access control**: only members of a conversation can read or send messages in it

## Tech stack

**Backend**
- Python, FastAPI
- SQLAlchemy 2.0 ORM, PostgreSQL
- JWT (`pyjwt`), `pwdlib` for password hashing
- WebSockets (FastAPI/Starlette) with an in-memory connection manager

**Frontend**
- React (Vite), React Router
- Axios, Tailwind CSS
- `jwt-decode`

## Project structure

```
Chat-App/
├── backend/
│   ├── main.py                  # app setup, CORS, router registration
│   ├── database.py              # engine, session, get_db dependency
│   ├── ws_manager.py            # WebSocket connection manager
│   ├── auth/security.py         # JWT, password hashing, auth dependencies
│   ├── models/                  # SQLAlchemy models
│   │   ├── users.py
│   │   ├── conversations.py
│   │   ├── conversation_members.py
│   │   └── messages.py
│   ├── schemas/                 # Pydantic request/response schemas
│   ├── routers/                 # HTTP and WebSocket routes
│   │   ├── auth_route.py
│   │   ├── conversation_route.py
│   │   └── ws_route.py
│   ├── services/                # business logic
│   │   └── conversation_services.py
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/api.js           # axios instance and API calls
        └── components/          # Login, Register, ProtectedRoute,
                                 # userHomePage, ConversationList,
                                 # ChatPage, SearchUser
```

## Data model

- `users`: id, username, email, password_hash, created_at
- `conversations`: id, type (`direct` / `group`), name, created_at
- `conversation_members`: conversation_id + user_id (composite key), joined_at
- `messages`: id, conversation_id, sender_id, message, sent_at

A join table links users to conversations, so the schema already supports group chats, though only direct chats are implemented in the API.

## API overview

| Method | Path | Description |
|---|---|---|
| POST | `/register` | Create an account |
| POST | `/token` | Log in (form data), returns a JWT |
| GET | `/users/me/` | Current user |
| GET | `/conversations` | Your inbox |
| GET | `/conversations/users/search?q=` | Search users by username |
| POST | `/conversations/messages` | Send a message to a user (creates the conversation if needed) |
| GET | `/conversations/{id}/messages` | Message history (members only) |
| WS | `/ws?token=` | Real-time message push |

Interactive docs are available at `http://127.0.0.1:8000/docs` while the backend is running.

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/Chat-App.git
cd Chat-App
```

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows (PowerShell)
venv\Scripts\Activate.ps1
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a PostgreSQL database (for example `chat_app`), then create `backend/.env`:

```
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/chat_app
SECRET_KEY=your-long-random-secret
```

Generate a secret key with:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Create the database tables from the models in `backend/models/`, then start the server:

```bash
uvicorn main:app --reload
```

The backend runs at `http://127.0.0.1:8000`. Run uvicorn from inside `backend/`, since imports are relative to that folder.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`, which is the origin allowed by the backend's CORS settings. It expects the API at `http://127.0.0.1:8000` (set in `frontend/src/api/api.js`).

### 4. Try it

1. Register two users (use a normal window and a private/incognito window).
2. Log in as each one.
3. Search for the other user, send a message, and watch it appear instantly on the other side.

## Security notes

- Secrets are read from environment variables, and `.env` is git-ignored
- Passwords are hashed, never stored or returned in plain text
- Login runs a dummy hash check for unknown usernames to keep response timing consistent
- Identity always comes from the verified JWT on the server, never from client-supplied fields
- Conversation membership is checked on every conversation-scoped endpoint
- Search results expose only `id` and `username`

## Known limitations

- WebSocket connections are held in memory, so real-time delivery works with a single server process only (multiple workers would need something like Redis pub/sub)
- The WebSocket token is passed in the query string
- The socket does not automatically reconnect if the connection drops
- Direct chats only; group chats are not implemented yet

## Roadmap

- Left/right message alignment and auto-scroll
- Logout and token-expiry handling
- Group conversations
- Unique constraint to prevent duplicate direct conversations for the same pair of users
- Pagination for long message histories
- Docker and docker-compose setup
- Tests
