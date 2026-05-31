import mongoose, { Model, Schema, Types } from "mongoose";

// Interface สำหรับ Choice ของคำถาม
export interface IChoice {
  label: string; // "A", "B", "C", "D"
  text: string;  // เนื้อหาของตัวเลือก
}

// Interface หลักของ Problem (ข้อสอบ)
export interface IProblem {
  skillId: Types.ObjectId;
  level: "beginner" | "intermediate" | "advanced";
  question: string;
  questionType: "multiple_choice" | "true_false";
  choices: IChoice[];
  correctAnswer: string; // label ของคำตอบที่ถูก เช่น "A"
  explanation?: string;
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
      enum: ["multiple_choice", "true_false"],
      default: "multiple_choice",
    },
    choices: {
      type: [choiceSchema],
      validate: {
        validator: function (v: IChoice[]) {
          return v.length >= 2; // ต้องมีตัวเลือกอย่างน้อย 2 ตัว
        },
        message: "At least 2 choices are required",
      },
    },
    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required"],
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
