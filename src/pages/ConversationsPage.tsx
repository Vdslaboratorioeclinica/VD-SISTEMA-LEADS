import { Inbox, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function ConversationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Operação</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
          <MessageCircle className="h-6 w-6 text-cyan-300" /> Conversas
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Atendimento conversacional com leads e clientes, integrado ao WhatsApp.
        </p>
      </header>

      <div className="grid place-items-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center">
        <Inbox className="h-12 w-12 text-slate-600" />
        <h2 className="mt-4 text-lg font-semibold text-slate-200">
          Conversas chegam aqui no Sprint 5
        </h2>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          A interface réplica do WhatsApp (lista de conversas, histórico, envio e status de leitura)
          será implementada após a integração Z-API, no Sprint 5 do plano aprovado. Nenhuma conversa
          real trafega antes disso.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/configuracoes/whatsapp">
            <Button type="button" variant="outline">
              Ver configuração da integração
            </Button>
          </Link>
          <Link to="/leads">
            <Button type="button" variant="secondary">
              Ir para Leads
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
