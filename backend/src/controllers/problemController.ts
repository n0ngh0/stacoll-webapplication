import Problem from "../models/Problem";

export const problemController = {
  // GET /api/skills/:skillId/problems?level=beginner — ดึงคำถามสำหรับทำข้อสอบ (ไม่ส่ง correctAnswer)
  async getProblemsForAssessment(skillId: string, level?: string) {
    try {
      const filter: any = { skillId, isActive: true };
      if (level) {
        filter.level = level;
      }

      const problems = await Problem.find(filter)
        .select("-correctAnswer -explanation") // ไม่ส่งเฉลยให้ user
        .sort({ order: 1 })
        .lean();

      return {
        status: 200,
        body: {
          success: true,
          message: "Problems fetched successfully",
          problems,
          total: problems.length,
        },
      };
    } catch (err: any) {
      return {
        status: 500,
        body: { success: false, message: "Error fetching problems", error: err.message },
      };
    }
  },

  // GET /api/admin/skills/:skillId/problems — ดึงคำถามทั้งหมด (รวม correctAnswer สำหรับ admin)
  async getProblemsForAdmin(skillId: string, level?: string) {
    try {
      const filter: any = { skillId };
      if (level) {
        filter.level = level;
      }

      const problems = await Problem.find(filter)
        .sort({ level: 1, order: 1 })
        .lean();

      return {
        status: 200,
        body: {
          success: true,
          message: "Problems fetched successfully",
          problems,
          total: problems.length,
        },
      };
    } catch (err: any) {
      return {
        status: 500,
        body: { success: false, message: "Error fetching problems", error: err.message },
      };
    }
  },

  // POST /api/admin/skills/:skillId/problems — เพิ่มคำถามใหม่ (admin only)
  async createProblem(skillId: string, body: any) {
    try {
      if (!body || !body.question) {
        return {
          status: 400,
          body: { success: false, message: "Question is required" },
        };
      }
      if (body.questionType !== "coding" && !body.correctAnswer) {
        return {
          status: 400,
          body: { success: false, message: "correctAnswer is required for this question type" },
        };
      }

      const problem = await Problem.create({
        ...body,
        skillId,
      });

      return {
        status: 201,
        body: { success: true, message: "Problem created successfully", problem },
      };
    } catch (err: any) {
      return {
        status: 500,
        body: { success: false, message: "Error creating problem", error: err.message },
      };
    }
  },

  // GET /api/admin/problems/:id — ดึงคำถามเดียว (admin)
  async getProblemById(id: string) {
    try {
      const problem = await Problem.findById(id).populate("languageId").lean();

      if (!problem) {
        return { status: 404, body: { success: false, message: "Problem not found" } };
      }

      return {
        status: 200,
        body: { success: true, message: "Problem fetched successfully", problem },
      };
    } catch (err: any) {
      return {
        status: 500,
        body: { success: false, message: "Error fetching problem", error: err.message },
      };
    }
  },

  // PUT /api/admin/problems/:id — แก้ไขคำถาม (admin only)
  async updateProblem(id: string, body: any) {
    try {
      if (!body) {
        return { status: 400, body: { success: false, message: "Request body is empty" } };
      }

      const problem = await Problem.findByIdAndUpdate(
        id,
        { $set: body },
        { new: true, runValidators: true }
      ).lean();

      if (!problem) {
        return { status: 404, body: { success: false, message: "Problem not found" } };
      }

      return {
        status: 200,
        body: { success: true, message: "Problem updated successfully", problem },
      };
    } catch (err: any) {
      return {
        status: 500,
        body: { success: false, message: "Error updating problem", error: err.message },
      };
    }
  },

  // DELETE /api/admin/problems/:id — ลบคำถาม (admin only)
  async deleteProblem(id: string) {
    try {
      const problem = await Problem.findByIdAndDelete(id).lean();

      if (!problem) {
        return { status: 404, body: { success: false, message: "Problem not found" } };
      }

      return {
        status: 200,
        body: { success: true, message: "Problem deleted successfully" },
      };
    } catch (err: any) {
      return {
        status: 500,
        body: { success: false, message: "Error deleting problem", error: err.message },
      };
    }
  },
};
