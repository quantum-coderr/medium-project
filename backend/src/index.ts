import { Hono } from 'hono';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';
import { cors } from 'hono/cors';

const app = new Hono<{
  Bindings: {
    DIRECT_URL: string,
    JWT_SECRET: string,
  }
}>();

// CORS — update origins below for production deployment
app.use("/*", cors());

app.route("/api/v1/auth", authRouter);
app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

export default app;