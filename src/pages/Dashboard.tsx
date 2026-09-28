import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, CalendarClock, Clock, Loader2, MessageCircle, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PersistedLead } from '@/services/accessFixtures'
import { listSyntheticLeads } from '@/services/accessFixtures'

export default function Dashboard() {
  const [leads, setLeads] = useState<PersistedLead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setLeads(await listSyntheticLeads())
    } catch {
      setError('Não foi possível carregar os indicadores.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const activeLeads = leads.filter((lead) => lead.record_state !== 'archived')
  const newLeads = activeLeads.filter((lead) => lead.status === 'Novo')
  const waitingFirstResponse = activeLeads.filter(
    (lead) => !lead.first_response_at && !lead.contingency_mode,
  )
  const slaBlown = activeLeads.filter((lead) => lead.sla_status === 'estourado')
  const withNextAction = activeLeads.filter((lead) => Boolean(lead.next_action))

  const cards = [
    {
      label: 'Leads ativos',
      value: String(activeLeads.length),
      hint: 'Registros não arquivados',
      icon: Users,
      color: 'text-cyan-300',
    },
    {
      label: 'Novos leads',
      value: String(newLeads.length),
      hint: 'Aguardando primeiro contato',
      icon: MessageCircle,
      color: 'text-violet-300',
    },
    {
      label: 'Aguardando primeira resposta',
      value: String(waitingFirstResponse.length),
      hint: 'Fila operacional',
      icon: Clock,
      color: 'text-amber-300',
    },
    {
      label: 'SLA estourado',
      value: String(slaBlown.length),
      hint: 'Exceções que exigem ação',
      icon: CalendarClock,
      color: 'text-rose-300',
    },
  ]

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-cyan-300">Visão geral</p>
        <h1 className="mt-1 text-3xl font-bold">Bom atendimento começa com contexto.</h1>
        <p className="mt-2 text-slate-400">
          Acompanhe leads, fila de resposta e próximas ações em um só lugar.
        </p>
      </header>

      {isLoading && (
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-cyan-300" /> Carregando indicadores…
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">
          {error}
        </p>
      )}

      {!isLoading && !error && (
        <>
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
              to="/leads"
              className="group rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-transparent p-6"
            >
              <MessageCircle className="h-6 w-6 text-cyan-300" />
              <h2 className="mt-4 text-xl font-semibold">Operação de leads</h2>
              <p className="mt-2 text-sm text-slate-400">
                Todos os contatos com busca, filtros e SLA de primeira resposta.
              </p>
              <span className="mt-5 flex items-center gap-2 text-sm text-cyan-300">
                Abrir leads <ArrowRight className="h-4 w-4 group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              to="/configuracoes/whatsapp"
              className="group rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-400/10 to-transparent p-6"
            >
              <CalendarClock className="h-6 w-6 text-violet-300" />
              <h2 className="mt-4 text-xl font-semibold">Integração WhatsApp</h2>
              <p className="mt-2 text-slate-400">
                Status da instância Z-API, número de teste e política de contato da VDS.
              </p>
              <span className="mt-5 flex items-center gap-2 text-sm text-violet-300">
                Ver configuração <ArrowRight className="h-4 w-4 group-hover:translate-x-1" />
              </span>
            </Link>
          </div>

          {withNextAction.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="text-lg font-semibold">Próximas ações registradas</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {withNextAction.slice(0, 5).map((lead) => (
                  <li
                    key={lead.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 p-3"
                  >
                    <span className="text-slate-200">
                      <strong>{lead.name}</strong> · {lead.next_action}
                    </span>
                    <Link to="/leads" className="text-xs text-cyan-300 hover:underline">
                      Ver lead
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
