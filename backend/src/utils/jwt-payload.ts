import { getJwtExpiresInSeconds } from "../config/env";

export function buildJwtPayload(id: string, role: string) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id,
    role,
    iat: now,
    exp: now + getJwtExpiresInSeconds(),
  };
}
