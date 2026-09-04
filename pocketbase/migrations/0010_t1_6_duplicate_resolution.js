migrate(
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')
    if (!leads.fields.getByName('duplicate_resolution'))
      leads.fields.add(
        new SelectField({
          name: 'duplicate_resolution',
          required: false,
          values: ['pending', 'linked', 'new_justified'],
          maxSelect: 1,
        }),
      )
    if (!leads.fields.getByName('linked_lead_id'))
      leads.fields.add(new TextField({ name: 'linked_lead_id', required: false }))
    if (!leads.fields.getByName('new_justification'))
      leads.fields.add(new TextField({ name: 'new_justification', required: false }))
    if (!leads.fields.getByName('record_state'))
      leads.fields.add(
        new SelectField({
          name: 'record_state',
          required: true,
          values: ['active', 'archived'],
          maxSelect: 1,
        }),
      )
    if (!leads.fields.getByName('archive_reason'))
      leads.fields.add(new TextField({ name: 'archive_reason', required: false }))
    app.save(leads)

    const auditEvents = app.findCollectionByNameOrId('audit_events')
    const action = auditEvents.fields.getByName('action')
    for (const value of [
      'lead.duplicate_detected',
      'lead.linked',
      'lead.new_justified',
      'lead.archived',
    ]) {
      if (action && !action.values.includes(value)) action.values.push(value)
    }
    app.save(auditEvents)
  },
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')
    for (const name of [
      'duplicate_resolution',
      'linked_lead_id',
      'new_justification',
      'record_state',
      'archive_reason',
    ]) {
      if (leads.fields.getByName(name)) leads.fields.removeByName(name)
    }
    app.save(leads)
  },
)
