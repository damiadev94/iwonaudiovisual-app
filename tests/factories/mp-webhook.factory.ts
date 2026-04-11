import { MPWebhookEvent } from "../../types/mercadopago";

export const createMPWebhookEvent = (
  overrides?: Partial<MPWebhookEvent>
): MPWebhookEvent => ({
  id: 123,
  live_mode: false,
  type: "payment",
  date_created: new Date().toISOString(),
  user_id: 999,
  api_version: "v1",
  action: "payment.created",
  data: {
    id: "test-id",
  },
  ...overrides,
});