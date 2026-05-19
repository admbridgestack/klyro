import { z } from "zod";

export const createBusinessSchema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(60),
  vertical: z.string().min(1),
  country: z.string().length(2),
  default_language: z.string().default("es"),
  default_currency: z.string().default("HNL"),
});

export const updateBusinessSchema = createBusinessSchema.partial().extend({
  whatsapp_number: z.string().optional().nullable(),
  sms_enabled: z.boolean().optional(),
  email_enabled: z.boolean().optional(),
  default_cancellation_hours: z.number().int().positive().optional(),
});

export const checkSlugSchema = z.object({
  slug: z.string().min(1),
});

export type CreateBusiness = z.infer<typeof createBusinessSchema>;
export type UpdateBusiness = z.infer<typeof updateBusinessSchema>;
export type CheckSlug = z.infer<typeof checkSlugSchema>;
