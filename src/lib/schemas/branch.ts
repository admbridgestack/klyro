import { z } from "zod";

export const createBranchSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(60),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().length(2).default("HN"),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/).optional(),
  whatsapp_number: z.string().regex(/^\+[1-9]\d{1,14}$/).optional(),
  timezone: z.string().default("America/Tegucigalpa"),
});

export const updateBranchSchema = createBranchSchema.partial();

export type CreateBranch = z.infer<typeof createBranchSchema>;
export type UpdateBranch = z.infer<typeof updateBranchSchema>;
