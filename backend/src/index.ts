import { configDotenv } from "dotenv";
import { Elysia } from "elysia";
import connectDB from "./config/database"
import { setup } from "./setup";
import { authRoutes } from "./routes/authRoutes";
import { userRoutes } from "./routes/userRoutes";

configDotenv()
connectDB()

const port = process.env.PORT || 8000

const app = new Elysia()
  .use(setup)
  .use(authRoutes)
  .use(userRoutes)
  .listen(port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

