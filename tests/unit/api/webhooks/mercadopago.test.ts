import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockProcessEvent } = vi.hoisted(() => ({
  mockProcessEvent: vi.fn(),
}));

// La verificación de firma está desactivada en el código actual; se prueba
// el comportamiento del endpoint sin ella.
vi.mock("@/lib/mercadopago/webhook", () => ({
  verifyWebhookSignature: vi.fn(() => true),
  processWebhookEvent: mockProcessEvent,
}));

import { POST } from "@/app/api/webhooks/mercadopago/route";

function makeWebhookRequest(body: unknown, extraHeaders: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/webhooks/mercadopago", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-signature": "ts=1700000000,v1=abc123",
      "x-request-id": "req-id-123",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
}

const subscriptionEvent = {
  id: 1,
  live_mode: true,
  type: "subscription_preapproval",
  date_created: "2024-01-01T00:00:00Z",
  user_id: 123456,
  api_version: "v1",
  action: "updated",
  data: { id: "PREAPPROVAL_123" },
};

const paymentEvent = {
  id: 2,
  live_mode: true,
  type: "payment",
  date_created: "2024-01-01T00:00:00Z",
  user_id: 123456,
  api_version: "v1",
  action: "payment.created",
  data: { id: "999" },
};

describe("POST /api/webhooks/mercadopago", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProcessEvent.mockResolvedValue(undefined);
  });

  it("retorna 200 con { received: true } para un evento subscription_preapproval", async () => {
    const response = await POST(makeWebhookRequest(subscriptionEvent));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ received: true });
    expect(mockProcessEvent).toHaveBeenCalledWith(subscriptionEvent);
  });

  it("retorna 200 con { received: true } para un evento payment", async () => {
    const response = await POST(makeWebhookRequest(paymentEvent));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ received: true });
    expect(mockProcessEvent).toHaveBeenCalledWith(paymentEvent);
  });

  it("retorna 200 aunque processWebhookEvent falle (nunca devuelve 500)", async () => {
    mockProcessEvent.mockRejectedValue(new Error("DB error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(makeWebhookRequest(subscriptionEvent));
    const data = await response.json();

    consoleSpy.mockRestore();
    expect(response.status).toBe(200);
    expect(data).toEqual({ received: true });
  });

  it("retorna 200 aunque el body no sea JSON válido", async () => {
    const request = new Request(
      "http://localhost:3000/api/webhooks/mercadopago",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "esto-no-es-json",
      }
    );
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(request);
    const data = await response.json();

    consoleSpy.mockRestore();
    expect(response.status).toBe(200);
    expect(data).toEqual({ received: true });
  });

  it("pasa correctamente el body parseado a processWebhookEvent", async () => {
    await POST(makeWebhookRequest(paymentEvent));

    expect(mockProcessEvent).toHaveBeenCalledTimes(1);
    expect(mockProcessEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "payment",
        data: { id: "999" },
      })
    );
  });
});
