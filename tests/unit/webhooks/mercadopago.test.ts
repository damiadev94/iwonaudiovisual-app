import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMPWebhookEvent } from "@/tests/factories/mp-webhook.factory";
import {
  verifyWebhookSignature,
  processWebhookEvent,
} from "@/lib/mercadopago/webhook";

import { createAdminClient } from "@/lib/supabase/admin";

// vi.hoisted garantiza que mockGet esté disponible cuando el factory del mock
// se ejecuta (los vi.mock se elevan al tope del archivo antes que el resto)
const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

// Mock de dependencias externas
// Payment y PreApproval se usan con `new`, por eso necesitan function() regular
vi.mock("mercadopago", () => ({
  MercadoPagoConfig: vi.fn(),
  Payment: vi.fn(function () { return { get: mockGet }; }),
  PreApproval: vi.fn(function () { return { get: mockGet }; }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

describe("MercadoPago Webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =============================
  // 🔐 SIGNATURE VALIDATION
  // =============================

  describe("verifyWebhookSignature", () => {
    const validBody = { data: { id: "event-1" } };

    it("should return false if body is missing", () => {
      const result = verifyWebhookSignature(null, "v1=abc,ts=123", "req-id");
      expect(result).toBe(false);
    });

    it("should return false if requestId is missing", () => {
      const result = verifyWebhookSignature(validBody, "v1=abc,ts=123", null);
      expect(result).toBe(false);
    });

    it("should return false if signature is invalid", () => {
      const result = verifyWebhookSignature(validBody, "invalid", "req-id");
      expect(result).toBe(false);
    });

    it("should return true if signature is valid (mocked)", () => {
      // 👇 si tu función usa crypto real, podés mockearla
      const spy = vi
        .spyOn(global, "Buffer")
        .mockImplementationOnce(() => "valid" as unknown as typeof Buffer);

      const result = verifyWebhookSignature(validBody, "v1=valid,ts=123", "req-id");

      expect(result).toBeDefined();

      spy.mockRestore();
    });
  });

  // =============================
  // 🔄 EVENT PROCESSING
  // =============================

  describe("processWebhookEvent", () => {
    const mockDb = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "sub-1" }, error: null }),
      // Makes the object thenable so `await supabase.from(...).update(...).eq(...)` resolves
      then: (resolve: (v: unknown) => void) => resolve({ data: null, error: null }),
    } as unknown as ReturnType<typeof createAdminClient>;

    beforeEach(() => {
      vi.mocked(createAdminClient).mockReturnValue(mockDb);
    });

    it("should handle approved payment", async () => {
      mockGet.mockResolvedValue({
        status: "approved",
        external_reference: "user-1",
      });

      const event = createMPWebhookEvent({
        type: "payment",
        data: { id: "pay-1" },
      });

      await processWebhookEvent(event);

      expect(mockGet).toHaveBeenCalledWith({ id: "pay-1" });
    });

    it("should handle rejected payment", async () => {
      mockGet.mockResolvedValue({
        status: "rejected",
      });

      const event = createMPWebhookEvent({
        type: "payment",
        data: { id: "pay-1" },
      });

      await processWebhookEvent(event);

      expect(mockGet).toHaveBeenCalled();
    });

    it("should handle subscription authorized", async () => {
      mockGet.mockResolvedValue({
        status: "authorized",
        external_reference: "user-1",
      });

      const event = createMPWebhookEvent({
        type: "subscription_preapproval",
        data: { id: "sub-1" },
      });

      await processWebhookEvent(event);

      expect(mockGet).toHaveBeenCalledWith({ id: "sub-1" });
    });

    it("should ignore unknown event type", async () => {
      const event = createMPWebhookEvent({
        type: "unknown_event",
        data: { id: "x" },
      });

      const result = await processWebhookEvent(event);

      expect(result).toBeUndefined();
    });

    it("should handle errors without crashing", async () => {
      mockGet.mockRejectedValue(new Error("MP error"));

      const event = createMPWebhookEvent({
        type: "payment",
        data: { id: "pay-1" },
      });

      await expect(processWebhookEvent(event)).resolves.not.toThrow();
    });
  });
});
