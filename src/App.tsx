import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import AppShell from '@/components/AppShell'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/RouteGuards'
import { AuthProvider } from '@/context/AuthContext'
import AdminPage from '@/pages/AdminPage'
import ContactsPage from '@/pages/ContactsPage'
import ConversationsPage from '@/pages/ConversationsPage'
import Dashboard from '@/pages/Dashboard'
import FollowUpsPage from '@/pages/FollowUpsPage'
import Index from '@/pages/Index'
import KanbanPage from '@/pages/KanbanPage'
import NotFound from '@/pages/NotFound'
import ReportsPage from '@/pages/ReportsPage'

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
    if (this.state.hasError)
      return (
        <main className="grid min-h-screen place-items-center bg-[#08111f] p-6 text-slate-100">
          <section className="max-w-lg rounded-2xl border border-rose-400/30 bg-slate-900 p-6">
            <h1 className="text-xl font-semibold">Não foi possível carregar o sistema</h1>
            <p className="mt-2 text-sm text-slate-400">
              Atualize a página. Se persistir, informe o horário.
            </p>
            <p className="mt-3 rounded-lg bg-slate-950 p-3 text-xs text-rose-200">
              {this.state.message}
            </p>
            <button
              className="mt-4 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950"
              onClick={() => window.location.reload()}
            >
              Recarregar
            </button>
          </section>
        </main>
      )
    return this.props.children
  }
}
const shell = (
  <ProtectedRoute>
    <AppShell />
  </ProtectedRoute>
)
const App = () => (
  <AppErrorBoundary>
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
            <Route element={shell}>
              <Route index element={<Dashboard />} />
              <Route path="conversas" element={<ConversationsPage />} />
              <Route path="kanban" element={<KanbanPage />} />
              <Route path="follow-ups" element={<FollowUpsPage />} />
              <Route path="contatos" element={<ContactsPage />} />
              <Route path="relatorios" element={<ReportsPage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="leads" element={<Navigate to="/kanban" replace />} />
              <Route path="rastreabilidade" element={<Navigate to="/relatorios" replace />} />
              <Route path="funil" element={<Navigate to="/kanban" replace />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </AppErrorBoundary>
)
export default App
