import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from '@/components/Layout'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/RouteGuards'
import { AuthProvider } from '@/context/AuthContext'
import Index from '@/pages/Index'
import LeadsPage from '@/pages/LeadsPage'
import TraceabilityPage from '@/pages/TraceabilityPage'
import FunnelPage from '@/pages/FunnelPage'
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
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/leads" replace />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="rastreabilidade" element={<TraceabilityPage />} />
            <Route path="funil" element={<FunnelPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
