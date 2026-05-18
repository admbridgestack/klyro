import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(1),
  duration_minutes: z.number().int().min(5),
  price: z.number().min(0),
  currency: z.string().default("HNL"),
});

export const updateServiceSchema = createServiceSchema.partial();

export const bulkServicesSchema = z.object({
  services: z.array(createServiceSchema).min(1),
});

export type CreateService = z.infer<typeof createServiceSchema>;
export type UpdateService = z.infer<typeof updateServiceSchema>;
export type BulkServices = z.infer<typeof bulkServicesSchema>;
