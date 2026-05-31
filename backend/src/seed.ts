/**
 * Seed Script สำหรับ STACOLL
 * รัน: bun run src/seed.ts
 * 
 * จะสร้าง:
 * - 6 Skills (SQL, Python, Git/GitHub, Data Literacy, C/C++, Docker)
 * - 2-3 ตัวอย่าง Problems ต่อ skill ต่อ level สำหรับทดสอบ
 */

import { configDotenv } from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/database";
import Skill from "./models/Skill";
import Problem from "./models/Problem";

configDotenv();

const seedSkills = [
  {
    title: "SQL",
    description: "ภาษามาตรฐานที่ใช้สำหรับสื่อสาร จัดการ และดึงข้อมูลจากระบบฐานข้อมูลเชิงสัมพันธ์ (Relational Database) เช่น การค้นหา เพิ่ม หรือลบข้อมูลในตาราง",
    category: "analyst" as const,
    icon: "SQL",
    levels: [
      { level: "beginner" as const, description: "ทำพื้นฐานทั่วไปได้", questionCount: 15, estimatedTime: 30 },
      { level: "intermediate" as const, description: "สามารถประยุกต์ใช้งานได้", questionCount: 20, estimatedTime: 45 },
      { level: "advanced" as const, description: "เข้าใจจุดแข็งของภาษานี้จริงๆ", questionCount: 15, estimatedTime: 60 },
    ],
  },
  {
    title: "Python",
    description: "ภาษาโปรแกรมมิ่งยอดนิยมที่เขียนและอ่านง่ายมาก นำไปใช้งานได้ครอบจักรวาล ทั้ง Web, Data Science, AI และอื่นๆ",
    category: "programming" as const,
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1280px-Python-logo-notext.svg.png",
    levels: [
      { level: "beginner" as const, description: "ทำพื้นฐานทั่วไปได้", questionCount: 15, estimatedTime: 30 },
      { level: "intermediate" as const, description: "สามารถประยุกต์ใช้งานได้", questionCount: 20, estimatedTime: 45 },
      { level: "advanced" as const, description: "เข้าใจจุดแข็งของภาษานี้จริงๆ", questionCount: 15, estimatedTime: 60 },
    ],
  },
  {
    title: "Git/GitHub",
    description: "Git คือระบบที่คอยบันทึกประวัติการแก้ไขโค้ด (Version Control) ช่วยให้ทำงานร่วมกันเป็นทีมได้อย่างมีประสิทธิภาพ",
    category: "systems" as const,
    icon: "https://cdn-icons-png.flaticon.com/512/25/25231.png",
    levels: [
      { level: "beginner" as const, description: "ทำพื้นฐานทั่วไปได้", questionCount: 15, estimatedTime: 30 },
      { level: "intermediate" as const, description: "สามารถประยุกต์ใช้งานได้", questionCount: 20, estimatedTime: 45 },
      { level: "advanced" as const, description: "เข้าใจจุดแข็งของภาษานี้จริงๆ", questionCount: 15, estimatedTime: 60 },
    ],
  },
  {
    title: "Data Literacy",
    description: "ทักษะความรู้เท่าทันข้อมูล หรือความสามารถในการอ่าน ทำความเข้าใจ วิเคราะห์ และสื่อสารเรื่องราวจากข้อมูล",
    category: "analyst" as const,
    icon: "https://www.freeiconspng.com/thumbs/sql-server-icon-png/sql-server-icon-png-29.png",
    levels: [
      { level: "beginner" as const, description: "ทำพื้นฐานทั่วไปได้", questionCount: 15, estimatedTime: 30 },
      { level: "intermediate" as const, description: "สามารถประยุกต์ใช้งานได้", questionCount: 20, estimatedTime: 45 },
      { level: "advanced" as const, description: "เข้าใจจุดแข็งของภาษานี้จริงๆ", questionCount: 15, estimatedTime: 60 },
    ],
  },
  {
    title: "C/C++",
    description: "ภาษาโปรแกรมมิ่งระดับตำนานที่ขึ้นชื่อเรื่อง 'ความเร็วและประสิทธิภาพ' ใช้ในงาน System Programming, Game Engine และอื่นๆ",
    category: "programming" as const,
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/ISO_C%2B%2B_Logo.svg/1920px-ISO_C%2B%2B_Logo.svg.png",
    levels: [
      { level: "beginner" as const, description: "ทำพื้นฐานทั่วไปได้", questionCount: 15, estimatedTime: 30 },
      { level: "intermediate" as const, description: "สามารถประยุกต์ใช้งานได้", questionCount: 20, estimatedTime: 45 },
      { level: "advanced" as const, description: "เข้าใจจุดแข็งของภาษานี้จริงๆ", questionCount: 15, estimatedTime: 60 },
    ],
  },
  {
    title: "Docker",
    description: "เครื่องมือจำลองสภาพแวดล้อมที่เรียกว่า 'Container' ช่วยให้ deploy แอปพลิเคชันได้สะดวกและเป็นมาตรฐานเดียวกัน",
    category: "systems" as const,
    icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/docker-icon.png",
    levels: [
      { level: "beginner" as const, description: "ทำพื้นฐานทั่วไปได้", questionCount: 15, estimatedTime: 30 },
      { level: "intermediate" as const, description: "สามารถประยุกต์ใช้งานได้", questionCount: 20, estimatedTime: 45 },
      { level: "advanced" as const, description: "เข้าใจจุดแข็งของภาษานี้จริงๆ", questionCount: 15, estimatedTime: 60 },
    ],
  },
];

