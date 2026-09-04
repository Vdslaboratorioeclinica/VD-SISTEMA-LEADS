import { leadInitialStatus } from './leadDictionary'

export const funnelStates = [
  'Novo',
  'Em atendimento',
  'Qualificado',
  'Tentando agendar',
  'Convertido',
  'Perdido',
] as const

export type FunnelState = (typeof funnelStates)[number]

export const funnelInitialStatus = leadInitialStatus

export const funnelFinalStates: FunnelState[] = ['Convertido', 'Perdido']

export const funnelStateDetails: Record<FunnelState, string> = {
  Novo: 'Estado inicial obrigatório de todo lead.',
  'Em atendimento': 'Atendente iniciou o atendimento após a primeira resposta.',
  Qualificado: 'Lead qualificado quanto à necessidade e ao serviço de interesse.',
  'Tentando agendar': 'Em negociação para agendar o exame.',
  Convertido: 'Agendamento realizado ou orientação concluída.',
  Perdido: 'Encerrado sem agendamento; exige motivo de perda obrigatório.',
}

export const funnelTransitions: { from: FunnelState; to: FunnelState }[] = [
  { from: 'Novo', to: 'Em atendimento' },
  { from: 'Em atendimento', to: 'Qualificado' },
  { from: 'Em atendimento', to: 'Perdido' },
  { from: 'Qualificado', to: 'Tentando agendar' },
  { from: 'Qualificado', to: 'Perdido' },
  { from: 'Tentando agendar', to: 'Convertido' },
  { from: 'Tentando agendar', to: 'Perdido' },
]

export const funnelLossReasons = [
  'Não respondeu',
  'Sem interesse',
  'Sem recurso no momento',
  'Pediu para não contatar',
  'Outro',
] as const

export const funnelNextActionByState: Record<FunnelState, string> = {
  Novo: 'Fazer o primeiro contato e registrar a primeira resposta.',
  'Em atendimento': 'Qualificar quanto à necessidade e ao serviço.',
  Qualificado: 'Enviar orçamento ou orientação.',
  'Tentando agendar': 'Confirmar data e horário do exame.',
  Convertido: 'Registrar o resultado e definir acompanhamento.',
  Perdido: 'Registrar o motivo de perda e o follow-up permitido.',
}
