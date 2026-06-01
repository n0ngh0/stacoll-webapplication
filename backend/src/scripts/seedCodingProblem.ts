import mongoose from "mongoose";
import dotenv from "dotenv";
import Skill from "../models/Skill";
import Problem from "../models/Problem";
import Language from "../models/Language";
import connectDB from "../config/database";

dotenv.config();

const seedCodingProblem = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB...");

    // 1. Get a Language (e.g., Python)
    const python = await Language.findOne({ name: /Python/i });
    if (!python) {
      console.log("Python language not found in DB! Please run seedLanguages.ts first.");
      process.exit(1);
    }
    console.log(`Found Language: ${python.name} (Judge0 ID: ${python.judge0_id})`);

    // 2. Ensure a "Python" skill exists
    let skill = await Skill.findOne({ title: "Python Basics" });
    if (!skill) {
      skill = new Skill({
        title: "Python Basics",
        icon: "Python",
        description: "Learn the basics of Python programming.",
        category: "programming",
        levels: [
          { level: "beginner", description: "Variables, Loops, and Functions", estimatedTime: 30 },
          { level: "intermediate", description: "Data Structures and Algorithms", estimatedTime: 45 },
          { level: "advanced", description: "OOP and System Design", estimatedTime: 60 }
        ]
      });
      await skill.save();
      console.log("Created 'Python Basics' Skill.");
    } else {
      console.log("Skill 'Python Basics' already exists.");
    }

    // 3. Delete old mock problems
    await Problem.deleteMany({ skillId: skill._id, questionType: "coding" });

    // 4. Create the competitive programming problem
    const problemData = {
      skillId: skill._id,
      level: "beginner",
      question: "Sum of Array",
      questionType: "coding",
      languageId: python._id,
      templateCode: `def solve(arr):
    # TODO: Calculate the sum of elements in arr
    return sum(arr)
`,
      testCases: [
        {
          input: "1 2 3 4 5",
          expectedOutput: "15\n",
          isHidden: false,
        },
        {
          input: "10 -5 20",
          expectedOutput: "25\n",
          isHidden: false,
        },
        {
          input: "100 200 300 400 500",
          expectedOutput: "1500\n",
          isHidden: true, // Hidden test case!
        }
      ],
      points: 10,
      order: 1,
      isActive: true,
      explanation: "Sum of all elements in the array.",
    };

    const problem = await Problem.create(problemData);
    console.log(`✅ Created coding problem: ${problem.question}`);

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding coding problem:", error);
    process.exit(1);
  }
};

seedCodingProblem();
