import { Elysia, t } from "elysia";
import { authController } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getFrontendUrl } from "../config/env";

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .use(authMiddleware)
  .post("/register", async ({ body, set }) => {
    const { status, body: responseBody } = await authController.register(body);
    set.status = status;
    return responseBody;
  }, {
    body: t.Object({
      username: t.String(),
      email: t.String(),
      password: t.String()
    })
  })
  .post("/verify-otp", async ({ body, set }) => {
    const { status, body: responseBody } = await authController.verifyOTP(body);
    set.status = status;
    return responseBody;
  }, {
    body: t.Object({
      email: t.String(),
      otp: t.String()
    })
  })
  .post("/forgot-password", async ({ body, set }) => {
    const { status, body: responseBody } = await authController.forgotPassword(body);
    set.status = status;
    return responseBody;
  }, {
    body: t.Object({ email: t.String() }),
  })
  .post("/reset-password", async ({ body, set }) => {
    const { status, body: responseBody } = await authController.resetPassword(body);
    set.status = status;
    return responseBody;
  }, {
    body: t.Object({
      email: t.String(),
      token: t.String(),
      password: t.String(),
    }),
  })
  .post("/login", async ({ body, jwt, set }) => {
    const { status, body: responseBody } = await authController.login(body, jwt.sign);
    set.status = status;
    return responseBody;
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String()
    })
  })
  // Google OAuth2 — Redirect ไป Google
  .get("/google", ({ redirect }) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return { success: false, message: "Google OAuth is not configured" };
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
    });

    return redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  })
  // Google OAuth2 — Callback จาก Google
  .get("/google/callback", async ({ query, jwt, redirect, set }) => {
    const { code, error } = query as { code?: string; error?: string };
    const frontendUrl = getFrontendUrl();

    if (error || !code) {
      return redirect(`${frontendUrl}/signin?error=google_auth_cancelled`);
    }

    const result = await authController.googleCallback(code, jwt.sign);

    if (result.status !== 200) {
      return redirect(`${frontendUrl}/signin?error=google_auth_failed`);
    }

    const userEncoded = encodeURIComponent(JSON.stringify(result.body.user));
    return redirect(
      `${frontendUrl}/auth/google/callback?token=${result.body.token}&user=${userEncoded}`
    );
  });
