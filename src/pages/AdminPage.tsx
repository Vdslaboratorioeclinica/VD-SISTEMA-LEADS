import { Settings, UsersRound } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { permissionDefinitions, permissionMatrix } from '@/data/accessControl'
import { Check, X } from 'lucide-react'

export default function AdminPage() {
  const { profile } = useAuth()
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
          Configurações
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
          <Settings className="h-6 w-6 text-cyan-300" /> Administração
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Matriz de permissões e gestão de perfis. Acesso restrito ao Gestor.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">
          <UsersRound className="h-5 w-5 text-cyan-300" />
          <div>
            <h3 className="font-semibold text-slate-100">Matriz de permissões</h3>
            <p className="text-xs text-slate-400">Perfil atual: {profile}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Permissão</th>
                <th className="px-5 py-3 font-medium">Atendente</th>
                <th className="px-5 py-3 font-medium">Gestor</th>
                <th className="px-5 py-3 font-medium">Regra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {permissionDefinitions.map((permission) => (
                <tr key={permission.key}>
                  <td className="px-5 py-3 text-slate-100">
                    {permission.label}
                    <span className="ml-2 text-xs text-slate-500">{permission.key}</span>
                  </td>
                  <td className="px-5 py-3">
                    {permissionMatrix.Atendente.includes(permission.key) ? (
                      <Check className="h-4 w-4 text-emerald-400" aria-label="Permitido" />
                    ) : (
                      <X className="h-4 w-4 text-rose-400" aria-label="Negado" />
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {permissionMatrix.Gestor.includes(permission.key) ? (
                      <Check className="h-4 w-4 text-emerald-400" aria-label="Permitido" />
                    ) : (
                      <X className="h-4 w-4 text-rose-400" aria-label="Negado" />
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400">{permission.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
