import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import AppShell from '@/components/AppShell'
import { ManagerRoute, ProtectedRoute, PublicOnlyRoute } from '@/components/RouteGuards'
import { AuthProvider } from '@/context/AuthContext'
import Index from '@/pages/Index'
import Dashboard from '@/pages/Dashboard'
import LeadsPage from '@/pages/LeadsPage'
import ConversationsPage from '@/pages/ConversationsPage'
import SettingsPage from '@/pages/SettingsPage'
import FollowUpsPage from '@/pages/FollowUpsPage'
import AdminPage from '@/pages/AdminPage'
import NotFound from '@/pages/NotFound'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Index />
              </PublicOnlyRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="conversas" element={<ConversationsPage />} />
            <Route path="follow-ups" element={<FollowUpsPage />} />
            <Route
              path="admin"
              element={
                <ManagerRoute>
                  <AdminPage />
                </ManagerRoute>
              }
            />
            <Route
              path="configuracoes"
              element={<Navigate to="/configuracoes/operacao" replace />}
            />
            <Route path="configuracoes/operacao" element={<SettingsPage section="operacao" />} />
            <Route
              path="configuracoes/rastreabilidade"
              element={<SettingsPage section="rastreabilidade" />}
            />
            <Route path="configuracoes/funil" element={<SettingsPage section="funil" />} />
            <Route path="configuracoes/whatsapp" element={<SettingsPage section="whatsapp" />} />
            {/* Redirects de rotas antigas */}
            <Route
              path="rastreabilidade"
              element={<Navigate to="/configuracoes/rastreabilidade" replace />}
            />
            <Route path="funil" element={<Navigate to="/configuracoes/funil" replace />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
