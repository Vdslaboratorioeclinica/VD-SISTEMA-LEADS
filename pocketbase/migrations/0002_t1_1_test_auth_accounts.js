migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const password = $secrets.get('T1_1_TEST_PASSWORD')

    const accounts = [
      { email: 'ana.atendente@teste.vds.local', name: 'Ana Souza' },
      { email: 'marcos.gestor@teste.vds.local', name: 'Marcos Lima' },
    ]

    accounts.forEach((account) => {
      try {
        app.findAuthRecordByEmail('_pb_users_auth_', account.email)
        return // already seeded
      } catch (_) {}
      const record = new Record(users)
      record.setEmail(account.email)
      record.setPassword(password)
      record.setVerified(true)
      record.set('name', account.name)
      app.save(record)
    })
  },
  (app) => {
    try {
      app.delete(app.findAuthRecordByEmail('_pb_users_auth_', 'ana.atendente@teste.vds.local'))
    } catch (_) {}
    try {
      app.delete(app.findAuthRecordByEmail('_pb_users_auth_', 'marcos.gestor@teste.vds.local'))
    } catch (_) {}
  },
)
