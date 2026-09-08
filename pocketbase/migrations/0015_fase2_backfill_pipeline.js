migrate(
  (app) => {
    const activeRule =
      "@request.auth.id != '' && @request.auth.status = 'Ativo' && (@request.auth.profile = 'Atendente' || @request.auth.profile = 'Gestor')"
    const managerRule =
      "@request.auth.id != '' && @request.auth.status = 'Ativo' && @request.auth.profile = 'Gestor'"
    const leadsCollection = app.findCollectionByNameOrId('leads')
    const stages = app.findCollectionByNameOrId('pipeline_stages')
    stages.listRule = activeRule
    stages.viewRule = activeRule
    stages.createRule = managerRule
    stages.updateRule = managerRule
    stages.deleteRule = managerRule
    if (!stages.fields.getByName('name'))
      stages.fields.add(new TextField({ name: 'name', required: true }))
    if (!stages.fields.getByName('slug'))
      stages.fields.add(new TextField({ name: 'slug', required: true }))
    if (!stages.fields.getByName('position'))
      stages.fields.add(new NumberField({ name: 'position', required: true }))
    if (!stages.fields.getByName('color'))
      stages.fields.add(new TextField({ name: 'color', required: true }))
    if (!stages.fields.getByName('is_final'))
      stages.fields.add(new BoolField({ name: 'is_final', required: false }))
    if (!stages.fields.getByName('active'))
      stages.fields.add(new BoolField({ name: 'active', required: true }))
    stages.indexes = ['CREATE INDEX idx_pipeline_stages_slug ON pipeline_stages (slug)']
    app.save(stages)

    const conversations = app.findCollectionByNameOrId('conversations')
    conversations.listRule = activeRule
    conversations.viewRule = activeRule
    conversations.createRule = activeRule
    conversations.updateRule = activeRule
    conversations.deleteRule = managerRule
    if (!conversations.fields.getByName('lead'))
      conversations.fields.add(
        new RelationField({
          name: 'lead',
          required: true,
          collectionId: leadsCollection.id,
          cascadeDelete: false,
          maxSelect: 1,
        }),
      )
    if (!conversations.fields.getByName('external_chat_id'))
      conversations.fields.add(new TextField({ name: 'external_chat_id', required: false }))
    if (!conversations.fields.getByName('channel'))
      conversations.fields.add(
        new SelectField({
          name: 'channel',
          required: true,
          values: ['WhatsApp Evolution', 'Manual'],
          maxSelect: 1,
        }),
      )
    if (!conversations.fields.getByName('unread_count'))
      conversations.fields.add(new NumberField({ name: 'unread_count', required: false }))
    if (!conversations.fields.getByName('ai_mode'))
      conversations.fields.add(
        new SelectField({
          name: 'ai_mode',
          required: true,
          values: ['assistindo', 'pausada', 'humano'],
          maxSelect: 1,
        }),
      )
    if (!conversations.fields.getByName('handoff_required'))
      conversations.fields.add(new BoolField({ name: 'handoff_required', required: false }))
    if (!conversations.fields.getByName('assigned_to'))
      conversations.fields.add(new TextField({ name: 'assigned_to', required: false }))
    if (!conversations.fields.getByName('summary'))
      conversations.fields.add(new TextField({ name: 'summary', required: false }))
    if (!conversations.fields.getByName('last_message_at'))
      conversations.fields.add(new DateField({ name: 'last_message_at', required: false }))
    app.save(conversations)

    const messages = app.findCollectionByNameOrId('messages')
    messages.listRule = activeRule
    messages.viewRule = activeRule
    messages.createRule = activeRule
    messages.updateRule = activeRule
    messages.deleteRule = managerRule
    if (!messages.fields.getByName('conversation'))
      messages.fields.add(
        new RelationField({
          name: 'conversation',
          required: true,
          collectionId: conversations.id,
          cascadeDelete: true,
          maxSelect: 1,
        }),
      )
    if (!messages.fields.getByName('direction'))
      messages.fields.add(
        new SelectField({
          name: 'direction',
          required: true,
          values: ['incoming', 'outgoing'],
          maxSelect: 1,
        }),
      )
    if (!messages.fields.getByName('sender_type'))
      messages.fields.add(
        new SelectField({
          name: 'sender_type',
          required: true,
          values: ['lead', 'ia', 'atendente', 'sistema'],
          maxSelect: 1,
        }),
      )
    if (!messages.fields.getByName('body'))
      messages.fields.add(new TextField({ name: 'body', required: true }))
    if (!messages.fields.getByName('external_id'))
      messages.fields.add(new TextField({ name: 'external_id', required: false }))
    if (!messages.fields.getByName('delivery_status'))
      messages.fields.add(
        new SelectField({
          name: 'delivery_status',
          required: true,
          values: ['recebida', 'pendente', 'enviada', 'falhou'],
          maxSelect: 1,
        }),
      )
    app.save(messages)

    const followUps = app.findCollectionByNameOrId('follow_ups')
    followUps.listRule = activeRule
    followUps.viewRule = activeRule
    followUps.createRule = activeRule
    followUps.updateRule = activeRule
    followUps.deleteRule = managerRule
    if (!followUps.fields.getByName('lead'))
      followUps.fields.add(
        new RelationField({
          name: 'lead',
          required: true,
          collectionId: leadsCollection.id,
          cascadeDelete: false,
          maxSelect: 1,
        }),
      )
    if (!followUps.fields.getByName('conversation'))
      followUps.fields.add(
        new RelationField({
          name: 'conversation',
          required: false,
          collectionId: conversations.id,
          cascadeDelete: false,
          maxSelect: 1,
        }),
      )
    if (!followUps.fields.getByName('scheduled_at'))
      followUps.fields.add(new DateField({ name: 'scheduled_at', required: true }))
    if (!followUps.fields.getByName('status'))
      followUps.fields.add(
        new SelectField({
          name: 'status',
          required: true,
          values: ['agendado', 'enviado', 'cancelado', 'falhou'],
          maxSelect: 1,
        }),
      )
    if (!followUps.fields.getByName('rule_name'))
      followUps.fields.add(new TextField({ name: 'rule_name', required: true }))
    if (!followUps.fields.getByName('message_template'))
      followUps.fields.add(new TextField({ name: 'message_template', required: true }))
    if (!followUps.fields.getByName('created_by'))
      followUps.fields.add(new TextField({ name: 'created_by', required: false }))
    app.save(followUps)

    const rules = app.findCollectionByNameOrId('follow_up_rules')
    rules.listRule = activeRule
    rules.viewRule = activeRule
    rules.createRule = managerRule
    rules.updateRule = managerRule
    rules.deleteRule = managerRule
    if (!rules.fields.getByName('name'))
      rules.fields.add(new TextField({ name: 'name', required: true }))
    if (!rules.fields.getByName('delay_days'))
      rules.fields.add(new NumberField({ name: 'delay_days', required: true }))
    if (!rules.fields.getByName('message_template'))
      rules.fields.add(new TextField({ name: 'message_template', required: true }))
    if (!rules.fields.getByName('active'))
      rules.fields.add(new BoolField({ name: 'active', required: true }))
    app.save(rules)

    const customFields = app.findCollectionByNameOrId('custom_field_definitions')
    customFields.listRule = activeRule
    customFields.viewRule = activeRule
    customFields.createRule = managerRule
    customFields.updateRule = managerRule
    customFields.deleteRule = managerRule
    if (!customFields.fields.getByName('field_key'))
      customFields.fields.add(new TextField({ name: 'field_key', required: true }))
    if (!customFields.fields.getByName('label'))
      customFields.fields.add(new TextField({ name: 'label', required: true }))
    if (!customFields.fields.getByName('field_type'))
      customFields.fields.add(
        new SelectField({
          name: 'field_type',
          required: true,
          values: ['texto', 'numero', 'data', 'selecao'],
          maxSelect: 1,
        }),
      )
    if (!customFields.fields.getByName('options_json'))
      customFields.fields.add(new TextField({ name: 'options_json', required: false }))
    if (!customFields.fields.getByName('required'))
      customFields.fields.add(new BoolField({ name: 'required', required: false }))
    if (!customFields.fields.getByName('active'))
      customFields.fields.add(new BoolField({ name: 'active', required: true }))
    if (!customFields.fields.getByName('position'))
      customFields.fields.add(new NumberField({ name: 'position', required: true }))
    app.save(customFields)

    const evolution = app.findCollectionByNameOrId('evolution_connections')
    evolution.listRule = managerRule
    evolution.viewRule = managerRule
    evolution.createRule = managerRule
    evolution.updateRule = managerRule
    evolution.deleteRule = managerRule
    if (!evolution.fields.getByName('instance_name'))
      evolution.fields.add(new TextField({ name: 'instance_name', required: true }))
    if (!evolution.fields.getByName('base_url'))
      evolution.fields.add(new URLField({ name: 'base_url', required: true }))
    if (!evolution.fields.getByName('status'))
      evolution.fields.add(
        new SelectField({
          name: 'status',
          required: true,
          values: ['nao_configurada', 'conectando', 'conectada', 'erro'],
          maxSelect: 1,
        }),
      )
    if (!evolution.fields.getByName('phone'))
      evolution.fields.add(new TextField({ name: 'phone', required: false }))
    if (!evolution.fields.getByName('last_sync_at'))
      evolution.fields.add(new DateField({ name: 'last_sync_at', required: false }))
    app.save(evolution)

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
      try {
        app.findFirstRecordByData('pipeline_stages', 'slug', seed[1])
      } catch (_) {
        const r = new Record(stages)
        r.set('name', seed[0])
        r.set('slug', seed[1])
        r.set('position', seed[2])
        r.set('color', seed[3])
        r.set('is_final', seed[4])
        r.set('active', true)
        app.save(r)
      }
    })
    try {
      app.findFirstRecordByData('follow_up_rules', 'name', 'Retomar tentativa de agendamento')
    } catch (_) {
      const r = new Record(rules)
      r.set('name', 'Retomar tentativa de agendamento')
      r.set('delay_days', 3)
      r.set(
        'message_template',
        'Oi, {{nome}}! Lembrei da nossa conversa. Posso ajudar você a concluir o agendamento?',
      )
      r.set('active', true)
      app.save(r)
    }
    const fieldSeeds = [
      ['convenio', 'Convênio', 'texto', 1],
      ['melhor_horario', 'Melhor horário para contato', 'texto', 2],
      ['unidade_preferida', 'Unidade preferida', 'selecao', 3],
    ]
    fieldSeeds.forEach((seed) => {
      try {
        app.findFirstRecordByData('custom_field_definitions', 'field_key', seed[0])
      } catch (_) {
        const r = new Record(customFields)
        r.set('field_key', seed[0])
        r.set('label', seed[1])
        r.set('field_type', seed[2])
        r.set('required', false)
        r.set('active', true)
        r.set('position', seed[3])
        app.save(r)
      }
    })
    const initialStage = app.findFirstRecordByData('pipeline_stages', 'slug', 'novo')
    const leads = app.findRecordsByFilter('leads', "pipeline_stage = ''", '-created', 500, 0)
    leads.forEach((lead) => {
      lead.set('pipeline_stage', initialStage.id)
      app.save(lead)
    })
  },
  (app) => {
    const leads = app.findRecordsByFilter('leads', "pipeline_stage != ''", '-created', 500, 0)
    leads.forEach((lead) => {
      lead.set('pipeline_stage', '')
      app.save(lead)
    })
  },
)
