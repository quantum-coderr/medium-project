import { Hono } from "hono";
import { verify } from "hono/jwt";
import { createPostInput, updatePostInput } from "@quantum-coderr/medium-common";
import { getPrisma } from '../lib/prisma';

export const blogRouter = new Hono<{
    Bindings: {
        DIRECT_URL: string,
        JWT_SECRET: string,
    },
    Variables: {
        userId: string
    }
}>();

// Auth Middleware
blogRouter.use('/*', async (c, next) => {
    const authHeader = c.req.header("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    try {
        const user = await verify(token, c.env.JWT_SECRET);
        if (user) {
            c.set("userId", String(user.id));
            console.log(`[AUTH] User ${user.id} authenticated successfully`);
            await next();
        } else {
            console.warn(`[AUTH] Invalid credentials — token verification returned falsy`);
            c.status(403);
            return c.json({ success: false, error: "Invalid credentials" });
        }
    } catch (e) {
        console.error(`[AUTH] Token verification failed:`, e);
        c.status(401);
        return c.json({ success: false, error: "Unauthorized — invalid or expired token" });
    }
});

// Create Post
blogRouter.post('/', async (c) => {
    const prisma = getPrisma(c.env.DIRECT_URL);
    const body = await c.req.json();
    const authorId = c.get("userId");
    const { success } = createPostInput.safeParse(body);

    if (!success) {
        console.warn(`[CREATE POST] Validation failed for user ${authorId}`, body);
        c.status(400);
        return c.json({ success: false, error: "Invalid input — title and content are required" });
    }

    try {
        const post = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: Number(authorId),
            }
        });

        console.log(`[CREATE POST] Post ${post.id} created by user ${authorId}`);
        return c.json({
            success: true,
            message: "Post created successfully",
            data: { id: post.id }
        });
    } catch (e) {
        console.error(`[CREATE POST] Failed for user ${authorId}:`, e);
        c.status(500);
        return c.json({ success: false, error: "Failed to create post" });
    }
});

// Update Post
blogRouter.put('/', async (c) => {
    const prisma = getPrisma(c.env.DIRECT_URL);
    const body = await c.req.json();
    const { success } = updatePostInput.safeParse(body);

    if (!success) {
        console.warn(`[UPDATE POST] Validation failed`, body);
        c.status(400);
        return c.json({ success: false, error: "Invalid input — id, title, and content are required" });
    }

    const authorId = c.get("userId");

    try {
        const post = await prisma.post.update({
            where: { id: body.id },
            data: {
                title: body.title,
                content: body.content,
                authorId: Number(authorId)
            }
        });

        console.log(`[UPDATE POST] Post ${post.id} updated by user ${authorId}`);
        return c.json({
            success: true,
            message: "Post updated successfully",
            data: { id: post.id }
        });
    } catch (e) {
        console.error(`[UPDATE POST] Failed for post ${body.id}:`, e);
        c.status(500);
        return c.json({ success: false, error: "Failed to update post — post may not exist" });
    }
});

// Delete Post (author-only)
blogRouter.delete('/:id', async (c) => {
    const prisma = getPrisma(c.env.DIRECT_URL);
    const id = Number(c.req.param("id"));
    const authorId = c.get("userId");

    try {
        // Verify the post belongs to the requesting user
        const post = await prisma.post.findUnique({
            where: { id },
            select: { authorId: true }
        });

        if (!post) {
            console.warn(`[DELETE POST] Post ${id} not found`);
            c.status(404);
            return c.json({ success: false, error: "Post not found" });
        }

        if (post.authorId !== Number(authorId)) {
            console.warn(`[DELETE POST] User ${authorId} is not the author of post ${id}`);
            c.status(403);
            return c.json({ success: false, error: "You can only delete your own posts" });
        }

        await prisma.post.delete({ where: { id } });

        console.log(`[DELETE POST] Post ${id} deleted by user ${authorId}`);
        return c.json({
            success: true,
            message: "Post deleted successfully"
        });
    } catch (e) {
        console.error(`[DELETE POST] Failed for post ${id}:`, e);
        c.status(500);
        return c.json({ success: false, error: "Failed to delete post" });
    }
});

