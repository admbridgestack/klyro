import { apiFetch } from "./client";
import type { CreateBranch, UpdateBranch } from "@/lib/schemas/branch";

export interface Branch {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  address?: string | null;
  city?: string | null;
  country: string;
  phone?: string | null;
  whatsapp_number?: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export function createBranch(data: CreateBranch): Promise<Branch> {
  return apiFetch<Branch>("/api/v1/branches", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getBranches(): Promise<Branch[]> {
  return apiFetch<Branch[]>("/api/v1/branches");
}

export function updateBranch(id: string, data: UpdateBranch): Promise<Branch> {
  return apiFetch<Branch>(`/api/v1/branches/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
