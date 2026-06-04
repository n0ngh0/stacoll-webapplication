import { getToken } from "@/lib/auth-session";

export function getApiUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const { auth = true, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (auth) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (
    rest.body &&
    typeof rest.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return fetch(`${getApiUrl()}${normalizedPath}`, {
    ...rest,
    headers,
  });
}

export async function apiJson<T = unknown>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const res = await apiFetch(path, options);
  return res.json() as Promise<T>;
}
