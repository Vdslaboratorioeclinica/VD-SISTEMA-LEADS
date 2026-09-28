import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Columns3,
  List,
  Loader2,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import LeadDetailDrawer from '@/components/LeadDetailDrawer'
import LeadsKanbanBoard from '@/components/LeadsKanbanBoard'
import { useAuth } from '@/context/AuthContext'
import { leadOrigins } from '@/data/leadDictionary'
import { funnelTransitions } from '@/data/funnelDictionary'
import type { PersistedLead } from '@/services/accessFixtures'
import { listSyntheticLeads, registerFirstResponse, searchLeads } from '@/services/accessFixtures'
import { createAuditEvent, updateLeadStatusWithAudit } from '@/services/audit'

const PAGE_SIZE = 20
const statusOptions = Array.from(new Set(funnelTransitions.flatMap((t) => [t.from, t.to])))
const serviceOptions: PersistedLead['service'][] = ['Citologia', 'Papanicolau', 'Outro']
const slaOptions = [
  { value: 'atendido_no_prazo', label: 'Atendido no prazo' },
  { value: 'estourado', label: 'Estourado' },
  { value: 'pendente_contingencia', label: 'Contingência' },
]

const selectClass =
  'rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/60'

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'Novo':
      return 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
    case 'Em atendimento':
      return 'border-blue-400/30 bg-blue-400/10 text-blue-300'
    case 'Qualificado':
      return 'border-violet-400/30 bg-violet-400/10 text-violet-300'
    case 'Tentando agendar':
      return 'border-amber-400/30 bg-amber-400/10 text-amber-300'
    case 'Convertido':
      return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
    case 'Perdido':
      return 'border-rose-400/30 bg-rose-400/10 text-rose-300'
    default:
      return 'border-slate-400/30 bg-slate-400/10 text-slate-300'
  }
}

function slaBadgeClass(sla: string | undefined): string {
  switch (sla) {
    case 'atendido_no_prazo':
      return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
    case 'estourado':
      return 'border-rose-400/30 bg-rose-400/10 text-rose-300'
    case 'pendente_contingencia':
      return 'border-amber-400/30 bg-amber-400/10 text-amber-300'
    default:
      return 'border-slate-500/30 bg-slate-500/10 text-slate-400'
  }
}

function slaBadgeLabel(sla: string | undefined): string {
  switch (sla) {
    case 'atendido_no_prazo':
      return 'No prazo'
    case 'estourado':
      return 'Estourado'
    case 'pendente_contingencia':
      return 'Contingência'
    default:
      return '—'
  }
}

