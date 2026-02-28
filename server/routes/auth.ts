import { WorkOS } from "@workos-inc/node";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);
const clientId = process.env.WORKOS_CLIENT_ID!;
const appDomain = process.env.APP_DOMAIN ?? "dashboard.velais.com";

const COOKIE_NAME = "__velais_rt";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

function isLocalHost(host: string): boolean {
  const hostname = host.split(":")[0] ?? "";
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".lvh.me")
  );
}

function cookieOptions(host: string) {
  const local = isLocalHost(host);
  return {
    httpOnly: true,
    secure: true, // always true — dev uses HTTPS via mkcert
    sameSite: "Lax" as const,
    path: "/api/auth",
    domain: local ? undefined : `.${appDomain}`,
    maxAge: COOKIE_MAX_AGE,
  };
}

const auth = new Hono();

auth.get("/login", (c) => {
  const organizationId = c.req.query("organization_id");
  const host = c.req.header("host") ?? "localhost";
  const redirectUri = `https://${host}/api/auth/callback`;

  const url = workos.userManagement.getAuthorizationUrl({
    provider: "authkit",
    clientId,
    redirectUri,
    ...(organizationId ? { organizationId } : {}),
  });

  return c.redirect(url);
});

auth.get("/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) {
    return c.json({ error: "Missing authorization code" }, 400);
  }

  try {
    const result = await workos.userManagement.authenticateWithCode({
      clientId,
      code,
    });

    const host = c.req.header("host") ?? "localhost";
    console.log("[auth/callback] Success, user:", result.user?.id);
    console.log("[auth/callback] Has refresh token:", !!result.refreshToken);
    console.log("[auth/callback] Host:", host);
    console.log(
      "[auth/callback] Cookie options:",
      JSON.stringify(cookieOptions(host)),
    );

    if (result.refreshToken) {
      setCookie(c, COOKIE_NAME, result.refreshToken, cookieOptions(host));
    }

    return c.redirect("/");
  } catch (err) {
    console.error("[auth/callback] Authentication failed:", err);
    return c.redirect("/?error=auth_failed");
  }
});

auth.get("/session", async (c) => {
  const refreshToken = getCookie(c, COOKIE_NAME);
  const cookieHeader = c.req.header("cookie");
  console.log("[auth/session] Cookie header:", cookieHeader ?? "(none)");
  console.log("[auth/session] Refresh token present:", !!refreshToken);
  if (!refreshToken) {
    return c.json({ user: null, accessToken: null, organizationId: null });
  }

  try {
    const result = await workos.userManagement.authenticateWithRefreshToken({
      clientId,
      refreshToken,
    });

    // Rotate cookie if a new refresh token was issued
    if (result.refreshToken && result.refreshToken !== refreshToken) {
      const host = c.req.header("host") ?? "localhost";
      setCookie(c, COOKIE_NAME, result.refreshToken, cookieOptions(host));
    }

    return c.json({
      user: result.user,
      accessToken: result.accessToken,
      organizationId: result.organizationId ?? null,
    });
  } catch (err) {
    console.error("[auth/session] Refresh failed:", err);
    // Clear invalid cookie
    const host = c.req.header("host") ?? "localhost";
    deleteCookie(c, COOKIE_NAME, {
      path: "/api/auth",
      domain: isLocalHost(host) ? undefined : `.${appDomain}`,
    });
    return c.json({ user: null, accessToken: null, organizationId: null });
  }
});

auth.get("/logout", async (c) => {
  const host = c.req.header("host") ?? "localhost";
  const refreshToken = getCookie(c, COOKIE_NAME);

  // Clear the cookie first regardless of what happens next
  deleteCookie(c, COOKIE_NAME, {
    path: "/api/auth",
    domain: isLocalHost(host) ? undefined : `.${appDomain}`,
  });

  const returnTo = `https://${host}/`;

  // Try to get session ID so we can clear the WorkOS session too
  if (refreshToken) {
    try {
      const result = await workos.userManagement.authenticateWithRefreshToken({
        clientId,
        refreshToken,
      });

      // Extract session ID from the access token
      const parts = result.accessToken.split(".");
      if (parts[1]) {
        const claims = JSON.parse(atob(parts[1]));
        if (claims.sid) {
          const logoutUrl = workos.userManagement.getLogoutUrl({
            sessionId: claims.sid,
            returnTo,
          });
          return c.redirect(logoutUrl);
        }
      }
    } catch {
      // If refresh fails, just clear cookie and redirect home
    }
  }

  return c.redirect(returnTo);
});

export default auth;
