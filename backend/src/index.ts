import { configDotenv } from "dotenv";
import { Elysia } from "elysia";
import connectDB from "./config/database"

configDotenv()
connectDB()

const port = process.env.PORT || 3000

const app = new Elysia().listen(port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
