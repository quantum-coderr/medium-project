const BACKEND_URL = "https://backend.rohansingh.workers.dev";

async function api(method, path, body, token) {
    const opts = { method, headers: { "Content-Type": "application/json" } };
    if (token) opts.headers["Authorization"] = token;
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BACKEND_URL}${path}`, opts);
    return res.json();
}

const ROHAN_POSTS = [
    { title: "Why Serverless is the Future of Web Development", content: "The web development landscape has shifted dramatically over the past decade. Gone are the days when deploying an application meant provisioning servers, managing load balancers, and worrying about scaling infrastructure. Serverless computing has emerged as a paradigm that lets developers focus entirely on writing code.\n\nWith platforms like Cloudflare Workers, your code runs at the edge — milliseconds away from your users, no matter where they are in the world. Cold starts are virtually eliminated, and you pay only for what you use.\n\nBut serverless isn't just about cost savings. It fundamentally changes how we think about architecture. Instead of monolithic applications, we build small, focused functions that respond to events. Each function does one thing well, making our systems easier to test, debug, and maintain.\n\nThe future belongs to developers who embrace this shift. As infrastructure becomes invisible, the quality of your code and the speed of your iteration become the only things that matter." },
    { title: "JWT Authentication: Beyond the Basics", content: "JSON Web Tokens are the de facto standard for authentication in modern web applications. But most tutorials only scratch the surface.\n\nToken expiry matters more than you think. A 24-hour expiry is a reasonable default, but consider your threat model. For sensitive applications, shorter expiry times with refresh tokens provide better security.\n\nAlways hash your passwords with bcrypt or argon2. Bcrypt is designed to be slow — that's a feature, not a bug. It makes brute-force attacks computationally expensive.\n\nThink carefully about what you put in your JWT payload. The token is signed, not encrypted. Anyone can decode it and read the contents. Only include non-sensitive identifiers like user IDs.\n\nValidate tokens on every request using middleware. This keeps your authentication logic centralized and consistent." },
    { title: "Deploying to Cloudflare Workers: A Step-by-Step Guide", content: "Cloudflare Workers is one of the fastest ways to deploy backend code. Your JavaScript or TypeScript runs on Cloudflare's global network, executing within milliseconds of your users.\n\nFirst, install Wrangler — Cloudflare's CLI tool. Then authenticate with npx wrangler login. Create a wrangler.jsonc file with your worker's name, entry point, and environment variables.\n\nFor local development, use wrangler dev. This spins up a local server that mimics the Workers runtime with hot reloading and access to all bindings.\n\nWhen you're ready to ship, run wrangler deploy. Wrangler bundles your code, minifies it, and uploads it to Cloudflare's network. Within seconds, your code is running on hundreds of servers worldwide.\n\nThe entire deploy process takes under 15 seconds. No Docker containers, no CI pipelines, no infrastructure management. Just your code, everywhere." },
    { title: "Zod Validation: Share Types Between Frontend and Backend", content: "One of the most frustrating bugs in full-stack development is when the frontend sends data the backend doesn't expect. The signup form sends username, but the API expects name. Everything breaks silently.\n\nZod solves this by defining validation schemas once and sharing them between frontend and backend. Create a shared npm package with your schemas, and import them in both your React components and your Hono routes.\n\nYour signup form uses the schema to validate input before sending. Your API route uses the same schema to validate the request body before touching the database. If either side sends invalid data, you get a clear error message.\n\nZod's type inference is the real magic. Define a schema, then derive the TypeScript type with z.infer. No separate type definitions — the schema is the single source of truth.\n\nWhen you change a field name in your schema, both frontend and backend get a compile-time error until they're updated. That's the power of shared validation." },
];

async function run() {
    console.log("Creating Rohan's account and posts...\n");

    // Sign up
    let token;
    const signup = await api("POST", "/api/v1/auth/signup", { name: "Rohan Singh", email: "rohan@cloudquill.dev", password: "test123" });
    if (signup.success) {
        token = signup.data.jwt;
        console.log("✅ Signed up Rohan (rohan@cloudquill.dev)");
    } else {
        // Try signin
        const signin = await api("POST", "/api/v1/auth/signin", { email: "rohan@cloudquill.dev", password: "test123" });
        if (signin.success) {
            token = signin.data.jwt;
            console.log("✅ Signed in Rohan (already existed)");
        } else {
            console.log("❌ Could not auth Rohan:", signin.error);
            return;
        }
    }

    for (const post of ROHAN_POSTS) {
        const c = await api("POST", "/api/v1/blog", { title: post.title, content: post.content }, token);
        if (c.success) {
            await api("PUT", `/api/v1/blog/${c.data.id}/publish`, {}, token);
            console.log(`✅ "${post.title}"`);
        } else {
            console.log(`❌ "${post.title}" — ${c.error}`);
        }
    }

    console.log("\n🎉 Done! Rohan's 4 posts created. Use rohan@cloudquill.dev / test123 to sign in.");
}

run();
