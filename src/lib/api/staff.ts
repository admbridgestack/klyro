import { apiFetch } from "./client";
import type { CreateStaff, UpdateStaff } from "@/lib/schemas/staff";
import type { AvailabilitySlot } from "@/lib/schemas/availability";

export interface Staff {
  id: string;
  business_id: string;
  display_name: string;
  slug: string;
  user_id?: string | null;
  invite_email?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function createStaff(data: CreateStaff): Promise<Staff> {
  return apiFetch<Staff>("/api/v1/staff", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getStaff(): Promise<Staff[]> {
  return apiFetch<Staff[]>("/api/v1/staff");
}

export function updateStaff(id: string, data: UpdateStaff): Promise<Staff> {
  return apiFetch<Staff>(`/api/v1/staff/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function assignBranches(staffId: string, branchIds: string[]): Promise<void> {
  return apiFetch<void>(`/api/v1/staff/${staffId}/branches`, {
    method: "POST",
    body: JSON.stringify({ branch_ids: branchIds }),
  });
}

export function assignServices(staffId: string, serviceIds: string[]): Promise<void> {
  return apiFetch<void>(`/api/v1/staff/${staffId}/services`, {
    method: "POST",
    body: JSON.stringify({ service_ids: serviceIds }),
  });
}

export function setAvailability(
  staffId: string,
  branchId: string,
  slots: AvailabilitySlot[],
): Promise<void> {
  return apiFetch<void>(`/api/v1/staff/${staffId}/availability`, {
    method: "PUT",
    body: JSON.stringify({ branch_id: branchId, slots }),
  });
}
