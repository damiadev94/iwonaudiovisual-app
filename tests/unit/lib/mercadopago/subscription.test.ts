import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Hoist mock fns so they're available inside vi.mock factory (which is hoisted above imports)
const { mockPlanCreate, mockPreApprovalCreate, mockUpdate, mockGet } = vi.hoisted(() => ({
  mockPlanCreate: vi.fn(),
  mockPreApprovalCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockGet: vi.fn(),
}));

vi.mock("mercadopago", () => ({
  MercadoPagoConfig: vi.fn(function () {}),
  PreApproval: vi.fn(function () {
    return { create: mockPreApprovalCreate, update: mockUpdate, get: mockGet };
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
  createSubscriptionForUser,
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

  describe("createSubscriptionForUser", () => {
    beforeEach(() => {
      // Por defecto setear plan_id para no caer en la rama de auto-creación
      process.env.MERCADOPAGO_PLAN_ID = "EXISTING_PLAN_ID";
      mockPreApprovalCreate.mockResolvedValue({
        id: "PREAPPROVAL_ABC",
        init_point: "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_id=PREAPPROVAL_ABC",
      });
    });

    it("crea una PreApproval con external_reference y devuelve preapproval_id + init_point", async () => {
      const result = await createSubscriptionForUser("user-uuid-123", "test@example.com");

      expect(mockPreApprovalCreate).toHaveBeenCalledWith({
        body: expect.objectContaining({
          preapproval_plan_id: "EXISTING_PLAN_ID",
          payer_email: "test@example.com",
          external_reference: "user-uuid-123",
          status: "pending",
        }),
      });
      expect(result.preapproval_id).toBe("PREAPPROVAL_ABC");
      expect(result.init_point).toContain("mercadopago");
    });

    it("usa MERCADOPAGO_BACK_URL en el back_url cuando está definido", async () => {
      process.env.MERCADOPAGO_BACK_URL = "https://app.example.com";

      await createSubscriptionForUser("user-uuid-123", "test@example.com");

      expect(mockPreApprovalCreate).toHaveBeenCalledWith({
        body: expect.objectContaining({
          back_url: "https://app.example.com/suscripcion/exito",
        }),
      });
    });

    it("usa NEXT_PUBLIC_APP_URL como fallback si MERCADOPAGO_BACK_URL no está definido", async () => {
      delete process.env.MERCADOPAGO_BACK_URL;
      process.env.NEXT_PUBLIC_APP_URL = "https://iwon.example.com";

      await createSubscriptionForUser("user-uuid-123", "test@example.com");

      expect(mockPreApprovalCreate).toHaveBeenCalledWith({
        body: expect.objectContaining({
          back_url: "https://iwon.example.com/suscripcion/exito",
        }),
      });
    });

    it("falla si MP devuelve una PreApproval sin id o sin init_point", async () => {
      mockPreApprovalCreate.mockResolvedValue({ id: "X" });

      await expect(
        createSubscriptionForUser("user-uuid-123", "test@example.com")
      ).rejects.toThrow(/preapproval inválida/i);
    });

    it("propaga errores del SDK de MercadoPago", async () => {
      mockPreApprovalCreate.mockRejectedValue(new Error("MP API error"));

      await expect(
        createSubscriptionForUser("user-uuid-123", "test@example.com")
      ).rejects.toThrow("MP API error");
    });

    it("crea un plan cuando MERCADOPAGO_PLAN_ID no está definido (modo dev)", async () => {
      delete process.env.MERCADOPAGO_PLAN_ID;
      mockPlanCreate.mockResolvedValue({ id: "NEW_PLAN_ID" });

      await createSubscriptionForUser("user-uuid-123", "test@example.com");

      expect(mockPlanCreate).toHaveBeenCalled();
      expect(mockPreApprovalCreate).toHaveBeenCalledWith({
        body: expect.objectContaining({ preapproval_plan_id: "NEW_PLAN_ID" }),
      });
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
