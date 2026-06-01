import mongoose, { Model, Schema, Types } from "mongoose";

// Interface สำหรับ Choice ของคำถาม
export interface IChoice {
  label: string; // "A", "B", "C", "D"
  text: string;  // เนื้อหาของตัวเลือก
}

export interface ITestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

// Interface หลักของ Problem (ข้อสอบ)
export interface IProblem {
  skillId: Types.ObjectId;
  level: "beginner" | "intermediate" | "advanced";
  question: string;
  questionType: "multiple_choice" | "true_false" | "coding";
  choices?: IChoice[]; // Optional for coding
  correctAnswer?: string; // Optional for coding
  explanation?: string;
  // Fields for coding problems
  languageId?: Types.ObjectId;
  templateCode?: string;
  testCases?: ITestCase[];
  points: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const choiceSchema = new Schema<IChoice>(
  {
    label: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const testCaseSchema = new Schema<ITestCase>(
  {
    input: {
      type: String,
      default: "",
    },
    expectedOutput: {
      type: String,
      required: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const problemSchema = new Schema<IProblem>(
  {
    skillId: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: [true, "Skill ID is required"],
      index: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: [true, "Level is required"],
    },
    question: {
      type: String,
      required: [true, "Question text is required"],
    },
    questionType: {
      type: String,
      enum: ["multiple_choice", "true_false", "coding"],
      default: "multiple_choice",
    },
    choices: {
      type: [choiceSchema],
      validate: {
        validator: function (this: any, v: IChoice[]) {
          if (this.questionType === "coding") return true;
          return v && v.length >= 2;
        },
        message: "At least 2 choices are required for multiple choice questions",
      },
    },
    correctAnswer: {
      type: String,
      required: function(this: any) {
        return this.questionType !== "coding";
      },
    },
    languageId: {
      type: Schema.Types.ObjectId,
      ref: "Language",
    },
    templateCode: {
      type: String,
    },
    testCases: {
      type: [testCaseSchema],
    },
    explanation: {
      type: String,
      default: "",
    },
    points: {
      type: Number,
      default: 1,
      min: 1,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index สำหรับ query ที่ใช้บ่อย
problemSchema.index({ skillId: 1, level: 1, order: 1 });

const Problem: Model<IProblem> =
  mongoose.models.Problem || mongoose.model<IProblem>("Problem", problemSchema);

export default Problem;
