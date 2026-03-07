const BACKEND_URL = "https://backend.rohansingh.workers.dev";

// ── Users to create ──
const USERS = [
    { name: "Rohan Singh", email: "rohan@hi.com", password: "test123", existing: true },
    { name: "Priya Sharma", email: "priya.sharma@cloudquill.dev", password: "demo1234" },
    { name: "Alex Chen", email: "alex.chen@cloudquill.dev", password: "demo1234" },
    { name: "Sarah Mitchell", email: "sarah.m@cloudquill.dev", password: "demo1234" },
    { name: "Dev Patel", email: "dev.patel@cloudquill.dev", password: "demo1234" },
];

// ── Posts assigned to users by index ──
const POSTS = [
    {
        user: 0,
        title: "Why Serverless is the Future of Web Development",
        content: `The web development landscape has shifted dramatically over the past decade. Gone are the days when deploying an application meant provisioning servers, managing load balancers, and worrying about scaling infrastructure. Serverless computing has emerged as a paradigm that lets developers focus entirely on writing code.\n\nWith platforms like Cloudflare Workers, your code runs at the edge — milliseconds away from your users, no matter where they are in the world. Cold starts are virtually eliminated, and you pay only for what you use.\n\nBut serverless isn't just about cost savings. It fundamentally changes how we think about architecture. Instead of monolithic applications, we build small, focused functions that respond to events. Each function does one thing well, making our systems easier to test, debug, and maintain.\n\nThe future belongs to developers who embrace this shift. As infrastructure becomes invisible, the quality of your code and the speed of your iteration become the only things that matter.`
    },
    {
        user: 1,
        title: "Mastering React Hooks: Patterns That Scale",
        content: `React Hooks changed everything when they were introduced. But many developers still use them at a surface level. Here are the patterns that will truly level up your React code.\n\nCustom hooks are your best friend. Whenever you find yourself repeating the same useState and useEffect combination, extract it into a custom hook. A useFetch hook, a useDebounce hook, a useLocalStorage hook — these abstractions make your components cleaner and your logic reusable across your entire application.\n\nThe useRef hook isn't just for DOM elements. It's perfect for storing mutable values that shouldn't trigger re-renders. Previous values, interval IDs, WebSocket connections — useRef keeps them without causing unnecessary renders.\n\nBe careful with useEffect dependencies. The exhaustive-deps ESLint rule exists for a reason. Missing dependencies cause stale closures, which are some of the most confusing bugs in React.\n\nFinally, consider useReducer for complex state. When your component manages multiple related state variables that change together, useReducer keeps the logic organized and predictable.`
    },
    {
        user: 2,
        title: "Building a REST API with Hono.js: A Practical Guide",
        content: `Hono.js is a small, fast web framework built for the edge. If you've used Express.js, you'll feel right at home — but Hono is designed from the ground up for serverless environments like Cloudflare Workers, Deno Deploy, and Bun.\n\nWhat makes Hono special? First, it's incredibly lightweight — under 14KB. Second, it supports middleware, routing, and context management out of the box. Third, it's TypeScript-first, giving you excellent type safety without extra configuration.\n\nOne pattern I particularly love is how Hono handles environment bindings in Cloudflare Workers. You can type your bindings once and get autocomplete everywhere. No more guessing what variables are available.\n\nIf you're building APIs for the edge, Hono should be your first choice. It's fast, elegant, and gets out of your way.`
    },
    {
        user: 3,
        title: "The Psychology of Great UI Design",
        content: `Good design isn't about making things pretty. It's about understanding how humans think, perceive, and make decisions. Every pixel on your screen should serve a purpose.\n\nFitts's Law tells us that the time to reach a target depends on its size and distance. That's why important buttons should be large and placed where users naturally look.\n\nThe Von Restorff effect explains why we notice things that stand out. A single green button among gray ones draws the eye immediately. Use this intentionally — highlight your primary action.\n\nCognitive load is your enemy. Every choice you present to users costs mental energy. The best interfaces reduce decisions to a minimum. Instead of showing 20 options, show 3.\n\nWhite space isn't wasted space. It's breathing room for the eye. Dense interfaces feel overwhelming. Spacious ones feel premium.\n\nDesign is empathy made visible. When you truly understand your users, the right design becomes obvious.`
    },
    {
        user: 4,
        title: "Prisma Accelerate: Connection Pooling for Serverless",
        content: `If you've ever tried to connect a serverless function to a traditional database, you've probably hit the connection limit wall. Every function invocation opens a new connection, and suddenly your database is drowning in thousands of idle connections.\n\nPrisma Accelerate solves this elegantly. It sits between your serverless functions and your database, managing a pool of connections that are reused across invocations.\n\nBut Accelerate does more than just connection pooling. It also provides a global cache layer. Frequently accessed data can be served from the edge, reducing latency and database load simultaneously.\n\nSetting it up is straightforward: generate an API key from the Prisma Data Platform, update your connection string, and you're done. Your Prisma queries work exactly the same — the magic happens transparently.\n\nFor any serverless application using PostgreSQL or MySQL, Prisma Accelerate isn't just nice to have — it's essential infrastructure.`
    },
    {
        user: 0,
        title: "JWT Authentication: Beyond the Basics",
        content: `JSON Web Tokens are the de facto standard for authentication in modern web applications. But most tutorials only scratch the surface.\n\nToken expiry matters more than you think. A 24-hour expiry is a reasonable default, but consider your threat model. For sensitive applications, shorter expiry times with refresh tokens provide better security.\n\nAlways hash your passwords with bcrypt or argon2. Bcrypt is designed to be slow — that's a feature, not a bug. It makes brute-force attacks computationally expensive.\n\nThink carefully about what you put in your JWT payload. The token is signed, not encrypted. Anyone can decode it and read the contents. Only include non-sensitive identifiers like user IDs.\n\nValidate tokens on every request using middleware. This keeps your authentication logic centralized and consistent.`
    },
    {
        user: 1,
        title: "CSS Grid vs Flexbox: When to Use Which",
        content: `The eternal debate in modern CSS: Grid or Flexbox? The answer is simpler than you think — they solve different problems, and the best layouts use both.\n\nFlexbox is one-dimensional. It excels at distributing items along a single axis — a navigation bar, a card footer with buttons, a centered hero section.\n\nCSS Grid is two-dimensional. It shines when you need to control both rows and columns simultaneously — a dashboard layout, a photo gallery, a complex form.\n\nHere's my rule of thumb: if your layout starts with the content and flows outward, use Flexbox. If your layout starts with the container and places content into defined areas, use Grid.\n\nThe real power comes from combining them. Use Grid for your page-level layout, then use Flexbox inside each section to arrange the smaller components.\n\nDon't overthink it. Start with Flexbox for most things. When you find yourself fighting it, that's your signal to reach for Grid.`
    },
    {
        user: 2,
        title: "The Art of Writing Clean TypeScript",
        content: `TypeScript has won. What started as a Microsoft experiment has become the language of choice for serious JavaScript development. But writing TypeScript and writing good TypeScript are two very different things.\n\nClean TypeScript starts with your types. Don't litter your code with 'any' — that defeats the entire purpose. Define clear interfaces for your data structures and use them consistently.\n\nUse union types and discriminated unions to model state machines. Instead of boolean flags, create types that make impossible states truly impossible.\n\nEmbrace utility types. Partial, Pick, Omit, Record — these let you derive new types from existing ones without duplication.\n\nFinally, let TypeScript infer types when it can. Save explicit annotations for function parameters, return types, and complex objects. The goal isn't types everywhere — it's the right types in the right places.`
    },
    {
        user: 3,
        title: "Database Indexing: The Performance Trick You're Missing",
        content: `Your application is slow. You've optimized your frontend, added caching, compressed your assets. But page loads still take seconds. The problem? Your database queries are doing full table scans.\n\nIndexes are the single most impactful performance optimization you can make on the backend. They're like the index at the back of a textbook — instead of reading every page, you jump directly to the right one.\n\nStart with your WHERE clauses. Any column you frequently filter by should probably have an index. User lookups by email? Index it. Posts filtered by authorId? Index it.\n\nBut indexes aren't free. Every index slows down INSERT and UPDATE operations. Don't index everything — index strategically.\n\nComposite indexes are powerful but order matters. An index on (authorId, createdAt) helps queries that filter by author and sort by date, but won't help a query that only filters by createdAt.\n\nThe difference between a well-indexed database and an unindexed one can be the difference between 5ms and 5 seconds.`
    },
    {
        user: 4,
        title: "Why Every Developer Should Write a Blog",
        content: `I used to think blogging was for marketers and thought leaders. Then I started writing, and it changed my career.\n\nWriting forces clarity. When you try to explain a concept in writing, you discover gaps in your understanding. You can't hand-wave in a blog post the way you can in a conversation.\n\nYour blog is your portfolio. A well-written post about how you solved a tricky problem stands out more than 50 half-finished GitHub repositories.\n\nWriting builds your network. Every post is a conversation starter. Other developers reach out, share perspectives, and sometimes offer opportunities.\n\nYou don't need to write about cutting-edge research. Write about what you learned this week. Write about a bug that took three days to fix. Someone out there is struggling with the exact same thing.\n\nStart today. Your first post will be rough. Your tenth will be better. Your fiftieth will be something you're proud of.`
    },
    {
        user: 0,
        title: "Deploying to Cloudflare Workers: A Step-by-Step Guide",
        content: `Cloudflare Workers is one of the fastest ways to deploy backend code. Your JavaScript or TypeScript runs on Cloudflare's global network, executing within milliseconds of your users.\n\nFirst, install Wrangler — Cloudflare's CLI tool. Then authenticate with npx wrangler login. Create a wrangler.jsonc file with your worker's name, entry point, and environment variables.\n\nFor local development, use wrangler dev. This spins up a local server that mimics the Workers runtime with hot reloading and access to all bindings.\n\nWhen you're ready to ship, run wrangler deploy. Wrangler bundles your code, minifies it, and uploads it to Cloudflare's network. Within seconds, your code is running on hundreds of servers worldwide.\n\nThe entire deploy process takes under 15 seconds. No Docker containers, no CI pipelines, no infrastructure management. Just your code, everywhere.`
    },
    {
        user: 1,
        title: "Understanding Async/Await in JavaScript",
        content: `Asynchronous programming is the backbone of modern JavaScript. Whether you're fetching data from an API, reading a file, or querying a database, understanding async/await is non-negotiable.\n\nPromises were the first big step forward from callback hell. But promise chains can still become unwieldy, especially when you need values from multiple async operations.\n\nAsync/await makes asynchronous code read like synchronous code. Mark a function as async, use await to pause until a promise resolves. The code flows top to bottom, just like you'd expect.\n\nA common mistake is awaiting inside a loop when operations don't depend on each other. Use Promise.all to run them in parallel — this can turn 5 seconds into 500 milliseconds.\n\nRemember: async/await doesn't make code multi-threaded. JavaScript is still single-threaded. What it does is free up the event loop while waiting for I/O, allowing other code to run meanwhile.`
    },
    {
        user: 3,
        title: "Tailwind CSS: Why I Switched and Never Looked Back",
        content: `I was a CSS purist for years. I wrote BEM class names, maintained organized stylesheets, and scoffed at utility-first frameworks. Then I tried Tailwind on a real project, and everything changed.\n\nThe argument against Tailwind is cluttered HTML. And yes, a div with fifteen utility classes looks noisy at first. But you never context-switch. You never leave your component file. You never hunt through stylesheets.\n\nTailwind's real power is constraint-based design. Instead of arbitrary pixel values, you work with a predefined scale. Colors come from curated palettes. Font sizes follow a harmonious scale. Consistency is built in.\n\nThe responsive utilities are brilliant. Instead of media queries in separate files, prefix any utility with sm:, md:, or lg: right where you use it.\n\nPerformance is another win. Tailwind purges unused styles in production. My CSS bundles are typically under 10KB.\n\nIs Tailwind perfect? No. Complex animations still benefit from custom CSS. But for 90 percent of UI work, Tailwind is faster, more maintainable, and more consistent.`
    },
    {
        user: 2,
        title: "Git Workflows for Small Teams",
        content: `Git is powerful, but power without structure leads to chaos. If your team has ever struggled with merge conflicts or confusing branch histories, you need a workflow.\n\nFor small teams, I recommend simplified trunk-based flow. The main branch is always deployable. Feature work happens on short-lived branches. Pull requests are small and reviewed quickly.\n\nName branches consistently: feature/, fix/, chore/ followed by a brief description. Write meaningful commit messages — "Fix token validation for expired JWTs" tells the whole story; "Fixed bug" tells nothing.\n\nRebase before merging. This keeps your history linear and easy to read. Protect your main branch with required reviews and CI checks.\n\nThe best workflow is the one your team actually follows. Start simple, add complexity only when you feel the pain, and document your conventions.`
    },
    {
        user: 4,
        title: "Edge Computing: Why Latency Matters More Than You Think",
        content: `Every millisecond counts. Google found that 100ms delay reduces conversions by 7 percent. Amazon found that 100ms costs 1 percent in sales.\n\nTraditional cloud computing runs code in a single region. A user in Tokyo hitting a server in Virginia adds 200ms of latency from physics alone. No optimization can fix that.\n\nEdge computing runs your code in data centers distributed worldwide. The user in Tokyo hits a server in Tokyo. Response times drop from 200ms to 20ms.\n\nCloudflare Workers pioneered this for web applications. Your code deploys to over 300 locations. No cold start penalty, no container spin-up, no region to choose.\n\nNot everything belongs at the edge. Heavy computation and complex transactions still benefit from centralized servers. But for APIs, authentication, and content delivery, the edge is where you should be.\n\nThe cloud was a revolution. The edge is the next one.`
    },
    {
        user: 0,
        title: "Zod Validation: Share Types Between Frontend and Backend",
        content: `One of the most frustrating bugs in full-stack development is when the frontend sends data the backend doesn't expect. The signup form sends username, but the API expects name. Everything breaks silently.\n\nZod solves this by defining validation schemas once and sharing them between frontend and backend. Create a shared npm package with your schemas, and import them in both your React components and your Hono routes.\n\nYour signup form uses the schema to validate input before sending. Your API route uses the same schema to validate the request body before touching the database. If either side sends invalid data, you get a clear error message.\n\nZod's type inference is the real magic. Define a schema, then derive the TypeScript type with z.infer. No separate type definitions — the schema is the single source of truth.\n\nWhen you change a field name in your schema, both frontend and backend get a compile-time error until they're updated. That's the power of shared validation.`
    },
];

