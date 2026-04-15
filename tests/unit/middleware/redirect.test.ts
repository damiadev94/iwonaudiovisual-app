import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Fns hoisted para los mocks ───────────────────────────────────────────────
const { mockGetUser } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
}));

// ─── Mocks de módulos ─────────────────────────────────────────────────────────
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildRequest(pathname: string) {
  return new NextRequest(`https://iwonaudiovisual.com${pathname}`);
}

const AUTHENTICATED_USER = { id: "uid-123", email: "usuario@ejemplo.com" };

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("middleware — redirecciones según estado de autenticación", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Usuario autenticado en rutas de auth ────────────────────────────────────

  describe("usuario autenticado", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: AUTHENTICATED_USER } });
    });

    it("redirige de /login a /dashboard", async () => {
      const response = await middleware(buildRequest("/login"));

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "https://iwonaudiovisual.com/dashboard"
      );
    });

    it("redirige de /register a /dashboard", async () => {
      const response = await middleware(buildRequest("/register"));

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "https://iwonaudiovisual.com/dashboard"
      );
    });

    it("permite el acceso a /dashboard sin redirigir", async () => {
      const response = await middleware(buildRequest("/dashboard"));

      expect(response.status).not.toBe(307);
      expect(response.headers.get("location")).toBeNull();
    });

    it("permite el acceso a /dashboard/canciones sin redirigir", async () => {
      const response = await middleware(
        buildRequest("/dashboard/canciones")
      );

      expect(response.status).not.toBe(307);
      expect(response.headers.get("location")).toBeNull();
    });
  });

  // ─── Usuario no autenticado en rutas protegidas ──────────────────────────────

  describe("usuario no autenticado", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
    });

    it("redirige de /dashboard a /login", async () => {
      const response = await middleware(buildRequest("/dashboard"));

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "https://iwonaudiovisual.com/login"
      );
    });

    it("redirige de /admin a /login", async () => {
      const response = await middleware(buildRequest("/admin"));

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "https://iwonaudiovisual.com/login"
      );
    });

    it("permite el acceso a /login sin redirigir", async () => {
      const response = await middleware(buildRequest("/login"));

      expect(response.headers.get("location")).toBeNull();
    });

    it("permite el acceso a /register sin redirigir", async () => {
      const response = await middleware(buildRequest("/register"));

      expect(response.headers.get("location")).toBeNull();
    });
  });
});
