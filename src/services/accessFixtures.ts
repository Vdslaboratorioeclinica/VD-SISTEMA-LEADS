import type { RecordModel } from 'pocketbase'
import pb from '@/lib/pocketbase/client'

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
  origin: string
  status: string
  data_class: string
}

export async function bootstrapSyntheticFixtures(): Promise<void> {
  await pb.send('/backend/v1/t1/bootstrap', { method: 'POST', body: {} })
}

export async function listSyntheticUsers(): Promise<PersistedUser[]> {
  return pb.collection('synthetic_users').getFullList<PersistedUser>({ sort: 'synthetic_id' })
}

export async function listSyntheticLeads(): Promise<PersistedLead[]> {
  return pb.collection('leads').getFullList<PersistedLead>({ sort: 'synthetic_id' })
}
