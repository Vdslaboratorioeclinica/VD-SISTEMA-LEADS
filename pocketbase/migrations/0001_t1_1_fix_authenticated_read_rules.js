migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('synthetic_users')
    users.listRule = "@request.auth.id != ''"
    users.viewRule = "@request.auth.id != ''"
    app.save(users)

    const leads = app.findCollectionByNameOrId('leads')
    leads.listRule = "@request.auth.id != ''"
    leads.viewRule = "@request.auth.id != ''"
    app.save(leads)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('synthetic_users')
    users.listRule = null
    users.viewRule = null
    app.save(users)

    const leads = app.findCollectionByNameOrId('leads')
    leads.listRule = null
    leads.viewRule = null
    app.save(leads)
  },
)
