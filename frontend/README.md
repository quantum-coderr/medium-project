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
│   ├── Blogs.tsx             # Blog feed with search support
│   ├── Blog.tsx              # Single blog post view
│   ├── Publish.tsx           # Create/publish article page
│   └── Profile.tsx           # User profile with Published & Drafts tabs
├── components/
│   ├── Auth.tsx              # Reusable auth form component
│   ├── Appbar.tsx            # Top nav with hamburger drawer & avatar dropdown
│   ├── BlogCard.tsx          # Post preview card with read time
│   ├── BlogSkeleton.tsx      # Loading skeleton for blog feed
│   ├── FullBlog.tsx          # Full article with author-only controls
│   ├── Quote.tsx             # Motivational quote on auth pages
│   └── Spinner.tsx           # Loading spinner
└── hooks/
    └── index.ts              # useBlog, useBlogs, useUser custom hooks
```

---

## 🖥️ Routes

| Path | Page | Description |
|------|------|-------------|
| `/signup` | Signup | User registration with motivational quote |
| `/signin` | Signin | User login |
| `/blogs` | Blogs | Blog feed with search bar (Enter to search) |
| `/blog/:id` | Blog | Single post detail with author-only delete/publish controls |
| `/publish` | Publish | Create a new article (draft → publish flow) |
| `/profile` | Profile | User info, Published tab, Drafts tab |

---

## ✨ UI Features

*   **Appbar:** Includes a logo, "New" post button, responsive search bar, and user avatar dropdown menu.
*   **Hamburger Drawer:** Mobile-friendly slide-out drawer navigation wrapper.
*   **Blog Card:** Displays snippet, author information, reading time, and an optional "Draft" badge.
*   **Profile Tabs:** Switch seamlessly between Published posts and Drafts with immediate count feedback.
*   **Pagination Controls:** "Previous" and "Next" buttons at the bottom of the main feed and profile tabs to navigate efficiently.
*   **Branding:** Custom `favicon.png` and updated document titles reflecting the "CloudQuill" brand.
*   **Read Time**: Calculated from word count at 200 WPM
*   **Date Formatting**: ISO dates displayed as "Mar 6, 2026"

---

## 🔧 Configuration

### `src/config.ts`

```typescript
export const BACKEND_URL = "<YOUR_BACKEND_URL>"
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
