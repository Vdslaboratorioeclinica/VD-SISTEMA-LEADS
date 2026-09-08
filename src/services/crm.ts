import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export type PipelineStage = RecordModel & {
  name: string
  slug: string
  position: number
  color: string
  is_final: boolean
  active: boolean
}
export type CrmLead = RecordModel & {
  name: string
  phone: string
  email?: string
  origin: string
  service: string
  need: string
  responsible?: string
  status: string
  pipeline_stage?: string
  last_contact_at?: string
  next_action?: string
  next_action_at?: string
}
export type Conversation = RecordModel & {
  lead: string
  channel: string
  unread_count: number
  ai_mode: 'assistindo' | 'pausada' | 'humano'
  handoff_required: boolean
  assigned_to?: string
  summary?: string
  last_message_at?: string
  expand?: { lead?: CrmLead }
}
export type Message = RecordModel & {
  conversation: string
  direction: 'incoming' | 'outgoing'
  sender_type: string
  body: string
  delivery_status: string
}
export type FollowUp = RecordModel & {
  lead: string
  conversation?: string
  scheduled_at: string
  status: string
  rule_name: string
  message_template: string
  expand?: { lead?: CrmLead }
}
export type FollowUpRule = RecordModel & {
  name: string
  delay_days: number
  message_template: string
  active: boolean
}
export type CustomField = RecordModel & {
  field_key: string
  label: string
  field_type: string
  required: boolean
  active: boolean
  position: number
}
export type EvolutionConnection = RecordModel & {
  instance_name: string
  base_url: string
  status: string
  phone?: string
  last_sync_at?: string
}

export const listStages = () =>
  pb.collection('pipeline_stages').getFullList<PipelineStage>({ sort: 'position' })
export const listLeads = () => pb.collection('leads').getFullList<CrmLead>({ sort: '-updated' })
export const listConversations = () =>
  pb
    .collection('conversations')
    .getFullList<Conversation>({ sort: '-last_message_at', expand: 'lead' })
export const listMessages = (conversation: string) =>
  pb
    .collection('messages')
    .getFullList<Message>({ filter: `conversation = "${conversation}"`, sort: 'created' })
export const listFollowUps = () =>
  pb.collection('follow_ups').getFullList<FollowUp>({ sort: 'scheduled_at', expand: 'lead' })
export const listRules = () =>
  pb.collection('follow_up_rules').getFullList<FollowUpRule>({ sort: 'created' })
export const listCustomFields = () =>
  pb.collection('custom_field_definitions').getFullList<CustomField>({ sort: 'position' })
export const listEvolution = () =>
  pb.collection('evolution_connections').getFullList<EvolutionConnection>({ sort: '-updated' })
export const moveLead = (leadId: string, stageId: string) =>
  pb.collection('leads').update<CrmLead>(leadId, { pipeline_stage: stageId })
export const createStage = (data: Pick<PipelineStage, 'name' | 'slug' | 'position' | 'color'>) =>
  pb.collection('pipeline_stages').create<PipelineStage>({ ...data, active: true, is_final: false })
export const updateStage = (id: string, data: Partial<PipelineStage>) =>
  pb.collection('pipeline_stages').update<PipelineStage>(id, data)
export const createCustomField = (
  data: Pick<CustomField, 'field_key' | 'label' | 'field_type' | 'position'>,
) =>
  pb
    .collection('custom_field_definitions')
    .create<CustomField>({ ...data, active: true, required: false, options_json: '' })
export const createRule = (data: Pick<FollowUpRule, 'name' | 'delay_days' | 'message_template'>) =>
  pb.collection('follow_up_rules').create<FollowUpRule>({ ...data, active: true })
export const saveEvolution = (data: Pick<EvolutionConnection, 'instance_name' | 'base_url'>) =>
  pb
    .collection('evolution_connections')
    .create<EvolutionConnection>({ ...data, status: 'nao_configurada', phone: '' })
export const sendManualMessage = async (conversation: string, body: string) =>
  pb
    .collection('messages')
    .create<Message>({
      conversation,
      body,
      direction: 'outgoing',
      sender_type: 'atendente',
      delivery_status: 'pendente',
      external_id: '',
    })
