import type { StateStorage } from "zustand/middleware";

const isSecure = location.protocol === "https:";

export const cookieStorage: StateStorage = {
  getItem: (name) => {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${encodeURIComponent(name)}=([^;]*)`)
    );
    return match ? decodeURIComponent(match[1]) : null;
  },

  setItem: (name, value) => {
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    const secure = isSecure ? "; Secure" : "";
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Strict${secure}`;
  },

  removeItem: (name) => {
    document.cookie = `${encodeURIComponent(name)}=; max-age=0; path=/; SameSite=Strict`;
  },
};
