# ⚙️ CloudQuill — Backend

Serverless API powering CloudQuill, built with [Hono.js](https://hono.dev/) and deployed on [Cloudflare Workers](https://workers.cloudflare.com/).

---

## 🏗️ Architecture

```
src/
├── index.ts              # App entry point — CORS, route mounting
├── lib/
│   └── prisma.ts         # Reusable getPrisma() helper
└── routes/
    ├── auth.ts           # POST /signup, POST /signin
    ├── user.ts           # GET /me, GET /me/posts, GET /me/drafts
    └── blog.ts           # Full CRUD, search, publish toggle
```

### Design Decisions

- **Route separation** — Auth, user profile, and blog logic are isolated into dedicated routers for clarity and maintainability.
- **Prisma helper** — A single `getPrisma()` utility eliminates repeated PrismaClient boilerplate.
- **Author-only guards** — Delete and publish endpoints verify the requesting user is the post author before allowing mutations.
- **Published-only feeds** — Bulk and search endpoints only return published posts; single-post endpoint shows any post by ID.

---

## 📡 API Routes

### Auth (`/api/v1/auth`)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `POST` | `/signup` | `{ email, password, name? }` | `{ success, data: { jwt } }` |
| `POST` | `/signin` | `{ email, password }` | `{ success, data: { jwt } }` |

### User (`/api/v1/user`) — _requires auth_

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/me` | Returns `id`, `email`, `name`, `createdAt`, `postCount` (published only) |
| `GET` | `/me/posts?page=1&limit=10` | Current user's published posts (paginated) |
| `GET` | `/me/drafts?page=1&limit=10` | Current user's unpublished drafts (paginated) |

### Blog (`/api/v1/blog`) — _requires auth_

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/` | Create post (draft by default) |
| `PUT` | `/` | Update post (`{ id, title?, content? }`) |
| `DELETE` | `/:id` | Delete own post |
| `PUT` | `/:id/publish` | Toggle publish/unpublish |
| `GET` | `/search?q=...&page=1` | Search published posts (case-insensitive) |
| `GET` | `/bulk?page=1&limit=10` | Paginated published feed |
| `GET` | `/:id` | Single post detail |

### Response Format

All endpoints return a consistent JSON shape:

```json
{
  "success": true,
  "message": "Optional action description",
  "data": { ... },
  "error": "Only present when success is false"
}
```

---

## 🗄️ Database Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

---

## 🔧 Environment Variables

### Wrangler Config (`wrangler.jsonc`)

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Secret key for signing/verifying JWT tokens |
| `DIRECT_URL` | Prisma Accelerate connection string |

### Prisma Migrations (`.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Direct PostgreSQL connection string (used only for `prisma migrate`) |

---

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Set up local environment variables for secrets
# Create a .dev.vars file (gitignored) with:
#   JWT_SECRET=your_secret
#   DIRECT_URL=your_prisma_accelerate_url

# Set up .env for Prisma CLI
echo 'DATABASE_URL="postgresql://user:pass@host:5432/db"' > .env

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start dev server
npm run dev
# → Ready on http://localhost:8787
```

---

## 🚢 Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy

# This runs: wrangler deploy --minify
# Deploys to: https://<worker-name>.workers.dev
```

### First-time Setup

1. Run `npx wrangler login` to authenticate with Cloudflare
2. Ensure your `wrangler.jsonc` has production `JWT_SECRET` and `DIRECT_URL` values
3. Run `npm run deploy`

---

## 📦 Shared Validation

This backend uses `@quantum-coderr/medium-common` — a shared npm package providing Zod validation schemas used by both frontend and backend:

- `signupInput` — email, password, optional name
- `signinInput` — email, password
- `createPostInput` — title, content
- `updatePostInput` — optional title, optional content
