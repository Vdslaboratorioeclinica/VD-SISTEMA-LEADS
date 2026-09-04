import { useEffect, useState } from 'react'
import { Check, Loader2, ShieldAlert, ShieldCheck, UserRound, UsersRound } from 'lucide-react'
import { permissionDefinitions, permissionMatrix } from '@/data/accessControl'
import { useAuth } from '@/context/AuthContext'
import {
  listSyntheticLeads,
  listSyntheticUsers,
  type PersistedLead,
  type PersistedUser,
} from '@/services/accessFixtures'
import {
  createAuditEvent,
  listAuditEvents,
  registerDeniedPermission,
  updateLeadStatusWithAudit,
  type AuditEvent,
} from '@/services/audit'

const leadStatuses = ['Novo', 'Em atendimento', 'Convertido', 'Perdido']

export default function AccessControlPanel() {
  const { user, profile, hasPermission } = useAuth()
  const [users, setUsers] = useState<PersistedUser[]>([])
  const [leads, setLeads] = useState<PersistedLead[]>([])
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function reloadAudit() {
    if (profile === 'Gestor') setEvents(await listAuditEvents())
  }

  useEffect(() => {
    let active = true
    Promise.all([listSyntheticUsers(), listSyntheticLeads()])
      .then(async ([loadedUsers, loadedLeads]) => {
        if (!active) return
        setUsers(loadedUsers)
        setLeads(loadedLeads)
        if (profile === 'Gestor') setEvents(await listAuditEvents())
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os dados persistidos.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [profile])

  async function handleStatusChange(lead: PersistedLead, newStatus: string) {
    if (!user || !profile || !hasPermission('leads.update')) return
    setIsSaving(true)
    setError(null)
    setNotice(null)
    try {
      const event = await updateLeadStatusWithAudit({
        leadId: lead.id,
        previousStatus: lead.status,
        newStatus,
        actorId: user.id,
        actorEmail: user.email as string,
        actorProfile: profile,
      })
      setLeads((current) =>
        current.map((item) => (item.id === lead.id ? { ...item, status: newStatus } : item)),
      )
      setNotice(`Alteração auditada: ${event.previous_value} → ${event.new_value}.`)
      await reloadAudit()
    } catch {
      setError('Não foi possível salvar e auditar a alteração; o valor anterior foi preservado.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDenied(permission: 'leads.assign' | 'users.manage' | 'audit.view') {
    if (!user || !profile || hasPermission(permission)) return
    setError(null)
    try {
      await registerDeniedPermission({
        actorId: user.id,
        actorEmail: user.email as string,
        actorProfile: profile,
        permission,
      })
      setNotice(`Tentativa proibida registrada para ${permission}.`)
    } catch {
      setError('A tentativa foi negada, mas não foi possível registrar a auditoria.')
    }
  }

  return (
    <section className="space-y-6" aria-labelledby="access-control-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#10B981]">
            T1.3 · Auditoria
          </p>
          <h2 id="access-control-title" className="mt-1 text-xl font-semibold text-[#F1F5F9]">
            Perfil autenticado: {profile}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[#94A3B8]">
            Alterações registram autor, horário e valores anterior/novo. Tentativas proibidas também
            são registradas.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-300">
          <ShieldCheck className="h-3.5 w-3.5" /> Dados reais bloqueados
        </div>
      </div>

      {isLoading && (
        <div
          className="flex items-center gap-2 rounded-xl border border-[#243352] bg-[#111A2C] p-4 text-sm text-[#94A3B8]"
          role="status"
        >
          <Loader2 className="h-4 w-4 animate-spin text-[#10B981]" /> Carregando registros
          persistidos…
        </div>
      )}
      {isSaving && (
        <div
          className="rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-200"
          role="status"
        >
          Salvando alteração e registro de auditoria…
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
      {notice && (
        <div
          className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 p-4 text-sm text-[#A7F3D0]"
          role="status"
        >
          {notice}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {users.map((syntheticUser) => (
          <article
            key={syntheticUser.id}
            className="rounded-xl border border-[#243352] bg-[#0B1120]/60 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981]/15 text-[#10B981]">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#F1F5F9]">{syntheticUser.name}</h3>
                  <p className="text-xs text-[#94A3B8]">{syntheticUser.email}</p>
                </div>
              </div>
              <span className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2.5 py-1 text-[11px] font-semibold text-[#10B981]">
                {syntheticUser.profile}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#243352] pt-3 text-xs text-[#94A3B8]">
              <span>ID: {syntheticUser.synthetic_id}</span>
              <span className="text-[#10B981]">{syntheticUser.status}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-[#243352] bg-[#111A2C] p-5">
        <h3 className="font-semibold text-[#F1F5F9]">Alteração de lead auditada</h3>
        <p className="mt-1 text-xs text-[#94A3B8]">
          A operação grava o valor anterior e o novo na mesma ação.
        </p>
        {leads.map((lead) => (
          <div key={lead.id} className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-medium text-[#F1F5F9]">
              {lead.name} — {lead.status}
            </span>
            <label className="sr-only" htmlFor={`status-${lead.id}`}>
              Novo status do lead
            </label>
            <select
              id={`status-${lead.id}`}
              value={lead.status}
              disabled={isSaving || !hasPermission('leads.update')}
              onChange={(event) => void handleStatusChange(lead, event.target.value)}
              className="rounded-lg border border-[#243352] bg-[#0B1120] px-3 py-2 text-sm text-[#F1F5F9]"
            >
              <option value={lead.status}>{lead.status}</option>
              {leadStatuses
                .filter((status) => status !== lead.status)
                .map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
            </select>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(
          [
            ['Atribuir responsável', 'leads.assign'],
            ['Gerenciar usuários', 'users.manage'],
            ['Consultar auditoria', 'audit.view'],
          ] as const
        ).map(([label, permission]) => (
          <div key={permission} className="rounded-xl border border-[#243352] bg-[#111A2C] p-4">
            <p className="text-sm font-semibold text-[#F1F5F9]">{label}</p>
            <p className="mt-1 text-xs text-[#94A3B8]">{permission}</p>
            {hasPermission(permission) ? (
              <p className="mt-3 text-sm text-[#10B981]">Permitido para {profile}</p>
            ) : (
              <button
                type="button"
                onClick={() => void handleDenied(permission)}
                className="mt-3 flex items-start gap-2 text-left text-sm text-rose-300 underline-offset-2 hover:underline"
                aria-label={`Tentar ${label}`}
              >
                <ShieldAlert className="h-4 w-4 shrink-0" /> Acesso negado — registrar tentativa
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-[#243352] bg-[#111A2C]">
        <div className="flex items-center gap-3 border-b border-[#243352] px-5 py-4">
          <UsersRound className="h-5 w-5 text-[#10B981]" />
          <div>
            <h3 className="font-semibold text-[#F1F5F9]">Matriz efetiva e auditoria</h3>
            <p className="text-xs text-[#94A3B8]">
              {profile === 'Gestor'
                ? 'Histórico disponível para o Gestor.'
                : 'A auditoria é restrita ao Gestor.'}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-[#243352] text-xs uppercase tracking-wider text-[#94A3B8]">
              <tr>
                <th className="px-5 py-3 font-medium">Permissão</th>
                <th className="px-5 py-3 font-medium">Perfil atual</th>
                <th className="px-5 py-3 font-medium">Regra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#243352]/70">
              {permissionDefinitions.map((permission) => (
                <tr key={permission.key}>
                  <td className="px-5 py-3 text-[#F1F5F9]">
                    {permission.label}
                    <span className="ml-2 text-xs text-[#94A3B8]">{permission.key}</span>
                  </td>
                  <td className="px-5 py-3">
                    {permissionMatrix[profile!].includes(permission.key) ? (
                      <Check className="h-4 w-4 text-[#10B981]" aria-label="Permitido" />
                    ) : (
                      <span className="text-xs text-rose-300">Negado</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-[#94A3B8]">{permission.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {profile === 'Gestor' && (
        <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 p-5">
          <h3 className="font-semibold text-[#F1F5F9]">Histórico de auditoria</h3>
          {events.length === 0 ? (
            <p className="mt-2 text-sm text-[#94A3B8]">Nenhum evento registrado ainda.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-[#243352] bg-[#0B1120]/60 p-3 text-xs text-[#CBD5E1]"
                >
                  <strong>{event.action}</strong> · {event.result} · {event.actor_email} ·{' '}
                  {event.previous_value || '—'} → {event.new_value || '—'} ·{' '}
                  {new Date(event.created).toLocaleString('pt-BR')}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-dashed border-[#10B981]/40 bg-[#10B981]/5 p-5">
        <h3 className="font-semibold text-[#F1F5F9]">Fixtures de leads persistidos</h3>
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="mt-3 grid gap-2 text-xs text-[#CBD5E1] sm:grid-cols-2 lg:grid-cols-4"
          >
            <span>
              <strong className="text-[#94A3B8]">ID:</strong> {lead.synthetic_id}
            </span>
            <span>
              <strong className="text-[#94A3B8]">Nome:</strong> {lead.name}
            </span>
            <span>
              <strong className="text-[#94A3B8]">Telefone:</strong> {lead.phone}
            </span>
            <span>
              <strong className="text-[#94A3B8]">Origem:</strong> {lead.origin}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