// ── Helper ──
async function api(method, path, body, token) {
    const opts = {
        method,
        headers: { "Content-Type": "application/json" },
    };
    if (token) opts.headers["Authorization"] = token;
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${BACKEND_URL}${path}`, opts);
    return res.json();
}

async function seed() {
    console.log("🌱 CloudQuill Seed Script\n");
    console.log("═".repeat(50));

    const tokens = {};

    // Step 1: Create users
    console.log("\n👥 Setting up users...\n");
    for (const user of USERS) {
        try {
            if (!user.existing) {
                const data = await api("POST", "/api/v1/auth/signup", { name: user.name, email: user.email, password: user.password });
                if (data.success) {
                    tokens[user.email] = data.data.jwt;
                    console.log(`   ✅ Created: ${user.name} (${user.email})`);
                    continue;
                }
            }
            // Sign in (existing or signup failed because already exists)
            const data = await api("POST", "/api/v1/auth/signin", { email: user.email, password: user.password });
            if (data.success) {
                tokens[user.email] = data.data.jwt;
                console.log(`   ✅ Signed in: ${user.name} (${user.email})`);
            } else {
                console.log(`   ❌ Failed: ${user.name} — ${data.error}`);
            }
        } catch (e) {
            console.log(`   ❌ Error: ${user.name} — ${e.message}`);
        }
    }

    // Step 2: Delete old posts for main user
    const mainToken = tokens[USERS[0].email];
    if (mainToken) {
        console.log("\n🗑️  Cleaning up Rohan's old posts...\n");
        let oldPosts = [];
        try {
            const r1 = await api("GET", "/api/v1/user/me/posts?limit=50", null, mainToken);
            if (r1.success) oldPosts = oldPosts.concat(r1.data.posts);
        } catch (e) {}
        try {
            const r2 = await api("GET", "/api/v1/user/me/drafts?limit=50", null, mainToken);
            if (r2.success) oldPosts = oldPosts.concat(r2.data.posts);
        } catch (e) {}

        for (const post of oldPosts) {
            try {
                await api("DELETE", `/api/v1/blog/${post.id}`, null, mainToken);
                console.log(`   🗑️  Deleted: "${post.title}"`);
            } catch (e) {}
        }
    }

    // Step 3: Create and publish posts
    console.log("\n📝 Creating posts...\n");
    let created = 0;
    for (const post of POSTS) {
        const user = USERS[post.user];
        const token = tokens[user.email];
        if (!token) { console.log(`   ⏭️  Skipping — no token for ${user.name}`); continue; }

        try {
            const createRes = await api("POST", "/api/v1/blog", { title: post.title, content: post.content }, token);
            if (!createRes.success) { console.log(`   ❌ "${post.title}" — ${createRes.error}`); continue; }

            await api("PUT", `/api/v1/blog/${createRes.data.id}/publish`, {}, token);
            created++;
            console.log(`   ✅ [${user.name}] "${post.title}"`);
        } catch (e) {
            console.log(`   ❌ "${post.title}" — ${e.message}`);
        }
    }

    console.log("\n" + "═".repeat(50));
    console.log(`\n🎉 Done! Created ${created} posts from ${USERS.length} authors.`);
    console.log("   Refresh your CloudQuill frontend to see the new content!\n");
}

seed();
