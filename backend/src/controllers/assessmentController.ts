import AssessmentResult from "../models/AssessmentResult";
import Problem from "../models/Problem";
import Skill from "../models/Skill";
import User from "../models/User";
import mongoose from "mongoose";

const PASSING_SCORE = 60;
const COOLDOWN_DAYS = 14;

export const assessmentController = {
  // ดึง progress ของ user ใน skill นั้น
  async getUserProgress(userId: string, skillId: string) {
    try {
      const results = await AssessmentResult.find({ userId, skillId }).sort({ createdAt: -1 }).lean();
      
      const passedLevels: Record<string, boolean> = {
        beginner: false,
        intermediate: false,
        advanced: false,
      };

      const cooldowns: Record<string, { active: boolean; daysRemaining: number }> = {
        beginner: { active: false, daysRemaining: 0 },
        intermediate: { active: false, daysRemaining: 0 },
        advanced: { active: false, daysRemaining: 0 },
      };

      // หา passed status ก่อน
      for (const res of results) {
        if (res.passed) {
          passedLevels[res.level] = true;
        }
      }

      // หา cooldown สำหรับอันที่ไม่ผ่าน (ล่าสุดของแต่ละ level)
      const latestFails: Record<string, any> = {};
      for (const res of results) {
        if (!latestFails[res.level] && !passedLevels[res.level]) {
          latestFails[res.level] = res;
        }
      }

      const now = Date.now();
      for (const [level, res] of Object.entries(latestFails)) {
        const timePassed = now - new Date(res.createdAt).getTime();
        const daysPassed = timePassed / (1000 * 60 * 60 * 24);
        
        if (daysPassed < COOLDOWN_DAYS) {
          cooldowns[level] = {
            active: true,
            daysRemaining: Math.ceil(COOLDOWN_DAYS - daysPassed),
          };
        }
      }

      return {
        status: 200,
        body: {
          success: true,
          passedLevels,
          cooldowns,
        },
      };
    } catch (err: any) {
      return { status: 500, body: { success: false, message: err.message } };
    }
  },

  // ตรวจสอบสิทธิ์ และเริ่มทำข้อสอบ
  async startAssessment(userId: string, skillId: string, level: string) {
    try {
      // 1. ตรวจสอบ Level Lock
      if (level === "intermediate" || level === "advanced") {
        const requiredLevel = level === "intermediate" ? "beginner" : "intermediate";
        const passedPrev = await AssessmentResult.findOne({ userId, skillId, level: requiredLevel, passed: true });
        
        if (!passedPrev) {
          return { status: 403, body: { success: false, message: `You must pass ${requiredLevel} level first.` } };
        }
      }

      // 2. ตรวจสอบว่าผ่าน level นี้ไปแล้วหรือยัง
      const alreadyPassed = await AssessmentResult.findOne({ userId, skillId, level, passed: true });
      if (alreadyPassed) {
        return { status: 400, body: { success: false, message: `You have already passed this level.` } };
      }

      // 3. ตรวจสอบ Cooldown
      const lastAttempt = await AssessmentResult.findOne({ userId, skillId, level }).sort({ createdAt: -1 });
      if (lastAttempt && !lastAttempt.passed) {
        const timePassed = Date.now() - new Date(lastAttempt.createdAt).getTime();
        const daysPassed = timePassed / (1000 * 60 * 60 * 24);
        
        if (daysPassed < COOLDOWN_DAYS) {
          return {
            status: 403,
            body: {
              success: false,
              message: "Cooldown active",
              daysRemaining: Math.ceil(COOLDOWN_DAYS - daysPassed),
            },
          };
        }
      }

      // 4. ดึงคำถาม
      const problems = await Problem.find({ skillId, level, isActive: true })
        .select("-correctAnswer -explanation") // ไม่ส่งเฉลย
        .sort({ order: 1 })
        .lean();

      if (problems.length === 0) {
        return { status: 404, body: { success: false, message: "No problems found for this level." } };
      }

      return {
        status: 200,
        body: {
          success: true,
          problems,
          total: problems.length,
        },
      };
    } catch (err: any) {
      return { status: 500, body: { success: false, message: err.message } };
    }
  },

  // ส่งคำตอบและตรวจข้อสอบ
  async submitAssessment(userId: string, skillId: string, level: string, submittedAnswers: Record<string, string>) {
    try {
      // 1. ตรวจสอบอีกรอบว่าผ่านไปแล้วหรือติด cooldown ไหมเพื่อป้องกันการยิง API ตรงๆ
      const alreadyPassed = await AssessmentResult.findOne({ userId, skillId, level, passed: true });
      if (alreadyPassed) {
        return { status: 400, body: { success: false, message: `You have already passed this level.` } };
      }
      
      const lastAttempt = await AssessmentResult.findOne({ userId, skillId, level }).sort({ createdAt: -1 });
      if (lastAttempt && !lastAttempt.passed) {
        const timePassed = Date.now() - new Date(lastAttempt.createdAt).getTime();
        const daysPassed = timePassed / (1000 * 60 * 60 * 24);
        if (daysPassed < COOLDOWN_DAYS) {
          return { status: 403, body: { success: false, message: "Cooldown active" } };
        }
      }

      // 2. ดึงคำถามพร้อมเฉลย
      const problems = await Problem.find({ skillId, level, isActive: true }).lean();
      
      if (problems.length === 0) {
        return { status: 404, body: { success: false, message: "No problems found." } };
      }

      // 3. ตรวจคำตอบ
      let correctCount = 0;
      const answerRecords = [];

      for (const p of problems) {
        const userAnswer = submittedAnswers[p._id.toString()];
        const isCorrect = userAnswer === p.correctAnswer;
        if (isCorrect) correctCount++;
        
        answerRecords.push({
          problemId: p._id,
          selectedAnswer: userAnswer || null,
          isCorrect,
        });
      }

      // 4. คำนวณคะแนน
      const score = Math.round((correctCount / problems.length) * 100);
      const passed = score >= PASSING_SCORE;

      // 5. บันทึกประวัติ
      const result = await AssessmentResult.create({
        userId,
        skillId,
        level,
        score,
        passed,
        answers: answerRecords,
      });

      // 6. ถ้าผ่าน ให้เพิ่มใน User verifiedSkills
      if (passed) {
        const skill = await Skill.findById(skillId);
        if (skill) {
          await User.findByIdAndUpdate(userId, {
            $addToSet: {
              verifiedSkills: {
                skillId: skill._id,
                skillName: skill.title,
                level: level,
                score: score,
                verifiedAt: new Date(),
              }
            }
          });
        }
      }

      return {
        status: 200,
        body: {
          success: true,
          score,
          passed,
          totalQuestions: problems.length,
          correctAnswers: correctCount,
        },
      };
    } catch (err: any) {
      return { status: 500, body: { success: false, message: err.message } };
    }
  },

  // ดึงประวัติทั้งหมดสำหรับ MySkill Page
  async getUserAssessmentHistory(userId: string) {
    try {
      const results = await AssessmentResult.find({ userId })
        .populate("skillId", "title icon category")
        .sort({ createdAt: -1 })
        .lean();

      return {
        status: 200,
        body: {
          success: true,
          history: results,
        },
      };
    } catch (err: any) {
      return { status: 500, body: { success: false, message: err.message } };
    }
  }
};
