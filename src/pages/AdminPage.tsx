import { useEffect, useState } from 'react'
import { Cable, Database, GitBranch, Plus, Save, SlidersHorizontal } from 'lucide-react'
import {
  createCustomField,
  createRule,
  createStage,
  listCustomFields,
  listEvolution,
  listRules,
  listStages,
  saveEvolution,
  type CustomField,
  type EvolutionConnection,
  type FollowUpRule,
  type PipelineStage,
} from '@/services/crm'
export default function AdminPage() {
  const [stages, setStages] = useState<PipelineStage[]>([]),
    [fields, setFields] = useState<CustomField[]>([]),
    [rules, setRules] = useState<FollowUpRule[]>([]),
    [connections, setConnections] = useState<EvolutionConnection[]>([]),
    [stageName, setStageName] = useState(''),
    [fieldName, setFieldName] = useState(''),
    [url, setUrl] = useState(''),
    [instance, setInstance] = useState('')
  useEffect(() => {
    Promise.all([listStages(), listCustomFields(), listRules(), listEvolution()]).then(
      ([a, b, c, d]) => {
        setStages(a)
        setFields(b)
        setRules(c)
        setConnections(d)
      },
    )
  }, [])
  async function addStage() {
    if (!stageName.trim()) return
    const x = await createStage({
      name: stageName,
      slug: stageName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-'),
      position: stages.length + 1,
      color: '#38BDF8',
    })
    setStages((v) => [...v, x])
    setStageName('')
  }
  async function addField() {
    if (!fieldName.trim()) return
    const x = await createCustomField({
      field_key: `campo_${Date.now()}`,
      label: fieldName,
      field_type: 'texto',
      position: fields.length + 1,
    })
    setFields((v) => [...v, x])
    setFieldName('')
  }
  async function addEvolution() {
    if (!instance.trim() || !url.trim()) return
    const x = await saveEvolution({ instance_name: instance, base_url: url })
    setConnections((v) => [x, ...v])
    setInstance('')
    setUrl('')
  }
  return (
    <div className="space-y-7">
      <header>
        <p className="text-sm font-medium text-cyan-300">Configurações</p>
        <h1 className="mt-1 text-3xl font-bold">Administração</h1>
        <p className="mt-2 text-slate-400">Adapte o CRM à operação da VDS sem alterar código.</p>
      </header>
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <GitBranch className="h-5 w-5 text-violet-300" />
            Etapas do Kanban
          </h2>
          <div className="mt-4 space-y-2">
            {stages.map((x) => (
              <div key={x.id} className="flex items-center gap-3 rounded-xl bg-slate-950 p-3">
                <i className="h-3 w-3 rounded-full" style={{ background: x.color }} />
                <span className="flex-1 text-sm">{x.name}</span>
                <span className="text-xs text-slate-600">{x.position}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="Nova etapa"
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
            <button
              onClick={() => void addStage()}
              className="rounded-xl bg-violet-400 px-3 text-slate-950"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <SlidersHorizontal className="h-5 w-5 text-cyan-300" />
            Campos personalizados
          </h2>
          <div className="mt-4 space-y-2">
            {fields.map((x) => (
              <div key={x.id} className="flex justify-between rounded-xl bg-slate-950 p-3">
                <span className="text-sm">{x.label}</span>
                <span className="text-xs text-slate-500">{x.field_type}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="Nome do novo campo"
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
            <button
              onClick={() => void addField()}
              className="rounded-xl bg-cyan-400 px-3 text-slate-950"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <Cable className="h-5 w-5 text-emerald-300" />
            Evolution API
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            O token deve ser configurado como secret no Skip Cloud; ele nunca é salvo nesta tela.
          </p>
          {connections.map((x) => (
            <div key={x.id} className="mt-4 rounded-xl bg-slate-950 p-3">
              <div className="flex justify-between">
                <strong className="text-sm">{x.instance_name}</strong>
                <span className="text-xs text-amber-300">{x.status}</span>
              </div>
              <p className="mt-1 text-xs text-slate-600">{x.base_url}</p>
            </div>
          ))}
          <div className="mt-4 space-y-2">
            <input
              value={instance}
              onChange={(e) => setInstance(e.target.value)}
              placeholder="Nome da instância"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL da Evolution"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
            <button
              onClick={() => void addEvolution()}
              className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              <Save className="h-4 w-4" />
              Salvar conexão
            </button>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <Database className="h-5 w-5 text-amber-300" />
            Regras de follow-up
          </h2>
          {rules.map((x) => (
            <div key={x.id} className="mt-4 rounded-xl bg-slate-950 p-4">
              <div className="flex justify-between">
                <strong className="text-sm">{x.name}</strong>
                <span className="text-xs text-amber-300">{x.delay_days} dias</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{x.message_template}</p>
            </div>
          ))}
          <p className="mt-4 text-xs text-slate-600">
            A criação avançada de regras será liberada após validar o primeiro envio pela Evolution.
          </p>
        </section>
      </div>
    </div>
  )
}
