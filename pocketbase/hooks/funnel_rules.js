// Valida o contrato do funil no servidor, inclusive para chamadas diretas à API.
onRecordUpdate((e) => {
  const record = e.record
  const original = record.original()
  const previousStatus = String(original.get('status') || '')
  const nextStatus = String(record.get('status') || '')
  const lossReason = String(record.get('loss_reason') || '').trim()

  if (previousStatus !== nextStatus) {
    const allowedTransitions = {
      Novo: ['Em atendimento'],
      'Em atendimento': ['Qualificado', 'Perdido'],
      Qualificado: ['Tentando agendar', 'Perdido'],
      'Tentando agendar': ['Convertido', 'Perdido'],
      Convertido: [],
      Perdido: [],
    }
    const allowedNext = allowedTransitions[previousStatus] || []
    if (allowedNext.indexOf(nextStatus) === -1) {
      throw new BadRequestError(
        `Transição inválida: ${previousStatus} → ${nextStatus}. Consulte as transições permitidas do funil.`,
      )
    }
  }

  if (nextStatus === 'Perdido' && !lossReason) {
    throw new BadRequestError(
      'Para mover um lead para Perdido é obrigatório informar o motivo de perda.',
    )
  }

  e.next()
}, 'leads')
