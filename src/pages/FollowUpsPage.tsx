import { useEffect, useState } from 'react'
import { CalendarClock, CheckCircle2, Clock3 } from 'lucide-react'
import { listFollowUps, type FollowUp } from '@/services/crm'
export default function FollowUpsPage() {
  const [items, setItems] = useState<FollowUp[]>([])
  useEffect(() => {
    listFollowUps().then(setItems)
  }, [])
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-amber-300">Próximas ações</p>
        <h1 className="mt-1 text-3xl font-bold">Follow-ups</h1>
        <p className="mt-2 text-slate-400">
          Mensagens programadas para retomar leads sem resposta. Regra padrão: 3 dias.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <Clock3 className="h-5 w-5 text-amber-300" />
          <strong className="mt-3 block text-2xl">
            {items.filter((x) => x.status === 'agendado').length}
          </strong>
          <span className="text-sm text-slate-500">Agendados</span>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          <strong className="mt-3 block text-2xl">
            {items.filter((x) => x.status === 'enviado').length}
          </strong>
          <span className="text-sm text-slate-500">Enviados</span>
        </div>
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        {items.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarClock className="mx-auto h-9 w-9 text-slate-700" />
            <p className="mt-3 text-slate-300">Nenhum follow-up programado</p>
            <p className="mt-1 text-sm text-slate-500">
              Eles aparecerão aqui quando um lead entrar na regra configurada.
            </p>
          </div>
        ) : (
          items.map((x) => (
            <div
              key={x.id}
              className="flex items-center justify-between border-b border-slate-800 p-4"
            >
              <div>
                <strong className="text-sm">{x.expand?.lead?.name || 'Lead'}</strong>
                <p className="text-xs text-slate-500">{x.rule_name}</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-amber-300">
                  {new Date(x.scheduled_at).toLocaleString('pt-BR')}
                </span>
                <p className="text-xs text-slate-500">{x.status}</p>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
