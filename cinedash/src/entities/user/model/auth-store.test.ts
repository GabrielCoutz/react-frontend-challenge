import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from './auth-store'

vi.mock('@/shared/utils/generateAuthToken', () => ({
  generateAuthToken: () => 'mock-token-abc',
}))

describe('auth-store', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, isAuthenticated: false })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('login()', () => {
    it('retorna true após login bem-sucedido', async () => {
      const promise = useAuthStore.getState().login('user@test.com', 'senha123')
      await vi.advanceTimersByTimeAsync(2000)
      const result = await promise
      expect(result).toBe(true)
    })

    it('define isAuthenticated como true após login', async () => {
      const promise = useAuthStore.getState().login('user@test.com', 'senha123')
      await vi.advanceTimersByTimeAsync(2000)
      await promise
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('armazena o token gerado após login', async () => {
      const promise = useAuthStore.getState().login('user@test.com', 'senha123')
      await vi.advanceTimersByTimeAsync(2000)
      await promise
      expect(useAuthStore.getState().token).toBe('mock-token-abc')
    })

    it('não autentica antes do delay de 2s completar', async () => {
      useAuthStore.getState().login('user@test.com', 'senha123')
      await vi.advanceTimersByTimeAsync(1999)
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('logout()', () => {
    it('limpa o token', async () => {
      const promise = useAuthStore.getState().login('user@test.com', 'senha123')
      await vi.advanceTimersByTimeAsync(2000)
      await promise
      useAuthStore.getState().logout()
      expect(useAuthStore.getState().token).toBeNull()
    })

    it('define isAuthenticated como false', async () => {
      const promise = useAuthStore.getState().login('user@test.com', 'senha123')
      await vi.advanceTimersByTimeAsync(2000)
      await promise
      useAuthStore.getState().logout()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('não lança erro ao fazer logout sem login prévio', () => {
      expect(() => useAuthStore.getState().logout()).not.toThrow()
    })
  })
})
