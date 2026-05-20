import { beforeEach, describe, expect, it } from 'vitest'
import { cookieStorage } from '.'

function clearCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim()
    if (name) document.cookie = `${name}=; max-age=0; path=/`
  })
}

describe('cookieStorage', () => {
  beforeEach(clearCookies)

  it('setItem armazena valor legível por getItem', () => {
    cookieStorage.setItem('chave', 'valor')
    expect(cookieStorage.getItem('chave')).toBe('valor')
  })

  it('getItem retorna null para chave inexistente', () => {
    expect(cookieStorage.getItem('inexistente')).toBeNull()
  })

  it('removeItem deleta o cookie', () => {
    cookieStorage.setItem('chave', 'valor')
    cookieStorage.removeItem('chave')
    expect(cookieStorage.getItem('chave')).toBeNull()
  })

  it('preserva JSON serializado (uso do Zustand persist)', () => {
    const value = JSON.stringify({ token: 'uuid-abc', isAuthenticated: true })
    cookieStorage.setItem('auth-storage', value)
    expect(cookieStorage.getItem('auth-storage')).toBe(value)
  })

  it('sobrescreve valor existente', () => {
    cookieStorage.setItem('chave', 'primeiro')
    cookieStorage.setItem('chave', 'segundo')
    expect(cookieStorage.getItem('chave')).toBe('segundo')
  })
})
