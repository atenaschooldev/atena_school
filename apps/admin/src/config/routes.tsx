import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

// Lazy load components for better performance
const Landing = lazy(() => import('@/app/landing/page'))
const Dashboard = lazy(() => import('@/app/dashboard/page'))
const Users = lazy(() => import('@/app/users/page'))
const Studenti = lazy(() => import('@/app/studenti/page'))
const Corsi = lazy(() => import('@/app/corsi/page'))
const Gruppi = lazy(() => import('@/app/gruppi/page'))
const Prenotazioni = lazy(() => import('@/app/prenotazioni/page'))
const Pagamenti = lazy(() => import('@/app/pagamenti/page'))
const Presenze = lazy(() => import('@/app/presenze/page'))
const Orari = lazy(() => import('@/app/orari/page'))
const Iscrizioni = lazy(() => import('@/app/iscrizioni/page'))
const Insegnanti = lazy(() => import('@/app/insegnanti/page'))
const Promozioni = lazy(() => import('@/app/promozioni/page'))
const ServiziAttivi = lazy(() => import('@/app/servizi-attivi/page'))
const Notifiche = lazy(() => import('@/app/notifiche/page'))
const Moduli = lazy(() => import('@/app/moduli/page'))
const Documenti = lazy(() => import('@/app/documenti/page'))
const FAQs = lazy(() => import('@/app/faqs/page'))

// Auth pages
const SignIn = lazy(() => import('@/app/auth/sign-in/page'))
const SignIn2 = lazy(() => import('@/app/auth/sign-in-2/page'))
const SignIn3 = lazy(() => import('@/app/auth/sign-in-3/page'))
const SignUp = lazy(() => import('@/app/auth/sign-up/page'))
const SignUp2 = lazy(() => import('@/app/auth/sign-up-2/page'))
const SignUp3 = lazy(() => import('@/app/auth/sign-up-3/page'))
const ForgotPassword = lazy(() => import('@/app/auth/forgot-password/page'))
const ForgotPassword2 = lazy(() => import('@/app/auth/forgot-password-2/page'))
const ForgotPassword3 = lazy(() => import('@/app/auth/forgot-password-3/page'))

// Error pages
const Unauthorized = lazy(() => import('@/app/errors/unauthorized/page'))
const Forbidden = lazy(() => import('@/app/errors/forbidden/page'))
const NotFound = lazy(() => import('@/app/errors/not-found/page'))
const InternalServerError = lazy(() => import('@/app/errors/internal-server-error/page'))
const UnderMaintenance = lazy(() => import('@/app/errors/under-maintenance/page'))

// Settings pages
const UserSettings = lazy(() => import('@/app/settings/user/page'))
const AccountSettings = lazy(() => import('@/app/settings/account/page'))
const AppearanceSettings = lazy(() => import('@/app/settings/appearance/page'))
const NotificationSettings = lazy(() => import('@/app/settings/notifications/page'))
const ConnectionSettings = lazy(() => import('@/app/settings/connections/page'))
const LocalizationSettings = lazy(() => import('@/app/settings/localization/page'))

export interface RouteConfig {
  path: string
  element: React.ReactNode
  children?: RouteConfig[]
}

export const routes: RouteConfig[] = [
  // Default route - redirect to dashboard
  // Use relative path "dashboard" instead of "/dashboard" for basename compatibility
  {
    path: "/",
    element: <Navigate to="dashboard" replace />
  },

  // Landing Page
  {
    path: "/landing",
    element: <Landing />
  },

  // Dashboard Routes
  {
    path: "/dashboard",
    element: <Dashboard />
  },


  // Content Pages
  {
    path: "/corsi",
    element: <Corsi />
  },
  {
    path: "/gruppi",
    element: <Gruppi />
  },
  {
    path: "/prenotazioni",
    element: <Prenotazioni />
  },
  {
    path: "/servizi-attivi",
    element: <ServiziAttivi />
  },
  {
    path: "/pagamenti",
    element: <Pagamenti />
  },
  {
    path: "/presenze",
    element: <Presenze />
  },
  {
    path: "/iscrizioni",
    element: <Iscrizioni />
  },
  {
    path: "/insegnanti",
    element: <Insegnanti />
  },
  {
    path: "/promozioni",
    element: <Promozioni />
  },
  {
    path: "/orari",
    element: <Orari />
  },
  {
    path: "/studenti",
    element: <Studenti />
  },
  {
    path: "/users",
    element: <Users />
  },
  {
    path: "/notifiche",
    element: <Notifiche />
  },
  {
    path: "/moduli",
    element: <Moduli />
  },
  {
    path: "/documenti",
    element: <Documenti />
  },
  {
    path: "/faqs",
    element: <FAQs />
  },

  // Authentication Routes
  {
    path: "/sign-in",
    element: <SignIn />
  },
  {
    path: "/auth/sign-in",
    element: <SignIn />
  },
  {
    path: "/auth/sign-in-2",
    element: <SignIn2 />
  },
  {
    path: "/auth/sign-in-3",
    element: <SignIn3 />
  },
  {
    path: "/auth/sign-up",
    element: <SignUp />
  },
  {
    path: "/auth/sign-up-2",
    element: <SignUp2 />
  },
  {
    path: "/auth/sign-up-3",
    element: <SignUp3 />
  },
  {
    path: "/auth/forgot-password",
    element: <ForgotPassword />
  },
  {
    path: "/auth/forgot-password-2",
    element: <ForgotPassword2 />
  },
  {
    path: "/auth/forgot-password-3",
    element: <ForgotPassword3 />
  },

  // Error Pages
  {
    path: "/errors/unauthorized",
    element: <Unauthorized />
  },
  {
    path: "/errors/forbidden",
    element: <Forbidden />
  },
  {
    path: "/errors/not-found",
    element: <NotFound />
  },
  {
    path: "/errors/internal-server-error",
    element: <InternalServerError />
  },
  {
    path: "/errors/under-maintenance",
    element: <UnderMaintenance />
  },

  // Settings Routes
  {
    path: "/settings",
    element: <Navigate to="/settings/connections" replace />
  },
  {
    path: "/settings/user",
    element: <UserSettings />
  },
  {
    path: "/settings/account",
    element: <AccountSettings />
  },
  {
    path: "/settings/appearance",
    element: <AppearanceSettings />
  },
  {
    path: "/settings/notifications",
    element: <NotificationSettings />
  },
  {
    path: "/settings/connections",
    element: <ConnectionSettings />
  },
  {
    path: "/settings/localization",
    element: <LocalizationSettings />
  },

  // Catch-all route for 404
  {
    path: "*",
    element: <NotFound />
  }
]
