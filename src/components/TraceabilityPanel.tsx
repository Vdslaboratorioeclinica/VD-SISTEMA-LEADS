import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Download, Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { listSyntheticLeads, type PersistedLead } from '@/services/accessFixtures'
import { funnelStates } from '@/data/funnelDictionary'
import { leadOrigins } from '@/data/leadDictionary'

const funnelStatusValues = funnelStates as readonly string[]

type ExceptionKind = 'sem_status_valido' | 'sem_primeira_resposta' | 'sem_proxima_acao'

const exceptionLabels: Record<ExceptionKind, string> = {
  sem_status_valido: 'Sem status válido',
  sem_primeira_resposta: 'Sem primeira resposta',
  sem_proxima_acao: 'Sem próxima ação',
}

function pct(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

function csvCell(value: string | number | undefined | null): string {
  const text = value == null ? '' : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

function MetricCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint: string
  tone: 'emerald' | 'blue' | 'purple' | 'rose'
}) {
  const toneClass =
    tone === 'emerald'
      ? 'text-[#10B981]'
      : tone === 'blue'
        ? 'text-blue-400'
        : tone === 'purple'
          ? 'text-purple-400'
          : 'text-rose-400'
  return (
    <div className="rounded-xl bg-[#111A2C] border border-[#243352] p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">{label}</p>
      <p className={`mt-2 text-2xl font-bold text-[#F1F5F9]`}>
        <span className={toneClass}>{value}</span>
      </p>
      <p className="mt-1 text-xs text-[#94A3B8] flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3 text-[#10B981]" /> {hint}
      </p>
    </div>
  )
}

