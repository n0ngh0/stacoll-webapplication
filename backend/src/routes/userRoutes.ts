import { Elysia } from "elysia";
import { userController } from "../controllers/userController";
import { requireAdmin } from "../middlewares/authMiddleware";

export const userRoutes = new Elysia({ prefix: "/api/admin/users" })
  .use(requireAdmin)
  .get("/", async ({ set }) => {
    const { status, body } = await userController.getAllUsers();
    set.status = status;
    return body;
  });
