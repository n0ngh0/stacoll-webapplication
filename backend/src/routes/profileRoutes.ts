import { Elysia } from "elysia";
import { profileController } from "../controllers/profileController";
import { requireAuth } from "../middlewares/authMiddleware";

export const profileRoutes = new Elysia({ prefix: "/api/profile" })
  .use(requireAuth)
  .get("/me", async ({ user, set }) => {
    const { status, body } = await profileController.getProfile(user!._id);
    set.status = status;
    return body;
  })
  .put("/me", async ({ user, body, set }) => {
    const { status, body: responseBody } = await profileController.updateProfile(user!._id, body);
    set.status = status;
    return responseBody;
  })
  .put("/me/password", async ({ user, body, set }) => {
    const { status, body: responseBody } = await profileController.changePassword(user!._id, body);
    set.status = status;
    return responseBody;
  })
  .delete("/me", async ({ user, set }) => {
    const { status, body: responseBody } = await profileController.deleteProfile(user!._id);
    set.status = status;
    return responseBody;
  });
