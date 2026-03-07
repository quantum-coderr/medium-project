<div align="center">

# ☁️ CloudQuill

**A serverless blogging platform built for the modern web.**

[![Cloudflare Workers](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[Live Demo](#-live-demo) · [Getting Started](#-getting-started) · [Architecture](#-architecture) · [API Reference](#-api-reference)

</div>

---

## 📋 Problem Statement

Publishing platforms like Medium are powerful — but they're monolithic, expensive to host, and opaque to developers looking to learn full-stack architecture. CloudQuill solves this by providing a **lightweight, serverless, open-source alternative** that developers can deploy, customize, and extend on their own infrastructure.

## 🧠 Key Design Decisions

### Why Cloudflare Workers over a traditional VM?
A traditional server sits idle 24/7 waiting for requests — you pay for compute even at 3am when nobody is reading blogs. Cloudflare Workers run on V8 isolates directly at the edge, meaning the code only executes when a request arrives. This eliminates idle cost, auto-scales with traffic, and runs in 300+ global locations — so a user in Mumbai hits a nearby edge server instead of a VM sitting in us-east-1.

### Why Hono.js over Express?
Express is built on top of Node.js APIs like `http.createServer()` — APIs that don't exist in Cloudflare's runtime. Hono is built from scratch using standard Web APIs (`Request`, `Response`, `fetch`) that work anywhere — Cloudflare Workers, Bun, Deno, browsers. It was the only sensible choice for an edge-first backend.

### Why Prisma Accelerate instead of a direct database connection?
Cloudflare Workers are sandboxed — they can only make HTTP/HTTPS requests outbound, not raw TCP connections. PostgreSQL communicates over TCP, so a direct connection is physically impossible from a Worker. Prisma Accelerate acts as an HTTP proxy that translates Worker requests into TCP database queries. It also maintains a connection pool — instead of hundreds of Worker instances each exhausting PostgreSQL's ~100 connection limit, they all share Accelerate's persistent pool.

## 💡 Solution

CloudQuill is a full-stack blogging platform deployed entirely on the edge. The backend runs on **Cloudflare Workers** (zero cold starts, globally distributed), the database is managed via **Prisma Accelerate** (connection pooling for serverless), and the frontend is a fast **React SPA** styled with **Tailwind CSS**.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure signup/signin with bcrypt password hashing and 24-hour token expiry |
| 📝 **Full CRUD** | Create, read, update, and delete articles |
| 📰 **Draft & Publish** | Posts start as drafts — publish/unpublish toggle available to author |
| 📂 **Drafts Management** | Save incomplete posts as drafts and publish them later. |
| 🔍 **Search** | Case-insensitive full-text search across titles and content |
| 👤 **User Profiles** | Tabbed interface to separate published posts and drafts. |
| 🍔 **Navigation** | Hamburger drawer menu + avatar dropdown for quick navigation |
| 📄 **Pagination** | Built-in pagination and page navigation for feeds and profiles. |
| 🎨 **Custom Branding** | Custom app icon and metadata tailored for CloudQuill. |
| ✅ **Input Validation** | Shared Zod schemas between frontend and backend via `@quantum-coderr/medium-common` |
| ⚡ **Edge Deployment** | Backend runs on Cloudflare Workers — sub-millisecond cold starts worldwide |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite, React Router, Axios |
| **Backend** | Hono.js, Cloudflare Workers, TypeScript |
| **Database** | PostgreSQL via Prisma Accelerate |
| **Auth** | JWT (Hono JWT), bcryptjs |
| **Validation** | Zod (shared npm package) |
| **Deployment** | Vercel (Frontend), Cloudflare Workers (Backend) |

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Client
        A["🌐 React SPA<br/>(Vite + Tailwind)"]
    end

    subgraph Cloudflare Edge
        B["⚡ Cloudflare Worker<br/>(Hono.js API)"]
        C["🔐 JWT Auth<br/>Middleware"]
    end

    subgraph Data Layer
        D["🔄 Prisma Accelerate<br/>(Connection Pooling)"]
        E["🗄️ PostgreSQL<br/>Database"]
    end

    subgraph Shared
        F["📦 @quantum-coderr/medium-common<br/>(Zod Schemas)"]
    end

    A -- "HTTPS Requests" --> B
    B --> C
    C -- "Authenticated" --> D
    D -- "Pooled Connections" --> E
    F -. "Type-safe validation" .-> A
    F -. "Type-safe validation" .-> B

    style A fill:#61DAFB,color:#000
    style B fill:#F38020,color:#fff
    style C fill:#F59E0B,color:#000
    style D fill:#5A67D8,color:#fff
    style E fill:#4169E1,color:#fff
    style F fill:#10B981,color:#fff
```

### Request Lifecycle

1.  **User** interacts with the React SPA
2.  **Axios** sends an HTTP request with JWT in the `Authorization` header
3.  **Cloudflare Worker** receives the request at the nearest edge location
4.  **Hono Router** matches the route and runs the **auth middleware**
5.  **JWT** is verified — user ID is extracted and injected into the request context
6.  **Prisma Accelerate** manages a pooled connection to **PostgreSQL**
7.  **Response** is returned to the client as JSON

---

## 🖼️ Screenshots

> _Screenshots coming soon — contributions welcome!_

<!-- Add screenshots here:
![Home Feed](./docs/screenshots/home-feed.png)
![Blog Post](./docs/screenshots/blog-post.png)
![Publish](./docs/screenshots/publish.png)
-->

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Backend API** | [api.cloudquill.com](https://api.cloudquill.com) (Placeholder) |
| **Frontend** | [cloudquill-project.vercel.app](https://cloudquill-project.vercel.app/) |

---

## 🚀 Getting Started

### Prerequisites

-   **Node.js** ≥ 18
-   **npm** ≥ 9
-   A **PostgreSQL** database (e.g., [Supabase](https://supabase.com), [Neon](https://neon.tech))
-   A **Prisma Accelerate** API key ([prisma.io/accelerate](https://www.prisma.io/data-platform/accelerate))
-   A **Cloudflare** account (for deployment)

### Repository Structure

```
cloudquill/
├── backend/           # Hono.js API on Cloudflare Workers
│   ├── src/
│   │   ├── index.ts           # App entry, CORS, route mounting
│   │   ├── lib/prisma.ts      # Reusable Prisma helper
│   │   └── routes/
│   │       ├── auth.ts        # Signup & Signin
│   │       ├── user.ts        # Profile & Author posts
│   │       └── blog.ts        # CRUD, search, publish
│   ├── prisma/schema.prisma   # Database schema
│   └── wrangler.jsonc         # Cloudflare Workers config
├── frontend/          # React SPA
│   ├── src/
│   │   ├── pages/             # Signup, Signin, Blog, Blogs, Publish, Profile
│   │   ├── components/        # Appbar, Auth, BlogCard, FullBlog, Quote, etc.
│   │   └── hooks/             # useBlog, useBlogs, useUser custom hooks
│   └── vite.config.ts
├── common/            # Shared Zod validation schemas
│   └── src/index.ts           # signupInput, signinInput, createPostInput, updatePostInput
└── docs/              # Architecture documentation
```

### 1. Clone the Repository

```bash
git clone https://github.com/quantum-coderr/cloudquill.git
cd cloudquill
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create your Wrangler config from the example
cp wrangler.jsonc.example wrangler.jsonc
# Edit wrangler.jsonc — add your JWT_SECRET and Prisma Accelerate DIRECT_URL

# Create .env for Prisma migrations
echo 'DATABASE_URL="postgresql://user:pass@host:5432/dbname"' > .env

# Initialize the database and run migrations
npx prisma generate
npx prisma migrate dev --name init

# (Optional) Seed the database with clean demo data
node seed.js

# Start local dev server
npm run dev
# → http://localhost:8787
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Update src/config.ts with your backend URL
# For local development: http://localhost:8787

npm run dev
# → http://localhost:5173
```

---

## 📡 API Reference

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/signup` | ✗ | Create account (email, password, name) |
| `POST` | `/signin` | ✗ | Login and receive JWT |

### Users (`/api/v1/user`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/me` | ✓ | Current user profile and published post count |
| `GET` | `/me/posts` | ✓ | Current user's published posts (paginated) |
| `GET` | `/me/drafts` | ✓ | Current user's unpublished drafts (paginated) |

### Blog Posts (`/api/v1/blog`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | ✓ | Create a new post (draft) |
| `PUT` | `/` | ✓ | Update a post |
| `DELETE` | `/:id` | ✓ | Delete own post |
| `PUT` | `/:id/publish` | ✓ | Toggle publish/unpublish |
| `GET` | `/search?q=...` | ✓ | Search published posts |
| `GET` | `/bulk?page=1&limit=10` | ✓ | Paginated published feed |
| `GET` | `/:id` | ✓ | Single post detail |

All authenticated endpoints require: `Authorization: Bearer <jwt_token>`

---

## 🚢 Deployment

Both frontend and backend are configured for **automatic deployment on every push** to the main branch.

| Service | Platform | Auto-Deploy |
|---------|----------|-------------|
| **Frontend** | [Vercel](https://vercel.com) | ✅ Builds and deploys on push |
| **Backend** | [Cloudflare Workers](https://workers.cloudflare.com) | ✅ Builds and deploys on push |

### Backend (Cloudflare Workers)

The backend auto-deploys via Cloudflare's Git integration. For manual deployment:

```bash
cd backend
npm run deploy
# Uses wrangler.jsonc configuration
# Deploys to: https://<worker-name>.workers.dev
```

### Frontend (Vercel)

The frontend auto-deploys via Vercel's Git integration. For local build:

```bash
cd frontend
npm run build
# Output: dist/
```

---

## 🔮 Future Infrastructure Improvements

| Improvement | Description |
|-------------|-------------|
| 📊 **Request Logging Middleware** | Structured logging with request IDs, latency tracking, and error context for debugging |
| 🛡️ **API Rate Limiting** | Per-IP and per-user rate limiting using Cloudflare's built-in rate limiting or Durable Objects |
| ⚡ **Caching Layer** | Edge caching for published posts using Cloudflare KV or Cache API to reduce database calls |
| 📈 **Observability & Monitoring** | Integration with tools like Sentry, Logflare, or Cloudflare Analytics for real-time insights |
| 🔄 **CI/CD Pipeline** | GitHub Actions for automated testing and linting (deployment is already automated via Vercel and Cloudflare) |
| 📉 **API Metrics Dashboard** | Track response times, error rates, and endpoint usage over time |
| 🖼️ **Image Uploads** | Support for article cover images and inline media via Cloudflare R2 storage |
| 🏷️ **Tagging System** | Categories and tags for content organization and discovery |
| 💬 **Comments & Reactions** | Reader engagement features with nested comments and like/bookmark support |
| 🔑 **OAuth Integration** | Google and GitHub social login alongside email/password |

---

## 📂 Documentation

- **[Architecture Deep Dive](./docs/architecture.md)** — system design, serverless rationale, and request lifecycle

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ☁️ by [quantum-coderr](https://github.com/quantum-coderr)**

</div>
