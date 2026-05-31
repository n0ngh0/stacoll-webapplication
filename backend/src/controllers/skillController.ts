import Skill from "../models/Skill";

export const skillController = {
  // GET /api/skills — ดึง skill ทั้งหมด (public)
  async getAllSkills(query?: { category?: string; search?: string }) {
    try {
      const filter: any = { isActive: true };

      if (query?.category && query.category !== "all") {
        filter.category = query.category;
      }

      if (query?.search) {
        filter.$or = [
          { title: { $regex: query.search, $options: "i" } },
          { description: { $regex: query.search, $options: "i" } },
        ];
      }

      const skills = await Skill.find(filter)
        .sort({ category: 1, title: 1 })
        .lean();

      return {
        status: 200,
        body: {
          success: true,
          message: "Skills fetched successfully",
          skills,
          total: skills.length,
        },
      };
    } catch (err: any) {
      return {
        status: 500,
        body: { success: false, message: "Error fetching skills", error: err.message },
      };
    }
  },

  // GET /api/skills/:id — ดึง skill detail
  async getSkillById(id: string) {
    try {
      const skill = await Skill.findById(id).lean();

      if (!skill) {
        return { status: 404, body: { success: false, message: "Skill not found" } };
      }

      return {
        status: 200,
        body: { success: true, message: "Skill fetched successfully", skill },
      };
    } catch (err: any) {
      return {
        status: 500,
        body: { success: false, message: "Error fetching skill", error: err.message },
      };
    }
  },

  // POST /api/admin/skills — สร้าง skill ใหม่ (admin only)
  async createSkill(body: any) {
    try {
      if (!body || !body.title || !body.category) {
        return {
          status: 400,
          body: { success: false, message: "Title and category are required" },
        };
      }

      const existing = await Skill.findOne({ title: body.title });
      if (existing) {
        return {
          status: 400,
          body: { success: false, message: `Skill '${body.title}' already exists` },
        };
      }

      const skill = await Skill.create(body);

      return {
        status: 201,
        body: { success: true, message: "Skill created successfully", skill },
      };
    } catch (err: any) {
      return {
        status: 500,
        body: { success: false, message: "Error creating skill", error: err.message },
      };
    }
  },

  // PUT /api/admin/skills/:id — แก้ไข skill (admin only)
  async updateSkill(id: string, body: any) {
    try {
      if (!body) {
        return { status: 400, body: { success: false, message: "Request body is empty" } };
      }

      const skill = await Skill.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true }).lean();

      if (!skill) {
        return { status: 404, body: { success: false, message: "Skill not found" } };
      }

      return {
        status: 200,
        body: { success: true, message: "Skill updated successfully", skill },
      };
    } catch (err: any) {
      if (err.code === 11000) {
        return {
          status: 400,
          body: { success: false, message: `Skill title already exists` },
        };
      }
      return {
        status: 500,
        body: { success: false, message: "Error updating skill", error: err.message },
      };
    }
  },

  // DELETE /api/admin/skills/:id — ลบ skill (admin only)
  async deleteSkill(id: string) {
    try {
      const skill = await Skill.findByIdAndDelete(id).lean();

      if (!skill) {
        return { status: 404, body: { success: false, message: "Skill not found" } };
      }

      return {
        status: 200,
        body: { success: true, message: "Skill deleted successfully" },
      };
    } catch (err: any) {
      return {
        status: 500,
        body: { success: false, message: "Error deleting skill", error: err.message },
      };
    }
  },
};
