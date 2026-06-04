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
            const judge0Url = process.env.JUDGE0_API_URL || "https://ce.judge0.com";
            const lang = p.languageId as any; // populated
            let allTestsPassed = true;

            for (const tc of p.testCases) {
              try {
                let finalSourceCode = userAnswer;
                if (lang.driverTemplate) {
                  finalSourceCode = lang.driverTemplate.replace("{{USER_CODE}}", userAnswer);
                }

                const judge0Key = process.env.JUDGE0_API_KEY;
                const headers: any = { "Content-Type": "application/json" };
                if (judge0Key) {
                  headers["X-RapidAPI-Key"] = judge0Key;
                  headers["X-RapidAPI-Host"] = judge0Url.replace("https://", "").split("/")[0];
                }

                const res = await fetch(`${judge0Url}/submissions?wait=true&base64_encoded=false`, {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    language_id: lang.judge0_id,
                    source_code: finalSourceCode,
                    stdin: tc.input || "",
                    expected_output: tc.expectedOutput,
                  }),
                });
                const data = await res.json();
                // Judge0 status 3 is "Accepted"
                if (data.status?.id !== 3) {
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

      const judge0Url = process.env.JUDGE0_API_URL || "https://ce.judge0.com";
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

          const judge0Key = process.env.JUDGE0_API_KEY;
          const headers: any = { "Content-Type": "application/json" };
          if (judge0Key) {
            headers["X-RapidAPI-Key"] = judge0Key;
            headers["X-RapidAPI-Host"] = judge0Url.replace("https://", "").split("/")[0];
          }

          const res = await fetch(`${judge0Url}/submissions?wait=true&base64_encoded=false`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              language_id: lang.judge0_id,
              source_code: finalSourceCode,
              stdin: tc.input || "",
              expected_output: tc.expectedOutput,
            }),
          });
          
          const data = await res.json();
          const passed = data.status?.id === 3; // 3 = Accepted
          
          if (!passed) allTestsPassed = false;
          
          results.push({
            testCaseIndex: i + 1,
            passed,
            isHidden: tc.isHidden,
            input: tc.isHidden ? "Hidden Test Case" : tc.input,
            expectedOutput: tc.isHidden ? "Hidden Output" : tc.expectedOutput,
            actualOutput: tc.isHidden ? (passed ? "Correct" : "Incorrect") : (data.stdout || data.stderr || data.compile_output || ""),
            status: data.status?.description || "Unknown Error",
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

  // POST /api/assessment/execute — Proxy to Judge0 to run code safely from backend
  async executeCode(body: { language_id: number; source_code: string; stdin?: string }) {
    try {
      const judge0Url = process.env.JUDGE0_API_URL || "https://ce.judge0.com";
      const judge0Key = process.env.JUDGE0_API_KEY;
      const headers: any = { "Content-Type": "application/json" };
      if (judge0Key) {
        headers["X-RapidAPI-Key"] = judge0Key;
        headers["X-RapidAPI-Host"] = judge0Url.replace("https://", "").split("/")[0];
      }
      
      const res = await fetch(`${judge0Url}/submissions?wait=true&base64_encoded=false`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          language_id: body.language_id,
          source_code: body.source_code,
          stdin: body.stdin || "",
        }),
      });

      const data = await res.json();
      
      return {
        status: res.status === 200 || res.status === 201 ? 200 : res.status,
        body: { success: res.ok, data, message: data.message || data.error || "Judge0 Error" },
      };
    } catch (err: any) {
      return { status: 500, body: { success: false, message: "Error executing code", error: err.message } };
    }
  },
};
