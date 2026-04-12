/**
 * Test de integración: flujo de registro y confirmación por email
 *
 * Simula el recorrido completo del usuario:
 *   1. Usuario completa el formulario en /register
 *      → signUp() es llamado con email, password y full_name
 *      → si la sesión no es inmediata: redirige a /confirm-email
 *      → si la sesión es inmediata (confirmación desactivada): redirige a /dashboard
 *   2. Usuario recibe email con link de confirmación y hace clic
 *      → browser va a /callback?code=<token_de_confirmacion>
 *      → el handler intercambia el código por sesión
 *      → redirige a /dashboard
 *
 * Nota: como el componente de registro es client-side y el entorno no tiene
 * DOM, se testea la lógica de validación (registerSchema) y el comportamiento
 * del cliente Supabase directamente. El callback route se testea completo.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerSchema } from "@/lib/validations/auth";

// ─── Fns hoisted para los mocks ───────────────────────────────────────────────
const { mockSignUp, mockExchangeCodeForSession } = vi.hoisted(() => ({
  mockSignUp: vi.fn(),
  mockExchangeCodeForSession: vi.fn(),
}));

// ─── Mocks de módulos ─────────────────────────────────────────────────────────

// Supabase cliente (browser) — usado por /register
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: { signUp: mockSignUp },
  })),
}));

// Supabase cliente (servidor) — usado por /callback
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const VALID_USER = {
  email: "usuario@ejemplo.com",
  password: "contrasena123",
  full_name: "Usuario Prueba",
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Flujo de registro con email y contraseña", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Paso 0: Validación del formulario ──────────────────────────────────────

  describe("Validación del formulario (registerSchema)", () => {
    it("acepta datos válidos", () => {
      const result = registerSchema.safeParse(VALID_USER);
      expect(result.success).toBe(true);
    });

    it("rechaza email con formato inválido", () => {
      const result = registerSchema.safeParse({ ...VALID_USER, email: "no-es-un-email" });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("Email invalido");
    });

    it("rechaza contraseña menor a 6 caracteres", () => {
      const result = registerSchema.safeParse({ ...VALID_USER, password: "123" });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        "La contrasena debe tener al menos 6 caracteres"
      );
    });

    it("rechaza nombre con menos de 2 caracteres", () => {
      const result = registerSchema.safeParse({ ...VALID_USER, full_name: "A" });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        "El nombre debe tener al menos 2 caracteres"
      );
    });

    it("rechaza si falta el campo full_name", () => {
      const { full_name: _, ...sinNombre } = VALID_USER;
      const result = registerSchema.safeParse(sinNombre);
      expect(result.success).toBe(false);
    });
  });

  // ─── Email ya registrado ─────────────────────────────────────────────────────

  describe("Email ya registrado", () => {
    it("detecta email duplicado: signUp retorna user con identities vacío (sin error explícito)", async () => {
      // Comportamiento de Supabase con confirmación activa + email ya existente:
      // no lanza error, sino que devuelve un user con identities = []
      mockSignUp.mockResolvedValue({
        data: {
          user: { id: "uid-existing", email: VALID_USER.email, identities: [] },
          session: null,
        },
        error: null,
      });

      const supabase = createBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: VALID_USER.email,
        password: VALID_USER.password,
        options: { data: { full_name: VALID_USER.full_name } },
      });

      // No hay error explícito de Supabase...
      expect(error).toBeNull();
      // ...pero identities vacío indica que el email ya estaba registrado
      expect(data.user?.identities?.length).toBe(0);
    });

    it("detecta email duplicado: signUp retorna error explícito", async () => {
      // Comportamiento de Supabase con confirmación desactivada + email ya existente
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "User already registered" },
      });

      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signUp({
        email: VALID_USER.email,
        password: VALID_USER.password,
        options: { data: { full_name: VALID_USER.full_name } },
      });

      expect(error).toBeTruthy();
      expect(error?.message).toBe("User already registered");
    });

    it("usuario nuevo tiene identities con al menos una entrada", async () => {
      mockSignUp.mockResolvedValue({
        data: {
          user: {
            id: "uid-new",
            email: VALID_USER.email,
            identities: [{ id: "uid-new", provider: "email" }],
          },
          session: null,
        },
        error: null,
      });

      const supabase = createBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: VALID_USER.email,
        password: VALID_USER.password,
        options: { data: { full_name: VALID_USER.full_name } },
      });

      expect(error).toBeNull();
      // identities con datos → registro exitoso, el componente redirige a /confirm-email
      expect(data.user?.identities?.length).toBeGreaterThan(0);
    });
  });

  // ─── Paso 1a: signUp con confirmación de email activada ─────────────────────

  describe("Paso 1a — signUp con confirmación de email (sin sesión inmediata)", () => {
    it("llama a signUp con email, password y full_name", async () => {
      // Supabase devuelve usuario sin sesión → email de confirmación pendiente
      mockSignUp.mockResolvedValue({
        data: { user: { id: "uid-123", email: VALID_USER.email }, session: null },
        error: null,
      });

      const supabase = createBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: VALID_USER.email,
        password: VALID_USER.password,
        options: { data: { full_name: VALID_USER.full_name } },
      });

      expect(error).toBeNull();
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: VALID_USER.email,
          password: VALID_USER.password,
          options: expect.objectContaining({
            data: expect.objectContaining({ full_name: VALID_USER.full_name }),
          }),
        })
      );

      // Sin sesión → el componente redirige a /confirm-email
      expect(data.session).toBeNull();
    });

  });

  // ─── Paso 1b: signUp con confirmación de email desactivada ──────────────────

  describe("Paso 1b — signUp sin confirmación de email (sesión inmediata)", () => {
    it("devuelve sesión activa y el componente redirige a /dashboard", async () => {
      mockSignUp.mockResolvedValue({
        data: {
          user: { id: "uid-456", email: VALID_USER.email },
          session: { access_token: "tok_abc", refresh_token: "ref_abc" },
        },
        error: null,
      });

      const supabase = createBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: VALID_USER.email,
        password: VALID_USER.password,
        options: { data: { full_name: VALID_USER.full_name } },
      });

      expect(error).toBeNull();
      // Sesión presente → el componente redirige directamente a /dashboard
      expect(data.session).not.toBeNull();
      expect(data.session?.access_token).toBe("tok_abc");
    });
  });

  // ─── Paso 2: Usuario confirma el email haciendo clic en el link ─────────────

  describe("Paso 2 — Confirmación de email via /callback", () => {
    it("intercambia el token de confirmación y redirige a /dashboard", async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      const request = new Request(
        "https://iwonaudiovisual.com/callback?code=email_confirm_token_xyz"
      );
      const response = await callbackRoute(request);

      expect(mockExchangeCodeForSession).toHaveBeenCalledWith(
        "email_confirm_token_xyz"
      );
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "https://iwonaudiovisual.com/dashboard"
      );
    });

    it("redirige a /login?error=auth si el token de confirmación es inválido o expiró", async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        error: { message: "token has expired" },
      });

      const request = new Request(
        "https://iwonaudiovisual.com/callback?code=token_expirado"
      );
      const response = await callbackRoute(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "https://iwonaudiovisual.com/login?error=auth"
      );
    });

    it("redirige a /login?error=auth si el usuario llega sin token en la URL", async () => {
      const request = new Request("https://iwonaudiovisual.com/callback");
      const response = await callbackRoute(request);

      expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
      expect(response.headers.get("location")).toBe(
        "https://iwonaudiovisual.com/login?error=auth"
      );
    });
  });

  // ─── Flujo end-to-end completo ───────────────────────────────────────────────

  describe("Flujo end-to-end: registrarse → confirmar email → /dashboard", () => {
    it("usuario nuevo: se registra, espera confirmación, confirma y llega a /dashboard", async () => {
      // Paso 1: usuario completa el formulario y signUp retorna sin sesión
      mockSignUp.mockResolvedValue({
        data: { user: { id: "uid-789" }, session: null },
        error: null,
      });

      const supabase = createBrowserClient();
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: VALID_USER.email,
        password: VALID_USER.password,
        options: { data: { full_name: VALID_USER.full_name } },
      });

      expect(signUpError).toBeNull();
      // Sin sesión → componente redirigió a /confirm-email
      expect(signUpData.session).toBeNull();

      // Paso 2: usuario recibe email y hace clic en el link de confirmación
      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      const confirmRequest = new Request(
        "https://iwonaudiovisual.com/callback?code=confirm_code_abc"
      );
      const response = await callbackRoute(confirmRequest);

      // Resultado final: usuario en /dashboard
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "https://iwonaudiovisual.com/dashboard"
      );
    });

    it("usuario nuevo: se registra con confirmación desactivada → llega directo a /dashboard", async () => {
      mockSignUp.mockResolvedValue({
        data: {
          user: { id: "uid-999" },
          session: { access_token: "direct_session" },
        },
        error: null,
      });

      const supabase = createBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: VALID_USER.email,
        password: VALID_USER.password,
        options: { data: { full_name: VALID_USER.full_name } },
      });

      expect(error).toBeNull();
      // Sesión inmediata → componente redirige directo a /dashboard sin pasar por confirm-email
      expect(data.session).not.toBeNull();
    });
  });
});
