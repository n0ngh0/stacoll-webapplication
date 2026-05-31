import { Elysia, t } from "elysia";
import { exportController } from "../controllers/exportController";

export const exportRoutes = new Elysia({ prefix: "/api/export" })
  .post("/pdf", async ({ request, set }) => {
    try {
      const html = await request.text();
      if (!html) throw new Error("No HTML provided");
      
      const pdfBuffer = await exportController.generatePDF(html);
      
      set.headers['Content-Type'] = "application/pdf";
      set.headers['Content-Disposition'] = 'attachment; filename="resume.pdf"';
      
      return new Blob([pdfBuffer]);
    } catch (error: any) {
      console.error("PDF generation error:", error);
      set.status = 500;
      return { success: false, message: error.message || "Failed to generate PDF" };
    }
  });
