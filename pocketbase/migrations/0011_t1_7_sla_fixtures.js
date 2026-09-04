migrate(
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')
    if (!leads.fields.getByName('intake_at'))
      leads.fields.add(new DateField({ name: 'intake_at', required: false }))
    if (!leads.fields.getByName('first_response_at'))
      leads.fields.add(new DateField({ name: 'first_response_at', required: false }))
    if (!leads.fields.getByName('first_response_duration_seconds'))
      leads.fields.add(
        new NumberField({ name: 'first_response_duration_seconds', required: false }),
      )
    if (!leads.fields.getByName('sla_status'))
      leads.fields.add(
        new SelectField({
          name: 'sla_status',
          required: false,
          values: ['atendido_no_prazo', 'estourado', 'pendente_contingencia'],
          maxSelect: 1,
        }),
      )
    if (!leads.fields.getByName('contingency_mode'))
      leads.fields.add(new BoolField({ name: 'contingency_mode', required: false }))
    app.save(leads)

    const fixtures = [
      {
        synthetic_id: 'LEAD-SLA-002M',
        name: 'Fixture SLA 2 minutos',
        phone: '+5500900000002',
        email: '',
        origin: 'WhatsApp',
        service: 'Citologia',
        need: 'Fixture sintética — resposta dentro do SLA',
        responsible: 'Ana Souza',
        status: 'Em atendimento',
        data_class: 'Sintético — não é paciente real',
        duplicate_resolution: 'pending',
        linked_lead_id: '',
        new_justification: '',
        record_state: 'active',
        archive_reason: '',
        intake_at: '2026-09-04 13:00:00.000Z',
        first_response_at: '2026-09-04 13:02:00.000Z',
        first_response_duration_seconds: 120,
        sla_status: 'atendido_no_prazo',
        contingency_mode: false,
      },
      {
        synthetic_id: 'LEAD-SLA-006M',
        name: 'Fixture SLA 6 minutos',
        phone: '+5500900000006',
        email: '',
        origin: 'Instagram',
        service: 'Papanicolau',
        need: 'Fixture sintética — resposta após o SLA',
        responsible: 'Marcos Lima',
        status: 'Em atendimento',
        data_class: 'Sintético — não é paciente real',
        duplicate_resolution: 'pending',
        linked_lead_id: '',
        new_justification: '',
        record_state: 'active',
        archive_reason: '',
        intake_at: '2026-09-04 13:00:00.000Z',
        first_response_at: '2026-09-04 13:06:00.000Z',
        first_response_duration_seconds: 360,
        sla_status: 'estourado',
        contingency_mode: false,
      },
      {
        synthetic_id: 'LEAD-SLA-CONTINGENCY',
        name: 'Fixture contingência manual',
        phone: '+5500900000007',
        email: '',
        origin: 'Não identificada',
        service: 'Outro',
        need: 'Fixture sintética — canal indisponível',
        responsible: '',
        status: 'Novo',
        data_class: 'Sintético — não é paciente real',
        duplicate_resolution: 'pending',
        linked_lead_id: '',
        new_justification: '',
        record_state: 'active',
        archive_reason: '',
        intake_at: '2026-09-04 13:10:00.000Z',
        first_response_at: '',
        first_response_duration_seconds: 0,
        sla_status: 'pendente_contingencia',
        contingency_mode: true,
      },
    ]

    fixtures.forEach((data) => {
      try {
        app.findFirstRecordByData('leads', 'synthetic_id', data.synthetic_id)
      } catch {
        const record = new Record(leads)
        record.load(data)
        app.save(record)
      }
    })
  },
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')
    for (const name of [
      'intake_at',
      'first_response_at',
      'first_response_duration_seconds',
      'sla_status',
      'contingency_mode',
    ]) {
      if (leads.fields.getByName(name)) leads.fields.removeByName(name)
    }
    app.save(leads)
  },
)
