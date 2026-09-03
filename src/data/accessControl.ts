export type AccessProfile = 'Atendente' | 'Gestor'

export type PermissionKey =
  | 'leads.view'
  | 'leads.create'
  | 'leads.update'
  | 'leads.assign'
  | 'users.manage'
  | 'audit.view'

export interface PermissionDefinition {
  key: PermissionKey
  label: string
  description: string
}

export const accessProfiles = [
  {
    name: 'Atendente' as const,
    summary: 'Atende, qualifica e atualiza leads atribuídos.',
    color: 'blue',
  },
  {
    name: 'Gestor' as const,
    summary: 'Administra acesso, operação e acompanhamento do funil.',
    color: 'emerald',
  },
]

export const permissionDefinitions: PermissionDefinition[] = [
  { key: 'leads.view', label: 'Visualizar leads', description: 'Consultar leads disponíveis para atendimento' },
  { key: 'leads.create', label: 'Criar lead', description: 'Registrar um novo lead sintético ou autorizado' },
  { key: 'leads.update', label: 'Atualizar lead', description: 'Atualizar status, contato e necessidade' },
  { key: 'leads.assign', label: 'Atribuir responsável', description: 'Distribuir leads para a equipe' },
  { key: 'users.manage', label: 'Gerenciar usuários', description: 'Habilitar, desativar e alterar perfis' },
  { key: 'audit.view', label: 'Consultar auditoria', description: 'Consultar alterações e tentativas proibidas' },
]

export const permissionMatrix: Record<AccessProfile, PermissionKey[]> = {
  Atendente: ['leads.view', 'leads.create', 'leads.update'],
  Gestor: permissionDefinitions.map(({ key }) => key),
}

export const syntheticUsers = [
  {
    id: 'USR-SYN-001',
    name: 'Ana Souza',
    email: 'ana.atendente@teste.vds.local',
    profile: 'Atendente' as const,
    status: 'Ativo',
  },
  {
    id: 'USR-SYN-002',
    name: 'Marcos Lima',
    email: 'marcos.gestor@teste.vds.local',
    profile: 'Gestor' as const,
    status: 'Ativo',
  },
]

export const syntheticLead = {
  id: 'LEAD-SYN-001',
  name: 'Pessoa Teste',
  phone: '+55 00 90000-0001',
  origin: 'Fixture manual',
  status: 'Novo',
  dataClass: 'Sintético — não é paciente real',
}
