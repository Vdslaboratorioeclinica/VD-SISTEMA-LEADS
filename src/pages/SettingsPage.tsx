import { GitBranch, BarChart3, ShieldCheck, Inbox } from 'lucide-react'
import { Navigate, NavLink } from 'react-router-dom'
import AccessControlPanel from '@/components/AccessControlPanel'
import TraceabilityPanel from '@/components/TraceabilityPanel'
import FunnelDictionaryPanel from '@/components/FunnelDictionaryPanel'
import WhatsAppConfigPanel from '@/components/WhatsAppConfigPanel'

export type SettingsSection = 'operacao' | 'rastreabilidade' | 'funil' | 'whatsapp'

const sections: { key: SettingsSection; to: string; label: string; icon: typeof ShieldCheck }[] = [
  { key: 'operacao', to: '/configuracoes/operacao', label: 'Operação de leads', icon: ShieldCheck },
  {
    key: 'rastreabilidade',
    to: '/configuracoes/rastreabilidade',
    label: 'Rastreabilidade',
    icon: BarChart3,
  },
  { key: 'funil', to: '/configuracoes/funil', label: 'Dicionário do funil', icon: GitBranch },
  { key: 'whatsapp', to: '/configuracoes/whatsapp', label: 'Integração WhatsApp', icon: Inbox },
]

export default function SettingsPage({ section }: { section: SettingsSection }) {
  const isValid = sections.some((item) => item.key === section)
  if (!isValid) return <Navigate to="/configuracoes/operacao" replace />

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
          Configurações
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">
          {sections.find((s) => s.key === section)?.label}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Parâmetros operacionais, rastreabilidade, dicionário do funil e integração WhatsApp.
        </p>
      </header>
      <nav className="flex gap-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 p-2">
        {sections.map(({ key, to, label, icon: Icon }) => (
          <NavLink
            key={key}
            to={to}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-cyan-400/10 text-cyan-300' : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'}`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      {section === 'operacao' && <AccessControlPanel />}
      {section === 'rastreabilidade' && <TraceabilityPanel />}
      {section === 'funil' && <FunnelDictionaryPanel />}
      {section === 'whatsapp' && <WhatsAppConfigPanel />}
    </div>
  )
}
