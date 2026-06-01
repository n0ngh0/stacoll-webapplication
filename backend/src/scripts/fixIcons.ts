import mongoose from "mongoose";
import dotenv from "dotenv";
import Skill from "../models/Skill";
import connectDB from "../config/database";

dotenv.config();

const fixIcons = async () => {
  try {
    await connectDB();
    
    await Skill.updateOne(
      { title: "SQL" },
      { $set: { icon: "https://www.freeiconspng.com/thumbs/sql-server-icon-png/sql-server-icon-png-29.png" } }
    );
    
    await Skill.updateOne(
      { title: "React.js" },
      { $set: { icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png" } }
    );
    
    await Skill.updateOne(
      { title: "Python Basics" },
      { $set: { icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1280px-Python-logo-notext.svg.png" } }
    );

    console.log("Icons updated successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixIcons();
