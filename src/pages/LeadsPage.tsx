import AccessControlPanel from '@/components/AccessControlPanel'

export default function LeadsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#10B981]">Operação</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Operação de leads</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">
          Cadastre, pesquise e atualize leads, registre a primeira resposta e consulte acessos e
          auditoria.
        </p>
      </header>
      <AccessControlPanel />
    </div>
  )
}
