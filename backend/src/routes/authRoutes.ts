import { Elysia, t } from "elysia";
import { authController } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

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
  .post("/login", async ({ body, jwt, set }) => {
    const { status, body: responseBody } = await authController.login(body, jwt.sign);
    set.status = status;
    return responseBody;
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String()
    })
  });
