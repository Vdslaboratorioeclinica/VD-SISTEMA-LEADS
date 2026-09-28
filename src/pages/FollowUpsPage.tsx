import { CalendarClock } from 'lucide-react'

export default function FollowUpsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
          Gestão
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
          <CalendarClock className="h-6 w-6 text-cyan-300" /> Follow-ups
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Próximas ações programadas por lead, com prazos e responsáveis.
        </p>
      </header>
      <div className="grid place-items-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center">
        <CalendarClock className="h-12 w-12 text-slate-600" />
        <h2 className="mt-4 text-lg font-semibold text-slate-200">Em construção</h2>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          A fila de follow-ups (D+3 e próximas ações) entra na sequência do plano de evolução,
          depois da página de conversas. Os campos <code>next_action</code> e{' '}
          <code>next_action_at</code> já existem na coleção leads.
        </p>
      </div>
    </div>
  )
}
