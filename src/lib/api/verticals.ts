import { apiFetch } from "./client";
import type { VerticalKey } from "@/lib/verticals/registry";

/**
 * Shape returned by GET /api/v1/verticals
 * (defaultServices is omitted — it lives in the /defaults sub-resource)
 */
export interface VerticalListItem {
  key: VerticalKey;
  displayName: { es: string; en: string };
  icon: string;
  emoji?: string;
  status: "active" | "preview";
  defaultBufferMinutes: number;
  defaultCancellationHours: number;
  messagingTone: "casual" | "professional" | "wellness";
  bookingPageHints: {
    serviceNoun: { es: string; en: string };
    appointmentNoun: { es: string; en: string };
    staffNoun: { es: string; en: string };
  };
}

/**
 * Shape returned by GET /api/v1/verticals/[key]/defaults
 */
export interface VerticalDefaults {
  key: string;
  defaultServices: Array<{
    name: { es: string; en: string };
    durationMinutes: number;
    suggestedPriceRange: [number, number];
  }>;
  defaultBufferMinutes: number;
  defaultCancellationHours: number;
  messagingTone: "casual" | "professional" | "wellness";
  bookingPageHints: {
    serviceNoun: { es: string; en: string };
    appointmentNoun: { es: string; en: string };
    staffNoun: { es: string; en: string };
  };
}

export function getVerticals(): Promise<VerticalListItem[]> {
  return apiFetch<VerticalListItem[]>("/api/v1/verticals");
}

export function getVerticalDefaults(key: string): Promise<VerticalDefaults> {
  return apiFetch<VerticalDefaults>(`/api/v1/verticals/${key}/defaults`);
}
