import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "SLOT_TAKEN"
  | "BOOKING_CONFLICT"
  | "INTERNAL_ERROR";

export function toErrorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
  field?: string,
): NextResponse {
  return NextResponse.json(
    { error: { code, message, ...(field ? { field } : {}) } },
    { status },
  );
}

export function unauthorized(message?: string): NextResponse {
  return toErrorResponse(401, "UNAUTHORIZED", message ?? "Unauthorized");
}

export function notFound(message?: string): NextResponse {
  return toErrorResponse(404, "NOT_FOUND", message ?? "Not found");
}

export function validationError(message: string, field?: string): NextResponse {
  return toErrorResponse(400, "VALIDATION_ERROR", message, field);
}

export function internalError(message?: string): NextResponse {
  return toErrorResponse(500, "INTERNAL_ERROR", message ?? "Internal server error");
}
