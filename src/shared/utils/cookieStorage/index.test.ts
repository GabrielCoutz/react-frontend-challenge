import { beforeEach, describe, expect, it } from 'vitest'
import { getSignedAuthToken, removeAuthToken, setSignedAuthToken } from '.'

function clearCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0]?.trim() ?? ''
    if (name) document.cookie = `${name}=; max-age=0; path=/`
  })
}

describe('cookieStorage', () => {
  beforeEach(clearCookies)

  it('setSignedAuthToken + getSignedAuthToken retornam o mesmo token', async () => {
    await setSignedAuthToken('test-uuid-token')
    expect(await getSignedAuthToken()).toBe('test-uuid-token')
  })

  it('getSignedAuthToken retorna null quando cookie não existe', async () => {
    expect(await getSignedAuthToken()).toBeNull()
  })

  it('removeAuthToken deleta o cookie', async () => {
    await setSignedAuthToken('test-uuid-token')
    removeAuthToken()
    expect(await getSignedAuthToken()).toBeNull()
  })

  it('rejeita token adulterado (troca de caractere no token)', async () => {
    await setSignedAuthToken('legit-token')
    const raw = document.cookie.match(/auth-token=([^;]*)/)?.[1] ?? ''
    const dot = raw.indexOf('.')
    const tamperedToken = 'x' + raw.slice(1, dot)
    const sig = raw.slice(dot + 1)
    document.cookie = `auth-token=${tamperedToken}.${sig}`
    expect(await getSignedAuthToken()).toBeNull()
  })

  it('rejeita assinatura adulterada (troca de maiúscula por minúscula)', async () => {
    await setSignedAuthToken('legit-token')
    const raw = document.cookie.match(/auth-token=([^;]*)/)?.[1] ?? ''
    const dot = raw.indexOf('.')
    const token = raw.slice(0, dot)
    const sig = raw.slice(dot + 1)
    // troca primeiro char maiúsculo por minúsculo (ou vice-versa)
    const tamperedSig = sig
      .split('')
      .map((c, i) => i === 0 ? (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()) : c)
      .join('')
    document.cookie = `auth-token=${token}.${tamperedSig}`
    expect(await getSignedAuthToken()).toBeNull()
  })

  it('rejeita cookie sem assinatura (sem ponto separador)', async () => {
    document.cookie = 'auth-token=token-without-signature'
    expect(await getSignedAuthToken()).toBeNull()
  })

  it('sobrescreve token existente', async () => {
    await setSignedAuthToken('first-token')
    await setSignedAuthToken('second-token')
    expect(await getSignedAuthToken()).toBe('second-token')
  })
})
