migrate(
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')
    leads.updateRule = "@request.auth.id != ''"
    app.save(leads)
  },
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')
    leads.updateRule = null
    app.save(leads)
  },
)
