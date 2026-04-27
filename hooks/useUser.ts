"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cacheGet, cacheSet, cacheDelete } from "@/lib/cache/memoryCache";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";

async function fetchProfile(userId: string): Promise<Profile | null> {
  const key = `profile:${userId}`;
  const cached = cacheGet<Profile>(key);
  if (cached) return cached;

  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (data) cacheSet(key, data);
  return data ?? null;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const data = await fetchProfile(user.id);
        setProfile(data);
      }

      setLoading(false);
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        if (!session?.user) {
          setProfile(null);
          return;
        }

        // Invalidate cache on sign-in or token refresh so stale profile isn't served
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          cacheDelete(`profile:${session.user.id}`);
        }

        const data = await fetchProfile(session.user.id);
        setProfile(data);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading };
}
