import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isValid } = useAuth()

  if (!isValid) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isValid } = useAuth()

  if (isValid) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
