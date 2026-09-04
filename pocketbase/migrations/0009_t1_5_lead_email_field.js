migrate(
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')
    if (!leads.fields.getByName('email'))
      leads.fields.add(new EmailField({ name: 'email', required: false }))
    app.save(leads)
  },
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')
    if (leads.fields.getByName('email')) leads.fields.removeByName('email')
    app.save(leads)
  },
)