export default function LeadsPage() {
  const { user, profile, hasPermission } = useAuth()
  const [leads, setLeads] = useState<PersistedLead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [originFilter, setOriginFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [slaFilter, setSlaFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>(() =>
    (localStorage.getItem('vds_leads_view') as 'list' | 'kanban') || 'list',
  )
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function switchView(mode: 'list' | 'kanban') {
    setViewMode(mode)
    localStorage.setItem('vds_leads_view', mode)
  }

  useEffect(() => {
>>>>>>>
    const timer = setTimeout(() => setSearchTerm(searchInput.trim()), 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const loadLeads = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = searchTerm ? await searchLeads(searchTerm) : await listSyntheticLeads()
      setLeads(result)
    } catch {
      setError('Não foi possível carregar os leads.')
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm])

  useEffect(() => {
    void loadLeads()
  }, [loadLeads])

  const filtered = useMemo(
    () =>
      leads.filter(
        (lead) =>
          (statusFilter === 'all' || lead.status === statusFilter) &&
          (originFilter === 'all' || lead.origin === originFilter) &&
          (serviceFilter === 'all' || lead.service === serviceFilter) &&
          (slaFilter === 'all' || (lead.sla_status || '') === slaFilter),
      ),
    [leads, statusFilter, originFilter, serviceFilter, slaFilter],
  )

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const paged = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) || null,
    [leads, selectedLeadId],
  )
  const hasActiveFilters =
    searchTerm !== '' ||
    statusFilter !== 'all' ||
    originFilter !== 'all' ||
    serviceFilter !== 'all' ||
    slaFilter !== 'all'

  async function handleStatusChange(
    lead: PersistedLead,
    newStatus: string,
    lossReason?: string,
  ): Promise<void> {
    if (!user || !profile) return
    setIsSaving(true)
    setError(null)
    setNotice(null)
    try {
      await updateLeadStatusWithAudit({
        leadId: lead.id,
        previousStatus: lead.status,
        newStatus,
        lossReason,
        actorId: user.id,
        actorEmail: user.email as string,
        actorProfile: profile,
      })
      setLeads((current) =>
        current.map((item) =>
          item.id === lead.id
            ? {
                ...item,
                status: newStatus,
                loss_reason:
                  newStatus === 'Perdido' ? lossReason || item.loss_reason : item.loss_reason,
              }
            : item,
        ),
      )
      setNotice(`Alteração auditada: ${lead.status} → ${newStatus}.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível atualizar o status.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleFirstResponse(lead: PersistedLead): Promise<void> {
    if (!user || !profile) return
    setIsSaving(true)
    setError(null)
    setNotice(null)
    try {
      const updated = await registerFirstResponse(lead)
      setLeads((current) => current.map((item) => (item.id === lead.id ? updated : item)))
      await createAuditEvent({
        actorId: user.id,
        actorEmail: user.email as string,
        actorProfile: profile,
        action: 'lead.contact_changed',
        entity: 'lead',
        entityId: lead.id,
        previousValue: 'sem primeira resposta',
        newValue: `${updated.first_response_duration_seconds}s`,
        result: 'success',
      })
      setNotice(`Primeira resposta registrada em ${updated.first_response_duration_seconds}s.`)
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Não foi possível registrar a primeira resposta.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  function clearFilters() {
    setSearchInput('')
    setStatusFilter('all')
    setOriginFilter('all')
    setServiceFilter('all')
    setSlaFilter('all')
    setPage(0)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Operação</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
          <Users className="h-6 w-6 text-cyan-300" /> Leads
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Todos os contatos capturados, com busca, filtros por etapa e SLA de primeira resposta.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200"
        >
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200"
        >
          {notice}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {filtered.length} lead{filtered.length === 1 ? '' : 's'} com os filtros atuais
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
          <button
            type="button"
            onClick={() => switchView('list')}
            aria-pressed={viewMode === 'list'}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${viewMode === 'list' ? 'bg-cyan-400/10 text-cyan-300' : 'text-slate-400 hover:text-white'}`}
          >
            <List className="h-3.5 w-3.5" /> Lista
          </button>
          <button
            type="button"
            onClick={() => switchView('kanban')}
            aria-pressed={viewMode === 'kanban'}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${viewMode === 'kanban' ? 'bg-cyan-400/10 text-cyan-300' : 'text-slate-400 hover:text-white'}`}
          >
            <Columns3 className="h-3.5 w-3.5" /> Kanban
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 xl:flex-row xl:items-center">
        <div className="relative flex-1">
>>>>>>>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value)
              setPage(0)
            }}
            placeholder="Buscar por nome, telefone ou e-mail…"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-400/60"
          />
        </div>
        <select
          aria-label="Filtrar por status"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value)
            setPage(0)
          }}
          className={selectClass}
        >
          <option value="all">Todos os status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrar por origem"
          value={originFilter}
          onChange={(event) => {
            setOriginFilter(event.target.value)
            setPage(0)
          }}
          className={selectClass}
        >
          <option value="all">Todas as origens</option>
          {leadOrigins.map((origin) => (
            <option key={origin} value={origin}>
              {origin}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrar por serviço"
          value={serviceFilter}
          onChange={(event) => {
            setServiceFilter(event.target.value)
            setPage(0)
          }}
          className={selectClass}
        >
          <option value="all">Todos os serviços</option>
          {serviceOptions.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrar por SLA"
          value={slaFilter}
          onChange={(event) => {
            setSlaFilter(event.target.value)
            setPage(0)
          }}
          className={selectClass}
        >
          <option value="all">Todos os SLA</option>
          {slaOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hasActiveFilters && (
          <Button type="button" variant="outline" onClick={clearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>

      {viewMode === 'kanban' && (
        <LeadsKanbanBoard
          leads={filtered}
          onStatusChange={handleStatusChange}
          onOpenLead={(leadId) => setSelectedLeadId(leadId)}
          isSaving={isSaving}
          canUpdate={hasPermission('leads.update')}
        />
      )}

      {viewMode === 'list' && (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="overflow-x-auto">
>>>>>>>
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Origem</th>
                <th className="px-4 py-3 font-medium">Serviço</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">SLA</th>
                <th className="px-4 py-3 font-medium">Responsável</th>
                <th className="px-4 py-3 font-medium">Entrada</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {isLoading && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-400">
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-cyan-300" />
                    Carregando leads…
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-400">
                    Nenhum lead encontrado com os filtros atuais.
                    {searchTerm.includes('@') && (
                      <span className="mt-1 block text-xs text-slate-500">
                        Busca por e-mail: verifique se o lead tem e-mail cadastrado — o campo é
                        opcional no cadastro e muitos leads só têm telefone.
                      </span>
                    )}
                  </td>
                </tr>
              )}
              {!isLoading &&
                paged.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <span className="block font-medium text-slate-100">{lead.name}</span>
                      {lead.email ? (
                        <span className="block text-xs text-slate-500">{lead.email}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{lead.phone}</td>
                    <td className="px-4 py-3 text-slate-300">{lead.origin}</td>
                    <td className="px-4 py-3 text-slate-300">{lead.service}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClass(lead.status)}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${slaBadgeClass(lead.sla_status)}`}
                      >
                        {slaBadgeLabel(lead.sla_status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{lead.responsible || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {lead.intake_at ? new Date(lead.intake_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedLeadId(lead.id)}
                      >
                        Detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 px-4 py-3 text-xs text-slate-400">
          <span>
            {filtered.length === 0
              ? 'Nenhum lead'
              : `${safePage * PAGE_SIZE + 1}–${Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} de ${filtered.length} leads`}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>
            <span>
              Página {safePage + 1} de {pageCount}
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(safePage + 1)}
            >
              Próxima <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      )}

      <LeadDetailDrawer
        lead={selectedLead}
>>>>>>>
        onClose={() => setSelectedLeadId(null)}
        onStatusChange={handleStatusChange}
        onFirstResponse={handleFirstResponse}
        isSaving={isSaving}
        canUpdate={hasPermission('leads.update')}
      />
    </div>
  )
}
