const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly field?: string
  ) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(data?.message || "Không thể kết nối máy chủ.", response.status, data?.field);
  }
  return data as T;
}