// Publish / Unpublish Toggle (author-only)
blogRouter.put('/:id/publish', async (c) => {
    const prisma = getPrisma(c.env.DIRECT_URL);
    const id = Number(c.req.param("id"));
    const authorId = c.get("userId");

    try {
        const post = await prisma.post.findUnique({
            where: { id },
            select: { authorId: true, published: true }
        });

        if (!post) {
            console.warn(`[PUBLISH TOGGLE] Post ${id} not found`);
            c.status(404);
            return c.json({ success: false, error: "Post not found" });
        }

        if (post.authorId !== Number(authorId)) {
            console.warn(`[PUBLISH TOGGLE] User ${authorId} is not the author of post ${id}`);
            c.status(403);
            return c.json({ success: false, error: "You can only publish/unpublish your own posts" });
        }

        const updated = await prisma.post.update({
            where: { id },
            data: { published: !post.published }
        });

        console.log(`[PUBLISH TOGGLE] Post ${id} ${updated.published ? 'published' : 'unpublished'} by user ${authorId}`);
        return c.json({
            success: true,
            message: `Post ${updated.published ? 'published' : 'unpublished'} successfully`,
            data: { id: updated.id, published: updated.published }
        });
    } catch (e) {
        console.error(`[PUBLISH TOGGLE] Failed for post ${id}:`, e);
        c.status(500);
        return c.json({ success: false, error: "Failed to update publish status" });
    }
});

// Search Posts (published only, case-insensitive)
blogRouter.get('/search', async (c) => {
    const prisma = getPrisma(c.env.DIRECT_URL);
    const query = c.req.query("q") || "";

    if (!query.trim()) {
        c.status(400);
        return c.json({ success: false, error: "Search query 'q' is required" });
    }

    const page = Number(c.req.query("page") || "1");
    const limit = Math.min(Number(c.req.query("limit") || "10"), 50);
    const skip = (page - 1) * limit;

    const whereClause = {
        published: true,
        OR: [
            { title: { contains: query, mode: 'insensitive' as const } },
            { content: { contains: query, mode: 'insensitive' as const } }
        ]
    };

    try {
        const [posts, totalCount] = await Promise.all([
            prisma.post.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    createdAt: true,
                    author: {
                        select: { name: true }
                    }
                }
            }),
            prisma.post.count({ where: whereClause })
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        console.log(`[SEARCH] Query "${query}" — page ${page}/${totalPages}, ${posts.length} results`);
        return c.json({
            success: true,
            data: {
                posts,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (e) {
        console.error(`[SEARCH] Failed:`, e);
        c.status(500);
        return c.json({ success: false, error: "Failed to search posts" });
    }
});

// Get All Posts (Paginated — published only)
blogRouter.get('/bulk', async (c) => {
    const prisma = getPrisma(c.env.DIRECT_URL);

    const page = Number(c.req.query("page") || "1");
    const limit = Math.min(Number(c.req.query("limit") || "10"), 50);
    const skip = (page - 1) * limit;

    try {
        const [posts, totalCount] = await Promise.all([
            prisma.post.findMany({
                where: { published: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    published: true,
                    createdAt: true,
                    author: {
                        select: {
                            name: true
                        }
                    }
                }
            }),
            prisma.post.count({ where: { published: true } })
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        console.log(`[GET BULK] Page ${page}/${totalPages} — returned ${posts.length} posts`);
        return c.json({
            success: true,
            data: {
                posts,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (e) {
        console.error(`[GET BULK] Failed:`, e);
        c.status(500);
        return c.json({ success: false, error: "Failed to fetch posts" });
    }
});

// Get Single Post
blogRouter.get('/:id', async (c) => {
    const prisma = getPrisma(c.env.DIRECT_URL);
    const id = c.req.param("id");

    try {
        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                title: true,
                content: true,
                published: true,
                createdAt: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!post) {
            console.warn(`[GET POST] Post ${id} not found`);
            c.status(404);
            return c.json({ success: false, error: "Post not found" });
        }

        console.log(`[GET POST] Post ${id} fetched successfully`);
        return c.json({
            success: true,
            data: { post }
        });
    } catch (e) {
        console.error(`[GET POST] Failed for id ${id}:`, e);
        c.status(500);
        return c.json({ success: false, error: "Failed to fetch post" });
    }
});