// Sample problems สำหรับ SQL (ตัวอย่าง 2 ข้อต่อ level)
function getSQLProblems(skillId: mongoose.Types.ObjectId) {
  return [
    // Beginner
    {
      skillId,
      level: "beginner",
      question: "คำสั่งใดใช้สำหรับดึงข้อมูลจากตาราง?",
      questionType: "multiple_choice",
      choices: [
        { label: "A", text: "SELECT" },
        { label: "B", text: "INSERT" },
        { label: "C", text: "UPDATE" },
        { label: "D", text: "DELETE" },
      ],
      correctAnswer: "A",
      explanation: "SELECT ใช้สำหรับดึงข้อมูลจากตารางในฐานข้อมูล",
      order: 1,
    },
    {
      skillId,
      level: "beginner",
      question: "คำสั่ง WHERE ใช้สำหรับอะไร?",
      questionType: "multiple_choice",
      choices: [
        { label: "A", text: "เรียงลำดับข้อมูล" },
        { label: "B", text: "กรองข้อมูลตามเงื่อนไข" },
        { label: "C", text: "สร้างตารางใหม่" },
        { label: "D", text: "ลบตาราง" },
      ],
      correctAnswer: "B",
      explanation: "WHERE ใช้สำหรับกรองข้อมูลตามเงื่อนไขที่กำหนด",
      order: 2,
    },
    // Intermediate
    {
      skillId,
      level: "intermediate",
      question: "JOIN ประเภทใดจะแสดงเฉพาะแถวที่มีข้อมูลตรงกันทั้งสองตาราง?",
      questionType: "multiple_choice",
      choices: [
        { label: "A", text: "LEFT JOIN" },
        { label: "B", text: "RIGHT JOIN" },
        { label: "C", text: "INNER JOIN" },
        { label: "D", text: "FULL OUTER JOIN" },
      ],
      correctAnswer: "C",
      explanation: "INNER JOIN จะแสดงเฉพาะแถวที่มีค่า key ตรงกันในทั้งสองตาราง",
      order: 1,
    },
    {
      skillId,
      level: "intermediate",
      question: "คำสั่ง GROUP BY ใช้ร่วมกับอะไรเป็นหลัก?",
      questionType: "multiple_choice",
      choices: [
        { label: "A", text: "WHERE" },
        { label: "B", text: "Aggregate Functions เช่น COUNT, SUM" },
        { label: "C", text: "ORDER BY" },
        { label: "D", text: "LIMIT" },
      ],
      correctAnswer: "B",
      explanation: "GROUP BY ใช้จัดกลุ่มข้อมูลร่วมกับ Aggregate Functions เพื่อสรุปผล",
      order: 2,
    },
    // Advanced
    {
      skillId,
      level: "advanced",
      question: "Window Function ใดใช้สำหรับจัดลำดับโดยไม่ข้ามลำดับ?",
      questionType: "multiple_choice",
      choices: [
        { label: "A", text: "ROW_NUMBER()" },
        { label: "B", text: "RANK()" },
        { label: "C", text: "DENSE_RANK()" },
        { label: "D", text: "NTILE()" },
      ],
      correctAnswer: "C",
      explanation: "DENSE_RANK() จัดลำดับโดยไม่ข้ามลำดับเมื่อมีค่าเท่ากัน ต่างจาก RANK() ที่จะข้ามลำดับ",
      order: 1,
    },
    {
      skillId,
      level: "advanced",
      question: "CTE (Common Table Expression) ให้ประโยชน์อะไรมากที่สุด?",
      questionType: "multiple_choice",
      choices: [
        { label: "A", text: "เพิ่มความเร็วในการ query เสมอ" },
        { label: "B", text: "ทำให้ query ซับซ้อนอ่านง่ายขึ้นและสามารถ recursive ได้" },
        { label: "C", text: "สร้างตารางถาวรอัตโนมัติ" },
        { label: "D", text: "ลบข้อมูลซ้ำอัตโนมัติ" },
      ],
      correctAnswer: "B",
      explanation: "CTE ช่วยทำให้ query ซับซ้อนอ่านง่ายขึ้น และรองรับ Recursive Query",
      order: 2,
    },
  ];
}

