import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, GripVertical, Phone, Plus } from 'lucide-react'
import { listLeads, listStages, moveLead, type CrmLead, type PipelineStage } from '@/services/crm'
export default function KanbanPage() {
  const [stages, setStages] = useState<PipelineStage[]>([]),
    [leads, setLeads] = useState<CrmLead[]>([])
  useEffect(() => {
    Promise.all([listStages(), listLeads()]).then(([s, l]) => {
      setStages(s)
      setLeads(l)
    })
  }, [])
  const grouped = useMemo(
    () =>
      Object.fromEntries(stages.map((s) => [s.id, leads.filter((l) => l.pipeline_stage === s.id)])),
    [stages, leads],
  )
  async function drop(leadId: string, stageId: string) {
    await moveLead(leadId, stageId)
    setLeads((x) => x.map((l) => (l.id === leadId ? { ...l, pipeline_stage: stageId } : l)))
  }
  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-violet-300">Pipeline</p>
          <h1 className="mt-1 text-3xl font-bold">Kanban de atendimento</h1>
          <p className="mt-2 text-slate-400">
            Arraste os cards entre as etapas configuradas pelo administrador.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950">
          <Plus className="h-4 w-4" />
          Novo lead
        </button>
      </header>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <section
            key={stage.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => void drop(e.dataTransfer.getData('leadId'), stage.id)}
            className="w-72 shrink-0 rounded-2xl bg-slate-900/50 p-3"
          >
            <header className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <i className="h-2.5 w-2.5 rounded-full" style={{ background: stage.color }} />
                {stage.name}
              </span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                {grouped[stage.id]?.length || 0}
              </span>
            </header>
            <div className="space-y-3">
              {(grouped[stage.id] || []).map((lead) => (
                <article
                  key={lead.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('leadId', lead.id)}
                  className="cursor-grab rounded-xl border border-slate-800 bg-[#101b2d] p-4 shadow-lg active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between">
                    <strong className="text-sm">{lead.name}</strong>
                    <GripVertical className="h-4 w-4 text-slate-600" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {lead.service} · {lead.origin}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {lead.phone}
                    </span>
                    {lead.next_action_at && (
                      <CalendarClock className="h-3.5 w-3.5 text-amber-300" />
                    )}
                  </div>
                </article>
              ))}
              {(grouped[stage.id] || []).length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-800 p-5 text-center text-xs text-slate-600">
                  Solte um lead aqui
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
      {stages.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-800 p-10 text-center text-slate-500">
          As etapas do Kanban estão sendo preparadas.
        </div>
      )}
    </div>
  )
}
