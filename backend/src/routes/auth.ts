import { Hono } from "hono";
import { sign } from 'hono/jwt';
import { signinInput, signupInput } from "@quantum-coderr/medium-common";
import { hash, compare } from 'bcryptjs';
import { getPrisma } from '../lib/prisma';

// JWT token expiry: 24 hours (in seconds)
const JWT_EXPIRY_SECONDS = 60 * 60 * 24;

export const authRouter = new Hono<{
	Bindings: {
		DIRECT_URL: string,
		JWT_SECRET: string
	}
}>();

// Signup
authRouter.post('/signup', async (c) => {
	const prisma = getPrisma(c.env.DIRECT_URL);
	const body = await c.req.json();
	const { success } = signupInput.safeParse(body);

	if (!success) {
		c.status(400);
		return c.json({ success: false, error: "Invalid input — email and password are required" });
	}

	try {
		const user = await prisma.user.create({
			data: {
				email: body.email,
				password: await hash(body.password, 10),
				name: body.name || null
			}
		});

		const now = Math.floor(Date.now() / 1000);
		const jwt = await sign({ id: user.id, exp: now + JWT_EXPIRY_SECONDS }, c.env.JWT_SECRET);

		console.log(`[SIGNUP] User ${user.id} created successfully`);
		return c.json({ success: true, message: "Account created successfully", data: { jwt } });
	} catch (e) {
		console.error(`[SIGNUP] Failed:`, e);
		c.status(403);
		return c.json({ success: false, error: "User already exists or signup failed" });
	}
});

// Signin
authRouter.post('/signin', async (c) => {
	const prisma = getPrisma(c.env.DIRECT_URL);
	const body = await c.req.json();
	const { success } = signinInput.safeParse(body);

	if (!success) {
		c.status(400);
		return c.json({ success: false, error: "Invalid input — email and password are required" });
	}

	try {
		const user = await prisma.user.findUnique({
			where: { email: body.email }
		});

		if (!user) {
			c.status(403);
			return c.json({ success: false, error: "User not found" });
		}

		const isPasswordValid = await compare(body.password, user.password);
		if (!isPasswordValid) {
			c.status(403);
			return c.json({ success: false, error: "Invalid password" });
		}

		const now = Math.floor(Date.now() / 1000);
		const jwt = await sign({ id: user.id, exp: now + JWT_EXPIRY_SECONDS }, c.env.JWT_SECRET);

		console.log(`[SIGNIN] User ${user.id} signed in`);
		return c.json({ success: true, data: { jwt } });
	} catch (e) {
		console.error(`[SIGNIN] Failed:`, e);
		c.status(500);
		return c.json({ success: false, error: "Error while signing in" });
	}
});
