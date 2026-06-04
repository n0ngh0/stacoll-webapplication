import { Elysia, t } from "elysia";
import { requireAuth } from "../middlewares/authMiddleware";
import { uploadToCloudinary } from "../utils/cloudinary";

export const uploadRoutes = new Elysia({ prefix: "/api/upload" })
  .use(requireAuth)
  // POST /api/upload/image — Upload รูปภาพไปยัง Cloudinary
  .post(
    "/image",
    async ({ body, set }) => {
      try {
        const { file, folder } = body;

        if (!file) {
          set.status = 400;
          return { success: false, message: "No file provided" };
        }

        // ตรวจสอบ file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
          set.status = 400;
          return {
            success: false,
            message: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
          };
        }

        // ตรวจสอบขนาดไฟล์ (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          set.status = 400;
          return {
            success: false,
            message: "File size exceeds 5MB limit",
          };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const url = await uploadToCloudinary(buffer, folder || "stacoll");

        return { success: true, url };
      } catch (err: any) {
        console.error("Upload error:", err);
        set.status = 500;
        return { success: false, message: err.message || "Upload failed" };
      }
    },
    {
      body: t.Object({
        file: t.File(),
        folder: t.Optional(t.String()),
      }),
    }
  );
