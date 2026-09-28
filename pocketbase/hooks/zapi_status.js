// Consulta o status da instância Z-API usando credenciais dos secrets.
// GET /backend/v1/zapi/status — requer autenticação.
routerAdd(
  'GET',
  '/backend/v1/zapi/status',
  (e) => {
    const instanceId = $secrets.get('ID_INSTANCIA') || ''
    const token = $secrets.get('TOKEN_INSTANCIA') || ''

    if (!instanceId || !token) {
      throw e.unauthorizedError(
        'Credenciais Z-API não configuradas (ID_INSTANCIA/TOKEN_INSTANCIA).',
      )
    }

    let res
    try {
      res = $http.send({
        url: `https://api.z-api.io/instances/${instanceId}/token/${token}/status`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      throw e.badRequestError(
        'Falha ao contatar a Z-API: ' + (err && err.message ? err.message : 'erro desconhecido'),
      )
    }

    if (res.statusCode !== 200) {
      throw e.badRequestError('Z-API retornou status ' + res.statusCode + '.')
    }

    let parsed
    try {
      parsed = JSON.parse(res.body)
    } catch {
      throw e.badRequestError('Resposta inválida da Z-API.')
    }

    return e.json(200, {
      connected: parsed.connected === true,
      smartphoneConnected: parsed.smartphoneConnected === true,
      error: parsed.error || '',
    })
  },
  $apis.requireAuth(),
)
