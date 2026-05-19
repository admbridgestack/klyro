import { apiFetch } from "./client";
import type { CreateService, UpdateService } from "@/lib/schemas/service";

export interface Service {
  id: string;
  business_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export function createService(data: CreateService): Promise<Service> {
  return apiFetch<Service>("/api/v1/services", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function bulkCreateServices(services: CreateService[]): Promise<Service[]> {
  return apiFetch<Service[]>("/api/v1/services/bulk", {
    method: "POST",
    body: JSON.stringify({ services }),
  });
}

export function getServices(): Promise<Service[]> {
  return apiFetch<Service[]>("/api/v1/services");
}

export function updateService(id: string, data: UpdateService): Promise<Service> {
  return apiFetch<Service>(`/api/v1/services/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteService(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/services/${id}`, {
    method: "DELETE",
  });
}
