/* Main App Component - Handles routing (using react-router-dom) with AuthProvider and RouteGuards */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            {/* Protected dashboard at / */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Login screen accessible at /login, and as Index unauthenticated */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Index />
                </PublicOnlyRoute>
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
