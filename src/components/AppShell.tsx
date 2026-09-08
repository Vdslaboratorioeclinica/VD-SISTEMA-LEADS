import { BarChart3, Crosshair, GitBranch, LayoutDashboard, LogOut, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const navigation = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/leads', label: 'Operação de leads', icon: Users, end: false },
  { to: '/rastreabilidade', label: 'Rastreabilidade', icon: BarChart3, end: false },
  { to: '/funil', label: 'Funil', icon: GitBranch, end: false },
]

export default function AppShell() {
  const { user, profile, logout } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-[#0B1120] text-[#F1F5F9]">
      <header className="sticky top-0 z-30 border-b border-[#243352] bg-[#111A2C]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Crosshair className="h-5 w-5 text-white" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-bold text-white">
                Gestão de Atendimento VDS
              </span>
              <span className="block text-xs text-[#94A3B8]">Central de conversão de leads</span>
            </span>
          </NavLink>

          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <span className="block text-sm font-semibold text-[#F1F5F9]">
                {(user?.name as string) || (user?.email as string) || 'Usuário'}
              </span>
              <span className="block text-xs text-[#94A3B8]">{profile || 'Perfil'}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-[#243352] bg-[#1A2537] px-3 py-2 text-xs font-medium text-[#94A3B8] transition-colors hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-300"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        <nav
          aria-label="Navegação principal"
          className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6"
        >
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-[#10B981] text-[#A7F3D0]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  )
}
