import React from 'react'
import { Crosshair, LogOut, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import AccessControlPanel from '@/components/AccessControlPanel'
import FunnelDictionaryPanel from '@/components/FunnelDictionaryPanel'
import TraceabilityPanel from '@/components/TraceabilityPanel'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col min-h-screen bg-[#0B1120] text-[#F1F5F9]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#243352] bg-[#111A2C]/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Crosshair className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">LeadsPro</span>
            <span className="ml-2 rounded-full bg-[#10B981]/15 px-2 py-0.5 text-[10px] font-semibold text-[#10B981] border border-[#10B981]/30">
              Gestão de Leads
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-[#F1F5F9]">
              {(user?.name as string) || (user?.email as string) || 'Usuário'}
            </span>
            <span className="text-xs text-[#94A3B8]">
              {(user?.email as string) || 'Autenticado'}
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg bg-[#1A2537] hover:bg-[#EF4444]/20 hover:text-[#EF4444] border border-[#243352] px-3.5 py-2 text-xs font-medium text-[#94A3B8] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
        {/* Welcome Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#111A2C] via-[#111A2C] to-[#1A2537] border border-[#243352] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 px-3 py-1 text-xs text-[#10B981] font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Sessão iniciada com sucesso via PocketBase
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Painel de Gestão de Atendimento VDS
            </h1>
            <p className="text-sm md:text-base text-[#94A3B8]">
              Central de conversão de leads do laboratório VDS. Acompanhe cobertura de status,
              primeira resposta, próxima ação e exceções do funil.
            </p>
          </div>
        </div>

        {/* Real traceability panel (T1.15) — replaces the mock metrics grid */}
        <TraceabilityPanel />

        <AccessControlPanel />

        <FunnelDictionaryPanel />
      </main>
    </div>
  )
}
