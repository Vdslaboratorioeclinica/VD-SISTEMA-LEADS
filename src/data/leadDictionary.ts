export const leadFieldDictionary = [
  {
    key: 'name',
    label: 'Nome',
    type: 'texto',
    required: true,
    description: 'Identificação operacional do lead sintético.',
  },
  {
    key: 'phone',
    label: 'Telefone',
    type: 'telefone',
    required: true,
    description: 'Obrigatório; será normalizado na T1.5.',
  },
  {
    key: 'email',
    label: 'E-mail',
    type: 'e-mail',
    required: false,
    description: 'Opcional nesta etapa; busca será implementada na T1.5.',
  },
  {
    key: 'origin',
    label: 'Origem',
    type: 'lista controlada',
    required: true,
    description: 'Usar uma origem válida ou Não identificada para revisão.',
  },
  {
    key: 'service',
    label: 'Serviço',
    type: 'lista controlada',
    required: true,
    description: 'Citologia, Papanicolau ou Outro.',
  },
  {
    key: 'need',
    label: 'Necessidade',
    type: 'texto',
    required: true,
    description: 'Descrição inicial informada pelo operador.',
  },
  {
    key: 'responsible',
    label: 'Responsável',
    type: 'texto',
    required: false,
    description: 'Pode permanecer vazio até atribuição operacional.',
  },
  {
    key: 'status',
    label: 'Estado',
    type: 'lista controlada',
    required: true,
    description: 'Novo é o estado inicial obrigatório.',
  },
  {
    key: 'created',
    label: 'Criado em',
    type: 'timestamp',
    required: true,
    description: 'Gerado automaticamente pelo backend.',
  },
] as const

export const leadOrigins = [
  'WhatsApp',
  'Instagram',
  'Indicação',
  'Site',
  'Não identificada',
] as const
export const leadInitialStatus = 'Novo' as const
export const leadOperationalFixtures = [
  {
    synthetic_id: 'LEAD-SYN-001',
    phone: '+55 00 90000-0001',
    origin: 'Fixture manual',
    service: 'Citologia',
    need: 'Informações sobre exame',
    responsible: '',
    status: 'Novo',
  },
  {
    synthetic_id: 'LEAD-SYN-002',
    phone: '+55 00 90000-0001',
    origin: 'WhatsApp',
    service: 'Papanicolau',
    need: 'Agendamento de exame',
    responsible: '',
    status: 'Novo',
  },
  {
    synthetic_id: 'LEAD-SYN-003',
    phone: '+55 00 90000-0003',
    origin: 'Não identificada',
    service: 'Outro',
    need: 'Origem precisa ser revisada',
    responsible: '',
    status: 'Novo',
  },
] as const
