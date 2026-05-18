import { z } from "zod";

export const createStaffSchema = z.object({
  display_name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(60),
  user_id: z.string().uuid().optional(),
  invite_email: z.string().email().optional(),
});

export const updateStaffSchema = createStaffSchema.omit({ user_id: true }).partial();

export const assignBranchesSchema = z.object({
  branch_ids: z.array(z.string().uuid()).min(0),
});

export const assignServicesSchema = z.object({
  service_ids: z.array(z.string().uuid()).min(0),
});

export type CreateStaff = z.infer<typeof createStaffSchema>;
export type UpdateStaff = z.infer<typeof updateStaffSchema>;
export type AssignBranches = z.infer<typeof assignBranchesSchema>;
export type AssignServices = z.infer<typeof assignServicesSchema>;
