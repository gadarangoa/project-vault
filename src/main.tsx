import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppProvider } from '@/context/AppContext'
import { AppearanceProvider } from '@/components/appearance-provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <AppearanceProvider>
        <App />
      </AppearanceProvider>
    </AppProvider>
  </StrictMode>,
)
