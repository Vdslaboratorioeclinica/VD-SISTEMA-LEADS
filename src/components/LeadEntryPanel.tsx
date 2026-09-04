import { useState, type FormEvent } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { leadOrigins } from '@/data/leadDictionary'
import { useAuth } from '@/context/AuthContext'
import {
  createLead,
  searchLeads,
  type LeadInput,
  type PersistedLead,
} from '@/services/accessFixtures'

const initialForm: LeadInput = {
  name: '',
  phone: '',
  email: '',
  origin: '',
  service: 'Citologia',
  need: '',
}

export default function LeadEntryPanel({
  onCreated,
}: {
  onCreated: (lead: PersistedLead) => void
}) {
  const { user, profile, hasPermission } = useAuth()
  const [form, setForm] = useState<LeadInput>(initialForm)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PersistedLead[]>([])
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  function updateField<K extends keyof LeadInput>(field: K, value: LeadInput[K]) {
    setForm((current) => ({ ...current, [field]: value }))
    setError(null)
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || !profile || !hasPermission('leads.create')) return
    setIsSaving(true)
    setError(null)
    setNotice(null)
    try {
      const lead = await createLead(form)
      onCreated(lead)
      setForm(initialForm)
      setNotice(`Lead criado com telefone normalizado: ${lead.phone}. Estado: ${lead.status}.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível criar o lead.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSearching(true)
    setError(null)
    try {
      setResults(await searchLeads(query))
    } catch {
      setError('Não foi possível pesquisar os leads.')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const fieldClass =
    'mt-1 rounded-lg border border-[#243352] bg-[#0B1120] px-3 py-2 text-sm text-[#F1F5F9] placeholder:text-[#64748B]'

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-[#243352] bg-[#111A2C] p-5"
        aria-labelledby="lead-entry-title"
      >
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-[#10B981]" />
          <h3 id="lead-entry-title" className="font-semibold text-[#F1F5F9]">
            Criar lead manual
          </h3>
        </div>
        <p className="mt-1 text-xs text-[#94A3B8]">
          O telefone será normalizado. A decisão sobre duplicidade pertence à T1.6.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-[#CBD5E1]">
            Nome
            <Input
              required
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="text-xs text-[#CBD5E1]">
            Telefone
            <Input
              required
              inputMode="tel"
              placeholder="(96) 99999-9999"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="text-xs text-[#CBD5E1]">
            E-mail opcional
            <Input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="text-xs text-[#CBD5E1]">
            Origem
            <select
              required
              value={form.origin}
              onChange={(e) => updateField('origin', e.target.value)}
              className={`w-full ${fieldClass}`}
            >
              <option value="">Selecione</option>
              {leadOrigins.map((origin) => (
                <option key={origin} value={origin}>
                  {origin}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-[#CBD5E1]">
            Serviço
            <select
              required
              value={form.service}
              onChange={(e) => updateField('service', e.target.value as LeadInput['service'])}
              className={`w-full ${fieldClass}`}
            >
              <option value="Citologia">Citologia</option>
              <option value="Papanicolau">Papanicolau</option>
              <option value="Outro">Outro</option>
            </select>
          </label>
          <label className="text-xs text-[#CBD5E1] sm:col-span-2">
            Necessidade
            <Input
              required
              value={form.need}
              onChange={(e) => updateField('need', e.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
        <Button
          type="submit"
          disabled={isSaving || !hasPermission('leads.create')}
          className="mt-4 bg-[#10B981] text-[#06251A] hover:bg-[#34D399]"
        >
          {isSaving ? 'Salvando…' : 'Criar lead'}
        </Button>
      </form>
      <form
        onSubmit={handleSearch}
        className="rounded-xl border border-[#243352] bg-[#111A2C] p-5"
        aria-labelledby="lead-search-title"
      >
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-[#10B981]" />
          <h3 id="lead-search-title" className="font-semibold text-[#F1F5F9]">
            Buscar leads
          </h3>
        </div>
        <p className="mt-1 text-xs text-[#94A3B8]">
          Pesquise por nome, telefone ou e-mail. Nenhum registro é alterado pela busca.
        </p>
        <div className="mt-4 flex gap-2">
          <Input
            aria-label="Termo de busca"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome, telefone ou e-mail"
            className={fieldClass}
          />
          <Button type="submit" variant="outline" disabled={isSearching}>
            {isSearching ? 'Buscando…' : 'Buscar'}
          </Button>
        </div>
        {results.length > 0 && (
          <div className="mt-4 space-y-2" aria-live="polite">
            {results.map((lead) => (
              <div
                key={lead.id}
                className="rounded-lg border border-[#243352] p-3 text-xs text-[#CBD5E1]"
              >
                <strong className="text-[#F1F5F9]">{lead.name}</strong> · {lead.phone} ·{' '}
                {lead.origin} · {lead.status}
              </div>
            ))}
          </div>
        )}
        {query.trim() && !isSearching && results.length === 0 && (
          <p className="mt-4 text-sm text-[#94A3B8]" aria-live="polite">
            Nenhum lead encontrado.
          </p>
        )}
      </form>
      {error && (
        <div
          className="xl:col-span-2 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200"
          role="alert"
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          className="xl:col-span-2 rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 p-4 text-sm text-[#A7F3D0]"
          role="status"
        >
          {notice}
        </div>
      )}
    </div>
  )
}
