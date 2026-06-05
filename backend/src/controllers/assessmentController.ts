import AssessmentResult from "../models/AssessmentResult";
import Problem from "../models/Problem";
import Skill from "../models/Skill";
import User from "../models/User";
import Language from "../models/Language";
import mongoose from "mongoose";
import {
  entriesByLevel,
  getEffectiveLevel,
  getExpiresAt,
  getSkillRenewalState,
  isEntryExpired,
  isLevelValid,
  upsertVerifiedSkill,
  validateAssessmentAttempt,
} from "../utils/verified-skills";

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
      const [results, user] = await Promise.all([
        AssessmentResult.find({ userId, skillId }).sort({ createdAt: -1 }).lean(),
        User.findById(userId).lean(),
      ]);

      const skillEntries = (user?.verifiedSkills ?? []).filter(
        (v) => v.skillId.toString() === skillId
      );
      const byLevel = entriesByLevel(skillEntries as any);
      const now = new Date();

      const validLevels: Record<string, boolean> = {
        beginner: isLevelValid(byLevel, "beginner", now),
        intermediate: isLevelValid(byLevel, "intermediate", now),
        advanced: isLevelValid(byLevel, "advanced", now),
      };

      const expiredLevels: Record<string, boolean> = {
        beginner: Boolean(byLevel.get("beginner") && isEntryExpired(byLevel.get("beginner")!, now)),
        intermediate: Boolean(byLevel.get("intermediate") && isEntryExpired(byLevel.get("intermediate")!, now)),
        advanced: Boolean(byLevel.get("advanced") && isEntryExpired(byLevel.get("advanced")!, now)),
      };

      const levelDetails: Record<string, { expiresAt: string | null; isValid: boolean; isExpired: boolean }> = {};
      for (const level of ["beginner", "intermediate", "advanced"] as const) {
        const entry = byLevel.get(level);
        levelDetails[level] = {
          expiresAt: entry ? getExpiresAt(entry as any).toISOString() : null,
          isValid: validLevels[level],
          isExpired: entry ? isEntryExpired(entry as any, now) : false,
        };
      }

      const effective = getEffectiveLevel(skillEntries as any, now);
      const renewalState = getSkillRenewalState(skillEntries as any, now);

      const passedLevels = { ...validLevels };

      const cooldowns: Record<string, { active: boolean; daysRemaining: number }> = {
        beginner: { active: false, daysRemaining: 0 },
        intermediate: { active: false, daysRemaining: 0 },
        advanced: { active: false, daysRemaining: 0 },
      };

      const latestFails: Record<string, any> = {};
      for (const res of results) {
        if (!latestFails[res.level] && !validLevels[res.level]) {
          latestFails[res.level] = res;
        }
      }

      const nowMs = Date.now();
      for (const [level, res] of Object.entries(latestFails)) {
        const timePassed = nowMs - new Date(res.createdAt).getTime();
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
          validLevels,
          expiredLevels,
          levelDetails,
          effectiveLevel: effective?.level ?? null,
          renewalState: {
            highestAchievedLevel: renewalState.highestAchievedLevel,
            graceLevel: renewalState.graceLevel,
            graceExpiresAt: renewalState.graceExpiresAt?.toISOString() ?? null,
            graceDaysRemaining: renewalState.graceDaysRemaining,
            isInGracePeriod: renewalState.isInGracePeriod,
            mustRestartFromBeginner: renewalState.mustRestartFromBeginner,
            renewTargetLevel: renewalState.renewTargetLevel,
          },
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
      const user = await User.findById(userId).lean();
      const skillEntries = (user?.verifiedSkills ?? []).filter(
        (v) => v.skillId.toString() === skillId
      );
      const byLevel = entriesByLevel(skillEntries as any);
      const now = new Date();
      const normalizedLevel = level.toLowerCase();
      const renewalState = getSkillRenewalState(skillEntries as any, now);
      const access = validateAssessmentAttempt(byLevel, normalizedLevel, renewalState, now);

      if (!access.allowed) {
        return {
          status: access.message?.includes("still valid") ? 400 : 403,
          body: { success: false, message: access.message },
        };
      }

      const lastAttempt = await AssessmentResult.findOne({ userId, skillId, level: normalizedLevel }).sort({ createdAt: -1 });
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

      const problems = await Problem.find({ skillId, level: normalizedLevel, isActive: true })
        .select("-correctAnswer")
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
      const normalizedLevel = level.toLowerCase();
      const user = await User.findById(userId).lean();
      const skillEntries = (user?.verifiedSkills ?? []).filter(
        (v) => v.skillId.toString() === skillId
      );
      const byLevel = entriesByLevel(skillEntries as any);
      const now = new Date();
      const renewalState = getSkillRenewalState(skillEntries as any, now);
      const access = validateAssessmentAttempt(byLevel, normalizedLevel, renewalState, now);

      if (!access.allowed) {
        return {
          status: access.message?.includes("still valid") ? 400 : 403,
          body: { success: false, message: access.message },
        };
      }

      const lastAttempt = await AssessmentResult.findOne({ userId, skillId, level: normalizedLevel }).sort({ createdAt: -1 });
      if (lastAttempt && !lastAttempt.passed) {
        const timePassed = Date.now() - new Date(lastAttempt.createdAt).getTime();
        const daysPassed = timePassed / (1000 * 60 * 60 * 24);
        if (daysPassed < COOLDOWN_DAYS) {
          return { status: 403, body: { success: false, message: "Cooldown active" } };
        }
      }

      const problems = await Problem.find({ skillId, level: normalizedLevel, isActive: true }).populate("languageId").lean();
      
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
      await AssessmentResult.create({
        userId,
        skillId,
        level: normalizedLevel,
        score,
        passed,
        answers: answerRecords,
      });

      if (passed) {
        const skill = await Skill.findById(skillId);
        if (skill) {
          await upsertVerifiedSkill(
            userId,
            skillId,
            skill.title,
            normalizedLevel,
            score
          );
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
      
      const lang = await Language.findOne({ judge0_id: body.language_id });
      let finalSourceCode = body.source_code;
      if (lang && lang.driverTemplate) {
        finalSourceCode = lang.driverTemplate.replace("{{USER_CODE}}", body.source_code);
      }
      
      const res = await fetch("https://api.jdoodle.com/v1/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientSecret,
          script: finalSourceCode,
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
