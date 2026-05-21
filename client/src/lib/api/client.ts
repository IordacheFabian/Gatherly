import axios from "axios";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  retryAfter?: number; // seconds until rate limit resets

  constructor(message: string, status: number, details?: unknown, retryAfter?: number) {
    super(message);
    this.status = status;
    this.details = details;
    this.retryAfter = retryAfter;
  }
}

export const apiClient = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const { data: payload, status, headers } = error.response;
      const fieldErrors =
        typeof payload === "object" && payload !== null && "errors" in payload
          ? (payload as { errors?: Record<string, string[]> }).errors
          : undefined;
      const message =
        typeof payload === "string"
          ? payload
          : fieldErrors
            ? Object.values(fieldErrors)[0]?.[0] || "Validation failed"
            : (payload as { detail?: string; title?: string })?.detail ||
              (payload as { title?: string })?.title ||
              "Request failed";
      const retryAfterHeader = headers["retry-after"];
      const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;
      return Promise.reject(new ApiError(message, status, payload, retryAfter));
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function uploadFile<T>(path: string, file: File, fieldName = "file"): Promise<T> {
  const formData = new FormData();
  formData.append(fieldName, file);
  const { data } = await apiClient.post<T>(path, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function downloadFile(
  path: string,
  fallbackName: string,
): Promise<{ blob: Blob; fileName: string }> {
  const response = await apiClient.get<Blob>(path, { responseType: "blob" });
  const disposition = (response.headers["content-disposition"] as string) ?? "";
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  const fileName = match ? decodeURIComponent(match[1]) : fallbackName;
  return { blob: response.data, fileName };
}
