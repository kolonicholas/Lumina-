export type ApiResult<T> = { data?: T; error?: string };

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function refreshToken() {
  await fetch(`${apiBase}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const accessToken = typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;
  const baseHeaders = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(init.headers ?? {}),
  };

  const res = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: baseHeaders,
    credentials: "include",
  });

  if (res.status === 401) {
    await refreshToken();
    const retry = await fetch(`${apiBase}${path}`, {
      ...init,
      headers: baseHeaders,
      credentials: "include",
    });
    if (!retry.ok) {
      return { error: (await retry.json()).error ?? "Request failed" };
    }
    return { data: (await retry.json()) as T };
  }

  if (!res.ok) {
    return { error: (await res.json()).error ?? "Request failed" };
  }

  return { data: (await res.json()) as T };
}
