import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Inbox, Loader2, RefreshCw, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import pb from '@/lib/pocketbase/client'

type ConnectionStatus = {
  connected: boolean
  smartphoneConnected: boolean
  error?: string
}

export default function WhatsAppConfigPanel() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStatus = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await pb.send('/backend/v1/zapi/status', { method: 'GET' })
      setStatus(result as ConnectionStatus)
    } catch {
      setError('Não foi possível consultar o status da instância Z-API.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  return (
    <section className="space-y-6" aria-labelledby="whatsapp-config-title">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="whatsapp-config-title"
              className="flex items-center gap-2 font-semibold text-slate-100"
            >
              <Inbox className="h-5 w-5 text-cyan-300" /> Instância Z-API
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Credenciais armazenadas com segurança nos secrets do projeto (ID_INSTANCIA e
              TOKEN_INSTANCIA). O número de teste autorizado é 55 96 98436-6759.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadStatus()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Atualizar
          </Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Status da conexão
            </p>
            {isLoading && (
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Consultando…
              </p>
            )}
            {!isLoading && !error && status && (
              <p
                className={`mt-2 flex items-center gap-2 text-sm font-semibold ${status.connected ? 'text-emerald-300' : 'text-rose-300'}`}
              >
                {status.connected ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
                {status.connected ? 'Conectado ao WhatsApp' : 'Desconectado'}
              </p>
            )}
            {!isLoading && !error && status && (
              <p className="mt-1 text-xs text-slate-500">
                Celular conectado: {status.smartphoneConnected ? 'Sim' : 'Não'}
                {status.error ? ` · ${status.error}` : ''}
              </p>
            )}
            {!isLoading && error && (
              <p className="mt-2 flex items-center gap-2 text-sm text-amber-300">
                <AlertTriangle className="h-4 w-4" /> {error}
              </p>
            )}
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Webhook de recepção
            </p>
            <p className="mt-2 text-sm text-slate-300">Configuração no Sprint 4</p>
            <p className="mt-1 text-xs text-slate-500">
              O endpoint{' '}
              <code className="rounded bg-slate-800 px-1 py-0.5 text-[11px] text-cyan-300">
                /backend/v1/zapi/webhook
              </code>{' '}
              será criado na integração, com validação de secret e idempotência.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h3 className="font-semibold text-slate-100">Política de contato VDS</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-400">
          <li>• WhatsApp somente no número de teste autorizado pela governança.</li>
          <li>• Máximo de 3 tentativas por lead sem resposta, intervalo mínimo de 48h.</li>
          <li>• Follow-up D+3 limitado a 1 por lead, entre 9h e 17h (America/Belem).</li>
          <li>• Opt-out por SAIR e equivalentes entra na suppression list em até 24h.</li>
          <li>
            • Proibido: diagnóstico por mensagem, resultado de exame sem canal seguro, promessa
            terapêutica.
          </li>
        </ul>
      </div>
    </section>
  )
}
