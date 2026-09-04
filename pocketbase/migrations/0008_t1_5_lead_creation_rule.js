migrate(
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')
    leads.createRule = "@request.auth.id != ''"
    app.save(leads)

    const auditEvents = app.findCollectionByNameOrId('audit_events')
    const action = auditEvents.fields.getByName('action')
    if (action && !action.values.includes('lead.created')) action.values.push('lead.created')
    app.save(auditEvents)
  },
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')
    leads.createRule = null
    app.save(leads)

    const auditEvents = app.findCollectionByNameOrId('audit_events')
    const action = auditEvents.fields.getByName('action')
    if (action) action.values = action.values.filter((value) => value !== 'lead.created')
    app.save(auditEvents)
  },
)
