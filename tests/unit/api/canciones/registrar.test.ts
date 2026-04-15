import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/canciones/registrar/route";

// 🔁 Mocks globales
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

describe("POST /api/canciones/registrar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 🧩 Helpers
  const mockUser = { id: "user-1" };

  const createRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify(body),
    });

  // 🔴 1. No autenticado
  it("should return 401 if user is not authenticated", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const res = await POST(createRequest({}));

    expect(res.status).toBe(401);
  });

  // 🔴 2. Sin suscripción
  it("should return 403 if user has no subscription", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    } as unknown as ReturnType<typeof createAdminClient>);

    const res = await POST(createRequest({}));

    expect(res.status).toBe(403);
  });

  // 🔴 3. Body inválido
  it("should return 400 if required fields are missing", async () => {
    setupAuthAndSubscription();

    const res = await POST(createRequest({}));

    expect(res.status).toBe(400);
  });

  // 🔴 4. file_path inválido
  it("should return 400 if file_path does not belong to user", async () => {
    setupAuthAndSubscription();

    const res = await POST(
      createRequest({
        file_path: "otro-user/file.mp3",
        file_name: "file.mp3",
      })
    );

    expect(res.status).toBe(400);
  });

  // 🔴 5. Error en DB
  it("should return 500 if DB insert fails", async () => {
    setupAuthAndSubscription();

    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { status: "active" } }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      }),
    } as unknown as ReturnType<typeof createAdminClient>);

    const res = await POST(
      createRequest({
        file_path: "user-1/file.mp3",
        file_name: "file.mp3",
      })
    );

    expect(res.status).toBe(500);
  });

  // 🟢 6. Caso exitoso
  it("should register song successfully", async () => {
    setupAuthAndSubscription();

    const mockInsert = {
      id: "song-1",
      file_name: "file.mp3",
    };

    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { status: "active" } }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockInsert,
        error: null,
      }),
    } as unknown as ReturnType<typeof createAdminClient>);

    const res = await POST(
      createRequest({
        file_path: "user-1/file.mp3",
        file_name: "file.mp3",
      })
    );

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual(mockInsert);
  });

  // 🧩 Helper compartido
  function setupAuthAndSubscription() {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { status: "active" },
      }),
    } as unknown as ReturnType<typeof createAdminClient>);
  }
});
