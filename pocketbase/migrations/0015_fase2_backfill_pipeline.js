migrate(
  (app) => {
    const initialStage = app.findFirstRecordByData('pipeline_stages', 'slug', 'novo')
    const leads = app.findRecordsByFilter('leads', "pipeline_stage = ''", '-created', 500, 0)
    leads.forEach((lead) => {
      lead.set('pipeline_stage', initialStage.id)
      app.save(lead)
    })
  },
  (app) => {
    const leads = app.findRecordsByFilter('leads', "pipeline_stage != ''", '-created', 500, 0)
    leads.forEach((lead) => {
      lead.set('pipeline_stage', '')
      app.save(lead)
    })
  },
)
