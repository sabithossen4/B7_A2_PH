# DevPulse API

DevPulse is a REST API for software teams to report bugs, propose features, and manage issue resolution. It provides JWT authentication and role-based permissions for contributors and maintainers.

## Features

- Register and log in as a contributor or maintainer
- Secure password hashing with bcrypt (10 salt rounds)
- Signed JWT access tokens
- Create bug reports and feature requests
- Public issue list and issue details
- Filter issues by type and status
- Sort issues from newest or oldest
- Contributors can edit only their own open issues
- Maintainers can edit any issue, change workflow status, and delete issues
- Strict TypeScript, centralized error handling, and standardized responses
- PostgreSQL access through parameterized raw SQL only—no ORM, query builder, or SQL joins

## Tech Stack

- Node.js 24+
- TypeScript
- Express.js
- PostgreSQL with the native `pg` driver
- bcrypt
- JSON Web Token

## Getting Started

### Prerequisites

- Node.js 24 or newer
- A PostgreSQL database

### Installation

```bash
npm install
```

Copy `.env.example` to `.env` and fill in the values:

```env
PORT=5000
CONNECTIONSTRING=postgresql://username:password@host:5432/devpulse?sslmode=verify-full
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

Start the development server:

```bash
npm run dev
```

Build and start the production server:

```bash
npm run build
npm start
```

The server creates an isolated PostgreSQL schema named `devpulse` and initializes its tables automatically. This prevents unrelated tables in the same database from being modified.

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register a user |
| `POST` | `/api/auth/login` | Public | Log in and receive a JWT |
| `POST` | `/api/issues` | Authenticated | Create an issue |
| `GET` | `/api/issues` | Public | List, filter, and sort issues |
| `GET` | `/api/issues/:id` | Public | Get one issue |
| `PATCH` | `/api/issues/:id` | Authenticated | Update an issue according to role rules |
| `DELETE` | `/api/issues/:id` | Maintainer | Delete an issue |

Send the login token directly in the `Authorization` header using the assignment format (`Authorization: <token>`).

### Issue Query Parameters

`GET /api/issues` accepts:

- `sort=newest|oldest` (default: `newest`)
- `type=bug|feature_request`
- `status=open|in_progress|resolved`

Example:

```text
GET /api/issues?sort=oldest&type=bug&status=open
```

## Database Schema

### users

| Column | Description |
|---|---|
| `id` | Auto-incrementing primary key |
| `name` | Required display name |
| `email` | Required unique login email |
| `password` | Required bcrypt hash; never returned by the API |
| `role` | `contributor` or `maintainer`; defaults to `contributor` |
| `created_at` | Automatically generated timestamp |
| `updated_at` | Automatically generated and refreshed timestamp |

### issues

| Column | Description |
|---|---|
| `id` | Auto-incrementing primary key |
| `title` | Required title, maximum 150 characters |
| `description` | Required description, minimum 20 characters |
| `type` | `bug` or `feature_request` |
| `status` | `open`, `in_progress`, or `resolved`; defaults to `open` |
| `reporter_id` | ID of the reporting user, validated in application logic |
| `created_at` | Automatically generated timestamp |
| `updated_at` | Automatically generated and refreshed timestamp |

Reporter details are loaded with a separate batched query instead of a SQL join.

## Response Format

Successful responses follow this shape:

```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

Errors follow this shape:

```json
{
  "success": false,
  "message": "Error description",
  "errors": "Error details"
}
```
