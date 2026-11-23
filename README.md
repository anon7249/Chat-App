# Chat App

A full stack real-time chat application. Users can register, log in, search for other users, start direct conversations, and exchange messages that arrive instantly over WebSockets.

Built as a learning project to practise a FastAPI + React stack end to end: authentication, relational data modelling, a layered backend, and real-time messaging.

## Features

- **Authentication**: registration and login with JWT access tokens (OAuth2 password flow), passwords hashed with `pwdlib`
- **Protected routes**: frontend route guard plus backend dependency (`get_current_active_user`) on every private endpoint
- **User search**: find other users by username (debounced, excludes yourself, returns only `id` and `username`)
- **Direct conversations**: the first message to a user creates the conversation; later messages reuse it
- **Inbox**: lists your conversations with the other person's name and the last message, newest first
- **Real-time messages**: new messages are pushed to the recipient over a WebSocket, with no reload or polling
- **Access control**: only members of a conversation can read or send messages in it
- **AI to summarise**: Can summarise conversations using Claude AI 

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

- Group conversations
- Unique constraint to prevent duplicate direct conversations for the same pair of users

- Docker and docker-compose setup
