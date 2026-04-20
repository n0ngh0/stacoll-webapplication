import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

export const setup = new Elysia({ name: "setup" })
  .use(cors())
  .onError(({ code, error }) => {
    // Basic global error logging
    console.error(`[${code}]`, error.message);
    
    if (code === 'VALIDATION') {
      return {
        success: false,
        message: "Validation Error",
        details: error.all
      };
    }
    
    if (code === 'NOT_FOUND') {
      return { 
        success: false,
        message: "Route not found" 
      };
    }

    return { 
      success: false,
      message: "Internal Server Error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    };
  });
