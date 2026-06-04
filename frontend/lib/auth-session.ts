import type { SessionUser } from "@/types/user";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const SESSION_MAX_AGE = 86400;

function isValidToken(value: string | null | undefined): value is string {
  return Boolean(value && value !== "undefined" && value !== "null");
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return isValidToken(localStorage.getItem(TOKEN_KEY))
    ? localStorage.getItem(TOKEN_KEY)
    : null;
}

export function getStoredUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: SessionUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  const userPayload = encodeURIComponent(JSON.stringify(user));
  document.cookie = `token=${token}; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax`;
  document.cookie = `user=${userPayload}; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax`;
}

export function updateStoredUser(partial: Partial<SessionUser>) {
  const token = getToken();
  const user = getStoredUser();
  if (!token || !user) return;
  setSession(token, { ...user, ...partial });
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "user=; path=/; max-age=0; SameSite=Lax";
}

export function parseUserCookie(value: string | undefined): SessionUser | null {
  if (!value) return null;
  try {
    return JSON.parse(decodeURIComponent(value)) as SessionUser;
  } catch {
    try {
      return JSON.parse(value) as SessionUser;
    } catch {
      return null;
    }
  }
}