// Sample problems สำหรับ Python
function getPythonProblems(skillId: mongoose.Types.ObjectId) {
  return [
    {
      skillId,
      level: "beginner",
      question: "ตัวแปรในภาษา Python จำเป็นต้องประกาศ type ก่อนใช้งานหรือไม่?",
      questionType: "multiple_choice",
      choices: [
        { label: "A", text: "จำเป็นต้องประกาศเสมอ" },
        { label: "B", text: "ไม่จำเป็น Python เป็น Dynamically Typed" },
        { label: "C", text: "ต้องประกาศเฉพาะตัวแปร global" },
        { label: "D", text: "ต้องประกาศเมื่อใช้ใน function" },
      ],
      correctAnswer: "B",
      explanation: "Python เป็นภาษา Dynamically Typed ไม่จำเป็นต้องประกาศ type ล่วงหน้า",
      order: 1,
    },
    {
      skillId,
      level: "beginner",
      question: "ผลลัพธ์ของ print(type([1, 2, 3])) คืออะไร?",
      questionType: "multiple_choice",
      choices: [
        { label: "A", text: "<class 'tuple'>" },
        { label: "B", text: "<class 'list'>" },
        { label: "C", text: "<class 'dict'>" },
        { label: "D", text: "<class 'set'>" },
      ],
      correctAnswer: "B",
      explanation: "[1, 2, 3] เป็น list ใน Python ใช้ [] ในการสร้าง",
      order: 2,
    },
    {
      skillId,
      level: "intermediate",
      question: "List Comprehension ข้อใดสร้าง list ของเลขคู่ตั้งแต่ 0-9?",
      questionType: "multiple_choice",
      choices: [
        { label: "A", text: "[x for x in range(10) if x % 2 == 0]" },
        { label: "B", text: "[x for x in range(10) if x % 2]" },
        { label: "C", text: "[x % 2 for x in range(10)]" },
        { label: "D", text: "[x for x in range(0, 10, 3)]" },
      ],
      correctAnswer: "A",
      explanation: "ใช้ if x % 2 == 0 เพื่อกรองเฉพาะเลขคู่",
      order: 1,
    },
    {
      skillId,
      level: "advanced",
      question: "Decorator ใน Python ทำหน้าที่อะไร?",
      questionType: "multiple_choice",
      choices: [
        { label: "A", text: "สร้าง class ใหม่" },
        { label: "B", text: "เพิ่มหรือเปลี่ยนพฤติกรรมของ function โดยไม่แก้ไขโค้ดเดิม" },
        { label: "C", text: "จัดการ memory อัตโนมัติ" },
        { label: "D", text: "แปลง Python เป็นภาษาอื่น" },
      ],
      correctAnswer: "B",
      explanation: "Decorator ใช้ wrap function เพื่อเพิ่มหรือเปลี่ยนพฤติกรรมโดยไม่ต้องแก้ไขโค้ดเดิม",
      order: 1,
    },
  ];
}

