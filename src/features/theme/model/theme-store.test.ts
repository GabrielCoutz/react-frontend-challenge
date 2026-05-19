import { beforeEach, describe, expect, it } from 'vitest'
import { useThemeStore } from './theme-store'

describe('theme-store', () => {
  beforeEach(() => {
    document.documentElement.className = ''
    useThemeStore.setState({ theme: 'dark' })
  })

  describe('setTheme()', () => {
    it('atualiza o estado para dark', () => {
      useThemeStore.getState().setTheme('dark')
      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('atualiza o estado para light', () => {
      useThemeStore.getState().setTheme('light')
      expect(useThemeStore.getState().theme).toBe('light')
    })

    it('adiciona classe dark ao documentElement', () => {
      useThemeStore.getState().setTheme('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('adiciona classe light ao documentElement', () => {
      useThemeStore.getState().setTheme('light')
      expect(document.documentElement.classList.contains('light')).toBe(true)
    })

    it('remove classe dark ao mudar para light', () => {
      useThemeStore.getState().setTheme('dark')
      useThemeStore.getState().setTheme('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('remove classe light ao mudar para dark', () => {
      useThemeStore.getState().setTheme('light')
      useThemeStore.getState().setTheme('dark')
      expect(document.documentElement.classList.contains('light')).toBe(false)
    })
  })

  describe('toggle()', () => {
    it('alterna de dark para light', () => {
      useThemeStore.setState({ theme: 'dark' })
      useThemeStore.getState().toggle()
      expect(useThemeStore.getState().theme).toBe('light')
    })

    it('alterna de light para dark', () => {
      useThemeStore.setState({ theme: 'light' })
      useThemeStore.getState().toggle()
      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('aplica a classe correta ao alternar para light', () => {
      useThemeStore.setState({ theme: 'dark' })
      useThemeStore.getState().toggle()
      expect(document.documentElement.classList.contains('light')).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('aplica a classe correta ao alternar para dark', () => {
      useThemeStore.setState({ theme: 'light' })
      useThemeStore.getState().toggle()
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.classList.contains('light')).toBe(false)
    })

    it('dois toggles consecutivos retornam ao tema original', () => {
      const original = useThemeStore.getState().theme
      useThemeStore.getState().toggle()
      useThemeStore.getState().toggle()
      expect(useThemeStore.getState().theme).toBe(original)
    })
  })
})
