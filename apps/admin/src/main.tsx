import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyGoogleTranslateDomPatch } from '@/utils/fix-google-translate'
import { initPointerEventsWatchdog } from '@/utils/fix-pointer-events'
import { ErrorBoundary } from '@/components/error-boundary'

// Apply DOM patch to safely handle Google Translate / browser extension mutations
applyGoogleTranslateDomPatch()

// Initialize universal pointer-events watchdog for seamless mouse clicks across all dialogs
initPointerEventsWatchdog()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
