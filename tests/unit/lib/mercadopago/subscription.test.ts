import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoist mock fns so they're available inside vi.mock factory (which is hoisted above imports)
const { mockCreate, mockUpdate, mockGet } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockGet: vi.fn(),
}));

vi.mock("mercadopago", () => ({
  MercadoPagoConfig: vi.fn(function () {}),
  PreApproval: vi.fn(function () {
    return { create: mockCreate, update: mockUpdate, get: mockGet };
  }),
  Payment: vi.fn(function () {
    return { get: vi.fn() };
  }),
}));

vi.mock("@/lib/mercadopago/client", () => ({
  mercadopago: {},
}));

import {
  createSubscription,
  cancelSubscription,
  getSubscriptionStatus,
} from "@/lib/mercadopago/subscription";

describe("lib/mercadopago/subscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MERCADOPAGO_BACK_URL = "http://localhost:3000";
  });

  describe("createSubscription", () => {
    it("crea un pre-approval con los parámetros correctos", async () => {
      const mockResult = {
        id: "PREAPPROVAL_123",
        init_point:
          "https://www.mercadopago.com.ar/subscriptions/checkout?id=PREAPPROVAL_123",
        status: "pending",
      };
      mockCreate.mockResolvedValue(mockResult);

      const result = await createSubscription("test@example.com", "user-uuid-123");

      expect(mockCreate).toHaveBeenCalledWith({
        body: {
          reason: "Iwon Audiovisual - Suscripcion Mensual",
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 9999,
            currency_id: "ARS",
          },
          payer_email: "test@example.com",
          back_url: "http://localhost:3000/subir-cancion",
          external_reference: "user-uuid-123",
        },
      });
      expect(result).toEqual(mockResult);
    });

    it("usa MERCADOPAGO_BACK_URL cuando está definido", async () => {
      process.env.MERCADOPAGO_BACK_URL = "https://app.example.com";
      mockCreate.mockResolvedValue({ id: "PREAPPROVAL_123", init_point: "https://mp.com/checkout" });

      await createSubscription("test@example.com", "user-uuid-123");

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            back_url: "https://app.example.com/subir-cancion",
          }),
        })
      );
    });

    it("usa NEXT_PUBLIC_APP_URL como fallback si MERCADOPAGO_BACK_URL no está definido", async () => {
      delete process.env.MERCADOPAGO_BACK_URL;
      process.env.NEXT_PUBLIC_APP_URL = "https://iwon.example.com";
      mockCreate.mockResolvedValue({ id: "PREAPPROVAL_123", init_point: "https://mp.com/checkout" });

      await createSubscription("test@example.com", "user-uuid-123");

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            back_url: "https://iwon.example.com/subir-cancion",
          }),
        })
      );

      process.env.MERCADOPAGO_BACK_URL = "http://localhost:3000";
      process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    });

    it("propaga errores del SDK de MercadoPago", async () => {
      mockCreate.mockRejectedValue(new Error("MP API error"));

      await expect(
        createSubscription("test@example.com", "user-uuid-123")
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
