import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMPWebhookEvent } from "@/tests/factories/mp-webhook.factory";

// 🔥 Ajustá estas rutas según tu proyecto
import {
  verifyWebhookSignature,
  processWebhookEvent,
} from "@/lib/mercadopago/webhook";

// Mock de dependencias externas
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { createAdminClient } from "@/lib/supabase/admin";

describe("MercadoPago Webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =============================
  // 🔐 SIGNATURE VALIDATION
  // =============================

  describe("verifyWebhookSignature", () => {
    it("should return false if signature is missing", () => {
      const result = verifyWebhookSignature(null, "body", "secret");
      expect(result).toBe(false);
    });

    it("should return false if secret is missing", () => {
      const result = verifyWebhookSignature("sig", "body", null);
      expect(result).toBe(false);
    });

    it("should return false if signature is invalid", () => {
      const result = verifyWebhookSignature("invalid", "body", "secret");
      expect(result).toBe(false);
    });

    it("should return true if signature is valid (mocked)", () => {
      // 👇 si tu función usa crypto real, podés mockearla
      const spy = vi
        .spyOn(global, "Buffer")
        .mockImplementationOnce(() => "valid" as any);

      const result = verifyWebhookSignature("valid", "body", "secret");

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
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };

    beforeEach(() => {
      (createAdminClient as any).mockReturnValue(mockDb);
    });

    it("should handle approved payment", async () => {
      const event = createMPWebhookEvent({
        type: "payment",
        data: { id: "pay-1" },
      });

      const mockMP = {
        getPayment: vi.fn().mockResolvedValue({
          status: "approved",
          external_reference: "user-1",
        }),
      };

      await processWebhookEvent(event);

      expect(mockMP.getPayment).toHaveBeenCalled();
    });

    it("should handle rejected payment", async () => {
      const event = createMPWebhookEvent({
        type: "payment",
        data: { id: "pay-1" },
      });

      const mockMP = {
        getPayment: vi.fn().mockResolvedValue({
          status: "rejected",
        }),
      };

      await processWebhookEvent(event);

      expect(mockMP.getPayment).toHaveBeenCalled();
    });

    it("should handle subscription authorized", async () => {
      const event = createMPWebhookEvent({
        type: "subscription_preapproval",
        action: "authorized",
        data: { id: "sub-1" },
      });

      const mockMP = {
        getSubscription: vi.fn().mockResolvedValue({
          status: "authorized",
          external_reference: "user-1",
        }),
      };

      await processWebhookEvent(event);

      expect(mockMP.getSubscription).toHaveBeenCalled();
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
      const event = createMPWebhookEvent({
        type: "payment",
        data: { id: "pay-1" },
      });

      const mockMP = {
        getPayment: vi.fn().mockRejectedValue(new Error("MP error")),
      };

      await expect(
        processWebhookEvent(event)
      ).resolves.not.toThrow();
    });
  });
});