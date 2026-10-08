# Project Management System

A full stack project management app with a web client, an Android client and one shared backend and database. The same account works on web and mobile.

## Live links

| Item | Link |
| --- | --- |
| Web app | https://pms-srishti19.vercel.app |
| Backend API | https://pms-backend-k497.onrender.com/api |
| Health check | https://pms-backend-k497.onrender.com/health |
| Android APK | ADD_APK_LINK_HERE |
| Demo video | ADD_VIDEO_LINK_HERE |
| ER diagram | [docs/er-diagram.png](docs/er-diagram.png) |
| API docs | [API.md](API.md) |

The backend runs on Render's free tier and sleeps when idle. The first request after a pause can take 30 to 60 seconds. Open the health check link first to wake it up.

## Tech stack

| Part | Technology |
| --- | --- |
| Backend | Node.js, Express, Prisma 6, Zod, bcrypt, JWT |
| Database | PostgreSQL (Neon) |
| Web | React (Vite), React Router, Axios |
| Mobile | React Native (Expo), React Navigation, Axios, expo-secure-store, NetInfo |
| Hosting | Render (backend), Vercel (web), EAS Build (APK) |

## Repository layout

```
pms/
  backend/   Express API and Prisma schema
  web/       React web app
  mobile/    Expo Android app
  docs/      ER diagram
  README.md
  API.md
```

## Features

- Register, login, logout and current user, with hashed passwords and JWT auth.
- Projects (name, description, status, start and end date, created date) with full CRUD.
- Tasks (name, description, priority, status, due date, created date) with full CRUD and mark complete.
- Dashboard: total projects, total tasks, completed tasks, pending tasks, projects in progress.
- Search projects and tasks by name. Filter projects by status. Filter tasks by status and priority.
- Web: responsive layout, form validation, loading indicators, error messages.
- Mobile: token in SecureStore, pull to refresh, session expired message on 401, clear no-network message, task create, edit, delete and mark complete, search and filters.

## ER diagram

![ER diagram](docs/er-diagram.png)

A user owns many projects. A project has many tasks. Deleting a user deletes their projects, and deleting a project deletes its tasks.

## Security

- Passwords hashed with bcrypt. Only the hash is stored.
- JWT Bearer auth middleware on all routes except register, login and health.
- Every project and task query is scoped to the logged in user, so users can only read or change their own data. Another user's resource returns 404.
- Request bodies validated on the server with Zod.
- Prisma parameterized queries, so the API is not open to SQL injection.
- Rate limit of 10 requests per 15 minutes per IP on login and register.
- CORS only allows the origins listed in `CLIENT_ORIGIN`.
- Expired tokens return 401 with `code: "TOKEN_EXPIRED"`, invalid tokens return `TOKEN_INVALID`.

## Environment variables

### Backend (`backend/.env`)

| Variable | Description | Example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (Neon direct connection) | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Long random secret used to sign tokens | 48+ random characters |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_ORIGIN` | Allowed web origins, comma separated, no spaces, no trailing slash | `http://localhost:5173,https://pms-srishti19.vercel.app` |
| `PORT` | Local port (Render sets this itself) | `4000` |
| `NODE_ENV` | Set to `production` when deployed | `production` |

### Web (`web/.env`)

| Variable | Description | Example |
| --- | --- | --- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:4000/api` |

### Mobile (`mobile/.env`)

| Variable | Description | Example |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | Backend API base URL | `https://pms-backend-k497.onrender.com/api` |

Never commit real `.env` files. `backend/.env.example` lists the backend variable names.

## Local setup

Prerequisites: Node.js 20 or newer, npm, Git, and a PostgreSQL database (a free Neon project works).

### 1. Clone

```
git clone https://github.com/srishti-1935/pms.git
cd pms
```

### 2. Database and backend

1. Create a PostgreSQL database (for example a free project at neon.tech) and copy its connection string.
2. Create `backend/.env` from `backend/.env.example` and fill in `DATABASE_URL` and `JWT_SECRET`.
3. Install, apply the migrations and start the server:

```
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

The API runs on http://localhost:4000. Check http://localhost:4000/health.

To inspect data: `npx prisma studio`.

### 3. Web app

```
cd web
npm install
```

Create `web/.env` with `VITE_API_URL=http://localhost:4000/api`, then:

```
npm run dev
```

Open http://localhost:5173. Make sure `CLIENT_ORIGIN` in the backend includes `http://localhost:5173`.

### 4. Mobile app

```
cd mobile
npm install
```

Create `mobile/.env` with `EXPO_PUBLIC_API_URL` set to your backend URL, then:

```
npx expo start
```

Open the app in Expo Go on an Android phone on the same network.

## Running the mobile app against the deployed backend

1. In `mobile/.env`, set:

```
EXPO_PUBLIC_API_URL=https://pms-backend-k497.onrender.com/api
```

2. Open https://pms-backend-k497.onrender.com/health in a browser to wake the server.
3. Start the app with `npx expo start`, or install the APK from the link at the top of this file.
4. Log in with the same account you use on the web app.

Android devices cannot reach `localhost` on your computer, so use the deployed URL or your computer's LAN IP when testing locally.

## Building the Android APK

```
npm install -g eas-cli
eas login
cd mobile
eas build -p android --profile preview
```

The `preview` profile in `mobile/eas.json` builds an APK and sets `EXPO_PUBLIC_API_URL` for the build, because `.env` files are not uploaded to EAS. When the build finishes, open the build link on the phone to download and install the APK.

## Deployment

### Backend on Render

- Root directory: `backend`
- Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
- Start command: `npm start`
- Environment variables: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_ORIGIN`, `NODE_ENV=production`

### Web on Vercel

- Root directory: `web`
- Framework preset: Vite
- Environment variable: `VITE_API_URL`
- `web/vercel.json` rewrites all routes to `index.html` so page refreshes work.

After deploying the web app, add its URL to `CLIENT_ORIGIN` on Render.
