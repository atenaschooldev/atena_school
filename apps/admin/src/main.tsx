import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyGoogleTranslateDomPatch } from '@/utils/fix-google-translate'
import { ErrorBoundary } from '@/components/error-boundary'

// Apply DOM patch to safely handle Google Translate / browser extension mutations
applyGoogleTranslateDomPatch()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
