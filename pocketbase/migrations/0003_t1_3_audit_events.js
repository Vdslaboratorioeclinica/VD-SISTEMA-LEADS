migrate(
  (app) => {
    const auth = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!auth.fields.getByName('profile')) {
      auth.fields.add(
        new SelectField({
          name: 'profile',
          required: true,
          values: ['Atendente', 'Gestor'],
          maxSelect: 1,
        }),
      )
      app.save(auth)
    }

    const users = [
      { email: 'ana.atendente@teste.vds.local', profile: 'Atendente' },
      { email: 'marcos.gestor@teste.vds.local', profile: 'Gestor' },
    ]
    users.forEach((data) => {
      try {
        const record = app.findAuthRecordByEmail('_pb_users_auth_', data.email)
        record.set('profile', data.profile)
        app.save(record)
      } catch (_) {}
    })

    let existing = null
    try {
      existing = app.findCollectionByNameOrId('audit_events')
    } catch (_) {}
    if (!existing) {
      const audit = new Collection({
        name: 'audit_events',
        type: 'base',
        listRule: "@request.auth.profile = 'Gestor'",
        viewRule: "@request.auth.profile = 'Gestor'",
        createRule: "@request.auth.id != ''",
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'actor_id', type: 'text', required: true },
          { name: 'actor_email', type: 'email', required: true },
          {
            name: 'actor_profile',
            type: 'select',
            required: true,
            values: ['Atendente', 'Gestor'],
            maxSelect: 1,
          },
          {
            name: 'action',
            type: 'select',
            required: true,
            values: ['lead.status_changed', 'lead.contact_changed', 'permission.denied'],
            maxSelect: 1,
          },
          { name: 'entity', type: 'text', required: true },
          { name: 'entity_id', type: 'text', required: true },
          { name: 'previous_value', type: 'text' },
          { name: 'new_value', type: 'text' },
          {
            name: 'result',
            type: 'select',
            required: true,
            values: ['success', 'denied'],
            maxSelect: 1,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: false, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_audit_events_created ON audit_events (created DESC)'],
      })
      app.save(audit)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('audit_events'))
    } catch (_) {}
  },
)
