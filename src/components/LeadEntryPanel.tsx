import { useState, type FormEvent } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { leadOrigins } from '@/data/leadDictionary'
import { useAuth } from '@/context/AuthContext'
import {
  archiveLead,
  createLead,
  findPossibleDuplicates,
  linkLead,
  searchLeads,
  type LeadInput,
  type PersistedLead,
} from '@/services/accessFixtures'
import { createAuditEvent } from '@/services/audit'

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
  const [duplicates, setDuplicates] = useState<PersistedLead[]>([])
  const [duplicateChoice, setDuplicateChoice] = useState<'linked' | 'new_justified' | null>(null)
  const [newJustification, setNewJustification] = useState('')
  const [archiveReason, setArchiveReason] = useState<Record<string, string>>({})

  function updateField<K extends keyof LeadInput>(field: K, value: LeadInput[K]) {
    setForm((current) => ({ ...current, [field]: value }))
    setError(null)
  }

  async function finalizeDuplicate(choice: 'linked' | 'new_justified') {
    if (!user || !profile || !hasPermission('leads.create')) return
    if (choice === 'new_justified' && newJustification.trim().length < 5) {
      setError('Informe uma justificativa com pelo menos 5 caracteres.')
      return
    }
    setIsSaving(true)
    setError(null)
    setNotice(null)
    try {
      if (choice === 'linked') {
        const existingLead = duplicates[0]
        if (!existingLead) throw new Error('Nenhum lead existente disponível para vínculo.')
        const linkedLead = await linkLead(existingLead.id, form)
        await createAuditEvent({
          actorId: user.id,
          actorEmail: user.email as string,
          actorProfile: profile,
          action: 'lead.linked',
          entity: 'lead',
          entityId: linkedLead.id,
          newValue: linkedLead.id,
          result: 'success',
        })
        setForm(initialForm)
        setDuplicates([])
        setDuplicateChoice(null)
        setNewJustification('')
        setNotice('Entrada vinculada ao lead existente; nenhum duplicado foi criado.')
        return
      }
      const lead = await createLead(form, { newJustification })
      await createAuditEvent({
        actorId: user.id,
        actorEmail: user.email as string,
        actorProfile: profile,
        action: 'lead.created',
        entity: 'lead',
        entityId: lead.id,
        newValue: lead.phone,
        result: 'success',
      })
      await createAuditEvent({
        actorId: user.id,
        actorEmail: user.email as string,
        actorProfile: profile,
        action: 'lead.new_justified',
        entity: 'lead',
        entityId: lead.id,
        newValue: newJustification,
        result: 'success',
      })
      onCreated(lead)
      setForm(initialForm)
      setDuplicates([])
      setDuplicateChoice(null)
      setNewJustification('')
      setNotice('Novo lead criado com justificativa registrada.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível concluir a resolução.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || !profile || !hasPermission('leads.create')) return
    setIsSaving(true)
    setError(null)
    setNotice(null)
    try {
      const possibleDuplicates =
        duplicates.length > 0 ? duplicates : await findPossibleDuplicates(form.phone, form.email)
      if (possibleDuplicates.length > 0 && !duplicateChoice) {
        setDuplicates(possibleDuplicates)
        if (user && profile)
          await createAuditEvent({
            actorId: user.id,
            actorEmail: user.email as string,
            actorProfile: profile,
            action: 'lead.duplicate_detected',
            entity: 'lead',
            entityId: possibleDuplicates[0].id,
            newValue: form.phone,
            result: 'success',
          })
        setNotice(
          'Possível duplicidade encontrada. Escolha vincular ao existente ou justifique a criação de um novo.',
        )
        return
      }
      if (
        possibleDuplicates.length > 0 &&
        duplicateChoice === 'new_justified' &&
        newJustification.trim().length < 5
      ) {
        throw new Error('Informe uma justificativa com pelo menos 5 caracteres.')
      }
      const resolution =
        possibleDuplicates.length > 0
          ? {
              linkedLeadId: duplicateChoice === 'linked' ? duplicates[0]?.id : undefined,
              newJustification: duplicateChoice === 'new_justified' ? newJustification : undefined,
            }
          : undefined
      const lead = await createLead(form, resolution)
      await createAuditEvent({
        actorId: user.id,
        actorEmail: user.email as string,
        actorProfile: profile,
        action: 'lead.created',
        entity: 'lead',
        entityId: lead.id,
        newValue: lead.phone,
        result: 'success',
      })
      await createAuditEvent({
        actorId: user.id,
        actorEmail: user.email as string,
        actorProfile: profile,
        action: duplicateChoice === 'linked' ? 'lead.linked' : 'lead.new_justified',
        entity: 'lead',
        entityId: lead.id,
        newValue: duplicateChoice === 'linked' ? possibleDuplicates[0]?.id : newJustification,
        result: 'success',
      })
      onCreated(lead)
      setForm(initialForm)
      setDuplicates([])
      setDuplicateChoice(null)
      setNewJustification('')
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
        {duplicates.length > 0 && (
          <div
            className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100"
            role="alert"
          >
            <strong>Possível duplicidade:</strong>{' '}
            {duplicates.map((lead) => `${lead.name} (${lead.phone})`).join(', ')}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant={duplicateChoice === 'linked' ? 'default' : 'outline'}
                onClick={() => void finalizeDuplicate('linked')}
                disabled={isSaving}
              >
                Vincular ao existente
              </Button>
              <Button
                type="button"
                variant={duplicateChoice === 'new_justified' ? 'default' : 'outline'}
                onClick={() => setDuplicateChoice('new_justified')}
                disabled={isSaving}
              >
                Criar novo com justificativa
              </Button>
            </div>
            {duplicateChoice === 'new_justified' && (
              <Input
                aria-label="Justificativa para criar novo"
                value={newJustification}
                onChange={(e) => setNewJustification(e.target.value)}
                placeholder="Explique por que não é duplicado"
                className="mt-2"
              />
            )}
          </div>
        )}
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
                {lead.origin} · {lead.status} · {lead.record_state}
                {lead.record_state !== 'archived' && (
                  <div className="mt-2 flex gap-2">
                    <Input
                      aria-label={`Motivo para arquivar ${lead.name}`}
                      value={archiveReason[lead.id] || ''}
                      onChange={(e) =>
                        setArchiveReason((current) => ({ ...current, [lead.id]: e.target.value }))
                      }
                      placeholder="Motivo do arquivamento"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        if (!user || !profile) return
                        try {
                          await archiveLead(lead.id, archiveReason[lead.id] || '')
                          await createAuditEvent({
                            actorId: user.id,
                            actorEmail: user.email as string,
                            actorProfile: profile,
                            action: 'lead.archived',
                            entity: 'lead',
                            entityId: lead.id,
                            newValue: archiveReason[lead.id],
                            result: 'success',
                          })
                          setNotice('Lead arquivado sem exclusão física.')
                        } catch (cause) {
                          setError(
                            cause instanceof Error
                              ? cause.message
                              : 'Não foi possível arquivar o lead.',
                          )
                        }
                      }}
                    >
                      Arquivar
                    </Button>
                  </div>
                )}
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
