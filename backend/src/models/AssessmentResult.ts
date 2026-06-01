import mongoose, { Model, Schema, Types } from "mongoose";
import { IProblem } from "./Problem";

export interface IAnswer {
  problemId: Types.ObjectId;
  selectedAnswer: any;
  isCorrect: boolean;
}

export interface IAssessmentResult {
  userId: Types.ObjectId;
  skillId: Types.ObjectId;
  level: "beginner" | "intermediate" | "advanced";
  score: number;
  passed: boolean;
  answers: IAnswer[];
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>(
  {
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    selectedAnswer: {
      type: Schema.Types.Mixed,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    }
  },
  { _id: false }
);

const assessmentResultSchema = new Schema<IAssessmentResult>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
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
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      required: true,
      default: false,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
assessmentResultSchema.index({ userId: 1, skillId: 1, level: 1 });
assessmentResultSchema.index({ userId: 1, skillId: 1, passed: 1 });

const AssessmentResult: Model<IAssessmentResult> =
  mongoose.models.AssessmentResult || mongoose.model<IAssessmentResult>("AssessmentResult", assessmentResultSchema);

export default AssessmentResult;
