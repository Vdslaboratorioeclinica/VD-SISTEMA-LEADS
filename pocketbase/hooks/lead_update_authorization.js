// Aplica no servidor a permissão leads.assign da matriz de acesso.
onRecordUpdateRequest((e) => {
  if (!e.auth || e.auth.get('status') !== 'Ativo') {
    throw new ForbiddenError('Usuário sem perfil ativo para operar o sistema.')
  }

  const profile = String(e.auth.get('profile') || '')
  if (profile !== 'Atendente' && profile !== 'Gestor') {
    throw new ForbiddenError('Perfil sem autorização para operar leads.')
  }

  if (profile === 'Atendente') {
    const previousResponsible = String(e.record.original().get('responsible') || '')
    const nextResponsible = String(e.record.get('responsible') || '')
    if (previousResponsible !== nextResponsible) {
      throw new ForbiddenError('Somente o Gestor pode atribuir ou trocar o responsável do lead.')
    }
  }

  e.next()
}, 'leads')
