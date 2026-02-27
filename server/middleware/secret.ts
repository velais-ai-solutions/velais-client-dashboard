import type { MiddlewareHandler } from "hono";

export const secretMiddleware: MiddlewareHandler = async (c, next) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return c.json({ error: "Endpoint not configured" }, 503);
  }

  const header = c.req.header("Authorization");
  if (!header || header !== `Bearer ${secret}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
};
