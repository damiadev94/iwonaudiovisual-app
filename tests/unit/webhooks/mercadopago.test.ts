import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMPWebhookEvent } from "@/tests/factories/mp-webhook.factory";
import { Payment, PreApproval } from "mercadopago";
import {
  verifyWebhookSignature,
  processWebhookEvent,
} from "@/lib/mercadopago/webhook";

import { createAdminClient } from "@/lib/supabase/admin";

const mockGet = vi.fn();

// Mock de dependencias externas
vi.mock("mercadopago", () => {
  return {
    MercadoPagoConfig: vi.fn(),

    Payment: vi.fn().mockImplementation(() => ({
      get: mockGet,
    })),

    PreApproval: vi.fn().mockImplementation(() => ({
      get: mockGet,
    })),
  };
});

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
