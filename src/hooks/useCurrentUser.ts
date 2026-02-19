// src/hooks/useCurrentUser.ts
"use client";

import { useState, useEffect } from "react";

interface CurrentUser {
  id: string;
  email: string;
  role: string | null;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setUser({ id: data.id, email: data.email, role: data.role });
        }
      })
      .catch((err) => console.error("Auth error:", err))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}