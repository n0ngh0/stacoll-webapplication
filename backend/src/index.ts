import { configDotenv } from "dotenv";
import { Elysia } from "elysia";
import connectDB from "./config/database"
import { setup } from "./setup";
import { authRoutes } from "./routes/authRoutes";
import { userRoutes } from "./routes/userRoutes";
import { profileRoutes } from "./routes/profileRoutes";
import { exportRoutes } from "./routes/exportRoutes";
import { skillRoutes } from "./routes/skillRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { assessmentRoutes } from "./routes/assessmentRoutes";
import { languageRoutes } from "./routes/languageRoutes";

configDotenv()
connectDB()

const port = process.env.PORT || 8000

const app = new Elysia()
  .use(setup)
  .use(authRoutes)
  .use(userRoutes)
  .use(profileRoutes)
  .use(exportRoutes)
  .use(skillRoutes)
  .use(adminRoutes)
  .use(assessmentRoutes)
  .use(languageRoutes)
  .listen({
    port: port,
    maxRequestBodySize: 200 * 1024 * 1024 // 200MB to be absolutely safe
  });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

