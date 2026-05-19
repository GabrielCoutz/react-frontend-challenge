import { generateAuthToken } from "@/shared/utils/generateAuthToken";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,

      async login() {
        await new Promise((r) => setTimeout(r, 2000)); // intentional 2s delay to simulate network request

        const authToken = generateAuthToken();

        set({ token: authToken, isAuthenticated: true });

        return true;
      },

      logout: () => {
        set({ token: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
