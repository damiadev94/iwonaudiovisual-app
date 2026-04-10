import { z } from "zod";

export const createSubscriptionSchema = z.object({
  email: z.string().email(),
  userId: z.string().uuid(),
});

export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;
