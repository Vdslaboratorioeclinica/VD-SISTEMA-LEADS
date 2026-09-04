// pocketbase/hooks/funnel_rules.js
// T1.14 — Bloqueio de perda sem motivo (CA-1-015).
// Model hook: valida em qualquer $app.save() de um lead que o status "Perdido"
// exija loss_reason preenchido. Toda a lógica é inline no callback (scoping do JSVM).
onRecordUpdate((e) => {
  const record = e.record
  const status = record.get('status')
  const lossReason = record.get('loss_reason') || ''

  if (status === 'Perdido' && !String(lossReason).trim()) {
    throw new BadRequestError(
      'Para mover um lead para Perdido é obrigatório informar o motivo de perda.',
    )
  }

  e.next()
}, 'leads')
