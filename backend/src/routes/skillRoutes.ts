import { Elysia } from "elysia";
import { skillController } from "../controllers/skillController";
import { requireAuth } from "../middlewares/authMiddleware";

// Public/User skill routes
export const skillRoutes = new Elysia({ prefix: "/api/skills" })
  // GET /api/skills — ดึง skill ทั้งหมด (public, ไม่ต้อง login)
  .get("/", async ({ query, set }) => {
    const { status, body } = await skillController.getAllSkills({
      category: query.category as string | undefined,
      search: query.search as string | undefined,
    });
    set.status = status;
    return body;
  })
  // GET /api/skills/:id — ดึง skill detail (ต้อง login)
  .use(requireAuth)
  .get("/:id", async ({ params, set }) => {
    const { status, body } = await skillController.getSkillById(params.id);
    set.status = status;
    return body;
  });
