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
    const profiles = [
      { email: 'ana.atendente@teste.vds.local', profile: 'Atendente' },
      { email: 'marcos.gestor@teste.vds.local', profile: 'Gestor' },
    ]
    profiles.forEach((data) => {
      try {
        const record = app.findAuthRecordByEmail('_pb_users_auth_', data.email)
        record.set('profile', data.profile)
        app.save(record)
      } catch (_) {}
    })
  },
  (app) => {
    const auth = app.findCollectionByNameOrId('_pb_users_auth_')
    if (auth.fields.getByName('profile')) {
      auth.fields.removeByName('profile')
      app.save(auth)
    }
  },
)
