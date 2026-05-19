import { apiFetch } from "./client";
import type { CreateBusiness, UpdateBusiness } from "@/lib/schemas/business";

export interface Business extends CreateBusiness {
  id: string;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CheckSlugResult {
  available: boolean;
  suggestions?: string[];
}

export function checkSlug(slug: string): Promise<CheckSlugResult> {
  return apiFetch<CheckSlugResult>(
    `/api/v1/businesses/check-slug?slug=${encodeURIComponent(slug)}`,
  );
}

export function createBusiness(
  data: CreateBusiness,
): Promise<{ id: string } & CreateBusiness> {
  return apiFetch<{ id: string } & CreateBusiness>("/api/v1/businesses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMyBusiness(): Promise<Business> {
  return apiFetch<Business>("/api/v1/businesses/me");
}

export function updateMyBusiness(data: UpdateBusiness): Promise<Business> {
  return apiFetch<Business>("/api/v1/businesses/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
