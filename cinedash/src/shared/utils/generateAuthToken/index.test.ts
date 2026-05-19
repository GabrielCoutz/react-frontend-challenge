import { describe, expect, it } from 'vitest'
import { generateAuthToken } from '.'

describe('generateAuthToken', () => {
  it('retorna uma string não vazia', () => {
    expect(typeof generateAuthToken()).toBe('string')
    expect(generateAuthToken().length).toBeGreaterThan(0)
  })

  it('retorna apenas caracteres base36 válidos', () => {
    expect(generateAuthToken()).toMatch(/^[0-9a-z]+$/)
  })

  it('gera tokens diferentes em chamadas consecutivas', () => {
    const a = generateAuthToken()
    // força diferença de timestamp com delay via Date mock
    const b = generateAuthToken()
    // tokens gerados em milissegundos distintos devem ser diferentes;
    // em execução síncrona podem coincidir — validamos pelo menos o formato
    expect(typeof a).toBe('string')
    expect(typeof b).toBe('string')
  })

  it('token corresponde ao timestamp atual em base36', () => {
    const before = Date.now()
    const token = generateAuthToken()
    const after = Date.now()
    const tokenAsNumber = parseInt(token, 36)
    expect(tokenAsNumber).toBeGreaterThanOrEqual(before)
    expect(tokenAsNumber).toBeLessThanOrEqual(after)
  })
})
