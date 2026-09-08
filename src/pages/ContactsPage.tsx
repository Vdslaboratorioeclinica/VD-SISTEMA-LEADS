import { useEffect, useState } from 'react'
import { Mail, Phone, Search, UserRound } from 'lucide-react'
import { listLeads, type CrmLead } from '@/services/crm'
export default function ContactsPage() {
  const [items, setItems] = useState<CrmLead[]>([]),
    [q, setQ] = useState('')
  useEffect(() => {
    listLeads().then(setItems)
  }, [])
  const filtered = items.filter((x) =>
    `${x.name} ${x.phone} ${x.email || ''}`.toLowerCase().includes(q.toLowerCase()),
  )
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-cyan-300">Base de relacionamento</p>
        <h1 className="mt-1 text-3xl font-bold">Contatos</h1>
        <p className="mt-2 text-slate-400">Histórico e dados essenciais dos leads atendidos.</p>
      </header>
      <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
        <Search className="h-4 w-4 text-slate-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, telefone ou e-mail"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((x) => (
          <article key={x.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-cyan-400/10 text-cyan-300">
                <UserRound className="h-5 w-5" />
              </span>
              <div>
                <strong>{x.name}</strong>
                <p className="text-xs text-slate-500">
                  {x.origin} · {x.service}
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-sm text-slate-400">
              <p className="flex gap-2">
                <Phone className="h-4 w-4" />
                {x.phone}
              </p>
              {x.email && (
                <p className="flex gap-2">
                  <Mail className="h-4 w-4" />
                  {x.email}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
