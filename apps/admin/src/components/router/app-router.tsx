"use client"

import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { routes, type RouteConfig } from '@/config/routes'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ProtectedRoute } from '@/components/router/protected-route'

function isPublicRoute(path: string): boolean {
  return path === '/' || path === '/landing' || path.startsWith('/auth/') || path.startsWith('/errors/')
}

function renderRoutes(routeConfigs: RouteConfig[]) {
  return routeConfigs.map((route, index) => {
    const isPublic = isPublicRoute(route.path)
    const element = isPublic ? route.element : <ProtectedRoute>{route.element}</ProtectedRoute>

    return (
      <Route
        key={route.path + index}
        path={route.path}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            {element}
          </Suspense>
        }
      >
        {route.children && renderRoutes(route.children)}
      </Route>
    )
  })
}

export function AppRouter() {
  return (
    <Routes>
      {renderRoutes(routes)}
    </Routes>
  )
}
