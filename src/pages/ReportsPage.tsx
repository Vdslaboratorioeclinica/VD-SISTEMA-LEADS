import { BarChart3, Clock3, Target, Users } from 'lucide-react'
export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-emerald-300">Gestão</p>
        <h1 className="mt-1 text-3xl font-bold">Relatórios</h1>
        <p className="mt-2 text-slate-400">
          Indicadores do funil e do atendimento. O baseline real começa após conectar a Evolution.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <Clock3 className="h-5 w-5 text-cyan-300" />
          <strong className="mt-4 block text-3xl">—</strong>
          <p className="text-sm text-slate-500">Tempo médio de 1ª resposta</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <Target className="h-5 w-5 text-emerald-300" />
          <strong className="mt-4 block text-3xl">—</strong>
          <p className="text-sm text-slate-500">Conversão em agendamento</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <Users className="h-5 w-5 text-violet-300" />
          <strong className="mt-4 block text-3xl">—</strong>
          <p className="text-sm text-slate-500">Leads rastreáveis</p>
        </div>
      </div>
      <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center">
        <div>
          <BarChart3 className="mx-auto h-10 w-10 text-slate-700" />
          <p className="mt-3 text-slate-300">Aguardando dados reais</p>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Os gráficos serão calculados a partir das conversas recebidas e movimentações do Kanban.
          </p>
        </div>
      </div>
    </div>
  )
}
