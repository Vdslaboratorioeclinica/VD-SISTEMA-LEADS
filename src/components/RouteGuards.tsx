import React from 'react'
import { Navigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isValid, isActive, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1120] text-sm text-[#94A3B8]">
        Validando acesso…
      </div>
    )
  }
  if (!isValid || !isActive) return <Navigate to="/login" replace />
  return <>{children}</>
}

export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isValid, isActive, isLoading } = useAuth()
  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1120] text-sm text-[#94A3B8]">
        Validando acesso…
      </div>
    )
  if (isValid && isActive) return <Navigate to="/" replace />
  return <>{children}</>
}

export const PermissionDenied: React.FC<{ permission: string }> = ({ permission }) => (
  <div
    role="alert"
    className="flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200"
  >
    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
    <span>
      Acesso negado. Seu perfil não possui a permissão <strong>{permission}</strong>.
    </span>
  </div>
)
