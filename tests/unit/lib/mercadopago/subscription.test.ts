import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Hoist mock fns so they're available inside vi.mock factory (which is hoisted above imports)
const { mockPlanCreate, mockUpdate, mockGet } = vi.hoisted(() => ({
  mockPlanCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockGet: vi.fn(),
}));

vi.mock("mercadopago", () => ({
  MercadoPagoConfig: vi.fn(function () {}),
  PreApproval: vi.fn(function () {
    return { update: mockUpdate, get: mockGet };
  }),
  PreApprovalPlan: vi.fn(function () {
    return { create: mockPlanCreate };
  }),
  Payment: vi.fn(function () {
    return { get: vi.fn() };
  }),
}));

vi.mock("@/lib/mercadopago/client", () => ({
  mercadopago: {},
}));

import {
  getSubscribeUrl,
  cancelSubscription,
  getSubscriptionStatus,
} from "@/lib/mercadopago/subscription";

describe("lib/mercadopago/subscription", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MERCADOPAGO_BACK_URL = "http://localhost:3000";
    // Ensure MERCADOPAGO_PLAN_ID is unset by default so getPlanId creates one
    delete process.env.MERCADOPAGO_PLAN_ID;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("getSubscribeUrl", () => {
    it("usa MERCADOPAGO_PLAN_ID si está definido y devuelve la URL correcta", async () => {
      process.env.MERCADOPAGO_PLAN_ID = "EXISTING_PLAN_ID";

      const url = await getSubscribeUrl("user-uuid-123", "test@example.com");

      expect(mockPlanCreate).not.toHaveBeenCalled();
      expect(url).toContain("preapproval_plan_id=EXISTING_PLAN_ID");
      expect(url).toContain("external_reference=user-uuid-123");
    });

    it("crea un plan cuando MERCADOPAGO_PLAN_ID no está definido", async () => {
      mockPlanCreate.mockResolvedValue({ id: "NEW_PLAN_ID" });

      const url = await getSubscribeUrl("user-uuid-123", "test@example.com");

      expect(mockPlanCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            reason: expect.any(String),
            auto_recurring: expect.objectContaining({
              frequency: 1,
              frequency_type: "months",
              transaction_amount: 14999,
              currency_id: "ARS",
            }),
          }),
        })
      );
      expect(url).toContain("preapproval_plan_id=NEW_PLAN_ID");
    });

    it("usa MERCADOPAGO_BACK_URL en el back_url del plan", async () => {
      process.env.MERCADOPAGO_BACK_URL = "https://app.example.com";
      mockPlanCreate.mockResolvedValue({ id: "PLAN_123" });

      await getSubscribeUrl("user-uuid-123", "test@example.com");

      expect(mockPlanCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            back_url: expect.stringContaining("https://app.example.com"),
          }),
        })
      );
    });

    it("usa NEXT_PUBLIC_APP_URL como fallback si MERCADOPAGO_BACK_URL no está definido", async () => {
      delete process.env.MERCADOPAGO_BACK_URL;
      process.env.NEXT_PUBLIC_APP_URL = "https://iwon.example.com";
      mockPlanCreate.mockResolvedValue({ id: "PLAN_123" });

      await getSubscribeUrl("user-uuid-123", "test@example.com");

      expect(mockPlanCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            back_url: expect.stringContaining("https://iwon.example.com"),
          }),
        })
      );
    });

    it("propaga errores del SDK de MercadoPago", async () => {
      mockPlanCreate.mockRejectedValue(new Error("MP API error"));

      await expect(
        getSubscribeUrl("user-uuid-123", "test@example.com")
      ).rejects.toThrow("MP API error");
    });
  });

  describe("cancelSubscription", () => {
    it("llama a preApproval.update con status cancelled", async () => {
      const mockResult = { id: "PREAPPROVAL_123", status: "cancelled" };
      mockUpdate.mockResolvedValue(mockResult);

      const result = await cancelSubscription("PREAPPROVAL_123");

      expect(mockUpdate).toHaveBeenCalledWith({
        id: "PREAPPROVAL_123",
        body: { status: "cancelled" },
      });
      expect(result).toEqual(mockResult);
    });

    it("propaga errores del SDK de MercadoPago", async () => {
      mockUpdate.mockRejectedValue(new Error("MP API error"));

      await expect(cancelSubscription("PREAPPROVAL_123")).rejects.toThrow(
        "MP API error"
      );
    });
  });

  describe("getSubscriptionStatus", () => {
    it("obtiene el estado de una suscripción por ID", async () => {
      const mockResult = {
        id: "PREAPPROVAL_123",
        status: "authorized",
        payer_email: "test@example.com",
      };
      mockGet.mockResolvedValue(mockResult);

      const result = await getSubscriptionStatus("PREAPPROVAL_123");

      expect(mockGet).toHaveBeenCalledWith({ id: "PREAPPROVAL_123" });
      expect(result).toEqual(mockResult);
    });

    it("propaga errores del SDK de MercadoPago", async () => {
      mockGet.mockRejectedValue(new Error("Not found"));

      await expect(getSubscriptionStatus("PREAPPROVAL_INVALID")).rejects.toThrow(
        "Not found"
      );
    });
  });
});
