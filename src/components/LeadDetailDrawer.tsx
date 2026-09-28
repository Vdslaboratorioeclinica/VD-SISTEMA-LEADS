import { useState } from 'react'
import { Clock, MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import type { PersistedLead } from '@/services/accessFixtures'
import { isFinalStatus, lossReasonOptions, nextAllowedStatuses } from '@/services/audit'

type Props = {
  lead: PersistedLead | null
  onClose: () => void
  onStatusChange: (lead: PersistedLead, newStatus: string, lossReason?: string) => Promise<void>
  onFirstResponse: (lead: PersistedLead) => Promise<void>
  isSaving: boolean
  canUpdate: boolean
}

export default function LeadDetailDrawer({
  lead,
  onClose,
  onStatusChange,
  onFirstResponse,
  isSaving,
  canUpdate,
}: Props) {
  const { profile } = useAuth()
  const [lossReason, setLossReason] = useState('')
  const [pendingLoss, setPendingLoss] = useState(false)

  if (!lead) return null

  const allowed = nextAllowedStatuses(lead.status)
  const isLoss = lead.status === 'Perdido'

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Fechar detalhes"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-slate-800 bg-[#0d1727] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Lead</p>
            <h2 className="mt-1 text-xl font-bold text-white">{lead.name}</h2>
            <p className="mt-1 text-xs text-slate-500">
              {lead.synthetic_id} · {lead.origin} · {lead.service}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Telefone</dt>
            <dd className="text-slate-200">{lead.phone}</dd>
          </div>
          {lead.email && (
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">E-mail</dt>
              <dd className="text-slate-200">{lead.email}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Necessidade</dt>
            <dd className="max-w-[60%] text-right text-slade-200 text-slate-200">{lead.need}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Responsável</dt>
            <dd className="text-slate-200">{lead.responsible || 'Não atribuído'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Status</dt>
            <dd className="text-slate-200">{lead.status}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">SLA primeira resposta</dt>
            <dd className="text-slate-200">
              {lead.first_response_at
                ? `${Math.floor((lead.first_response_duration_seconds ?? 0) / 60)}min ${(lead.first_response_duration_seconds ?? 0) % 60}s`
                : 'Pendente'}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Entrada</dt>
            <dd className="text-slate-200">
              {lead.intake_at ? new Date(lead.intake_at).toLocaleString('pt-BR') : '—'}
            </dd>
          </div>
          {lead.next_action && (
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Próxima ação</dt>
              <dd className="max-w-[60%] text-right text-slate-200">{lead.next_action}</dd>
            </div>
          )}
        </dl>

        {isLoss && lead.loss_reason && (
          <div className="mt-4 rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200">
            Motivo de perda: {lead.loss_reason}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {!isFinalStatus(lead.status) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Mover para próxima etapa
              </p>
              <div className="flex flex-wrap gap-2">
                {allowed.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant="outline"
                    disabled={isSaving || !canUpdate}
                    onClick={() => {
                      if (status === 'Perdido') {
                        setPendingLoss(true)
                      } else {
                        setPendingLoss(false)
                        void onStatusChange(lead, status)
                      }
                    }}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {pendingLoss && (
            <div className="rounded-lg border border-rose-400/30 bg-rose-400/10 p-3">
              <label htmlFor="loss-reason" className="mb-2 block text-xs text-rose-200">
                Motivo de perda (obrigatório)
              </label>
              <select
                id="loss-reason"
                value={lossReason}
                onChange={(event) => setLossReason(event.target.value)}
                className="w-full rounded-lg border border-rose-400/40 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              >
                <option value="">Selecione o motivo…</option>
                {lossReasonOptions().map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full"
                disabled={isSaving || !lossReason || !canUpdate}
                onClick={() => {
                  setPendingLoss(false)
                  void onStatusChange(lead, 'Perdido', lossReason)
                }}
              >
                Confirmar perda
              </Button>
            </div>
          )}
          {!lead.first_response_at && !lead.contingency_mode && (
            <Button
              type="button"
              className="w-full"
              disabled={isSaving || !canUpdate}
              onClick={() => void onFirstResponse(lead)}
            >
              <Clock className="mr-2 h-4 w-4" /> Registrar primeira resposta
            </Button>
          )}
          <Button type="button" variant="secondary" className="w-full" disabled>
            <MessageCircle className="mr-2 h-4 w-4" /> Abrir conversa (Sprint 5)
          </Button>
        </div>

        {profile === 'Gestor' && (
          <p className="mt-6 text-xs text-slate-500">
            Alterações de status são auditadas com autor, horário e valores anterior/novo.
          </p>
        )}
      </div>
    </div>
  )
}
