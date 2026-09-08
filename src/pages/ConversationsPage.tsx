import { useEffect, useState } from 'react'
import { Bot, MessageCircle, Search, Send, UserRound, WandSparkles } from 'lucide-react'
import {
  listConversations,
  listMessages,
  sendManualMessage,
  type Conversation,
  type Message,
} from '@/services/crm'

export default function ConversationsPage() {
  const [items, setItems] = useState<Conversation[]>([]),
    [selected, setSelected] = useState<Conversation | null>(null),
    [messages, setMessages] = useState<Message[]>([]),
    [text, setText] = useState(''),
    [loading, setLoading] = useState(true)
  useEffect(() => {
    listConversations()
      .then((x) => {
        setItems(x)
        setSelected(x[0] || null)
      })
      .finally(() => setLoading(false))
  }, [])
  useEffect(() => {
    if (selected) listMessages(selected.id).then(setMessages)
    else setMessages([])
  }, [selected])
  async function send() {
    if (!selected || !text.trim()) return
    const m = await sendManualMessage(selected.id, text.trim())
    setMessages((x) => [...x, m])
    setText('')
  }
  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-medium text-cyan-300">Atendimento</p>
        <h1 className="mt-1 text-3xl font-bold">Conversas</h1>
        <p className="mt-2 text-slate-400">
          WhatsApp conectado pela Evolution, com IA assistindo e transbordo humano.
        </p>
      </header>
      <div className="grid min-h-[680px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 lg:grid-cols-[340px_1fr_300px]">
        <aside className="border-b border-slate-800 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-800 p-4">
            <div className="flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-slate-500">
              <Search className="h-4 w-4" />
              <span className="text-sm">Buscar conversa</span>
            </div>
          </div>
          <div className="p-2">
            {loading ? (
              <p className="p-4 text-sm text-slate-500">Carregando…</p>
            ) : items.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="mx-auto h-8 w-8 text-slate-600" />
                <p className="mt-3 text-sm text-slate-300">Nenhuma conversa ainda</p>
                <p className="mt-1 text-xs text-slate-500">
                  As conversas aparecerão quando a Evolution estiver conectada.
                </p>
              </div>
            ) : (
              items.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`w-full rounded-xl p-3 text-left ${selected?.id === c.id ? 'bg-cyan-400/10' : 'hover:bg-slate-800/60'}`}
                >
                  <div className="flex justify-between">
                    <strong className="text-sm">{c.expand?.lead?.name || 'Contato'}</strong>
                    {c.unread_count > 0 && (
                      <span className="rounded-full bg-cyan-400 px-2 text-xs text-slate-950">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {c.summary || 'Conversa sem resumo'}
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>
        <section className="flex min-h-[500px] flex-col">
          {selected ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 p-4">
                <div>
                  <strong>{selected.expand?.lead?.name || 'Contato'}</strong>
                  <p className="text-xs text-slate-500">
                    {selected.channel} ·{' '}
                    {selected.ai_mode === 'humano' ? 'Atendimento humano' : 'IA assistindo'}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${selected.handoff_required ? 'bg-rose-400/10 text-rose-300' : 'bg-emerald-400/10 text-emerald-300'}`}
                >
                  {selected.handoff_required ? 'Precisa de humano' : 'IA ativa'}
                </span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${m.direction === 'outgoing' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-200'}`}
                    >
                      {m.body}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-800 p-4">
                <div className="flex gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && void send()}
                    placeholder="Escreva uma mensagem…"
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={() => void send()}
                    className="rounded-xl bg-cyan-400 px-4 text-slate-950"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center text-center">
              <div>
                <MessageCircle className="mx-auto h-10 w-10 text-slate-700" />
                <p className="mt-3 text-slate-400">Selecione uma conversa</p>
              </div>
            </div>
          )}
        </section>
        <aside className="border-t border-slate-800 p-5 lg:border-l lg:border-t-0">
          <h2 className="text-sm font-semibold">Contexto do lead</h2>
          {selected ? (
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex gap-3">
                <UserRound className="h-4 w-4 text-cyan-300" />
                <span>{selected.expand?.lead?.phone || 'Telefone não informado'}</span>
              </div>
              <div className="rounded-xl bg-slate-950 p-4">
                <div className="flex items-center gap-2 text-xs text-violet-300">
                  <WandSparkles className="h-4 w-4" />
                  Resumo da IA
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {selected.summary || 'O resumo será criado conforme a conversa evoluir.'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 p-4">
                <div className="flex items-center gap-2 text-xs text-emerald-300">
                  <Bot className="h-4 w-4" />
                  Modo de atendimento
                </div>
                <p className="mt-2 text-xs text-slate-400">{selected.ai_mode}</p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500">
              Abra uma conversa para ver os dados coletados.
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}
