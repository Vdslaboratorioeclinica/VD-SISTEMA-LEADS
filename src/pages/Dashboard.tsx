import { ArrowRight, BarChart3, CheckCircle2, GitBranch, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const modules = [
  {
    to: '/leads',
    title: 'Operação de leads',
    description: 'Cadastro, busca, fila, SLA, perfis e trilha de auditoria.',
    icon: Users,
  },
  {
    to: '/rastreabilidade',
    title: 'Rastreabilidade',
    description: 'Indicadores, filtros, exceções e exportação para o Gestor.',
    icon: BarChart3,
  },
  {
    to: '/funil',
    title: 'Funil comercial',
    description: 'Estados, transições permitidas, próximas ações e motivos de perda.',
    icon: GitBranch,
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <section className="rounded-2xl border border-[#243352] bg-gradient-to-r from-[#111A2C] via-[#111A2C] to-[#1A2537] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)] sm:p-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/30 bg-[#10B981]/15 px-3 py-1 text-xs font-medium text-[#10B981]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Fundação do funil ativa
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Painel de Gestão de Atendimento VDS
          </h1>
          <p className="text-sm text-[#94A3B8] md:text-base">
            Acesse cada área do sistema pelas rotas abaixo. Os módulos deixaram de ficar
            concentrados em uma única página.
          </p>
        </div>
      </section>

      <section aria-labelledby="modules-title">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#10B981]" />
          <h2 id="modules-title" className="text-xl font-semibold text-[#F1F5F9]">
            Áreas do sistema
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {modules.map(({ to, title, description, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-xl border border-[#243352] bg-[#111A2C] p-5 transition hover:-translate-y-0.5 hover:border-[#10B981]/50 hover:shadow-[0_10px_30px_rgba(16,185,129,0.08)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10B981]/10 text-[#10B981]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-[#F1F5F9]">{title}</h3>
              <p className="mt-2 min-h-10 text-sm text-[#94A3B8]">{description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#10B981]">
                Abrir área{' '}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
