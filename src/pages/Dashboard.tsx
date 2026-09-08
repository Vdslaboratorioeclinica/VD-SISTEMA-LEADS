import { ArrowRight, CalendarClock, Inbox, MessageCircle, Sparkles, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const cards = [
  {
    label: 'Conversas ativas',
    value: '12',
    hint: '3 aguardando humano',
    icon: MessageCircle,
    color: 'text-cyan-300',
  },
  { label: 'Novos leads', value: '8', hint: 'Hoje', icon: Users, color: 'text-violet-300' },
  {
    label: 'Follow-ups',
    value: '5',
    hint: 'Programados para hoje',
    icon: CalendarClock,
    color: 'text-amber-300',
  },
  {
    label: 'Atendidos pela IA',
    value: '74%',
    hint: 'Com transbordo seguro',
    icon: Sparkles,
    color: 'text-emerald-300',
  },
]
export default function Dashboard() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-cyan-300">Visão geral</p>
        <h1 className="mt-1 text-3xl font-bold">Bom atendimento começa com contexto.</h1>
        <p className="mt-2 text-slate-400">
          Acompanhe conversas, leads e próximas ações em um só lugar.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, hint, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{label}</span>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <strong className="mt-4 block text-3xl">{value}</strong>
            <span className="text-xs text-slate-500">{hint}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Link
          to="/conversas"
          className="group rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-transparent p-6"
        >
          <Inbox className="h-6 w-6 text-cyan-300" />
          <h2 className="mt-4 text-xl font-semibold">Caixa de conversas</h2>
          <p className="mt-2 text-sm text-slate-400">
            Atenda leads, veja o resumo da IA e assuma conversas em transbordo.
          </p>
          <span className="mt-5 flex items-center gap-2 text-sm text-cyan-300">
            Abrir conversas <ArrowRight className="h-4 w-4 group-hover:translate-x-1" />
          </span>
        </Link>
        <Link
          to="/kanban"
          className="group rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-400/10 to-transparent p-6"
        >
          <Users className="h-6 w-6 text-violet-300" />
          <h2 className="mt-4 text-xl font-semibold">Pipeline comercial</h2>
          <p className="mt-2 text-sm text-slate-400">
            Visualize cada lead e mova o atendimento para a próxima etapa.
          </p>
          <span className="mt-5 flex items-center gap-2 text-sm text-violet-300">
            Abrir Kanban <ArrowRight className="h-4 w-4 group-hover:translate-x-1" />
          </span>
        </Link>
      </div>
      <p className="text-xs text-slate-600">
        Indicadores demonstrativos até a entrada de dados reais pela Evolution.
      </p>
    </div>
  )
}
