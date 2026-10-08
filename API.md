# API documentation

Base URL: `https://pms-backend-k497.onrender.com/api`
Local: `http://localhost:4000/api`

All request and response bodies are JSON. All routes except `register`, `login` and `/health` need this header:

```
Authorization: Bearer <token>
```

## Conventions

- Dates are ISO 8601 strings, for example `2026-10-31T00:00:00.000Z`. Optional dates may be `null`.
- IDs are integers.
- Validation failures return 400 with an error message from the server.
- Accessing another user's project or task returns 404.
- Creating returns 201. Deleting returns 204 with no body.

### Enums

| Field | Values |
| --- | --- |
| Project `status` | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED` |
| Task `priority` | `LOW`, `MEDIUM`, `HIGH` |
| Task `status` | `PENDING`, `IN_PROGRESS`, `COMPLETED` |

### Auth errors

| Status | Body | Meaning |
| --- | --- | --- |
| 401 | `{ "code": "TOKEN_EXPIRED", ... }` | Token has expired. Log in again. |
| 401 | `{ "code": "TOKEN_INVALID", ... }` | Missing or invalid token. |
| 429 | rate limit message | More than 10 login or register requests in 15 minutes from one IP. |

## Health

### GET /health

No auth. Returns a simple status response used to check the server is up.

## Auth

### POST /auth/register

Create an account and receive a token.

Request:

```json
{
  "fullName": "Srishti Sharma",
  "email": "user@example.com",
  "password": "password123"
}
```

| Field | Rules |
| --- | --- |
| `fullName` | string, 2 to 100 characters |
| `email` | valid email, max 255, stored lowercase, must be unique |
| `password` | string, 8 to 72 characters |

Response `201`:

```json
{
  "user": { "id": 1, "fullName": "Srishti Sharma", "email": "user@example.com", "createdAt": "2026-10-08T10:00:00.000Z" },
  "token": "<jwt>"
}
```

A duplicate email returns 409.

### POST /auth/login

Request:

```json
{ "email": "user@example.com", "password": "password123" }
```

Response `200`:

```json
{
  "user": { "id": 1, "fullName": "Srishti Sharma", "email": "user@example.com", "createdAt": "2026-10-08T10:00:00.000Z" },
  "token": "<jwt>"
}
```

Wrong credentials return 401.

### POST /auth/logout

Auth required. Tokens are stateless, so logout confirms the request and the client deletes its stored token.

Response `200`: `{ "message": "Logged out. Discard the token on the client." }`

### GET /auth/me

Auth required. Returns the logged in user.

Response `200`:

```json
{ "user": { "id": 1, "fullName": "Srishti Sharma", "email": "user@example.com", "createdAt": "2026-10-08T10:00:00.000Z" } }
```

## Projects

### GET /projects

Auth required. Returns the current user's projects.

Query parameters (all optional):

| Param | Description |
| --- | --- |
| `search` | Case insensitive match on project name |
| `status` | One of the project status values |

Response `200`:

```json
{
  "projects": [
    {
      "id": 1,
      "name": "Website redesign",
      "description": "New landing page",
      "status": "IN_PROGRESS",
      "startDate": "2026-10-01T00:00:00.000Z",
      "endDate": "2026-11-01T00:00:00.000Z",
      "createdAt": "2026-10-08T10:00:00.000Z",
      "ownerId": 1
    }
  ]
}
```

### POST /projects

Request:

```json
{
  "name": "Website redesign",
  "description": "New landing page",
  "status": "NOT_STARTED",
  "startDate": "2026-10-01T00:00:00.000Z",
  "endDate": "2026-11-01T00:00:00.000Z"
}
```

| Field | Rules |
| --- | --- |
| `name` | required, 1 to 150 characters |
| `description` | optional, max 2000 characters, may be null |
| `status` | optional, defaults to `NOT_STARTED` |
| `startDate`, `endDate` | optional, may be null. `endDate` must be on or after `startDate`. |

Response `201`: `{ "project": { ... } }`

### GET /projects/:id

Response `200`: `{ "project": { ... } }`. Returns 404 if it does not exist or belongs to another user.

### PUT /projects/:id

Partial update. Send only the fields to change. Same rules as create. Send `null` to clear description or dates.

Response `200`: `{ "project": { ... } }`

### DELETE /projects/:id

Deletes the project and all its tasks. Response `204`.

## Tasks

### GET /tasks

Auth required. Returns tasks belonging to the current user's projects.

Query parameters (all optional):

| Param | Description |
| --- | --- |
| `search` | Case insensitive match on task name |
| `status` | One of the task status values |
| `priority` | `LOW`, `MEDIUM` or `HIGH` |
| `projectId` | Only tasks in this project |

Response `200`:

```json
{
  "tasks": [
    {
      "id": 1,
      "name": "Design header",
      "description": "Logo and navigation",
      "priority": "HIGH",
      "status": "PENDING",
      "dueDate": "2026-10-20T00:00:00.000Z",
      "createdAt": "2026-10-08T10:05:00.000Z",
      "projectId": 1
    }
  ]
}
```

### POST /tasks

Request:

```json
{
  "name": "Design header",
  "description": "Logo and navigation",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2026-10-20T00:00:00.000Z",
  "projectId": 1
}
```

| Field | Rules |
| --- | --- |
| `name` | required, 1 to 150 characters |
| `description` | optional, max 2000 characters, may be null |
| `priority` | optional, defaults to `MEDIUM` |
| `status` | optional, defaults to `PENDING` |
| `dueDate` | optional, may be null |
| `projectId` | required positive integer. The project must belong to the current user. |

Response `201`: `{ "task": { ... } }`

### GET /tasks/:id

Response `200`: `{ "task": { ... } }`. Returns 404 if missing or not owned by the user.

### PUT /tasks/:id

Partial update. To mark a task complete:

```json
{ "status": "COMPLETED" }
```

Response `200`: `{ "task": { ... } }`

### DELETE /tasks/:id

Response `204`.

## Dashboard

### GET /dashboard

Auth required. Counts for the current user only.

Response `200`:

```json
{
  "totalProjects": 3,
  "totalTasks": 12,
  "completedTasks": 5,
  "pendingTasks": 6,
  "projectsInProgress": 2
}
```

`pendingTasks` counts tasks with status `PENDING`.

## Example (PowerShell)

```powershell
$body = @{ email = "user@example.com"; password = "password123" } | ConvertTo-Json
$r = Invoke-RestMethod -Method Post -Uri https://pms-backend-k497.onrender.com/api/auth/login -ContentType "application/json" -Body $body
Invoke-RestMethod -Uri https://pms-backend-k497.onrender.com/api/projects -Headers @{ Authorization = "Bearer $($r.token)" }
```
