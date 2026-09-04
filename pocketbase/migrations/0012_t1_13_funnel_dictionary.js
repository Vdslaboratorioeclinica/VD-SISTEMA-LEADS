migrate(
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')

    // 1. Estados do funil homologados (T1.13)
    const statusField = leads.fields.getByName('status')
    if (statusField) {
      statusField.values = [
        'Novo',
        'Em atendimento',
        'Qualificado',
        'Tentando agendar',
        'Convertido',
        'Perdido',
      ]
      statusField.required = true
      statusField.maxSelect = 1
    }

    // 2. Motivo de perda — lista controlada homologada (obrigado na T1.14)
    if (!leads.fields.getByName('loss_reason'))
      leads.fields.add(
        new SelectField({
          name: 'loss_reason',
          required: false,
          values: [
            'Não respondeu',
            'Sem interesse',
            'Sem recurso no momento',
            'Pediu para não contatar',
            'Outro',
          ],
          maxSelect: 1,
        }),
      )

    // 3. Próxima ação — texto curto e data alvo
    if (!leads.fields.getByName('next_action'))
      leads.fields.add(new TextField({ name: 'next_action', required: false, max: 200 }))
    if (!leads.fields.getByName('next_action_at'))
      leads.fields.add(new DateField({ name: 'next_action_at', required: false }))

    app.save(leads)
  },
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')

    const statusField = leads.fields.getByName('status')
    if (statusField) statusField.values = ['Novo', 'Em atendimento', 'Convertido', 'Perdido']

    for (const name of ['loss_reason', 'next_action', 'next_action_at']) {
      if (leads.fields.getByName(name)) leads.fields.removeByName(name)
    }

    app.save(leads)
  },
)
