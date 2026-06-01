import mongoose from "mongoose";
import Language from "../models/Language";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/stacoll";

const languages = [
  { judge0_id: 45, name: "Assembly (NASM 2.14.02)", monaco_identifier: "assembly", extension: ".asm" },
  { judge0_id: 46, name: "Bash (5.0.0)", monaco_identifier: "shell", extension: ".sh" },
  { judge0_id: 50, name: "C (GCC 9.2.0)", monaco_identifier: "c", extension: ".c" },
  { judge0_id: 54, name: "C++ (GCC 9.2.0)", monaco_identifier: "cpp", extension: ".cpp" },
  { judge0_id: 62, name: "Java (OpenJDK 13.0.1)", monaco_identifier: "java", extension: ".java" },
  { judge0_id: 63, name: "JavaScript (Node.js 12.14.0)", monaco_identifier: "javascript", extension: ".js" },
  { 
    judge0_id: 71, 
    name: "Python (3.8.1)", 
    monaco_identifier: "python", 
    extension: ".py",
    driverTemplate: `import sys\n\n{{USER_CODE}}\n\nif __name__ == "__main__":\n    input_data = sys.stdin.read().split()\n    if input_data:\n        arr = [int(x) for x in input_data]\n        result = solve(arr)\n        print(result)\n`
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    for (const lang of languages) {
      await Language.findOneAndUpdate(
        { judge0_id: lang.judge0_id },
        lang,
        { upsert: true, new: true }
      );
    }

    console.log("Successfully seeded languages");
  } catch (error) {
    console.error("Error seeding languages:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seed();
