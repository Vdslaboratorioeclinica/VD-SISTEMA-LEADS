migrate(
  (app) => {
    const users = new Collection({
      type: 'base',
      name: 'synthetic_users',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
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
      indexes: ['CREATE UNIQUE INDEX idx_synthetic_users_id ON synthetic_users (synthetic_id)'],
    })
    db.save(users)

    const leads = new Collection({
      type: 'base',
      name: 'leads',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
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
      indexes: ['CREATE UNIQUE INDEX idx_leads_synthetic_id ON leads (synthetic_id)'],
    })
    db.save(leads)

    const usersData = [
      {
        synthetic_id: 'USR-SYN-001',
        name: 'Ana Souza',
        email: 'ana.atendente@teste.vds.local',
        profile: 'Atendente',
        status: 'Ativo',
      },
      {
        synthetic_id: 'USR-SYN-002',
        name: 'Marcos Lima',
        email: 'marcos.gestor@teste.vds.local',
        profile: 'Gestor',
        status: 'Ativo',
      },
    ]
    usersData.forEach((data) => {
      const record = new Record(users)
      record.load(data)
      db.save(record)
    })

    const lead = new Record(leads)
    lead.load({
      synthetic_id: 'LEAD-SYN-001',
      name: 'Pessoa Teste',
      phone: '+55 00 90000-0001',
      origin: 'Fixture manual',
      status: 'Novo',
      data_class: 'Sintético — não é paciente real',
    })
    db.save(lead)
  },
  (db) => {
    const users = db.findCollectionByNameOrId('synthetic_users')
    const leads = db.findCollectionByNameOrId('leads')
    db.delete(users)
    db.delete(leads)
  },
)
