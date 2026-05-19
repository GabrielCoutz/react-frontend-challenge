import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useDebounce } from './use-debounce'

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('retorna o valor inicial imediatamente', () => {
    const { result } = renderHook(() => useDebounce('inicial', 400))
    expect(result.current).toBe('inicial')
  })

  it('não atualiza o valor antes do delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'primeiro' },
    })

    rerender({ value: 'segundo' })
    act(() => { vi.advanceTimersByTime(300) })

    expect(result.current).toBe('primeiro')
  })

  it('atualiza o valor após o delay completo', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'primeiro' },
    })

    rerender({ value: 'segundo' })
    act(() => { vi.advanceTimersByTime(400) })

    expect(result.current).toBe('segundo')
  })

  it('reseta o timer a cada mudança de valor', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })
    act(() => { vi.advanceTimersByTime(300) })

    rerender({ value: 'c' })
    act(() => { vi.advanceTimersByTime(300) })

    // ainda não deve ter atualizado — timer foi resetado
    expect(result.current).toBe('a')

    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current).toBe('c')
  })
})
