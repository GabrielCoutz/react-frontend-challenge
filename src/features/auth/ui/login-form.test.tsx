import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { axe } from '@/test/setup'
import { LoginForm } from './login-form'

const mockLogin = vi.fn()
const mockOnSuccess = vi.fn()

vi.mock('@/entities/user', () => ({
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

describe('LoginForm — acessibilidade', () => {
  beforeEach(() => {
    vi.mocked(mockLogin).mockResolvedValue(true)
  })

  it('não tem violações de acessibilidade no estado inicial', async () => {
    const { container } = renderWithProviders(<LoginForm onSuccess={mockOnSuccess} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('não tem violações de acessibilidade com erros de validação visíveis', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<LoginForm onSuccess={mockOnSuccess} />)
    await user.type(screen.getByLabelText('Email'), 'invalido')
    await user.type(screen.getByLabelText('Senha'), '123')
    fireEvent.submit(screen.getByRole('button', { name: /entrar/i }).closest('form')!)
    await waitFor(() => expect(screen.getByText('Email inválido')).toBeInTheDocument())
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('LoginForm — atributos ARIA', () => {
  it('input email tem aria-label, autoComplete e aria-invalid=false inicial', () => {
    renderWithProviders(<LoginForm onSuccess={mockOnSuccess} />)
    const email = screen.getByLabelText('Email')
    expect(email).toHaveAttribute('aria-label', 'Email')
    expect(email).toHaveAttribute('autocomplete', 'email')
    expect(email).toHaveAttribute('aria-invalid', 'false')
  })

  it('input senha tem aria-label e autoComplete', () => {
    renderWithProviders(<LoginForm onSuccess={mockOnSuccess} />)
    const senha = screen.getByLabelText('Senha')
    expect(senha).toHaveAttribute('aria-label', 'Senha')
    expect(senha).toHaveAttribute('autocomplete', 'current-password')
  })

  it('botão de visibilidade da senha tem aria-label descritivo', () => {
    renderWithProviders(<LoginForm onSuccess={mockOnSuccess} />)
    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeInTheDocument()
  })

  it('aria-label do botão de senha alterna ao clicar', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm onSuccess={mockOnSuccess} />)
    const toggle = screen.getByRole('button', { name: 'Mostrar senha' })
    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Ocultar senha' })).toBeInTheDocument()
  })

  it('botão submit tem aria-busy=false no estado inicial', () => {
    renderWithProviders(<LoginForm onSuccess={mockOnSuccess} />)
    expect(screen.getByRole('button', { name: /entrar/i })).toHaveAttribute('aria-busy', 'false')
  })

  it('erro de email ativa aria-invalid e aria-describedby apontando para o alerta', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm onSuccess={mockOnSuccess} />)
    await user.type(screen.getByLabelText('Email'), 'invalido')
    await user.type(screen.getByLabelText('Senha'), 'senha123')
    fireEvent.submit(screen.getByRole('button', { name: /entrar/i }).closest('form')!)
    await waitFor(() => expect(screen.getByText('Email inválido')).toBeInTheDocument())
    const email = screen.getByLabelText('Email')
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveAttribute('aria-describedby', 'email-error')
    expect(screen.getByRole('alert')).toHaveTextContent('Email inválido')
  })

  it('erro de senha ativa aria-invalid e aria-describedby apontando para o alerta', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm onSuccess={mockOnSuccess} />)
    await user.type(screen.getByLabelText('Email'), 'valido@email.com')
    await user.type(screen.getByLabelText('Senha'), '123')
    fireEvent.submit(screen.getByRole('button', { name: /entrar/i }).closest('form')!)
    await waitFor(() => expect(screen.getByText('Senha deve ter no mínimo 6 caracteres')).toBeInTheDocument())
    const senha = screen.getByLabelText('Senha')
    expect(senha).toHaveAttribute('aria-invalid', 'true')
    expect(senha).toHaveAttribute('aria-describedby', 'password-error')
    expect(screen.getByRole('alert')).toHaveTextContent('Senha deve ter no mínimo 6 caracteres')
  })
})
