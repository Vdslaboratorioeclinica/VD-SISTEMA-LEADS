import { useMemo, useState } from 'react'
import { AlertTriangle, GripVertical, Loader2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { funnelStates, funnelTransitions, type FunnelState } from '@/data/funnelDictionary'
import type { PersistedLead } from '@/services/accessFixtures'
import { lossReasonOptions } from '@/services/audit'

type Props = {
  leads: PersistedLead[]
  onStatusChange: (lead: PersistedLead, newStatus: string, lossReason?: string) => Promise<void>
  onOpenLead: (leadId: string) => void
  isSaving: boolean
  canUpdate: boolean
}

const columnColors: Record<FunnelState, string> = {
  Novo: 'border-t-cyan-400',
  'Em atendimento': 'border-t-blue-400',
  Qualificado: 'border-t-violet-400',
  'Tentando agendar': 'border-t-amber-400',
  Convertido: 'border-t-emerald-400',
  Perdido: 'border-t-rose-400',
}

function allowedTransitions(from: string): string[] {
  return funnelTransitions.filter((t) => t.from === from).map((t) => t.to)
}

export default function LeadsKanbanBoard({
  leads,
  onStatusChange,
  onOpenLead,
  isSaving,
  canUpdate,
}: Props) {
  const { profile } = useAuth()
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null)
  const [hoverColumn, setHoverColumn] = useState<string | null>(null)
  const [pendingLossLead, setPendingLossLead] = useState<PersistedLead | null>(null)
  const [lossReason, setLossReason] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  const byStatus = useMemo(() => {
    const map: Record<string, PersistedLead[]> = {}
    funnelStates.forEach((status) => {
      map[status] = []
    })
    leads.forEach((lead) => {
      if (!map[lead.status]) map[lead.status] = []
      map[lead.status].push(lead)
    })
    return map
  }, [leads])

  function handleDrop(status: FunnelState) {
    const lead = leads.find((item) => item.id === draggingLeadId)
    setDraggingLeadId(null)
    setHoverColumn(null)
    if (!lead) return
    if (lead.status === status) return
    const allowed = allowedTransitions(lead.status)
    if (!allowed.includes(status)) {
      setNotice(
        `Transição inválida: ${lead.status} → ${status}. Consulte as transições permitidas do funil.`,
      )
      return
    }
    if (status === 'Perdido') {
      setPendingLossLead(lead)
      setLossReason('')
      return
    }
    void onStatusChange(lead, status)
  }

  return (
    <div className="space-y-4">
      {notice && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs text-amber-300 underline-offset-2 hover:underline"
          >
            fechar
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {funnelStates.map((status) => {
          const items = byStatus[status] || []
          const isDropTarget = hoverColumn === status
          return (
            <section
              key={status}
              aria-label={`Coluna ${status}`}
              onDragOver={(event) => {
                event.preventDefault()
                setHoverColumn(status)
              }}
              onDragLeave={() => setHoverColumn(null)}
              onDrop={(event) => {
                event.preventDefault()
                handleDrop(status)
              }}
              className={`flex min-h-[220px] flex-col rounded-xl border border-slate-800 bg-slate-900/60 border-t-4 ${columnColors[status]} ${isDropTarget ? 'ring-2 ring-cyan-400/60' : ''}`}
            >
              <header className="flex items-center justify-between gap-2 px-3 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {status}
                </span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                  {items.length}
                </span>
              </header>
              <div className="flex-1 space-y-2 p-2 pt-0">
                {items.length === 0 && (
                  <p className="px-1 py-4 text-center text-[11px] text-slate-600">
                    Arraste um lead para cá
                  </p>
                )}
                {items.map((lead) => {
                  const canDrag = canUpdate && allowedTransitions(lead.status).length > 0
                  return (
                    <article
                      key={lead.id}
                      draggable={canDrag}
                      onDragStart={() => setDraggingLeadId(lead.id)}
                      onDragEnd={() => {
                        setDraggingLeadId(null)
                        setHoverColumn(null)
                      }}
                      onClick={() => onOpenLead(lead.id)}
                      className={`group cursor-pointer rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-xs transition hover:border-cyan-400/40 ${draggingLeadId === lead.id ? 'opacity-40' : ''} ${!canDrag ? 'cursor-not-allowed opacity-70' : ''}`}
                      title={
                        canDrag
                          ? 'Arraste para a próxima etapa ou clique para abrir os detalhes'
                          : 'Etapa final — clique para abrir os detalhes'
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <strong className="block leading-snug text-slate-100">{lead.name}</strong>
                        {canDrag && (
                          <GripVertical className="h-3.5 w-3.5 shrink-0 text-slate-600 group-hover:text-slate-400" />
                        )}
                      </div>
                      <p className="mt-1 text-slate-400">{lead.phone}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                          {lead.service}
                        </span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                          {lead.origin}
                        </span>
                        {lead.sla_status === 'estourado' && (
                          <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300">
                            SLA estourado
                          </span>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {pendingLossLead && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setPendingLossLead(null)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-rose-400/30 bg-[#0d1727] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Confirmar perda</h3>
            <p className="mt-1 text-sm text-slate-400">
              Motivo obrigatório para mover{' '}
              <strong className="text-slate-200">{pendingLossLead.name}</strong> para Perdido.
            </p>
            <select
              aria-label="Motivo de perda"
              value={lossReason}
              onChange={(event) => setLossReason(event.target.value)}
              className="mt-4 w-full rounded-lg border border-rose-400/40 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-rose-400/60"
            >
              <option value="">Selecione o motivo…</option>
              {lossReasonOptions().map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingLossLead(null)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={isSaving || !lossReason}
                onClick={() => {
                  const lead = pendingLossLead
                  setPendingLossLead(null)
                  void onStatusChange(lead, 'Perdido', lossReason)
                }}
                className="bg-rose-500 text-white hover:bg-rose-400"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirmar perda
              </Button>
            </div>
          </div>
        </div>
      )}

      {profile === 'Gestor' && (
        <p className="text-xs text-slate-500">
          <Users className="mr-1 inline h-3.5 w-3.5" /> Movimentações entre colunas são auditadas
          com autor, horário e valores anterior/novo.
        </p>
      )}
    </div>
  )
}
