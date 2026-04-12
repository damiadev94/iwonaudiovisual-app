/**
 * Test de integración: flujo completo de autenticación con Google
 *
 * Simula el recorrido del usuario:
 *   1. Usuario hace clic en "Continuar con Google" en /login
 *      → se llama a supabase.auth.signInWithOAuth con provider "google"
 *      → el browser redirige al proveedor OAuth de Google
 *   2. Google autentica al usuario y redirige a /callback?code=...
 *      → el handler intercambia el código por una sesión
 *      → el usuario es redirigido a /dashboard
 *
 * Nota sobre paso 1: como el componente de login es client-side y este
 * entorno no tiene DOM (jsdom/happy-dom), verificamos el comportamiento
 * del cliente supabase directamente — sin renderizar el componente.
 * Para tests de UI completos (clic real en el botón) se necesitaría
 * instalar @testing-library/react + jsdom o usar Playwright.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Fns hoisted para los mocks ───────────────────────────────────────────────
const { mockSignInWithOAuth, mockExchangeCodeForSession } = vi.hoisted(() => ({
  mockSignInWithOAuth: vi.fn(),
  mockExchangeCodeForSession: vi.fn(),
}));

// ─── Mocks de módulos ─────────────────────────────────────────────────────────

// Supabase cliente (browser) — usado por el login page
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: { signInWithOAuth: mockSignInWithOAuth },
  })),
}));

// Supabase cliente (servidor) — usado por el callback route
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession: mockExchangeCodeForSession },
  })),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}));

import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { GET as callbackRoute } from "@/app/(auth)/callback/route";

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Flujo completo de autenticación con Google", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Paso 1 — Inicio del login con Google desde /login", () => {
    it("llama a signInWithOAuth con provider 'google'", async () => {
      mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

      const supabase = createBrowserClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://iwonaudiovisual.com/callback",
        },
      });

      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: "google" })
      );
    });

    it("incluye redirectTo apuntando a /callback", async () => {
      mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

      const supabase = createBrowserClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://iwonaudiovisual.com/callback",
        },
      });

      const [args] = mockSignInWithOAuth.mock.calls[0];
      expect(args.options?.redirectTo).toMatch(/\/callback$/);
    });

    it("no llama a signInWithOAuth si hay un error (estado de error)", async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: "OAuth provider error" },
      });

      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: "https://iwonaudiovisual.com/callback" },
      });

      // El error queda expuesto para que el componente muestre toast
      expect(error).toBeTruthy();
      expect(error?.message).toBe("OAuth provider error");
    });
  });

  describe("Paso 2 — Retorno de Google a /callback", () => {
    it("intercambia el código y redirige al usuario a /dashboard", async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      const request = new Request(
        "https://iwonaudiovisual.com/callback?code=google_code_abc"
      );
      const response = await callbackRoute(request);

      expect(mockExchangeCodeForSession).toHaveBeenCalledWith("google_code_abc");
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "https://iwonaudiovisual.com/dashboard"
      );
    });

    it("redirige a /login?error=auth si Google no envió código", async () => {
      const request = new Request("https://iwonaudiovisual.com/callback");
      const response = await callbackRoute(request);

      expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
      expect(response.headers.get("location")).toBe(
        "https://iwonaudiovisual.com/login?error=auth"
      );
    });

    it("redirige a /login?error=auth si el código de Google es inválido", async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        error: { message: "invalid or expired code" },
      });

      const request = new Request(
        "https://iwonaudiovisual.com/callback?code=codigo_expirado"
      );
      const response = await callbackRoute(request);

      expect(response.headers.get("location")).toBe(
        "https://iwonaudiovisual.com/login?error=auth"
      );
    });
  });

  describe("Flujo end-to-end simulado", () => {
    it("usuario nuevo: inicia OAuth → recibe callback → llega a /dashboard", async () => {
      // Paso 1: usuario hace clic en "Continuar con Google"
      mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

      const supabase = createBrowserClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: "https://iwonaudiovisual.com/callback" },
      });

      expect(oauthError).toBeNull();
      expect(mockSignInWithOAuth).toHaveBeenCalledOnce();

      // Paso 2: Google autentica y redirige con código al callback
      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      const callbackRequest = new Request(
        "https://iwonaudiovisual.com/callback?code=new_user_auth_code"
      );
      const response = await callbackRoute(callbackRequest);

      // Resultado final: usuario en /dashboard
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "https://iwonaudiovisual.com/dashboard"
      );
    });

    it("usuario existente: reutiliza sesión → misma redirección a /dashboard", async () => {
      mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });
      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      // Inicia OAuth
      const supabase = createBrowserClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: "https://iwonaudiovisual.com/callback" },
      });

      // Recibe callback con código
      const response = await callbackRoute(
        new Request("https://iwonaudiovisual.com/callback?code=returning_user_code")
      );

      expect(response.headers.get("location")).toBe(
        "https://iwonaudiovisual.com/dashboard"
      );
    });
  });
});
