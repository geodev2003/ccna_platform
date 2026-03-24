"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/lib/api";

interface User { id: string; name: string; email: string; role: string; avatarUrl?: string }
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null, accessToken: null, refreshToken: null, isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
          }
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
        } finally { set({ isLoading: false }); }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/register", { name, email, password });
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
          }
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
        } finally { set({ isLoading: false }); }
      },

      logout: async () => {
        try { await api.post("/auth/logout", { refreshToken: get().refreshToken }); } catch {}
        if (typeof window !== "undefined") localStorage.clear();
        set({ user: null, accessToken: null, refreshToken: null });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data });
        } catch { set({ user: null }); }
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return localStorage;
        return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
      }),
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }),
    }
  )
);