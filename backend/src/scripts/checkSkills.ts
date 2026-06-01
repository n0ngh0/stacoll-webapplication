import mongoose from "mongoose";
import dotenv from "dotenv";
import Skill from "../models/Skill";
import connectDB from "../config/database";

dotenv.config();

const checkSkills = async () => {
  try {
    await connectDB();
    const skills = await Skill.find();
    for (const s of skills) {
      console.log(`Title: ${s.title}, Icon: ${s.icon}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkSkills();
