// Torna o campo `need` (Necessidade) opcional na coleção leads.
// Decisão da gestão VDS em 28/09/2026, após teste humano do Sprint 1.
// Reescreve o registro pendente 0014 (arquivo ausente no working tree desde 08/09).
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('leads')
    const needField = col.fields.getByName('need')
    needField.required = false
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('leads')
    const needField = col.fields.getByName('need')
    needField.required = true
    app.save(col)
  },
)
