import mongoose, { Document, Model, Schema } from "mongoose";

// 1. กำหนด Interface สำหรับ TypeScript เพื่อให้รู้ว่า User Document มีฟิลด์อะไรบ้าง
export interface IUser {
  username: string;
  email: string;
  password: string;
  role: string;
  imgUrl?: string;
  bio?: string;
  title?: string;
  projects?: Array<{
    title: string;
    description: string;
    tags: string[];
  }>;
  isVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 2. สร้าง Mongoose Schema พร้อมกับใส่ Validation แบบเบื้องต้น
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    imgUrl: {
      type: String,
      default: "/profiles/default.jpg",
    },
    bio: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        tags: [{ type: String }],
      }
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true, // ตัวนี้จะสร้าง createdAt และ updatedAt ให้โดยอัตโนมัติ
  }
);

// 3. ป้องกันการ Compile ซ้ำในฝั่ง Server-less (ถ้ามี) และทำการ Export ตัว Model พร้อม Type
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
