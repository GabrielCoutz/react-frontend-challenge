import {
  removeAuthToken,
  setSignedAuthToken,
} from "@/shared/utils/cookieStorage";
import { generateAuthToken } from "@/shared/utils/generateAuthToken";
import { create } from "zustand";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  isAuthenticated: false,

  async login() {
    await new Promise((r) => setTimeout(r, 1000)); // intentional 1s delay to simulate network request

    const authToken = generateAuthToken();

    await setSignedAuthToken(authToken);
    set({ token: authToken, isAuthenticated: true });

    return true;
  },

  logout: () => {
    removeAuthToken();
    set({ token: null, isAuthenticated: false });
  },
}));
