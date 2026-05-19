export class ApiError extends Error {
  status: number;
  code: string;
  fieldErrors?: Record<string, string[]>;

  constructor(
    status: number,
    code: string,
    message: string,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...init, headers });

  if (response.ok) {
    const body = await response.json();
    return body.data as T;
  }

  let errorBody: { error?: { code?: string; message?: string; field?: string } };
  try {
    errorBody = await response.json();
  } catch {
    throw new ApiError(response.status, String(response.status), response.statusText || "Request failed");
  }

  const err = errorBody?.error;
  const code = err?.code ?? String(response.status);
  const message = err?.message ?? "Request failed";
  const fieldErrors: Record<string, string[]> | undefined = err?.field
    ? { [err.field]: [message] }
    : undefined;

  throw new ApiError(response.status, code, message, fieldErrors);
}
