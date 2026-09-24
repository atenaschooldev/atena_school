import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarConfigProvider } from '@/contexts/sidebar-context'
import { AppRouter } from '@/components/router/app-router'
import { useEffect, useState } from 'react'
import { initGTM } from '@/utils/analytics'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

import { LanguageProvider } from '@/i18n/context'
import { ThemeCustomizerProvider } from '@/contexts/theme-customizer-context'
import { DiagnosticLoggerWidget } from '@/components/shared/diagnostic-logger-widget'

// Get basename from environment (for deployment) or use empty string for development
const basename = import.meta.env.VITE_BASENAME || ''

const persister = typeof window !== 'undefined'
  ? createSyncStoragePersister({
      storage: window.localStorage,
      key: 'ATENA_ADMIN_QUERY_CACHE',
      throttleTime: 1000,
    })
  : undefined;

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes stale time
        gcTime: 1000 * 60 * 60 * 24, // 24 hours garbage collection time
        refetchOnWindowFocus: false, // Don't trigger background DB queries when switching tabs
        retry: false,
      },
    },
  }))

  // Initialize GTM on app load
  useEffect(() => {
    initGTM();
  }, []);

  return (
    <div className="font-sans antialiased" style={{ fontFamily: 'var(--font-inter)' }}>
      {persister ? (
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister,
            maxAge: 1000 * 60 * 60 * 12, // 12 hours cache age
          }}
        >
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <ThemeCustomizerProvider>
              <LanguageProvider>
                <SidebarConfigProvider>
                  <Router basename={basename}>
                    <AppRouter />
                    <DiagnosticLoggerWidget />
                  </Router>
                </SidebarConfigProvider>
              </LanguageProvider>
            </ThemeCustomizerProvider>
          </ThemeProvider>
        </PersistQueryClientProvider>
      ) : null}
    </div>
  )
}

export default App
