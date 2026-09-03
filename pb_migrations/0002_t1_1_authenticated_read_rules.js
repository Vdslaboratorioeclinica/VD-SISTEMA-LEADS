migrate(
  (db) => {
    const users = db.findCollectionByNameOrId('synthetic_users')
    users.listRule = '@request.auth.id != ""'
    users.viewRule = '@request.auth.id != ""'
    users.createRule = null
    users.updateRule = null
    users.deleteRule = null
    db.save(users)

    const leads = db.findCollectionByNameOrId('leads')
    leads.listRule = '@request.auth.id != ""'
    leads.viewRule = '@request.auth.id != ""'
    leads.createRule = null
    leads.updateRule = null
    leads.deleteRule = null
    db.save(leads)
  },
  (db) => {
    const users = db.findCollectionByNameOrId('synthetic_users')
    users.listRule = null
    users.viewRule = null
    db.save(users)

    const leads = db.findCollectionByNameOrId('leads')
    leads.listRule = null
    leads.viewRule = null
    db.save(leads)
  },
)
