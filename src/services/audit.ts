import type { RecordModel } from 'pocketbase'
import pb from '@/lib/pocketbase/client'
import type { AccessProfile, PermissionKey } from '@/data/accessControl'
import { funnelFinalStates, funnelLossReasons, funnelTransitions } from '@/data/funnelDictionary'

export type AuditAction =
  | 'lead.created'
  | 'lead.duplicate_detected'
  | 'lead.linked'
  | 'lead.new_justified'
  | 'lead.archived'
  | 'lead.status_changed'
  | 'lead.contact_changed'
  | 'permission.denied'
export type AuditResult = 'success' | 'denied'

export type AuditEvent = RecordModel & {
  actor_id: string
  actor_email: string
  actor_profile: AccessProfile
  action: AuditAction
  entity: string
  entity_id: string
  previous_value: string
  new_value: string
  result: AuditResult
}

export async function createAuditEvent(input: {
  actorId: string
  actorEmail: string
  actorProfile: AccessProfile
  action: AuditAction
  entity: string
  entityId: string
  previousValue?: string
  newValue?: string
  result: AuditResult
}): Promise<AuditEvent> {
  return pb.collection('audit_events').create<AuditEvent>({
    actor_id: input.actorId,
    actor_email: input.actorEmail,
    actor_profile: input.actorProfile,
    action: input.action,
    entity: input.entity,
    entity_id: input.entityId,
    previous_value: input.previousValue || '',
    new_value: input.newValue || '',
    result: input.result,
  })
}

export async function listAuditEvents(): Promise<AuditEvent[]> {
  return pb.collection('audit_events').getFullList<AuditEvent>({ sort: '-created' })
}

export async function updateLeadStatusWithAudit(input: {
  leadId: string
  previousStatus: string
  newStatus: string
  lossReason?: string
  actorId: string
  actorEmail: string
  actorProfile: AccessProfile
}): Promise<AuditEvent> {
  const transitionAllowed = funnelTransitions.some(
    (transition) => transition.from === input.previousStatus && transition.to === input.newStatus,
  )
  if (!transitionAllowed)
    throw new Error(
      `Transição inválida: ${input.previousStatus} → ${input.newStatus}. Consulte as transições permitidas do funil.`,
    )

  const isLoss = input.newStatus === 'Perdido'
  const lossReason = input.lossReason?.trim() || ''
  if (isLoss && !lossReason)
    throw new Error('Para mover um lead para Perdido é obrigatório informar o motivo de perda.')

  const payload: Record<string, string> = { status: input.newStatus }
  if (isLoss) payload.loss_reason = lossReason

  await pb.collection('leads').update(input.leadId, payload)
  try {
    return await createAuditEvent({
      actorId: input.actorId,
      actorEmail: input.actorEmail,
      actorProfile: input.actorProfile,
      action: 'lead.status_changed',
      entity: 'lead',
      entityId: input.leadId,
      previousValue: input.previousStatus,
      newValue: isLoss ? `${input.newStatus} (${lossReason})` : input.newStatus,
      result: 'success',
    })
  } catch (error) {
    try {
      await pb.collection('leads').update(input.leadId, { status: input.previousStatus })
    } catch {
      throw new Error(
        'A alteração foi feita, mas não foi possível registrar nem reverter a auditoria.',
      )
    }
    throw error
  }
}

export function nextAllowedStatuses(currentStatus: string): string[] {
  return funnelTransitions
    .filter((transition) => transition.from === currentStatus)
    .map((transition) => transition.to)
}

export function isFinalStatus(status: string): boolean {
  return (funnelFinalStates as readonly string[]).includes(status)
}

export function lossReasonOptions(): readonly string[] {
  return funnelLossReasons
}

export async function registerDeniedPermission(input: {
  actorId: string
  actorEmail: string
  actorProfile: AccessProfile
  permission: PermissionKey
}): Promise<AuditEvent> {
  return createAuditEvent({
    actorId: input.actorId,
    actorEmail: input.actorEmail,
    actorProfile: input.actorProfile,
    action: 'permission.denied',
    entity: 'permission',
    entityId: input.permission,
    previousValue: '',
    newValue: input.permission,
    result: 'denied',
  })
}
