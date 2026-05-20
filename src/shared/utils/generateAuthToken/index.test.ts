import { describe, expect, it } from 'vitest'
import { generateAuthToken } from '.'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('generateAuthToken', () => {
  it('retorna uma string não vazia', () => {
    expect(typeof generateAuthToken()).toBe('string')
    expect(generateAuthToken().length).toBeGreaterThan(0)
  })

  it('retorna um UUID v4 válido', () => {
    expect(generateAuthToken()).toMatch(UUID_REGEX)
  })

  it('gera tokens diferentes em chamadas consecutivas', () => {
    const a = generateAuthToken()
    const b = generateAuthToken()
    expect(a).not.toBe(b)
  })
})
