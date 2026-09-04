import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
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

type SyntheticProfile = { profile: AccessProfile; status: 'Ativo' | 'Desativado' }

async function loadSyntheticProfile(email: string): Promise<SyntheticProfile | null> {
  try {
    const record = await pb
      .collection('synthetic_users')
      .getFirstListItem(`email = "${email.replaceAll('"', '\\"')}"`)
    return {
      profile: record.profile as AccessProfile,
      status: record.status as SyntheticProfile['status'],
    }
  } catch {
    return null
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<RecordModel | null>(() => {
    return (pb.authStore.record as RecordModel) || null
  })
  const [profile, setProfile] = useState<AccessProfile | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [isValid, setIsValid] = useState<boolean>(() => pb.authStore.isValid)
  const [isLoading, setIsLoading] = useState<boolean>(pb.authStore.isValid)

  const syncProfile = useCallback(async (record: RecordModel | null) => {
    if (!record?.email) {
      setProfile(null)
      setIsActive(false)
      return
    }
    const syntheticProfile = await loadSyntheticProfile(record.email as string)
    setProfile(syntheticProfile?.profile || null)
    setIsActive(syntheticProfile?.status === 'Ativo')
  }, [])

  useEffect(() => {
    let active = true
    void syncProfile(user).finally(() => {
      if (active) setIsLoading(false)
    })
    return () => {
      active = false
    }
  }, [syncProfile, user])

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, model) => {
      const nextUser = (model as RecordModel) || null
      setUser(nextUser)
      setIsValid(pb.authStore.isValid)
      setIsLoading(Boolean(nextUser))
      void syncProfile(nextUser).finally(() => setIsLoading(false))
    })
    return () => unsubscribe()
  }, [syncProfile])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const authData = await pb.collection('users').authWithPassword(email.trim(), password)
      const syntheticProfile = await loadSyntheticProfile(authData.record.email as string)
      if (!syntheticProfile || syntheticProfile.status !== 'Ativo') {
        pb.authStore.clear()
        setUser(null)
        setIsValid(false)
        setProfile(syntheticProfile?.profile || null)
        setIsActive(false)
        throw new Error('Usuário sem perfil ativo para operar o sistema.')
      }
      setUser(authData.record)
      setProfile(syntheticProfile.profile)
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
