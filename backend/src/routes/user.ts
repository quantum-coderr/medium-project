import { Hono } from "hono";
import { verify } from "hono/jwt";
import { getPrisma } from '../lib/prisma';

export const userRouter = new Hono<{
	Bindings: {
		DIRECT_URL: string,
		JWT_SECRET: string
	},
	Variables: {
		userId: string
	}
}>();

// Auth Middleware for all user routes
userRouter.use('/*', async (c, next) => {
	const authHeader = c.req.header("Authorization") || "";
	const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

	try {
		const user = await verify(token, c.env.JWT_SECRET);
		if (user) {
			c.set("userId", String(user.id));
			await next();
		} else {
			c.status(401);
			return c.json({ success: false, error: "Unauthorized" });
		}
	} catch (e) {
		c.status(401);
		return c.json({ success: false, error: "Unauthorized — invalid or expired token" });
	}
});

// Get current user profile
userRouter.get('/me', async (c) => {
	const prisma = getPrisma(c.env.DIRECT_URL);
	const userId = Number(c.get("userId"));

	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				createdAt: true,
				_count: { select: { posts: true } }
			}
		});

		if (!user) {
			c.status(404);
			return c.json({ success: false, error: "User not found" });
		}

		console.log(`[GET ME] User ${user.id} fetched profile`);
		return c.json({
			success: true,
			data: {
				id: user.id,
				email: user.email,
				name: user.name,
				createdAt: user.createdAt,
				postCount: user._count.posts
			}
		});
	} catch (e) {
		console.error(`[GET ME] Failed:`, e);
		c.status(500);
		return c.json({ success: false, error: "Failed to fetch profile" });
	}
});

// Get current user's unpublished drafts (paginated)
userRouter.get('/me/drafts', async (c) => {
	const prisma = getPrisma(c.env.DIRECT_URL);
	const userId = Number(c.get("userId"));

	const page = Number(c.req.query("page") || "1");
	const limit = Math.min(Number(c.req.query("limit") || "10"), 50);
	const skip = (page - 1) * limit;

	try {
		const [posts, totalCount] = await Promise.all([
			prisma.post.findMany({
				where: { authorId: userId, published: false },
				skip,
				take: limit,
				orderBy: { createdAt: 'desc' },
				select: {
					id: true,
					title: true,
					content: true,
					published: true,
					createdAt: true,
					authorId: true,
					author: {
						select: { name: true }
					}
				}
			}),
			prisma.post.count({ where: { authorId: userId, published: false } })
		]);

		const totalPages = Math.ceil(totalCount / limit);

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
		console.error(`[GET DRAFTS] Failed for user ${userId}:`, e);
		c.status(500);
		return c.json({ success: false, error: "Failed to fetch drafts" });
	}
});

// Get posts by the logged-in author (published only, paginated)
userRouter.get('/me/posts', async (c) => {
	const prisma = getPrisma(c.env.DIRECT_URL);
	const authorId = Number(c.get("userId"));

	const page = Number(c.req.query("page") || "1");
	const limit = Math.min(Number(c.req.query("limit") || "10"), 50);
	const skip = (page - 1) * limit;

	try {
		const [posts, totalCount] = await Promise.all([
			prisma.post.findMany({
				where: { authorId, published: true },
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
			prisma.post.count({ where: { authorId, published: true } })
		]);

		const totalPages = Math.ceil(totalCount / limit);

		console.log(`[AUTHOR POSTS] User ${authorId} — page ${page}/${totalPages}, ${posts.length} posts`);
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
		console.error(`[AUTHOR POSTS] Failed for user ${authorId}:`, e);
		c.status(500);
		return c.json({ success: false, error: "Failed to fetch author's posts" });
	}
});