routerAdd(
  'POST',
  '/backend/v1/t1/bootstrap',
  (e) => {
    const ensureCollection = (name, fields, indexes) => {
      try {
        return $app.findCollectionByNameOrId(name)
      } catch (_) {
        const collection = new Collection({
          type: 'base',
          name,
          listRule: '',
          viewRule: '',
          createRule: '',
          updateRule: '',
          deleteRule: '',
          fields,
          indexes,
        })
        $app.save(collection)
        return collection
      }
    }

    const users = ensureCollection(
      'synthetic_users',
      [
        new TextField({ name: 'synthetic_id', required: true }),
        new TextField({ name: 'name', required: true }),
        new TextField({ name: 'email', required: true }),
        new SelectField({
          name: 'profile',
          required: true,
          values: ['Atendente', 'Gestor'],
          maxSelect: 1,
        }),
        new SelectField({
          name: 'status',
          required: true,
          values: ['Ativo', 'Desativado'],
          maxSelect: 1,
        }),
      ],
      ['CREATE UNIQUE INDEX idx_synthetic_users_id ON synthetic_users (synthetic_id)'],
    )
    const leads = ensureCollection(
      'leads',
      [
        new TextField({ name: 'synthetic_id', required: true }),
        new TextField({ name: 'name', required: true }),
        new TextField({ name: 'phone', required: true }),
        new TextField({ name: 'origin', required: true }),
        new SelectField({
          name: 'status',
          required: true,
          values: ['Novo', 'Em atendimento', 'Convertido', 'Perdido'],
          maxSelect: 1,
        }),
        new TextField({ name: 'data_class', required: true }),
      ],
      ['CREATE UNIQUE INDEX idx_leads_synthetic_id ON leads (synthetic_id)'],
    )

    const seed = (collection, key, data) => {
      const existing = $app.findFirstRecordByFilter(collection.name, `synthetic_id = '${key}'`)
      if (existing) return existing
      const record = new Record(collection)
      record.load(data)
      $app.save(record)
      return record
    }

    seed(users, 'USR-SYN-001', {
      synthetic_id: 'USR-SYN-001',
      name: 'Ana Souza',
      email: 'ana.atendente@teste.vds.local',
      profile: 'Atendente',
      status: 'Ativo',
    })
    seed(users, 'USR-SYN-002', {
      synthetic_id: 'USR-SYN-002',
      name: 'Marcos Lima',
      email: 'marcos.gestor@teste.vds.local',
      profile: 'Gestor',
      status: 'Ativo',
    })
    seed(leads, 'LEAD-SYN-001', {
      synthetic_id: 'LEAD-SYN-001',
      name: 'Pessoa Teste',
      phone: '+55 00 90000-0001',
      origin: 'Fixture manual',
      status: 'Novo',
      data_class: 'Sintético — não é paciente real',
    })

    return e.json(200, { ok: true, users: 2, leads: 1 })
  },
  $apis.requireAuth(),
)
