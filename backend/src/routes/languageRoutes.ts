import { Elysia } from "elysia";
import { languageController } from "../controllers/languageController";

export const languageRoutes = new Elysia({ prefix: "/api/languages" })
  .get("/", async ({ set }) => {
    const { status, body } = await languageController.getAllLanguages();
    set.status = status;
    return body;
  });
