import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify } from "hono/jwt";
import { createPostInput, updatePostInput } from "@quantum-coderr/medium-common";

export const blogRouter = new Hono<{
    Bindings : {
        DIRECT_URL : string,
        JWT_SECRET : string,
    },
    Variables : {
        userId : string
    }
}>();

blogRouter.use('/*', async (c,next) => {
    const authHeader = c.req.header("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    try {
        const user = await verify(token, c.env.JWT_SECRET);
        if(user){
            c.set("userId", String(user.id));
            await next();
        } else {
            c.status(403);
            return c.json("invalid credentials");
        }
    } catch(e) {
        c.json("wrong inp");
    }
});

blogRouter.post('/', async (c) => {
    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DIRECT_URL,
	}).$extends(withAccelerate());

    const body = await c.req.json();
    const authorId = c.get("userId");
    const { success } = createPostInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}
    try {
        const post = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId : Number(authorId)
            }
        }); 

        return c.json({id : post.id});
    } catch(e){
        c.json("issue with post");
        c.status(403);
    }
});

blogRouter.put('/', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DIRECT_URL,
	}).$extends(withAccelerate());

    const body = await c.req.json();
    const { success } = updatePostInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}
    const authorId = c.get("userId");
    try {
        const post = await prisma.post.update({
            where :{
                id : body.id
            },
            data: {
                title: body.title,
                content: body.content,
                authorId : Number(authorId)
            }
        }); 
        return c.json({id : post.id});
    } catch(e){
        c.status(403);
    }
});

blogRouter.get('/bulk', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DIRECT_URL,
	}).$extends(withAccelerate());

    try {
        const post = await prisma.post.findMany({
            
        }); 

        return c.json({post});
    } catch(e){
        c.status(403);
    }
});

blogRouter.get('/:id', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DIRECT_URL,
	}).$extends(withAccelerate());

    const id = await c.req.param("id");
    try {
        const post = await prisma.post.findUnique({
            where : {
                id : Number(id)
            }
        }); 

        return c.json({post : post});
    } catch(e){
        c.status(403);
    }
});
