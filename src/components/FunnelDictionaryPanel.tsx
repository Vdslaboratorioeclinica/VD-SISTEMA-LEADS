import { ArrowRight, CheckCircle2, Info, ShieldCheck } from 'lucide-react'
import {
  funnelFinalStates,
  funnelInitialStatus,
  funnelLossReasons,
  funnelNextActionByState,
  funnelStateDetails,
  funnelStates,
  funnelTransitions,
} from '@/data/funnelDictionary'

export default function FunnelDictionaryPanel() {
  return (
    <section className="space-y-6" aria-labelledby="funnel-dictionary-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#10B981]">
            T1.13 · Dicionário do funil
          </p>
          <h2 id="funnel-dictionary-title" className="mt-1 text-xl font-semibold text-[#F1F5F9]">
            Homologação de estados, transições, motivos e próxima ação
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[#94A3B8]">
            Dicionário do funil para aprovação da VDS. A aplicação das regras (bloqueio de perda sem
            motivo e histórico de transições) é da task T1.14.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-300">
          <ShieldCheck className="h-3.5 w-3.5" /> Fixtures sintéticos
        </span>
      </div>

      <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 p-4 text-sm text-[#A7F3D0]">
        <Info className="mr-1 inline h-4 w-4" />
        Estado inicial obrigatório: <strong>{funnelInitialStatus}</strong>. Estados finais:{' '}
        <strong>{funnelFinalStates.join(', ')}</strong> — perdido exige motivo.
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {funnelStates.map((state) => {
          const isInitial = state === funnelInitialStatus
          const isFinal = funnelFinalStates.includes(state)
          return (
            <article key={state} className="rounded-xl border border-[#243352] bg-[#111A2C] p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-[#F1F5F9]">{state}</h3>
                {isInitial && (
                  <span className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2.5 py-1 text-[11px] font-semibold text-[#10B981]">
                    Inicial
                  </span>
                )}
                {isFinal && (
                  <span className="rounded-full border border-purple-400/30 bg-purple-400/10 px-2.5 py-1 text-[11px] font-semibold text-purple-300">
                    Final
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-[#CBD5E1]">{funnelStateDetails[state]}</p>
              <p className="mt-3 text-xs text-[#94A3B8]">
                <strong className="text-[#10B981]">Próxima ação:</strong>{' '}
                {funnelNextActionByState[state]}
              </p>
            </article>
          )
        })}
      </div>

      <div className="rounded-xl border border-[#243352] bg-[#111A2C] p-5">
        <h3 className="font-semibold text-[#F1F5F9]">Transições permitidas</h3>
        <p className="mt-1 text-xs text-[#94A3B8]">
          Percurso aprovado novo → atendendo → qualificado → tentando agendar → convertido/perdido.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          {funnelTransitions.map((transition) => (
            <span
              key={`${transition.from}-${transition.to}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#243352] bg-[#0B1120]/60 px-3 py-1.5"
            >
              <span className="text-[#F1F5F9]">{transition.from}</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#10B981]" />
              <span className="text-[#CBD5E1]">{transition.to}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#243352] bg-[#111A2C] p-5">
        <h3 className="font-semibold text-[#F1F5F9]">Motivos de perda (lista controlada)</h3>
        <p className="mt-1 text-xs text-[#94A3B8]">
          Obrigatório ao mover para <strong>Perdido</strong> — validação aplicada na task T1.14.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {funnelLossReasons.map((reason) => (
            <span
              key={reason}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-200"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> {reason}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
