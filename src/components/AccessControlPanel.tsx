import { useEffect, useState } from 'react'
import { Check, Loader2, ShieldCheck, UserRound, UsersRound } from 'lucide-react'
import { permissionDefinitions, permissionMatrix } from '@/data/accessControl'
import {
  bootstrapSyntheticFixtures,
  listSyntheticLeads,
  listSyntheticUsers,
  type PersistedLead,
  type PersistedUser,
} from '@/services/accessFixtures'

export default function AccessControlPanel() {
  const [users, setUsers] = useState<PersistedUser[]>([])
  const [leads, setLeads] = useState<PersistedLead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    bootstrapSyntheticFixtures()
      .then(() => Promise.all([listSyntheticUsers(), listSyntheticLeads()]))
      .then(([loadedUsers, loadedLeads]) => {
        if (!active) return
        setUsers(loadedUsers)
        setLeads(loadedLeads)
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os fixtures persistidos no Skip Cloud.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="space-y-6" aria-labelledby="access-control-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#10B981]">
            T1.1 · Fundação de acesso
          </p>
          <h2 id="access-control-title" className="mt-1 text-xl font-semibold text-[#F1F5F9]">
            Perfis e usuários sintéticos
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[#94A3B8]">
            Matriz mínima preparada para homologação da VDS. A autenticação e a auditoria serão
            implementadas nas próximas tasks.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-300 sm:self-auto">
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
      {error && (
        <div
          className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {users.map((user) => (
          <article key={user.id} className="rounded-xl border border-[#243352] bg-[#0B1120]/60 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981]/15 text-[#10B981]">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#F1F5F9]">{user.name}</h3>
                  <p className="text-xs text-[#94A3B8]">{user.email}</p>
                </div>
              </div>
              <span className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2.5 py-1 text-[11px] font-semibold text-[#10B981]">
                {user.profile}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#243352] pt-3 text-xs text-[#94A3B8]">
              <span>ID: {user.synthetic_id}</span>
              <span className="text-[#10B981]">{user.status}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-[#243352] bg-[#111A2C]">
        <div className="flex items-center gap-3 border-b border-[#243352] px-5 py-4">
          <UsersRound className="h-5 w-5 text-[#10B981]" />
          <div>
            <h3 className="font-semibold text-[#F1F5F9]">Matriz mínima de permissões</h3>
            <p className="text-xs text-[#94A3B8]">Escopo da T1.1 para CA-1-001 e CA-1-002</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-[#243352] text-xs uppercase tracking-wider text-[#94A3B8]">
              <tr>
                <th className="px-5 py-3 font-medium">Permissão</th>
                <th className="px-5 py-3 font-medium">Atendente</th>
                <th className="px-5 py-3 font-medium">Gestor</th>
                <th className="px-5 py-3 font-medium">Regra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#243352]/70">
              {permissionDefinitions.map((permission) => (
                <tr key={permission.key} className="align-top">
                  <td className="px-5 py-3">
                    <p className="font-medium text-[#F1F5F9]">{permission.label}</p>
                    <p className="mt-0.5 text-xs text-[#94A3B8]">{permission.key}</p>
                  </td>
                  <td className="px-5 py-3">
                    {permissionMatrix.Atendente.includes(permission.key) ? (
                      <Check className="h-4 w-4 text-[#10B981]" aria-label="Permitido" />
                    ) : (
                      <span className="text-xs text-rose-300">Negado</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Check className="h-4 w-4 text-[#10B981]" aria-label="Permitido" />
                  </td>
                  <td className="max-w-xs px-5 py-3 text-xs leading-5 text-[#94A3B8]">
                    {permission.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-[#10B981]/40 bg-[#10B981]/5 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" />
          <div className="w-full">
            <h3 className="font-semibold text-[#F1F5F9]">Fixtures de leads persistidos</h3>
            {leads.length === 0 && !isLoading ? (
              <p className="mt-1 text-sm text-amber-200">
                Nenhum lead sintético encontrado no backend.
              </p>
            ) : (
              leads.map((lead) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
