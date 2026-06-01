import mongoose, { Model, Schema, Document } from "mongoose";

export interface ILanguage extends Document {
  judge0_id: number;
  name: string;
  monaco_identifier: string;
  extension: string;
  driverTemplate?: string;
  isActive: boolean;
}

const languageSchema = new Schema<ILanguage>(
  {
    judge0_id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    monaco_identifier: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
      required: true,
    },
    driverTemplate: {
      type: String,
      default: "",
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

const Language: Model<ILanguage> =
  mongoose.models.Language || mongoose.model<ILanguage>("Language", languageSchema);

export default Language;
