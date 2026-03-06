# 🏛️ CloudQuill — System Architecture

This document provides a deep dive into CloudQuill's architecture, the rationale behind its design decisions, and how requests flow through the system.

---

## Overview

CloudQuill follows a **three-tier serverless architecture**:

```
┌──────────────┐     HTTPS     ┌───────────────────┐     Prisma     ┌──────────────┐
│  React SPA   │ ──────────▶   │ Cloudflare Worker  │ ──────────▶   │  PostgreSQL  │
│  (Vite)      │ ◀──────────   │ (Hono.js API)      │ ◀──────────   │  Database    │
└──────────────┘     JSON      └───────────────────┘   Accelerate   └──────────────┘
```

Each layer is independently deployable and scalable.

---

## Why Serverless?

### Traditional Architecture Problems
- **Always-on servers** — You pay for idle compute, even at 3 AM when nobody is reading blogs.
- **Cold start latency** — Traditional serverless platforms (AWS Lambda) have 1–5 second cold starts for Node.js.
- **Connection exhaustion** — Serverless functions spin up many instances, each opening a new database connection. PostgreSQL has a hard limit (~100 connections).

### CloudQuill's Serverless Solution

| Problem | Solution |
|---------|----------|
| Idle compute cost | **Cloudflare Workers** — pay only for requests, no minimum charges |
| Cold starts | Workers use **V8 isolates** (not containers), achieving sub-millisecond cold starts |
| Connection exhaustion | **Prisma Accelerate** provides connection pooling — hundreds of Workers share a small pool |
| Global latency | Workers run in **300+ edge locations** — code executes near the user |

---

## How Cloudflare Workers Interact with the Database

Cloudflare Workers cannot make direct TCP connections to PostgreSQL. The data path is:

```mermaid
sequenceDiagram
    participant W as Cloudflare Worker
    participant PA as Prisma Accelerate
    participant DB as PostgreSQL

    W->>PA: HTTPS Request (Prisma query)
    Note over PA: Connection pooling<br/>Query optimization
    PA->>DB: TCP (pooled connection)
    DB-->>PA: Query result
    PA-->>W: HTTPS Response (serialized data)
```

### Why Prisma Accelerate?

1. **HTTP-based protocol** — Workers can't open raw TCP sockets, but they can make HTTPS requests. Prisma Accelerate wraps database queries in HTTP.
2. **Connection pooling** — Instead of each Worker opening a connection, Accelerate maintains a small pool of persistent connections.
3. **Global edge caching** — Frequently read data can be cached at the edge (configurable per-query).

---

## Request Lifecycle

Here's the complete journey of a request through CloudQuill:

```mermaid
flowchart TD
    A["🌐 User clicks 'Publish'"] --> B["📤 Axios sends POST /api/v1/blog"]
    B --> C["⚡ Nearest Cloudflare Edge receives request"]
    C --> D["🔀 Hono router matches route"]
    D --> E{"🔐 Auth middleware"}
    E -- "No token / Invalid" --> F["❌ 401 Unauthorized"]
    E -- "Valid JWT" --> G["✅ userId extracted, set in context"]
    G --> H["📋 Zod validates request body"]
    H -- "Invalid input" --> I["❌ 400 Bad Request"]
    H -- "Valid" --> J["🗄️ Prisma query via Accelerate"]
    J --> K["💾 PostgreSQL executes query"]
    K --> L["📦 JSON response returned"]
    L --> M["🎨 React updates UI"]
```

### Step-by-step Breakdown

| Step | Component | Action |
|------|-----------|--------|
| 1 | **React SPA** | User action triggers an Axios HTTP request |
| 2 | **Axios** | Attaches JWT from `localStorage` as `Authorization: Bearer <token>` |
| 3 | **Cloudflare Edge** | Request routed to the nearest of 300+ global data centers |
| 4 | **Hono Router** | URL pattern matched to a handler (e.g., `POST /api/v1/blog`) |
| 5 | **Auth Middleware** | JWT decoded and verified using `hono/jwt`. User ID injected into `c.set("userId")` |
| 6 | **Zod Validation** | Request body validated against shared schemas from `@quantum-coderr/medium-common` |
| 7 | **Prisma Client** | `getPrisma()` creates an Accelerate-extended client. Query is serialized to HTTP |
| 8 | **Prisma Accelerate** | Receives HTTP query, routes through connection pool to PostgreSQL |
| 9 | **PostgreSQL** | Executes SQL, returns result |
| 10 | **Response** | Data serialized as JSON and returned through the chain |

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as React Frontend
    participant A as Auth Router
    participant DB as PostgreSQL

    Note over U,DB: Signup Flow
    U->>F: Fills signup form
    F->>A: POST /api/v1/auth/signup
    A->>DB: Create user (bcrypt hash)
    DB-->>A: User record
    A-->>F: JWT (24h expiry)
    F->>F: Store JWT in localStorage

    Note over U,DB: Subsequent Requests
    U->>F: Clicks "View Blogs"
    F->>A: GET /api/v1/blog/bulk + Bearer token
    A->>A: Verify JWT, extract userId
    A->>DB: Prisma query (published posts)
    DB-->>A: Post records
    A-->>F: JSON response
    F->>U: Render blog feed
```

### Security Measures
- **Passwords** are hashed with bcrypt (10 salt rounds) — never stored in plain text
- **JWT tokens** expire after 24 hours
- **Author-only mutations** — delete and publish endpoints verify `post.authorId === userId`
- **Input validation** — all request bodies are validated with Zod before touching the database

---

## Shared Validation Layer

CloudQuill uses a **shared npm package** (`@quantum-coderr/medium-common`) to ensure that the frontend and backend validate data identically:

```
common/src/index.ts
├── signupInput    → { email, password, name? }
├── signinInput    → { email, password }
├── createPostInput → { title, content }
└── updatePostInput → { title?, content? }
```

This means:
- The **frontend** can validate form inputs before sending a request
- The **backend** validates the same schema on arrival
- **Types are inferred** from Zod schemas — no manual interface duplication

---

## Data Model

```mermaid
erDiagram
    User ||--o{ Post : "writes"
    User {
        Int id PK
        String email UK
        String name
        String password
        DateTime createdAt
        DateTime updatedAt
    }
    Post {
        Int id PK
        String title
        String content
        Boolean published
        DateTime createdAt
        DateTime updatedAt
        Int authorId FK
    }
```
