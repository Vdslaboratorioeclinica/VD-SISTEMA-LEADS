import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { RecordAuthResponse, RecordModel } from 'pocketbase'
import pb from '@/lib/pocketbase/client'

export interface AuthContextType {
  user: RecordModel | null
  isValid: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<RecordAuthResponse<RecordModel>>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<RecordModel | null>(() => {
    return (pb.authStore.record as RecordModel) || null
  })
  const [isValid, setIsValid] = useState<boolean>(() => pb.authStore.isValid)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    // Synchronize React state whenever pb.authStore changes
    const unsubscribe = pb.authStore.onChange((_token, model) => {
      setUser((model as RecordModel) || null)
      setIsValid(pb.authStore.isValid)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const authData = await pb.collection('users').authWithPassword(email.trim(), password)
      setUser(authData.record)
      setIsValid(true)
      return authData
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    pb.authStore.clear()
    setUser(null)
    setIsValid(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isValid, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
