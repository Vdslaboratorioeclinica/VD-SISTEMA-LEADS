migrate(
  (app) => {
    const auth = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!auth.fields.getByName('status')) {
      auth.fields.add(
        new SelectField({
          name: 'status',
          required: true,
          values: ['Ativo', 'Desativado'],
          maxSelect: 1,
        }),
      )
      app.save(auth)
    }

    const profiles = [
      {
        email: 'ana.atendente@teste.vds.local',
        profile: 'Atendente',
        status: 'Ativo',
      },
      {
        email: 'marcos.gestor@teste.vds.local',
        profile: 'Gestor',
        status: 'Ativo',
      },
    ]
    profiles.forEach((data) => {
      try {
        const record = app.findAuthRecordByEmail('_pb_users_auth_', data.email)
        record.set('profile', data.profile)
        record.set('status', data.status)
        app.save(record)
      } catch (_) {}
    })

    const activeUserRule =
      "@request.auth.id != '' && @request.auth.status = 'Ativo' && (@request.auth.profile = 'Atendente' || @request.auth.profile = 'Gestor')"

    const leads = app.findCollectionByNameOrId('leads')
    leads.listRule = activeUserRule
    leads.viewRule = activeUserRule
    leads.createRule = activeUserRule
    leads.updateRule = activeUserRule
    leads.deleteRule = null
    app.save(leads)

    const syntheticUsers = app.findCollectionByNameOrId('synthetic_users')
    syntheticUsers.listRule = activeUserRule
    syntheticUsers.viewRule = activeUserRule
    syntheticUsers.createRule = null
    syntheticUsers.updateRule = null
    syntheticUsers.deleteRule = null
    app.save(syntheticUsers)

    const audit = app.findCollectionByNameOrId('audit_events')
    audit.listRule =
      "@request.auth.id != '' && @request.auth.status = 'Ativo' && @request.auth.profile = 'Gestor'"
    audit.viewRule = audit.listRule
    audit.createRule =
      "@request.auth.id != '' && @request.auth.status = 'Ativo' && actor_id = @request.auth.id && actor_email = @request.auth.email && actor_profile = @request.auth.profile"
    audit.updateRule = null
    audit.deleteRule = null
    app.save(audit)
  },
  (app) => {
    const auth = app.findCollectionByNameOrId('_pb_users_auth_')
    if (auth.fields.getByName('status')) auth.fields.removeByName('status')
    app.save(auth)

    const leads = app.findCollectionByNameOrId('leads')
    leads.listRule = "@request.auth.id != ''"
    leads.viewRule = "@request.auth.id != ''"
    leads.createRule = "@request.auth.id != ''"
    leads.updateRule = "@request.auth.id != ''"
    leads.deleteRule = null
    app.save(leads)

    const syntheticUsers = app.findCollectionByNameOrId('synthetic_users')
    syntheticUsers.listRule = "@request.auth.id != ''"
    syntheticUsers.viewRule = "@request.auth.id != ''"
    syntheticUsers.createRule = null
    syntheticUsers.updateRule = null
    syntheticUsers.deleteRule = null
    app.save(syntheticUsers)

    const audit = app.findCollectionByNameOrId('audit_events')
    audit.listRule = "@request.auth.profile = 'Gestor'"
    audit.viewRule = "@request.auth.profile = 'Gestor'"
    audit.createRule =
      "@request.auth.id != '' && actor_id = @request.auth.id && actor_email = @request.auth.email && actor_profile = @request.auth.profile"
    audit.updateRule = null
    audit.deleteRule = null
    app.save(audit)
  },
)
