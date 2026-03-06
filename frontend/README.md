# 🎨 CloudQuill — Frontend

Single-page React application for CloudQuill, built with [Vite](https://vitejs.dev/) and styled with [Tailwind CSS](https://tailwindcss.com/).

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **@quantum-coderr/medium-common** | Shared Zod validation schemas |

---

## 📁 Project Structure

```
src/
├── App.tsx                  # Router setup
├── config.ts                # Backend URL configuration
├── main.tsx                 # React entry point
├── pages/
│   ├── Signup.tsx            # Registration page
│   ├── Signin.tsx            # Login page
│   ├── Blogs.tsx             # Blog feed (list view)
│   ├── Blog.tsx              # Single blog post view
│   └── Publish.tsx           # Create/publish article page
├── components/
│   ├── Auth.tsx              # Reusable auth form component
│   ├── Appbar.tsx            # Top navigation bar
│   ├── BlogCard.tsx          # Post preview card
│   ├── BlogSkeleton.tsx      # Loading skeleton for blog feed
│   ├── FullBlog.tsx          # Full article display
│   ├── Quote.tsx             # Inspirational quote on auth pages
│   └── Spinner.tsx           # Loading spinner
└── hooks/
    └── index.ts              # useBlog, useBlogs custom hooks
```

---

## 🖥️ Routes

| Path | Page | Description |
|------|------|-------------|
| `/signup` | Signup | User registration |
| `/signin` | Signin | User login |
| `/blogs` | Blogs | Blog feed with all published posts |
| `/blog/:id` | Blog | Single blog post detail view |
| `/publish` | Publish | Create a new article |

---

## 🔧 Configuration

### `src/config.ts`

```typescript
export const BACKEND_URL = "https://backend.rohansingh.workers.dev"
```

Update this to point to your backend instance:
- **Local development:** `http://localhost:8787`
- **Production:** Your Cloudflare Workers URL

---

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:5173
```

Make sure the backend is running at the URL specified in `src/config.ts`.

---

## 📦 Build for Production

```bash
# Type-check and build
npm run build

# Output: dist/
# Deploy this folder to any static host (Vercel, Netlify, Cloudflare Pages)
```

### Other Commands

```bash
# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```

---

## 🔗 Environment Variables

No `.env` file is needed. The backend URL is configured directly in `src/config.ts`. For a production setup, consider migrating this to a Vite environment variable:

```typescript
// vite.config.ts enhancement (optional)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
```
