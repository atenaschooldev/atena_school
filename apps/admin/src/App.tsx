import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarConfigProvider } from '@/contexts/sidebar-context'
import { AppRouter } from '@/components/router/app-router'
import { useEffect, useState } from 'react'
import { initGTM } from '@/utils/analytics'
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

import { LanguageProvider } from '@/i18n/context'
import { ThemeCustomizerProvider } from '@/contexts/theme-customizer-context'
import { DiagnosticLoggerWidget } from '@/components/shared/diagnostic-logger-widget'
import { diagnosticLogger } from '@/utils/diagnostic-logger'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

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
    queryCache: new QueryCache({
      onError: (error, query) => {
        const key = Array.isArray(query.queryKey) ? query.queryKey.map(String).join(", ") : String(query.queryKey);
        console.error(`⚠️ [Query Error] Key: [${key}]:`, error);
        diagnosticLogger.logError(`Query Error: ${key}`, error);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const mutationKey = mutation.options.mutationKey ? (mutation.options.mutationKey as string[]).join(", ") : "Mutation";
        console.error(`🚨 [Mutation Error] [${mutationKey}]:`, error);
        diagnosticLogger.logError(`Mutation Error: ${mutationKey}`, error);
      },
    }),
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
                  {import.meta.env.DEV && (
                    <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
                  )}
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
