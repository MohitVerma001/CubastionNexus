# Cubastion Nexus — Backend API

Multi-tenant support-portal backend built with **Node.js + Express + PostgreSQL**.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18 or later |
| npm | 9 or later |
| PostgreSQL | 14 or later |

---

## Database Setup

1. Create the database:

```sql
CREATE DATABASE "nexusDev";
```

2. Run the schema (creates all tables, indexes, triggers, and seed data):

```bash
psql -h localhost -U postgres -d nexusDev -f src/database/schema.sql
```

The schema is safe to re-run — all statements use `IF NOT EXISTS` / `ON CONFLICT DO NOTHING`.

Seed data included:
- 3 SLA configs (P1 / P2 / P3)
- 8 email templates (Japanese locale)
- 1 test organisation (Fujikura Ltd)
- 3 test users (admin, agent, customer) — password: **TempPass@123**

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (default `3001`) |
| `NODE_ENV` | No | `development` or `production` |
| `FRONTEND_URL` | No | CORS origin (default `http://localhost:5173`) |
| `DB_HOST` | Yes | PostgreSQL host |
| `DB_PORT` | Yes | PostgreSQL port (default `5432`) |
| `DB_NAME` | Yes | Database name |
| `DB_USER` | Yes | Database user |
| `DB_PASSWORD` | No | Database password |
| `DB_SSL` | No | Enable SSL for DB connection (`true`/`false`) |
| `JWT_SECRET` | Yes | Secret for signing access tokens |
| `JWT_EXPIRES_IN` | No | Access token expiry (default `1h`) |
| `REFRESH_TOKEN_SECRET` | Yes | Secret for refresh tokens |
| `REFRESH_TOKEN_EXPIRES_IN` | No | Refresh token expiry (default `7d`) |
| `COOKIE_SECURE` | No | Set cookies with `Secure` flag (production: `true`) |
| `COOKIE_SAME_SITE` | No | SameSite cookie policy (default `lax`) |
| `SENDGRID_API_KEY` | No | SendGrid key — emails are skipped if not set |
| `EMAIL_FROM` | No | Sender email address |
| `UPLOAD_DIR` | No | Directory for uploaded files (default `uploads`) |
| `MAX_FILE_SIZE` | No | Max upload size in bytes (default `10485760` = 10 MB) |

---

## Install Dependencies

```bash
npm install
```

---

## Run in Development

```bash
npm run dev
```

Uses `nodemon` for auto-restart on file changes. Server starts at `http://localhost:3001`.

---

## Run in Production

```bash
npm start
```

Set `NODE_ENV=production` and `COOKIE_SECURE=true` in your environment.

---

## Verification Script

Checks database connectivity, table row counts, SLA configs, email templates, and test users:

```bash
node src/verify.js
```

Expected output: all checks green with `All checks passed — backend is ready.`

---

## API Endpoints

All routes are prefixed with `/api/v1`.

### Auth — `/api/v1/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/login` | No | Login; sets `access_token` + `refresh_token` httpOnly cookies |
| `POST` | `/logout` | Yes | Clears cookies and invalidates refresh token |
| `POST` | `/refresh` | No | Rotate refresh token; issues new cookie pair |
| `GET` | `/me` | Yes | Returns current user profile |
| `POST` | `/change-password` | Yes | Change password (keeps session alive) |
| `POST` | `/forgot-password` | No | Send password-reset email |
| `POST` | `/reset-password` | No | Reset password using email token |

### Tickets — `/api/v1/tickets`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Yes | List tickets (paginated, filterable) |
| `POST` | `/` | Yes | Create ticket |
| `GET` | `/:id` | Yes | Get single ticket |
| `PATCH` | `/:id` | Agent/Admin | Update ticket fields |
| `POST` | `/:id/escalate` | Agent/Admin | Escalate ticket |
| `POST` | `/:id/close` | Agent/Admin | Close ticket |
| `POST` | `/:id/reopen` | Yes | Reopen closed ticket |
| `GET` | `/:ticketId/comments` | Yes | List comments |
| `POST` | `/:ticketId/comments` | Yes | Add comment |
| `GET` | `/:ticketId/attachments` | Yes | List attachments |
| `POST` | `/:ticketId/attachments` | Yes | Upload attachment |
| `GET` | `/:ticketId/attachments/:id/download` | Yes | Download attachment |

### Users — `/api/v1/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Admin | List users (paginated) |
| `POST` | `/` | Admin | Create user (sends welcome email) |
| `GET` | `/:id` | Admin | Get single user |
| `PATCH` | `/:id` | Admin | Update user |
| `DELETE` | `/:id` | Admin | Deactivate user |
| `POST` | `/:id/reset-password` | Admin | Send password-reset to user |

### Organisations — `/api/v1/organisations`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Yes | List organisations |
| `POST` | `/` | Admin | Create organisation |
| `PATCH` | `/:id` | Admin | Update organisation |

### SLA Configs — `/api/v1/sla-configs`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Yes | Get global SLA configs (P1/P2/P3) |
| `PATCH` | `/:id` | Admin | Update SLA thresholds |

### Admin — `/api/v1/admin`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/stats` | Admin | Dashboard stats (tickets, SLA, orgs, agents) |

### Top-level Admin Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/audit-logs` | Admin | Paginated audit log |
| `GET` | `/api/v1/email-templates` | Admin | List email templates |
| `PATCH` | `/api/v1/email-templates/:id` | Admin | Update email template |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Server + database health check |

---

## Role-Based Access

| Role | Permissions |
|------|-------------|
| **customer** | Create tickets, view their own tickets/comments/attachments, post comments |
| **agent** | View all tickets across organisations, update/escalate/close tickets, post internal notes |
| **admin** | Everything agents can do, plus: manage users/organisations/SLA configs/email templates, view audit logs, access admin dashboard |

**Tenant isolation**: Customer requests are hard-pinned to their `organisation_id` — they cannot see other organisations' data. Agent and admin requests see all tenants unless `?organisation_id=` is passed to filter.

---

## SLA Business Hours

SLA deadlines are calculated in **JST (UTC+9), Mon–Fri 09:00–18:00**, excluding Japanese national holidays.

Priority thresholds (default):

| Priority | First Response | Resolution |
|----------|---------------|------------|
| P1 | 4 business hours | 16 business hours |
| P2 | 8 business hours | 40 business hours |
| P3 | 16 business hours | 80 business hours |

A background cron job runs every 15 minutes to mark breached tickets and log warnings when less than 20% of the SLA window remains.
