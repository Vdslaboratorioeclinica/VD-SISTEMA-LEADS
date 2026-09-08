import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { RecordAuthResponse, RecordModel } from 'pocketbase'
import pb from '@/lib/pocketbase/client'
import { permissionMatrix, type AccessProfile, type PermissionKey } from '@/data/accessControl'

export interface AuthContextType {
  user: RecordModel | null
  profile: AccessProfile | null
  isActive: boolean
  isValid: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<RecordAuthResponse<RecordModel>>
  logout: () => void
  hasPermission: (permission: PermissionKey) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function readAccess(record: RecordModel | null): {
  profile: AccessProfile | null
  isActive: boolean
} {
  const rawProfile = record?.profile
  const profile =
    rawProfile === 'Atendente' || rawProfile === 'Gestor' ? (rawProfile as AccessProfile) : null
  return {
    profile,
    isActive: Boolean(profile && record?.status === 'Ativo'),
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialRecord = (pb.authStore.record as RecordModel) || null
  const initialAccess = readAccess(initialRecord)
  const [user, setUser] = useState<RecordModel | null>(initialRecord)
  const [profile, setProfile] = useState<AccessProfile | null>(initialAccess.profile)
  const [isActive, setIsActive] = useState(initialAccess.isActive)
  const [isValid, setIsValid] = useState<boolean>(() => pb.authStore.isValid)
  const [isLoading, setIsLoading] = useState(false)

  const syncAccess = useCallback((record: RecordModel | null) => {
    const access = readAccess(record)
    setProfile(access.profile)
    setIsActive(access.isActive)
    return access
  }, [])

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, model) => {
      const nextUser = (model as RecordModel) || null
      setUser(nextUser)
      setIsValid(pb.authStore.isValid)
      syncAccess(nextUser)
    })
    return () => unsubscribe()
  }, [syncAccess])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const authData = await pb.collection('users').authWithPassword(email.trim(), password)
      const access = readAccess(authData.record)
      if (!access.profile || !access.isActive) {
        pb.authStore.clear()
        setUser(null)
        setIsValid(false)
        setProfile(access.profile)
        setIsActive(false)
        throw new Error('Usuário sem perfil ativo para operar o sistema.')
      }
      setUser(authData.record)
      setProfile(access.profile)
      setIsActive(true)
      setIsValid(true)
      return authData
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    pb.authStore.clear()
    setUser(null)
    setProfile(null)
    setIsActive(false)
    setIsValid(false)
  }, [])

  const permissions = useMemo(() => (profile ? permissionMatrix[profile] : []), [profile])
  const hasPermission = useCallback(
    (permission: PermissionKey) => isActive && permissions.includes(permission),
    [isActive, permissions],
  )

  return (
    <AuthContext.Provider
      value={{ user, profile, isActive, isValid, isLoading, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
