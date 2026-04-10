"use client";

import { useUser } from "./useUser";

export function useAdmin() {
  const { user, profile, loading } = useUser();

  const isAdmin = profile?.role === "admin";

  return { user, profile, isAdmin, loading };
}
