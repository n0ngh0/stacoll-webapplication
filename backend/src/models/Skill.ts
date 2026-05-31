import mongoose, { Model, Schema } from "mongoose";

// Interface สำหรับ Level ย่อยในแต่ละ Skill
export interface ISkillLevel {
  level: "beginner" | "intermediate" | "advanced";
  description: string;
  questionCount: number;
  estimatedTime: number; // นาที
}

// Interface หลักของ Skill
export interface ISkill {
  title: string;
  description: string;
  category: "analyst" | "programming" | "systems";
  icon: string; // URL หรือ text เช่น "SQL"
  levels: ISkillLevel[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const skillLevelSchema = new Schema<ISkillLevel>(
  {
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    questionCount: {
      type: Number,
      required: true,
      default: 15,
    },
    estimatedTime: {
      type: Number,
      required: true,
      default: 30,
    },
  },
  { _id: false }
);

const skillSchema = new Schema<ISkill>(
  {
    title: {
      type: String,
      required: [true, "Skill title is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Skill description is required"],
    },
    category: {
      type: String,
      enum: ["analyst", "programming", "systems"],
      required: [true, "Category is required"],
    },
    icon: {
      type: String,
      default: "",
    },
    levels: {
      type: [skillLevelSchema],
      default: [],
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

const Skill: Model<ISkill> =
  mongoose.models.Skill || mongoose.model<ISkill>("Skill", skillSchema);

export default Skill;
