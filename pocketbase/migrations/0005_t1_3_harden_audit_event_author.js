migrate(
  (app) => {
    const audit = app.findCollectionByNameOrId('audit_events')
    audit.createRule =
      "@request.auth.id != '' && actor_id = @request.auth.id && actor_email = @request.auth.email && actor_profile = @request.auth.profile"
    app.save(audit)
  },
  (app) => {
    const audit = app.findCollectionByNameOrId('audit_events')
    audit.createRule = "@request.auth.id != ''"
    app.save(audit)
  },
)
