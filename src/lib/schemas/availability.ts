import { z } from "zod";

export const availabilitySlotSchema = z
  .object({
    day_of_week: z.number().int().min(0).max(6),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: "start_time must be before end_time",
    path: ["start_time"],
  });

export const replaceAvailabilitySchema = z.object({
  branch_id: z.string().uuid(),
  slots: z.array(availabilitySlotSchema).min(0),
});

export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;
export type ReplaceAvailability = z.infer<typeof replaceAvailabilitySchema>;