// Sample problems สำหรับ Git/GitHub
function getGitProblems(skillId: mongoose.Types.ObjectId) {
  return [
    {
      skillId,
      level: "beginner",
      question: "คำสั่ง git init ใช้สำหรับอะไร?",
      questionType: "multiple_choice",
      choices: [
        { label: "A", text: "Clone repository จาก remote" },
        { label: "B", text: "สร้าง Git repository ใหม่ใน directory ปัจจุบัน" },
        { label: "C", text: "ลบ Git repository" },
        { label: "D", text: "อัพเดท Git version" },
      ],
      correctAnswer: "B",
      explanation: "git init ใช้สำหรับ initialize (สร้าง) Git repository ใหม่",
      order: 1,
    },
    {
      skillId,
      level: "intermediate",
      question: "คำสั่ง git rebase ต่างจาก git merge อย่างไร?",
      questionType: "multiple_choice",
      choices: [
        { label: "A", text: "rebase สร้าง merge commit แต่ merge ไม่สร้าง" },
        { label: "B", text: "rebase เขียน history ใหม่ให้เป็นเส้นตรง ส่วน merge สร้าง merge commit" },
        { label: "C", text: "ทั้งสองทำงานเหมือนกัน" },
        { label: "D", text: "rebase ใช้ได้กับ remote เท่านั้น" },
      ],
      correctAnswer: "B",
      explanation: "git rebase เขียน commit history ใหม่ให้เป็นเส้นตรง ส่วน merge จะสร้าง merge commit",
      order: 1,
    },
    {
      skillId,
      level: "advanced",
      question: "คำสั่ง git bisect ใช้สำหรับอะไร?",
      questionType: "multiple_choice",
      choices: [
        { label: "A", text: "แบ่ง repository เป็น 2 ส่วน" },
        { label: "B", text: "ค้นหา commit ที่ทำให้เกิด bug โดยใช้ binary search" },
        { label: "C", text: "รวม 2 branches เข้าด้วยกัน" },
        { label: "D", text: "ลบ branch ที่ไม่ใช้แล้ว" },
      ],
      correctAnswer: "B",
      explanation: "git bisect ใช้ binary search เพื่อหา commit ที่ทำให้เกิด bug อย่างรวดเร็ว",
      order: 1,
    },
  ];
}

async function seed() {
  await connectDB();
  
  console.log("🌱 Starting seed process...\n");

  // Clear existing data
  await Skill.deleteMany({});
  await Problem.deleteMany({});
  console.log("🗑️  Cleared existing Skills and Problems\n");

  // Create skills
  const createdSkills = await Skill.insertMany(seedSkills);
  console.log(`✅ Created ${createdSkills.length} Skills:`);
  createdSkills.forEach((s) => console.log(`   - ${s.title} (${s.category})`));

  // Create problems for specific skills
  const sqlSkill = createdSkills.find((s) => s.title === "SQL");
  const pythonSkill = createdSkills.find((s) => s.title === "Python");
  const gitSkill = createdSkills.find((s) => s.title === "Git/GitHub");

  const allProblems = [
    ...(sqlSkill ? getSQLProblems(sqlSkill._id as mongoose.Types.ObjectId) : []),
    ...(pythonSkill ? getPythonProblems(pythonSkill._id as mongoose.Types.ObjectId) : []),
    ...(gitSkill ? getGitProblems(gitSkill._id as mongoose.Types.ObjectId) : []),
  ];

  const createdProblems = await Problem.insertMany(allProblems);
  console.log(`\n✅ Created ${createdProblems.length} Problems:`);
  console.log(`   - SQL: ${allProblems.filter((p) => p.skillId === sqlSkill?._id).length} problems`);
  console.log(`   - Python: ${allProblems.filter((p) => p.skillId === pythonSkill?._id).length} problems`);
  console.log(`   - Git/GitHub: ${allProblems.filter((p) => p.skillId === gitSkill?._id).length} problems`);

  console.log("\n🎉 Seed completed successfully!");
  
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
