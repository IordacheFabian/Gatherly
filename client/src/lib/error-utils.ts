import { ApiError } from "@/lib/api";

export type FieldErrors = Record<string, string[]>;

export function getFieldErrors(error: unknown): FieldErrors {
  if (!(error instanceof ApiError)) return {};

  const details = error.details as { errors?: FieldErrors } | undefined;
  return details?.errors ?? {};
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof ApiError) {
    const fieldErrors = getFieldErrors(error);
    const firstFieldMessage = Object.values(fieldErrors)[0]?.[0];
    if (firstFieldMessage) return firstFieldMessage;
    return error.message || fallback;
  }

  if (error instanceof Error) return error.message;

  return fallback;
}
