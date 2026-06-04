export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  return secret || "dev-only-jwt-secret-do-not-use-in-production";
}

export function getMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is required");
  }
  return uri;
}

export function getJwtExpiresInSeconds(): number {
  const raw = process.env.JWT_EXPIRES_IN_SECONDS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : 3600;
  if (!Number.isFinite(parsed) || parsed < 60 || parsed > 604800) {
    return 3600;
  }
  return parsed;
}

export function getFrontendUrl(): string {
  return (
    process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}
