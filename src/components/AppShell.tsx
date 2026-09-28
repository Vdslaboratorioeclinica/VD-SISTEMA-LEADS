import {
  BarChart3,
  CalendarClock,
  GitBranch,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

type NavItem = {
  to: string
  label: string
  icon: typeof Inbox
  end?: boolean
  managerOnly?: boolean
}

const operationNav: NavItem[] = [
  { to: '/leads', label: 'Leads', icon: Users, end: true },
  { to: '/conversas', label: 'Conversas', icon: MessageCircle },
]

const managementNav: NavItem[] = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/follow-ups', label: 'Follow-ups', icon: CalendarClock },
]

const settingsNav: NavItem[] = [
  { to: '/configuracoes/operacao', label: 'Operação de leads', icon: ShieldCheck },
  { to: '/configuracoes/rastreabilidade', label: 'Rastreabilidade', icon: BarChart3 },
  { to: '/configuracoes/funil', label: 'Dicionário do funil', icon: GitBranch },
  { to: '/configuracoes/whatsapp', label: 'Integração WhatsApp', icon: Inbox },
  { to: '/admin', label: 'Administração', icon: Settings, managerOnly: true },
]

function NavSection({
  title,
  items,
  profile,
}: {
  title: string
  items: NavItem[]
  profile: string | null
}) {
  return (
    <div className="md:space-y-1">
      <p className="hidden px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 md:block">
        {title}
      </p>
      {items
        .filter((item) => !item.managerOnly || profile === 'Gestor')
        .map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive ? 'bg-cyan-400/10 text-cyan-300' : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'}`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
    </div>
  )
}

export default function AppShell() {
  const { user, profile, logout } = useAuth()
  return (
    <div className="min-h-screen bg-[#08111f] text-slate-100 md:flex">
      <aside className="border-b border-slate-800 bg-[#0d1727] md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-5">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
              <Stethoscope className="h-5 w-5 text-white" />
            </span>
            <span>
              <strong className="block text-sm">VDS Atendimento</strong>
              <small className="text-slate-400">CRM conversacional</small>
            </span>
          </NavLink>
          <button
            onClick={logout}
            className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300 md:hidden"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1">
          <NavSection title="Operação" items={operationNav} profile={profile} />
          <NavSection title="Gestão" items={managementNav} profile={profile} />
          <NavSection title="Configurações" items={settingsNav} profile={profile} />
        </nav>
        <div className="mt-auto hidden border-t border-slate-800 p-4 md:block md:absolute md:bottom-0 md:w-full">
          <div className="mb-3 truncate text-xs text-slate-400">
            <strong className="block text-slate-200">
              {(user?.name as string) || (user?.email as string)}
            </strong>
            {profile}
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
