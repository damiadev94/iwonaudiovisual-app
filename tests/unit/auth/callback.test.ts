import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Fns hoisted para los mocks ───────────────────────────────────────────────
const { mockExchangeCodeForSession } = vi.hoisted(() => ({
  mockExchangeCodeForSession: vi.fn(),
}));

// ─── Mocks de módulos ─────────────────────────────────────────────────────────
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession: mockExchangeCodeForSession },
  })),
}));

// Mock next/headers (requerido por createClient del servidor)
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}));

import { GET } from "@/app/(auth)/callback/route";

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("GET /callback - flujo OAuth de Google", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Flujo exitoso ────────────────────────────────────────────────────────

  it("intercambia el código por sesión y redirige a /dashboard", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });

    const request = new Request(
      "https://iwonaudiovisual.com/callback?code=google_auth_code_123"
    );
    const response = await GET(request);

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("google_auth_code_123");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://iwonaudiovisual.com/dashboard"
    );
  });

  it("respeta el parámetro ?next y redirige a la ruta indicada", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });

    const request = new Request(
      "https://iwonaudiovisual.com/callback?code=abc123&next=/dashboard/canciones"
    );
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://iwonaudiovisual.com/dashboard/canciones"
    );
  });

  // ─── Flujos de error ──────────────────────────────────────────────────────

  it("redirige a /login?error=auth si no hay código en la URL", async () => {
    const request = new Request("https://iwonaudiovisual.com/callback");
    const response = await GET(request);

    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://iwonaudiovisual.com/login?error=auth"
    );
  });

  it("redirige a /login?error=auth si el intercambio de sesión falla", async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      error: { message: "invalid code" },
    });

    const request = new Request(
      "https://iwonaudiovisual.com/callback?code=codigo_invalido"
    );
    const response = await GET(request);

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("codigo_invalido");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://iwonaudiovisual.com/login?error=auth"
    );
  });

  it("preserva el origen correcto de producción en la URL de redirección", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });

    const request = new Request(
      "https://iwonaudiovisual.com/callback?code=prod_code_xyz"
    );
    const response = await GET(request);

    const location = response.headers.get("location")!;
    expect(location).toMatch(/^https:\/\/iwonaudiovisual\.com/);
    expect(location).toMatch(/\/dashboard$/);
  });
});
