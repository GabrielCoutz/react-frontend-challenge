import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Aplica tema antes do primeiro render para evitar flash
const stored = localStorage.getItem('theme-storage')
const theme = stored ? (JSON.parse(stored)?.state?.theme ?? 'dark') : 'dark'
document.documentElement.classList.add(theme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
