/* Main App Component - Handles routing (using react-router-dom) with AuthProvider and RouteGuards */
import React from 'react'
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

class AppErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error) {
    console.error('Erro ao renderizar o sistema:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#0B1120] p-6 text-[#F1F5F9]">
          <section
            className="max-w-lg rounded-xl border border-rose-400/30 bg-[#111A2C] p-6"
            role="alert"
          >
            <h1 className="text-xl font-semibold">Não foi possível carregar o sistema</h1>
            <p className="mt-2 text-sm text-[#CBD5E1]">
              Atualize a página. Se o problema persistir, informe o horário e a etapa em que
              ocorreu.
            </p>
            {this.state.message && (
              <p className="mt-3 rounded-lg bg-[#0B1120] p-3 text-xs text-rose-200" role="status">
                Detalhe técnico: {this.state.message}
              </p>
            )}
            <button
              type="button"
              className="mt-4 rounded-lg bg-[#10B981] px-4 py-2 text-sm font-medium text-[#06251A]"
              onClick={() => window.location.reload()}
            >
              Recarregar
            </button>
          </section>
        </main>
      )
    }
    return this.props.children
  }
}

const App = () => (
  <AppErrorBoundary>
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
  </AppErrorBoundary>
)

export default App
