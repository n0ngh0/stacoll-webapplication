import { apiFetch } from "@/lib/api/client";
import { clearSession, getToken, setSession } from "@/lib/auth-session";
import type { SessionUser } from "@/types/user";

export function mapProfileToSession(user: {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  role: string;
  imgUrl?: string;
}): SessionUser {
  return {
    id: String(user._id ?? user.id ?? ""),
    username: user.username,
    email: user.email,
    role: user.role,
    imgUrl: user.imgUrl,
  };
}

/** Sync localStorage + cookies from the latest profile in the database. */
export async function syncSessionFromApi(): Promise<SessionUser | null> {
  const token = getToken();
  if (!token) return null;

  const res = await apiFetch("/profile/me");
  const data = await res.json();

  if (!res.ok || !data.success || !data.user) {
    if (res.status === 401 || res.status === 403) {
      clearSession();
    }
    return null;
  }

  const user = mapProfileToSession(data.user);
  setSession(token, user);
  return user;
}

export type AdminVerifyResult =
  | { ok: true; user: SessionUser }
  | { ok: false; reason: "unauthenticated" | "forbidden" };

/** Verify admin role against the database (do not trust cookie/JWT role). */
export async function verifyAdminAccess(): Promise<AdminVerifyResult> {
  const user = await syncSessionFromApi();

  if (!user) {
    return { ok: false, reason: "unauthenticated" };
  }

  if (user.role !== "admin") {
    return { ok: false, reason: "forbidden" };
  }

  return { ok: true, user };
}
