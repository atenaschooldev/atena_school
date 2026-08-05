"use client"

import { Navigate, useLocation } from "react-router-dom"
import { getAdminToken } from "@/lib/api"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = getAdminToken()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />
  }

  return <>{children}</>
}
