import { Elysia, t } from "elysia";
import { assessmentController } from "../controllers/assessmentController";
import { requireAuth, AuthUser } from "../middlewares/authMiddleware";

export const assessmentRoutes = new Elysia({ prefix: "/api/assessment" })
  .use(requireAuth)
  
  // GET /api/assessment/:skillId/progress
  .get("/:skillId/progress", async ({ params, user, set }) => {
    const authUser = user as AuthUser;
    const { status, body } = await assessmentController.getUserProgress(authUser._id.toString(), params.skillId);
    set.status = status;
    return body;
  })

  // POST /api/assessment/:skillId/start
  .post("/:skillId/start", async ({ params, body, user, set }) => {
    const authUser = user as AuthUser;
    const { status, body: responseBody } = await assessmentController.startAssessment(
      authUser._id.toString(), 
      params.skillId, 
      body.level
    );
    set.status = status;
    return responseBody;
  }, {
    body: t.Object({
      level: t.Union([t.Literal("beginner"), t.Literal("intermediate"), t.Literal("advanced")]),
    })
  })

  // POST /api/assessment/:skillId/submit
  .post("/:skillId/submit", async ({ params, body, user, set }) => {
    const authUser = user as AuthUser;
    const { status, body: responseBody } = await assessmentController.submitAssessment(
      authUser._id.toString(), 
      params.skillId, 
      body.level,
      body.answers
    );
    set.status = status;
    return responseBody;
  }, {
    body: t.Object({
      level: t.Union([t.Literal("beginner"), t.Literal("intermediate"), t.Literal("advanced")]),
      answers: t.Record(t.String(), t.Any()),
    })
  })

  // GET /api/assessment/history
  .get("/history", async ({ user, set }) => {
    const authUser = user as AuthUser;
    const { status, body } = await assessmentController.getUserAssessmentHistory(authUser._id.toString());
    set.status = status;
    return body;
  });
