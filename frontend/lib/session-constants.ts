const parsed = Number.parseInt(
  process.env.NEXT_PUBLIC_SESSION_MAX_AGE_SECONDS ?? "3600",
  10
);

/** Must match backend JWT_EXPIRES_IN_SECONDS. */
export const SESSION_MAX_AGE_SECONDS =
  Number.isFinite(parsed) && parsed >= 60 ? parsed : 3600;
