import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import User, { IUser } from "../models/User";
import { Document } from "mongoose";

// Extend the IUser type with Mongoose document methods for correct typing
type UserDocument = Document<unknown, any, IUser> & IUser & { _id: any };

export const authMiddleware = new Elysia({ name: "authMiddleware" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super_secret_key_change_me_in_production",
    })
  )
  .derive(async ({ jwt, headers }) => {
    const authorization = headers.authorization;
    
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return { user: null }; // Not authenticated
    }

    const token = authorization.split(" ")[1];
    const payload = await jwt.verify(token) as { id: string, role: string } | false;

    if (!payload) {
      return { user: null }; // Invalid token
    }

    const user = await User.findById(payload.id).select("-password") as UserDocument | null;
    return { user };
  });

export const requireAuth = new Elysia({ name: "requireAuth" })
  .use(authMiddleware)
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { success: false, message: "Unauthorized: No or invalid token provided" };
    }
  });

export const requireAdmin = new Elysia({ name: "requireAdmin" })
  .use(requireAuth)
  .onBeforeHandle(({ user, set }) => {
    if (!user || user.role !== "admin") {
      set.status = 403;
      return { success: false, message: "Forbidden: Admin access required" };
    }
  });
