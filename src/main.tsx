import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { OBRProvider } from './contexts/OBRContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OBRProvider>
      <App />
    </OBRProvider>
  </StrictMode>,
)
