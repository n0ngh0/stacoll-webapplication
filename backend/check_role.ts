import mongoose from "mongoose";
import User from "./src/models/User";
import { config } from "dotenv";

config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/stacoll";
mongoose.connect(uri).then(async () => {
  console.log("Connected to", uri);
  const users = await User.find({ username: "admin" });
  for (const u of users) {
    console.log(`Username: ${u.username}, Email: ${u.email}, Role: ${u.role}`);
  }
  process.exit(0);
});
