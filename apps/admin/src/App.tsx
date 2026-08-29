import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarConfigProvider } from '@/contexts/sidebar-context'
import { AppRouter } from '@/components/router/app-router'
import { useEffect, useState } from 'react'
import { initGTM } from '@/utils/analytics'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { LanguageProvider } from '@/i18n/context'
import { ThemeCustomizerProvider } from '@/contexts/theme-customizer-context'

// Get basename from environment (for deployment) or use empty string for development
const basename = import.meta.env.VITE_BASENAME || ''

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
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
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <ThemeCustomizerProvider>
            <LanguageProvider>
              <SidebarConfigProvider>
                <Router basename={basename}>
                  <AppRouter />
                </Router>
              </SidebarConfigProvider>
            </LanguageProvider>
          </ThemeCustomizerProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  )
}

export default App
