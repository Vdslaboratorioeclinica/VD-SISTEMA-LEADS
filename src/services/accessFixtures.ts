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
  if (!origin || !leadOrigins.includes(origin as (typeof leadOrigins)[number])) {
    throw new Error('Selecione uma origem válida.')
  }
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

export async function createLead(input: LeadInput): Promise<PersistedLead> {
  const valid = validateLeadInput(input)
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
  })
}
