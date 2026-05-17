import { create } from 'zustand'

// TODO: [Zustand] adicionar persist middleware para salvar token em localStorage
// Exemplo: import { persist } from 'zustand/middleware'
// Envolver o create com: create(persist(..., { name: 'auth-storage' }))

interface AuthState {
  token: string | null
  isAuth: boolean
  login: (email: string, password: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  isAuth: false,

  login: (email: string, _password: string) => {
    const fakeToken = btoa(`${email}:${Date.now()}`)
    set({ token: fakeToken, isAuth: true })
  },

  logout: () => {
    set({ token: null, isAuth: false })
  },
}))
