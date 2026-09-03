import React from 'react'
import {
  Crosshair,
  LogOut,
  Users,
  Target,
  TrendingUp,
  Building,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

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
              Painel Geral de Oportunidades
            </h1>
            <p className="text-sm md:text-base text-[#94A3B8]">
              Bem-vindo ao sistema de Gestão de Leads da LeadsPro. Centralize seus contatos
              comerciais e monitore suas conversões em tempo real.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl bg-[#111A2C] border border-[#243352] p-5 shadow-sm">
            <div className="flex items-center justify-between text-[#94A3B8] mb-3">
              <span className="text-xs font-medium uppercase tracking-wider">Total de Leads</span>
              <Users className="h-4 w-4 text-[#10B981]" />
            </div>
            <div className="text-2xl font-bold text-[#F1F5F9]">1.428</div>
            <p className="text-xs text-[#10B981] mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" /> +14.2% este mês
            </p>
          </div>

          <div className="rounded-xl bg-[#111A2C] border border-[#243352] p-5 shadow-sm">
            <div className="flex items-center justify-between text-[#94A3B8] mb-3">
              <span className="text-xs font-medium uppercase tracking-wider">
                Qualificados (MQL)
              </span>
              <Target className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-[#F1F5F9]">482</div>
            <p className="text-xs text-[#94A3B8] mt-1 font-medium">33.7% taxa de qualificação</p>
          </div>

          <div className="rounded-xl bg-[#111A2C] border border-[#243352] p-5 shadow-sm">
            <div className="flex items-center justify-between text-[#94A3B8] mb-3">
              <span className="text-xs font-medium uppercase tracking-wider">
                Oportunidades SQL
              </span>
              <Building className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-[#F1F5F9]">126</div>
            <p className="text-xs text-[#10B981] mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" /> 18 propostas ativas
            </p>
          </div>

          <div className="rounded-xl bg-[#111A2C] border border-[#243352] p-5 shadow-sm">
            <div className="flex items-center justify-between text-[#94A3B8] mb-3">
              <span className="text-xs font-medium uppercase tracking-wider">
                Valor em Pipeline
              </span>
              <TrendingUp className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-[#F1F5F9]">R$ 840.500</div>
            <p className="text-xs text-[#94A3B8] mt-1 font-medium">Ciclo médio de 24 dias</p>
          </div>
        </div>

        {/* Recent leads table preview */}
        <div className="rounded-2xl bg-[#111A2C] border border-[#243352] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.25)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#F1F5F9]">Contatos Recentes</h2>
              <p className="text-xs text-[#94A3B8]">Leads capturados nas últimas 24 horas</p>
            </div>
            <span className="text-xs text-[#10B981] font-medium flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Atualizado agora
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#94A3B8]">
              <thead className="border-b border-[#243352] text-xs uppercase text-[#94A3B8]/80 font-medium">
                <tr>
                  <th className="py-3 px-4">Lead</th>
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Valor Estimado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243352]/60">
                <tr className="hover:bg-[#1A2537]/50 transition-colors">
                  <td className="py-3 px-4 text-[#F1F5F9] font-medium">Ana Martins</td>
                  <td className="py-3 px-4">TechNova Soluções</td>
                  <td className="py-3 px-4">
                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400 font-medium">
                      Qualificado
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#F1F5F9]">R$ 48.000 / ano</td>
                </tr>
                <tr className="hover:bg-[#1A2537]/50 transition-colors">
                  <td className="py-3 px-4 text-[#F1F5F9] font-medium">Julio Silva</td>
                  <td className="py-3 px-4">Mercado Livre B2B</td>
                  <td className="py-3 px-4">
                    <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400 font-medium">
                      Proposta enviada
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#F1F5F9]">R$ 120.000 / ano</td>
                </tr>
                <tr className="hover:bg-[#1A2537]/50 transition-colors">
                  <td className="py-3 px-4 text-[#F1F5F9] font-medium">Renata Costa</td>
                  <td className="py-3 px-4">Startup X Logística</td>
                  <td className="py-3 px-4">
                    <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-xs text-purple-400 font-medium">
                      Em negociação
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#F1F5F9]">R$ 32.500 / ano</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