export default function TraceabilityPanel() {
  const { hasPermission } = useAuth()
  const [leads, setLeads] = useState<PersistedLead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [filterOrigin, setFilterOrigin] = useState<string>('todas')
  const [filterSla, setFilterSla] = useState<string>('todos')
  const [filterException, setFilterException] = useState<ExceptionKind | 'todas'>('todas')

  useEffect(() => {
    let active = true
    listSyntheticLeads()
      .then((loaded) => {
        if (active) setLeads(loaded)
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os leads para o painel.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const total = leads.length
    const validStatus = leads.filter((lead) => funnelStatusValues.includes(lead.status)).length
    const withFirstResponse = leads.filter((lead) => Boolean(lead.first_response_at)).length
    const withNextAction = leads.filter((lead) => Boolean(lead.next_action?.trim())).length
    const exceptions: Record<ExceptionKind, PersistedLead[]> = {
      sem_status_valido: leads.filter((lead) => !funnelStatusValues.includes(lead.status)),
      sem_primeira_resposta: leads.filter((lead) => !lead.first_response_at),
      sem_proxima_acao: leads.filter((lead) => !lead.next_action?.trim()),
    }
    return { total, validStatus, withFirstResponse, withNextAction, exceptions }
  }, [leads])

  const filtered = useMemo(
    () =>
      leads.filter((lead) => {
        if (filterStatus !== 'todos' && lead.status !== filterStatus) return false
        if (filterOrigin !== 'todas' && lead.origin !== filterOrigin) return false
        if (filterSla === 'estourado' && lead.sla_status !== 'estourado') return false
        if (filterSla === 'no_prazo' && lead.sla_status !== 'atendido_no_prazo') return false
        if (filterSla === 'contingencia' && !lead.contingency_mode) return false
        if (filterException === 'sem_status_valido') {
          if (funnelStatusValues.includes(lead.status)) return false
        }
        if (filterException === 'sem_primeira_resposta' && lead.first_response_at) return false
        if (filterException === 'sem_proxima_acao' && lead.next_action?.trim()) return false
        return true
      }),
    [leads, filterStatus, filterOrigin, filterSla, filterException],
  )

  const isManager = hasPermission('audit.view')

  function handleExportCsv() {
    const header = [
      'synthetic_id',
      'nome',
      'telefone',
      'origem',
      'servico',
      'status',
      'motivo_perda',
      'responsavel',
      'primeira_resposta',
      'proxima_acao',
      'proxima_acao_em',
      'sla',
    ]
    const rows = filtered.map((lead) => [
      lead.synthetic_id,
      lead.name,
      lead.phone,
      lead.origin,
      lead.service,
      lead.status,
      lead.loss_reason || '',
      lead.responsible || '',
      lead.first_response_at || '',
      lead.next_action || '',
      lead.next_action_at || '',
      lead.sla_status || '',
    ])
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `excecoes-leads-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="space-y-6" aria-labelledby="traceability-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#10B981]">
            T1.15 · Rastreabilidade
          </p>
          <h2 id="traceability-title" className="mt-1 text-xl font-semibold text-[#F1F5F9]">
            Painel de cobertura e exceções
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[#94A3B8]">
            Identifica leads sem status válido, sem primeira resposta ou sem próxima ação
            (CA-1-016). Dados somente de fixtures sintéticas.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-300">
          <ShieldCheck className="h-3.5 w-3.5" /> Fixtures sintéticos
        </span>
      </div>

      {isLoading && (
        <div
          className="flex items-center gap-2 rounded-xl border border-[#243352] bg-[#111A2C] p-4 text-sm text-[#94A3B8]"
          role="status"
        >
          <Loader2 className="h-4 w-4 animate-spin text-[#10B981]" /> Carregando painel…
        </div>
      )}
      {error && (
        <div
          className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200"
          role="alert"
        >
          {error}
        </div>
      )}

      {!isLoading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total de leads"
              value={String(stats.total)}
              hint="Registros persistidos"
              tone="emerald"
            />
            <MetricCard
              label="Com status válido"
              value={`${stats.validStatus} (${pct(stats.validStatus, stats.total)}%)`}
              hint="CA-1-013 · CS-3 ≥95%"
              tone="emerald"
            />
            <MetricCard
              label="Com primeira resposta"
              value={`${stats.withFirstResponse} (${pct(stats.withFirstResponse, stats.total)}%)`}
              hint="Fila e SLA"
              tone="blue"
            />
            <MetricCard
              label="Com próxima ação"
              value={`${stats.withNextAction} (${pct(stats.withNextAction, stats.total)}%)`}
              hint="Follow-up rastreável"
              tone="purple"
            />
          </div>

          <div className="rounded-xl border border-[#243352] bg-[#111A2C] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-[#F1F5F9]">Filtros e exceções</h3>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  Filtra a lista abaixo; exceções destacadas (CA-1-016).
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-xs text-[#94A3B8]">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
                {stats.exceptions.sem_primeira_resposta.length} sem 1ª resposta ·{' '}
                {stats.exceptions.sem_proxima_acao.length} sem próxima ação
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-[#94A3B8]">Estado</span>
                <select
                  value={filterStatus}
                  onChange={(event) => setFilterStatus(event.target.value)}
                  className="rounded-lg border border-[#243352] bg-[#0B1120] px-3 py-2 text-sm text-[#F1F5F9]"
                >
                  <option value="todos">Todos</option>
                  {funnelStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-[#94A3B8]">Origem</span>
                <select
                  value={filterOrigin}
                  onChange={(event) => setFilterOrigin(event.target.value)}
                  className="rounded-lg border border-[#243352] bg-[#0B1120] px-3 py-2 text-sm text-[#F1F5F9]"
                >
                  <option value="todas">Todas</option>
                  {leadOrigins.map((origin) => (
                    <option key={origin} value={origin}>
                      {origin}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-[#94A3B8]">SLA</span>
                <select
                  value={filterSla}
                  onChange={(event) => setFilterSla(event.target.value)}
                  className="rounded-lg border border-[#243352] bg-[#0B1120] px-3 py-2 text-sm text-[#F1F5F9]"
                >
                  <option value="todos">Todos</option>
                  <option value="estourado">Excedido (SLA estourado)</option>
                  <option value="no_prazo">No prazo</option>
                  <option value="contingencia">Contingência</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-[#94A3B8]">Exceção</span>
                <select
                  value={filterException}
                  onChange={(event) =>
                    setFilterException(event.target.value as ExceptionKind | 'todas')
                  }
                  className="rounded-lg border border-[#243352] bg-[#0B1120] px-3 py-2 text-sm text-[#F1F5F9]"
                >
                  <option value="todas">Todas (sem exceção)</option>
                  <option value="sem_status_valido">Sem status válido</option>
                  <option value="sem_primeira_resposta">Sem primeira resposta</option>
                  <option value="sem_proxima_acao">Sem próxima ação</option>
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-xs text-[#94A3B8]">{filtered.length} lead(s) no filtro</span>
              {isManager ? (
                <Button type="button" variant="outline" onClick={handleExportCsv}>
                  <Download className="mr-1 h-3.5 w-3.5" /> Exportar CSV
                </Button>
              ) : (
                <span className="text-xs text-[#94A3B8]">Exportação restrita ao Gestor.</span>
              )}
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-[#243352] text-xs uppercase tracking-wider text-[#94A3B8]">
                  <tr>
                    <th className="px-3 py-2 font-medium">Lead</th>
                    <th className="px-3 py-2 font-medium">Origem</th>
                    <th className="px-3 py-2 font-medium">Estado</th>
                    <th className="px-3 py-2 font-medium">Responsável</th>
                    <th className="px-3 py-2 font-medium">1ª resposta</th>
                    <th className="px-3 py-2 font-medium">Próxima ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#243352]/70">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-xs text-[#94A3B8]">
                        Nenhum lead encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                  {filtered.map((lead) => {
                    const isException =
                      (filterException === 'todas' &&
                        (!lead.first_response_at || !lead.next_action?.trim())) ||
                      (filterException === 'sem_primeira_resposta' && !lead.first_response_at) ||
                      (filterException === 'sem_proxima_acao' && !lead.next_action?.trim()) ||
                      (filterException === 'sem_status_valido' &&
                        !funnelStatusValues.includes(lead.status))
                    return (
                      <tr key={lead.id} className="hover:bg-[#1A2537]/40 transition-colors">
                        <td className="px-3 py-2 text-[#F1F5F9] font-medium">
                          {lead.name}
                          <span className="ml-2 text-[11px] text-[#94A3B8]">
                            {lead.synthetic_id}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[#CBD5E1]">{lead.origin}</td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              isException && !funnelStatusValues.includes(lead.status)
                                ? 'text-rose-300'
                                : 'text-[#CBD5E1]'
                            }
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[#CBD5E1]">
                          {lead.responsible || 'Não atribuído'}
                        </td>
                        <td className="px-3 py-2 text-[#CBD5E1]">
                          {lead.first_response_at
                            ? `${Math.floor((lead.first_response_duration_seconds ?? 0) / 60)}min ${
                                (lead.first_response_duration_seconds ?? 0) % 60
                              }s`
                            : '—'}
                        </td>
                        <td className="px-3 py-2 text-[#CBD5E1]">
                          {lead.next_action ? (
                            <span className="text-[#10B981]">{lead.next_action}</span>
                          ) : (
                            <span className="text-amber-300">Sem próxima ação</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
