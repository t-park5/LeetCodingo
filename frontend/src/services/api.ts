const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

async function requestNoContent(path: string, options?: RequestInit): Promise<void> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => {
    const p = fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(body),
    }).then(async (res) => {
      if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
      if (res.status === 204 || res.headers.get("content-length") === "0") return undefined as T;
      return res.json() as Promise<T>;
    });
    return p;
  },
  put: <T>(path: string, body: unknown) => {
    if (body === undefined || (typeof body === "object" && body !== null && Object.keys(body).length === 0)) {
      return requestNoContent(path, { method: "PUT", body: JSON.stringify(body) }) as unknown as Promise<T>;
    }
    return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
  },
};
