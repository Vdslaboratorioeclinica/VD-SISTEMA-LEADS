migrate(
  (app) => {
    const activeRule =
      "@request.auth.id != '' && @request.auth.status = 'Ativo' && (@request.auth.profile = 'Atendente' || @request.auth.profile = 'Gestor')"
    const managerRule =
      "@request.auth.id != '' && @request.auth.status = 'Ativo' && @request.auth.profile = 'Gestor'"

    const stages = new Collection({
      name: 'pipeline_stages',
      type: 'base',
      listRule: activeRule,
      viewRule: activeRule,
      createRule: managerRule,
      updateRule: managerRule,
      deleteRule: managerRule,
      fields: [
        new TextField({ name: 'name', required: true }),
        new TextField({ name: 'slug', required: true }),
        new NumberField({ name: 'position', required: true }),
        new TextField({ name: 'color', required: true }),
        new BoolField({ name: 'is_final', required: false }),
        new BoolField({ name: 'active', required: true }),
      ],
      indexes: ['CREATE UNIQUE INDEX idx_pipeline_stages_slug ON pipeline_stages (slug)'],
    })
    app.save(stages)

    const conversations = new Collection({
      name: 'conversations',
      type: 'base',
      listRule: activeRule,
      viewRule: activeRule,
      createRule: activeRule,
      updateRule: activeRule,
      deleteRule: managerRule,
      fields: [
        new RelationField({
          name: 'lead',
          required: true,
          collectionId: app.findCollectionByNameOrId('leads').id,
          cascadeDelete: false,
          maxSelect: 1,
        }),
        new TextField({ name: 'external_chat_id', required: false }),
        new SelectField({
          name: 'channel',
          required: true,
          values: ['WhatsApp Evolution', 'Manual'],
          maxSelect: 1,
        }),
        new NumberField({ name: 'unread_count', required: false }),
        new SelectField({
          name: 'ai_mode',
          required: true,
          values: ['assistindo', 'pausada', 'humano'],
          maxSelect: 1,
        }),
        new BoolField({ name: 'handoff_required', required: false }),
        new TextField({ name: 'assigned_to', required: false }),
        new TextField({ name: 'summary', required: false }),
        new DateField({ name: 'last_message_at', required: false }),
      ],
      indexes: [
        'CREATE INDEX idx_conversations_last_message ON conversations (last_message_at DESC)',
      ],
    })
    app.save(conversations)

    const messages = new Collection({
      name: 'messages',
      type: 'base',
      listRule: activeRule,
      viewRule: activeRule,
      createRule: activeRule,
      updateRule: activeRule,
      deleteRule: managerRule,
      fields: [
        new RelationField({
          name: 'conversation',
          required: true,
          collectionId: conversations.id,
          cascadeDelete: true,
          maxSelect: 1,
        }),
        new SelectField({
          name: 'direction',
          required: true,
          values: ['incoming', 'outgoing'],
          maxSelect: 1,
        }),
        new SelectField({
          name: 'sender_type',
          required: true,
          values: ['lead', 'ia', 'atendente', 'sistema'],
          maxSelect: 1,
        }),
        new TextField({ name: 'body', required: true }),
        new TextField({ name: 'external_id', required: false }),
        new SelectField({
          name: 'delivery_status',
          required: true,
          values: ['recebida', 'pendente', 'enviada', 'falhou'],
          maxSelect: 1,
        }),
      ],
      indexes: [
        'CREATE INDEX idx_messages_conversation_created ON messages (conversation, created)',
      ],
    })
    app.save(messages)

    const followUps = new Collection({
      name: 'follow_ups',
      type: 'base',
      listRule: activeRule,
      viewRule: activeRule,
      createRule: activeRule,
      updateRule: activeRule,
      deleteRule: managerRule,
      fields: [
        new RelationField({
          name: 'lead',
          required: true,
          collectionId: app.findCollectionByNameOrId('leads').id,
          cascadeDelete: false,
          maxSelect: 1,
        }),
        new RelationField({
          name: 'conversation',
          required: false,
          collectionId: conversations.id,
          cascadeDelete: false,
          maxSelect: 1,
        }),
        new DateField({ name: 'scheduled_at', required: true }),
        new SelectField({
          name: 'status',
          required: true,
          values: ['agendado', 'enviado', 'cancelado', 'falhou'],
          maxSelect: 1,
        }),
        new TextField({ name: 'rule_name', required: true }),
        new TextField({ name: 'message_template', required: true }),
        new TextField({ name: 'created_by', required: false }),
      ],
      indexes: ['CREATE INDEX idx_followups_schedule ON follow_ups (status, scheduled_at)'],
    })
    app.save(followUps)

    const rules = new Collection({
      name: 'follow_up_rules',
      type: 'base',
      listRule: activeRule,
      viewRule: activeRule,
      createRule: managerRule,
      updateRule: managerRule,
      deleteRule: managerRule,
      fields: [
        new TextField({ name: 'name', required: true }),
        new NumberField({ name: 'delay_days', required: true }),
        new TextField({ name: 'message_template', required: true }),
        new BoolField({ name: 'active', required: true }),
      ],
    })
    app.save(rules)

    const customFields = new Collection({
      name: 'custom_field_definitions',
      type: 'base',
      listRule: activeRule,
      viewRule: activeRule,
      createRule: managerRule,
      updateRule: managerRule,
      deleteRule: managerRule,
      fields: [
        new TextField({ name: 'field_key', required: true }),
        new TextField({ name: 'label', required: true }),
        new SelectField({
          name: 'field_type',
          required: true,
          values: ['texto', 'numero', 'data', 'selecao'],
          maxSelect: 1,
        }),
        new TextField({ name: 'options_json', required: false }),
        new BoolField({ name: 'required', required: false }),
        new BoolField({ name: 'active', required: true }),
        new NumberField({ name: 'position', required: true }),
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_custom_fields_key ON custom_field_definitions (field_key)',
      ],
    })
    app.save(customFields)

    const evolution = new Collection({
      name: 'evolution_connections',
      type: 'base',
      listRule: managerRule,
      viewRule: managerRule,
      createRule: managerRule,
      updateRule: managerRule,
      deleteRule: managerRule,
      fields: [
        new TextField({ name: 'instance_name', required: true }),
        new URLField({ name: 'base_url', required: true }),
        new SelectField({
          name: 'status',
          required: true,
          values: ['nao_configurada', 'conectando', 'conectada', 'erro'],
          maxSelect: 1,
        }),
        new TextField({ name: 'phone', required: false }),
        new DateField({ name: 'last_sync_at', required: false }),
      ],
    })
    app.save(evolution)

    const leads = app.findCollectionByNameOrId('leads')
    if (!leads.fields.getByName('pipeline_stage'))
      leads.fields.add(
        new RelationField({
          name: 'pipeline_stage',
          required: false,
          collectionId: stages.id,
          cascadeDelete: false,
          maxSelect: 1,
        }),
      )
    if (!leads.fields.getByName('custom_values_json'))
      leads.fields.add(new TextField({ name: 'custom_values_json', required: false }))
    if (!leads.fields.getByName('last_contact_at'))
      leads.fields.add(new DateField({ name: 'last_contact_at', required: false }))
    app.save(leads)

    const stageSeeds = [
      ['Novo lead', 'novo', 1, '#38BDF8', false],
      ['Em atendimento', 'em-atendimento', 2, '#A78BFA', false],
      ['Transbordo humano', 'transbordo-humano', 3, '#FB7185', false],
      ['Qualificado', 'qualificado', 4, '#FBBF24', false],
      ['Tentando agendar', 'tentando-agendar', 5, '#2DD4BF', false],
      ['Agendado', 'agendado', 6, '#34D399', true],
      ['Perdido', 'perdido', 7, '#94A3B8', true],
    ]
    stageSeeds.forEach((seed) => {
      const record = new Record(stages)
      record.set('name', seed[0])
      record.set('slug', seed[1])
      record.set('position', seed[2])
      record.set('color', seed[3])
      record.set('is_final', seed[4])
      record.set('active', true)
      app.save(record)
    })
    const rule = new Record(rules)
    rule.set('name', 'Retomar tentativa de agendamento')
    rule.set('delay_days', 3)
    rule.set(
      'message_template',
      'Oi, {{nome}}! Lembrei da nossa conversa. Posso ajudar você a concluir o agendamento?',
    )
    rule.set('active', true)
    app.save(rule)
    const fields = [
      ['convenio', 'Convênio', 'texto', 1],
      ['melhor_horario', 'Melhor horário para contato', 'texto', 2],
      ['unidade_preferida', 'Unidade preferida', 'selecao', 3],
    ]
    fields.forEach((item) => {
      const record = new Record(customFields)
      record.set('field_key', item[0])
      record.set('label', item[1])
      record.set('field_type', item[2])
      record.set('required', false)
      record.set('active', true)
      record.set('position', item[3])
      app.save(record)
    })
  },
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')
    for (const name of ['pipeline_stage', 'custom_values_json', 'last_contact_at'])
      if (leads.fields.getByName(name)) leads.fields.removeByName(name)
    app.save(leads)
    for (const name of [
      'messages',
      'follow_ups',
      'conversations',
      'follow_up_rules',
      'custom_field_definitions',
      'evolution_connections',
      'pipeline_stages',
    ]) {
      try {
        app.delete(app.findCollectionByNameOrId(name))
      } catch (_) {}
    }
  },
)
