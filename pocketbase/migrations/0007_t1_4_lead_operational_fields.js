migrate(
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')
    if (!leads.fields.getByName('service'))
      leads.fields.add(
        new SelectField({
          name: 'service',
          required: true,
          values: ['Citologia', 'Papanicolau', 'Outro'],
          maxSelect: 1,
        }),
      )
    if (!leads.fields.getByName('need'))
      leads.fields.add(new TextField({ name: 'need', required: true }))
    if (!leads.fields.getByName('responsible'))
      leads.fields.add(new TextField({ name: 'responsible' }))
    app.save(leads)
  },
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')
    if (leads.fields.getByName('service')) leads.fields.removeByName('service')
    if (leads.fields.getByName('need')) leads.fields.removeByName('need')
    if (leads.fields.getByName('responsible')) leads.fields.removeByName('responsible')
    app.save(leads)
  },
)
