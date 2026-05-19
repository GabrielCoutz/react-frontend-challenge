import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Aplica tema antes do primeiro render para evitar flash
function getInitialTheme(): 'dark' | 'light' {
  try {
    const raw = localStorage.getItem('theme-storage')
    const parsed = raw ? JSON.parse(raw) : null
    const theme = parsed?.state?.theme
    return theme === 'dark' || theme === 'light' ? theme : 'dark'
  } catch {
    return 'dark'
  }
}
document.documentElement.classList.add(getInitialTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
