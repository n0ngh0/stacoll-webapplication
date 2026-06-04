import AssessmentResult from "../models/AssessmentResult";
import Problem from "../models/Problem";
import Skill from "../models/Skill";
import User from "../models/User";
import mongoose from "mongoose";

const PASSING_SCORE = 60;
const COOLDOWN_DAYS = 14;

function getJDoodleConfig(judge0_id: number): { language: string; versionIndex: string } {
  const map: Record<number, { language: string; versionIndex: string }> = {
    45: { language: "nasm", versionIndex: "3" },
    46: { language: "bash", versionIndex: "3" },
    50: { language: "c", versionIndex: "4" },
    54: { language: "cpp", versionIndex: "4" },
    62: { language: "java", versionIndex: "3" },
    63: { language: "nodejs", versionIndex: "3" },
    71: { language: "python3", versionIndex: "3" },
  };
  return map[judge0_id] || { language: "python3", versionIndex: "3" };
}

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
      const problems = await Problem.find({ skillId, level, isActive: true }).populate("languageId").lean();
      
      if (problems.length === 0) {
        return { status: 404, body: { success: false, message: "No problems found." } };
      }

      // 3. ตรวจคำตอบ
      let correctCount = 0;
      const answerRecords = [];

      for (const p of problems) {
        const userAnswer = submittedAnswers[p._id.toString()];
        let isCorrect = false;

        if (p.questionType === "coding") {
          // Eval with Judge0
          if (!userAnswer || userAnswer.trim() === "") {
            isCorrect = false;
          } else if (p.testCases && p.testCases.length > 0) {
            const lang = p.languageId as any; // populated
            let allTestsPassed = true;

            for (const tc of p.testCases) {
              try {
                let finalSourceCode = userAnswer;
                if (lang.driverTemplate) {
                  finalSourceCode = lang.driverTemplate.replace("{{USER_CODE}}", userAnswer);
                }

                const jDoodleConfig = getJDoodleConfig(lang.judge0_id);
                const clientId = process.env.JDOODLE_CLIENT_ID || "";
                const clientSecret = process.env.JDOODLE_CLIENT_SECRET || "";

                const res = await fetch("https://api.jdoodle.com/v1/execute", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    clientId,
                    clientSecret,
                    script: finalSourceCode,
                    language: jDoodleConfig.language,
                    versionIndex: jDoodleConfig.versionIndex,
                    stdin: tc.input || "",
                  }),
                });
                const data = await res.json();
                
                const actualOutput = data.output?.trim() || "";
                const expected = tc.expectedOutput?.trim() || "";
                
                if (data.error || actualOutput !== expected) {
                  allTestsPassed = false;
                  break;
                }
              } catch (e) {
                allTestsPassed = false;
                break;
              }
            }
            isCorrect = allTestsPassed;
          } else {
            // No test cases? Automatically fail or pass? Let's say pass if code exists.
            isCorrect = true;
          }
        } else {
          isCorrect = userAnswer === p.correctAnswer;
        }

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

  // POST /api/assessment/:skillId/verify-problem/:problemId
  async verifySingleProblem(userId: string, skillId: string, problemId: string, source_code: string) {
    try {
      const problem = await Problem.findOne({ _id: problemId, skillId }).populate("languageId");
      if (!problem) {
        return { status: 404, body: { success: false, message: "Problem not found." } };
      }

      if (problem.questionType !== "coding") {
        return { status: 400, body: { success: false, message: "Only coding problems can be verified." } };
      }

      if (!source_code || source_code.trim() === "") {
        return { status: 400, body: { success: false, message: "Source code is empty." } };
      }

      const lang = problem.languageId as any;

      if (!problem.testCases || problem.testCases.length === 0) {
        return { status: 200, body: { success: true, passed: true, results: [] } };
      }

      const results = [];
      let allTestsPassed = true;

      // Evaluate against all test cases (both public and hidden)
      for (let i = 0; i < problem.testCases.length; i++) {
        const tc = problem.testCases[i];
        try {
          let finalSourceCode = source_code;
          if (lang.driverTemplate) {
            finalSourceCode = lang.driverTemplate.replace("{{USER_CODE}}", source_code);
          }

          const jDoodleConfig = getJDoodleConfig(lang.judge0_id);
          const clientId = process.env.JDOODLE_CLIENT_ID || "";
          const clientSecret = process.env.JDOODLE_CLIENT_SECRET || "";

          const res = await fetch("https://api.jdoodle.com/v1/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clientId,
              clientSecret,
              script: finalSourceCode,
              language: jDoodleConfig.language,
              versionIndex: jDoodleConfig.versionIndex,
              stdin: tc.input || "",
            }),
          });
          
          const data = await res.json();
          
          const actualOutput = data.output?.trim() || "";
          const expected = tc.expectedOutput?.trim() || "";
          
          let passed = false;
          let statusDesc = "Unknown";
          
          if (data.error) {
            passed = false;
            statusDesc = "API/Compilation Error";
          } else if (actualOutput !== expected) {
            passed = false;
            statusDesc = "Wrong Answer";
          } else {
            passed = true;
            statusDesc = "Accepted";
          }
          
          if (!passed) allTestsPassed = false;
          
          results.push({
            testCaseIndex: i + 1,
            passed,
            isHidden: tc.isHidden,
            input: tc.isHidden ? "Hidden Test Case" : tc.input,
            expectedOutput: tc.isHidden ? "Hidden Output" : tc.expectedOutput,
            actualOutput: tc.isHidden ? (passed ? "Correct" : "Incorrect") : (data.output || data.error || ""),
            status: statusDesc,
          });
          
          // Fast-fail: optionally we can stop at first failure, but giving all results is better.
        } catch (e: any) {
          allTestsPassed = false;
          results.push({
            testCaseIndex: i + 1,
            passed: false,
            isHidden: tc.isHidden,
            error: e.message
          });
        }
      }

      return {
        status: 200,
        body: {
          success: true,
          passed: allTestsPassed,
          results
        }
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
        body: { success: true, message: "History fetched successfully", history: results },
      };
    } catch (err: any) {
      return { status: 500, body: { success: false, message: "Error fetching history", error: err.message } };
    }
  },

  // POST /api/assessment/execute — Proxy to JDoodle API to run code safely from backend
  async executeCode(body: { language_id: number; source_code: string; stdin?: string }) {
    try {
      const jDoodleConfig = getJDoodleConfig(body.language_id);
      const clientId = process.env.JDOODLE_CLIENT_ID || "";
      const clientSecret = process.env.JDOODLE_CLIENT_SECRET || "";
      
      const res = await fetch("https://api.jdoodle.com/v1/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientSecret,
          script: body.source_code,
          language: jDoodleConfig.language,
          versionIndex: jDoodleConfig.versionIndex,
          stdin: body.stdin || "",
        }),
      });

      const data = await res.json();
      
      const mappedData = {
        stdout: data.output || "",
        stderr: data.error || "",
        compile_output: "",
        status: {
          id: data.error ? 11 : 3,
          description: data.error ? "Error" : "Executed"
        }
      };
      
      return {
        status: res.status === 200 || res.status === 201 ? 200 : res.status,
        body: { success: res.ok && !data.error, data: mappedData, message: data.error || "Execution completed" },
      };
    } catch (err: any) {
      return { status: 500, body: { success: false, message: "Error executing code", error: err.message } };
    }
  },
};
