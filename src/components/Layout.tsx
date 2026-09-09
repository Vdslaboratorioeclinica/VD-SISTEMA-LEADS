import { Link, NavLink, Outlet } from 'react-router-dom'
import { BarChart3, GitBranch, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const links = [
  { to: '/leads', label: 'Operação de leads', icon: ShieldCheck },
  { to: '/rastreabilidade', label: 'Rastreabilidade', icon: BarChart3 },
  { to: '/funil', label: 'Dicionário do funil', icon: GitBranch },
]

export default function LayoutShell() {
  const { user, profile, logout } = useAuth()
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F1F5F9]">
      <header className="border-b border-[#243352] bg-[#111A2C]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/leads" className="font-semibold tracking-tight">
            VDS · Gestão de Leads
          </Link>
          <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
            <span>
              {(user?.name as string) || (user?.email as string)} · {profile}
            </span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1 rounded-lg border border-[#243352] px-3 py-2 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </div>
      </header>
      <nav className="border-b border-[#243352] bg-[#0B1120]">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-[#10B981]/15 text-[#10B981]' : 'text-[#94A3B8] hover:bg-[#111A2C] hover:text-white'}`
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
