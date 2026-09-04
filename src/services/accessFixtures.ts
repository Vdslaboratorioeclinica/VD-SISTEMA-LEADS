import type { RecordModel } from 'pocketbase'
import pb from '@/lib/pocketbase/client'
import { leadInitialStatus, leadOrigins } from '@/data/leadDictionary'

export type PersistedUser = RecordModel & {
  synthetic_id: string
  name: string
  email: string
  profile: 'Atendente' | 'Gestor'
  status: 'Ativo' | 'Desativado'
}

export type DuplicateResolution = 'pending' | 'linked' | 'new_justified'
export type RecordState = 'active' | 'archived'

export type PersistedLead = RecordModel & {
  synthetic_id: string
  name: string
  phone: string
  email?: string
  origin: string
  service: 'Citologia' | 'Papanicolau' | 'Outro'
  need: string
  responsible?: string
  status: string
  data_class: string
  duplicate_resolution?: DuplicateResolution
  linked_lead_id?: string
  new_justification?: string
  record_state: RecordState
  archive_reason?: string
  intake_at?: string
  first_response_at?: string
  first_response_duration_seconds?: number
  sla_status?: 'atendido_no_prazo' | 'estourado' | 'pendente_contingencia'
  contingency_mode?: boolean
}

export type LeadInput = {
  name: string
  phone: string
  email?: string
  origin: string
  service: PersistedLead['service']
  need: string
}

export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 13)
    throw new Error('Informe um telefone válido com DDD.')
  return `+${digits}`
}

export function validateLeadInput(input: LeadInput): LeadInput {
  const name = input.name.trim()
  const email = input.email?.trim() || ''
  const origin = input.origin.trim()
  const need = input.need.trim()
  if (!name) throw new Error('Informe o nome do lead.')
  if (!origin || !leadOrigins.includes(origin as (typeof leadOrigins)[number]))
    throw new Error('Selecione uma origem válida.')
  if (!need) throw new Error('Informe a necessidade do lead.')
  if (email && !/^\S+@\S+\.\S+$/.test(email)) throw new Error('Informe um e-mail válido.')
  return { ...input, name, email, origin, need, phone: normalizePhone(input.phone) }
}

function quoteFilter(value: string): string {
  return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
}

export async function listSyntheticUsers(): Promise<PersistedUser[]> {
  return pb.collection('synthetic_users').getFullList<PersistedUser>({ sort: 'synthetic_id' })
}

export async function listSyntheticLeads(): Promise<PersistedLead[]> {
  return pb.collection('leads').getFullList<PersistedLead>({ sort: '-created' })
}

export async function searchLeads(term: string): Promise<PersistedLead[]> {
  const normalized = term.trim()
  if (!normalized) return []
  const normalizedPhone = normalized.replace(/\D/g, '')
  const filters = [
    `name ~ ${quoteFilter(normalized)}`,
    `phone ~ ${quoteFilter(normalizedPhone || normalized)}`,
  ]
  if (normalized.includes('@')) filters.push(`email ~ ${quoteFilter(normalized)}`)
  return pb
    .collection('leads')
    .getFullList<PersistedLead>({ filter: filters.join(' || '), sort: '-created' })
}

export async function findPossibleDuplicates(
  phone: string,
  email?: string,
): Promise<PersistedLead[]> {
  const normalizedPhone = normalizePhone(phone)
  const candidates = await pb.collection('leads').getFullList<PersistedLead>({ sort: '-created' })
  return candidates.filter((lead) => {
    try {
      return (
        normalizePhone(lead.phone) === normalizedPhone ||
        Boolean(email?.trim() && lead.email?.trim() === email.trim())
      )
    } catch {
      return Boolean(email?.trim() && lead.email?.trim() === email.trim())
    }
  })
}

export async function linkLead(leadId: string, input: LeadInput): Promise<PersistedLead> {
  const valid = validateLeadInput(input)
  return pb.collection('leads').update<PersistedLead>(leadId, {
    duplicate_resolution: 'linked',
    linked_lead_id: leadId,
    new_justification: '',
    origin: valid.origin,
  })
}

export async function createLead(
  input: LeadInput,
  options?: { linkedLeadId?: string; newJustification?: string },
): Promise<PersistedLead> {
  const valid = validateLeadInput(input)
  const justification = options?.newJustification?.trim() || ''
  if (options?.linkedLeadId && justification)
    throw new Error('Escolha vincular ou justificar novo, não ambos.')
  if (options && !options.linkedLeadId && !justification)
    throw new Error('Informe a justificativa para criar um novo lead.')
  return pb.collection('leads').create<PersistedLead>({
    synthetic_id: `LEAD-MANUAL-${Date.now()}`,
    name: valid.name,
    phone: valid.phone,
    email: valid.email || '',
    origin: valid.origin,
    service: valid.service,
    need: valid.need,
    responsible: '',
    status: leadInitialStatus,
    data_class: 'synthetic',
    duplicate_resolution: options?.linkedLeadId ? 'linked' : 'new_justified',
    linked_lead_id: options?.linkedLeadId || '',
    new_justification: justification,
    record_state: 'active',
    archive_reason: '',
  })
}

export async function registerFirstResponse(
  lead: PersistedLead,
  responseAt = new Date(),
): Promise<PersistedLead> {
  if (lead.first_response_at) throw new Error('A primeira resposta deste lead já foi registrada.')
  if (lead.contingency_mode)
    throw new Error('Lead em contingência deve ser reconciliado pela operação.')
  const intakeAt = new Date(lead.intake_at || lead.created)
  if (Number.isNaN(intakeAt.getTime()) || Number.isNaN(responseAt.getTime()))
    throw new Error('Não foi possível calcular o horário da primeira resposta.')
  const duration = Math.max(0, Math.floor((responseAt.getTime() - intakeAt.getTime()) / 1000))
  try {
    return await pb.collection('leads').update<PersistedLead>(lead.id, {
      first_response_at: responseAt.toISOString(),
      first_response_duration_seconds: duration,
      sla_status: duration <= 300 ? 'atendido_no_prazo' : 'estourado',
    })
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : 'erro de validação do backend'
    throw new Error(`Não foi possível registrar a primeira resposta: ${detail}`)
  }
}

export async function archiveLead(leadId: string, reason: string): Promise<PersistedLead> {
  const trimmed = reason.trim()
  if (trimmed.length < 5)
    throw new Error('Informe um motivo de arquivamento com pelo menos 5 caracteres.')
  return pb
    .collection('leads')
    .update<PersistedLead>(leadId, { record_state: 'archived', archive_reason: trimmed })
}
