import { Elysia, t } from "elysia";
import { skillController } from "../controllers/skillController";
import { problemController } from "../controllers/problemController";
import { requireAdmin } from "../middlewares/authMiddleware";

// Admin-only routes — ใช้ requireAdmin middleware
export const adminRoutes = new Elysia({ prefix: "/api/admin" })
  .use(requireAdmin)

  // ===== SKILL CRUD =====

  // POST /api/admin/skills — สร้าง Skill ใหม่
  .post("/skills", async ({ body, set }) => {
    const { status, body: responseBody } = await skillController.createSkill(body);
    set.status = status;
    return responseBody;
  }, {
    body: t.Object({
      title: t.String(),
      description: t.String(),
      category: t.Union([t.Literal("analyst"), t.Literal("programming"), t.Literal("systems")]),
      icon: t.Optional(t.String()),
      levels: t.Optional(t.Array(t.Object({
        level: t.Union([t.Literal("beginner"), t.Literal("intermediate"), t.Literal("advanced")]),
        description: t.String(),
        fullDescription: t.Optional(t.String()),
        questionCount: t.Optional(t.Number()),
        estimatedTime: t.Optional(t.Number()),
      }))),
      isActive: t.Optional(t.Boolean()),
    })
  })

  // PUT /api/admin/skills/:id — แก้ไข Skill
  .put("/skills/:id", async ({ params, body, set }) => {
    const { status, body: responseBody } = await skillController.updateSkill(params.id, body);
    set.status = status;
    return responseBody;
  })

  // DELETE /api/admin/skills/:id — ลบ Skill
  .delete("/skills/:id", async ({ params, set }) => {
    const { status, body: responseBody } = await skillController.deleteSkill(params.id);
    set.status = status;
    return responseBody;
  })

  // ===== PROBLEM CRUD =====

  // GET /api/admin/skills/:skillId/problems — ดึงคำถามทั้งหมด (รวมเฉลย)
  .get("/skills/:skillId/problems", async ({ params, query, set }) => {
    const { status, body } = await problemController.getProblemsForAdmin(
      params.skillId,
      query.level as string | undefined
    );
    set.status = status;
    return body;
  })

  // POST /api/admin/skills/:skillId/problems — เพิ่มคำถามใหม่
  .post("/skills/:skillId/problems", async ({ params, body, set }) => {
    const { status, body: responseBody } = await problemController.createProblem(params.skillId, body);
    set.status = status;
    return responseBody;
  }, {
    body: t.Object({
      level: t.Union([t.Literal("beginner"), t.Literal("intermediate"), t.Literal("advanced")]),
      question: t.String(),
      questionType: t.Optional(t.Union([t.Literal("multiple_choice"), t.Literal("true_false"), t.Literal("coding")])),
      choices: t.Optional(t.Array(t.Object({
        label: t.String(),
        text: t.String(),
      }))),
      correctAnswer: t.Optional(t.String()),
      explanation: t.Optional(t.String()),
      languageId: t.Optional(t.String()),
      templateCode: t.Optional(t.String()),
      testCases: t.Optional(t.Array(t.Object({
        input: t.Optional(t.String()),
        expectedOutput: t.String(),
        isHidden: t.Optional(t.Boolean()),
      }))),
      points: t.Optional(t.Number()),
      order: t.Optional(t.Number()),
      isActive: t.Optional(t.Boolean()),
    })
  })

  // GET /api/admin/problems/:id — ดึงคำถามเดียว
  .get("/problems/:id", async ({ params, set }) => {
    const { status, body: responseBody } = await problemController.getProblemById(params.id);
    set.status = status;
    return responseBody;
  })

  // PUT /api/admin/problems/:id — แก้ไขคำถาม
  .put("/problems/:id", async ({ params, body, set }) => {
    const { status, body: responseBody } = await problemController.updateProblem(params.id, body);
    set.status = status;
    return responseBody;
  })

  // DELETE /api/admin/problems/:id — ลบคำถาม
  .delete("/problems/:id", async ({ params, set }) => {
    const { status, body: responseBody } = await problemController.deleteProblem(params.id);
    set.status = status;
    return responseBody;
  });
