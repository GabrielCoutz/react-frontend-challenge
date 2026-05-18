import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { LoginForm } from './login-form'

const mockLogin = vi.fn()
const mockOnSuccess = vi.fn()

vi.mock('@/entities/user/model/auth-store', () => ({
  useAuthStore: () => ({ login: mockLogin }),
}))

describe('LoginForm — validação Zod', () => {
  beforeEach(() => {
    mockLogin.mockClear()
    mockOnSuccess.mockClear()
    mockLogin.mockResolvedValue(true)
  })

  const fillAndSubmit = async (email: string, password: string) => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm onSuccess={mockOnSuccess} />)
    await user.type(screen.getByLabelText('Email'), email)
    await user.type(screen.getByLabelText('Senha'), password)
    fireEvent.submit(screen.getByRole('button', { name: /entrar/i }).closest('form')!)
  }

  it('exibe erro para email inválido', async () => {
    await fillAndSubmit('nao-e-email', '123456')
    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument()
    })
    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('exibe erro para senha menor que 6 caracteres', async () => {
    await fillAndSubmit('teste@email.com', '123')
    await waitFor(() => {
      expect(screen.getByText('Senha deve ter no mínimo 6 caracteres')).toBeInTheDocument()
    })
    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('não chama login com dados inválidos', async () => {
    await fillAndSubmit('invalido', '123')
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled()
    })
  })

  it('chama login com dados válidos', async () => {
    await fillAndSubmit('teste@email.com', 'senha123')
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('teste@email.com', 'senha123')
    })
  })

  it('chama onSuccess após login bem-sucedido', async () => {
    await fillAndSubmit('teste@email.com', 'senha123')
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('não chama onSuccess quando login falha', async () => {
    mockLogin.mockResolvedValue(false)
    await fillAndSubmit('teste@email.com', 'senha123')
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })
    expect(mockOnSuccess).not.toHaveBeenCalled()
  })
})
