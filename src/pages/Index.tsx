import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Crosshair,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  Building2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface FloatingLead {
  id: string
  name: string
  company: string
  avatar: string
  deal: string
  badge: string
  badgeColor: string
  animClass: string
}

const FLOATING_LEADS: FloatingLead[] = [
  {
    id: '1',
    name: 'Ana Martins',
    company: 'TechNova Soluções',
    avatar: 'AM',
    deal: 'R$ 48.000 / ano',
    badge: 'Qualificado',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    animClass: 'animate-drift-1',
  },
  {
    id: '2',
    name: 'Julio Silva',
    company: 'Mercado Livre B2B',
    avatar: 'JS',
    deal: 'R$ 120.000 / ano',
    badge: 'Proposta enviada',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    animClass: 'animate-drift-2',
  },
  {
    id: '3',
    name: 'Renata Costa',
    company: 'Startup X Logística',
    avatar: 'RC',
    deal: 'R$ 32.500 / ano',
    badge: 'Em negociação',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    animClass: 'animate-drift-3',
  },
]

const REMEMBER_EMAIL_KEY = 'leadspro_remember_email'

export default function LoginPage() {
  const { login, isValid } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Validation & status states
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [shake, setShake] = useState(false)

  const passwordInputRef = useRef<HTMLInputElement>(null)

  // Redirect if already logged in
  useEffect(() => {
    if (isValid) {
      navigate('/', { replace: true })
    }
  }, [isValid, navigate])

  // Restore remembered email on mount
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY)
      if (savedEmail) {
        setEmail(savedEmail)
        setRememberMe(true)
      }
    } catch {
      // localStorage may be unavailable in some private contexts
    }
  }, [])

  // Validation functions
  const validateEmail = (value: string): string | null => {
    const trimmed = value.trim()
    if (!trimmed) {
      return 'Informe um e-mail válido.'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      return 'Informe um e-mail válido.'
    }
    return null
  }

  const validatePassword = (value: string): string | null => {
    if (!value) {
      return 'A senha deve ter pelo menos 6 caracteres.'
    }
    if (value.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres.'
    }
    return null
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (hasAttemptedSubmit) {
      setEmailError(validateEmail(value))
    }
    if (serverError) setServerError(null)
  }

  const handleEmailBlur = () => {
    if (hasAttemptedSubmit) {
      setEmailError(validateEmail(email))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (hasAttemptedSubmit) {
      setPasswordError(validatePassword(value))
    }
    if (serverError) setServerError(null)
  }

  const handlePasswordBlur = () => {
    if (hasAttemptedSubmit) {
      setPasswordError(validatePassword(password))
    }
  }

  const triggerShake = () => {
    setShake(true)
    window.setTimeout(() => setShake(false), 350)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHasAttemptedSubmit(true)
    setServerError(null)

    const eErr = validateEmail(email)
    const pErr = validatePassword(password)
    setEmailError(eErr)
    setPasswordError(pErr)

    if (eErr || pErr) {
      triggerShake()
      return
    }

    setIsSubmitting(true)

    try {
      await login(email, password)

      // Manage remember me
      try {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim())
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY)
        }
      } catch {
        // ignore storage errors
      }

      setIsSuccess(true)

      // Brief green checkmark feedback before navigation
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 550)
    } catch (err: unknown) {
      setIsSubmitting(false)
      triggerShake()

      let message = 'E-mail ou senha inválidos. Verifique e tente novamente.'

      if (err && typeof err === 'object') {
        const errorObj = err as { status?: number; isAbort?: boolean; message?: string }
        if (errorObj.status === 400) {
          message = 'E-mail ou senha inválidos. Verifique e tente novamente.'
        } else if (errorObj.status === 429) {
          message = 'Muitas tentativas. Aguarde alguns segundos.'
        } else if (
          errorObj.message?.toLowerCase().includes('failed to fetch') ||
          errorObj.message?.toLowerCase().includes('network') ||
          errorObj.status === 0
        ) {
          message = 'Não foi possível conectar ao servidor. Tente novamente.'
        } else if (errorObj.message) {
          message = `Erro ao autenticar: ${errorObj.message}`
        }
      }

      setServerError(message)
    }
  }

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault()
    toast({
      title: 'Recuperação de senha',
      description: 'Recuperação de senha indisponível no momento. Contate o administrador.',
      variant: 'default',
    })
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col lg:flex-row bg-[#0B1120] text-[#F1F5F9] selection:bg-[#10B981]/30 selection:text-white overflow-hidden">
      {/* Subtle background glow effect over entire viewport */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 15%, rgba(16, 185, 129, 0.12), transparent 45%), radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.08), transparent 40%)',
        }}
        aria-hidden="true"
      />

      {/* LEFT PANEL: Brand / Visual Presentation (desktop/tablet >= 1024px, 40-50% width) */}
      <aside
        className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 border-r border-[#243352]/60 z-10 overflow-hidden"
        style={{
          backgroundColor: '#0B1120',
          backgroundImage:
            'radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.15), transparent 60%)',
        }}
        aria-label="Apresentação institucional LeadsPro"
      >
        {/* Brand header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] shadow-[0_0_20px_rgba(16,185,129,0.35)]">
            <Crosshair className="h-6 w-6 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-white">LeadsPro</span>
              <span className="rounded-full bg-[#10B981]/15 px-2 py-0.5 text-[11px] font-semibold text-[#10B981] border border-[#10B981]/30">
                SaaS B2B
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">Gestão inteligente de leads</p>
          </div>
        </div>

        {/* Center content: Headlines & Animated Floating Lead Cards */}
        <div className="my-auto py-8">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#111A2C] border border-[#243352] px-3.5 py-1.5 text-xs text-[#94A3B8] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#10B981]" />
              <span>Pipeline de vendas e conversão acelerada</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-bold tracking-tight leading-[1.2] text-[#F1F5F9]">
              Gerencie seus leads com inteligência.
            </h1>

            <p className="text-base xl:text-lg text-[#94A3B8] leading-relaxed">
              Centralize, qualifique e converta seus contatos em oportunidades reais, tudo em um só
              lugar.
            </p>
          </div>

          {/* Floating cards decoration */}
          <div className="relative mt-10 space-y-3.5 max-w-lg">
            {FLOATING_LEADS.map((lead) => (
              <div
                key={lead.id}
                className={`relative flex items-center justify-between rounded-xl bg-[#111A2C]/90 border border-[#243352] px-4 py-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-300 hover:border-[#10B981]/50 ${lead.animClass}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1A2537] to-[#243352] border border-[#3B4A6B] font-semibold text-sm text-[#F1F5F9] shadow-inner">
                    {lead.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#F1F5F9]">{lead.name}</h4>
                    <p className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                      <Building2 className="h-3 w-3 text-[#94A3B8]" />
                      {lead.company}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${lead.badgeColor}`}
                  >
                    {lead.badge}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-[#94A3B8]">
                    <TrendingUp className="h-3 w-3 text-[#10B981]" />
                    {lead.deal}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex items-center gap-6 text-xs text-[#94A3B8]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#10B981]" />
              <span>Criptografia de ponta a ponta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-[#10B981]" />
              <span>99.9% Uptime garantido</span>
            </div>
          </div>
        </div>

        {/* Footer line */}
        <div className="flex items-center justify-between pt-4 border-t border-[#243352]/40 text-xs text-[#94A3B8]">
          <span>© 2024 LeadsPro. Todos os direitos reservados.</span>
          <span className="hover:text-[#F1F5F9] transition-colors cursor-default">
            Privacidade & Segurança
          </span>
        </div>
      </aside>

      {/* RIGHT PANEL: Authentication Form (100% mobile, 50% desktop) */}
      <section
        className="relative flex flex-1 flex-col items-center justify-center p-4 sm:p-8 lg:p-12 z-10 animate-fade-in"
        aria-label="Formulário de acesso"
      >
        {/* Mobile brand header (visible only on screens < 1024px) */}
        <header className="flex flex-col items-center gap-2 mb-8 lg:hidden text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] shadow-[0_0_24px_rgba(16,185,129,0.4)]">
            <Crosshair className="h-7 w-7 text-white stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">LeadsPro</span>
            <span className="rounded-full bg-[#10B981]/15 px-2 py-0.5 text-[11px] font-semibold text-[#10B981] border border-[#10B981]/30">
              SaaS B2B
            </span>
          </div>
          <p className="text-xs text-[#94A3B8]">Gestão de Leads</p>
        </header>

        {/* Form Container: constrained to ~400px width with custom card styling */}
        <div
          className={`w-full max-w-[420px] rounded-2xl bg-[#111A2C] border border-[#243352] p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition-all duration-300 ${
            shake ? 'animate-shake' : ''
          }`}
          style={{
            animationDuration: '500ms',
            animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div className="mb-6 text-left">
            <h2 className="text-2xl font-semibold tracking-tight text-[#F1F5F9]">
              Bem-vindo de volta
            </h2>
            <p className="mt-1.5 text-sm text-[#94A3B8]">Acesse sua conta para continuar.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Server Error Alert Banner */}
            {serverError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 p-3.5 text-sm text-[#EF4444] animate-slide-down shadow-sm"
              >
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-[#EF4444]" />
                <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
                  {serverError}
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="login-email" className="block text-sm font-medium text-[#F1F5F9]">
                E-mail
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#94A3B8]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  placeholder="seu@email.com"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'email-error' : undefined}
                  className={`w-full rounded-lg bg-[#1A2537] pl-10 pr-4 py-2.5 text-sm text-[#F1F5F9] placeholder:text-[#94A3B8]/60 border transition-all duration-150 outline-none ${
                    emailError
                      ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/30'
                      : 'border-[#243352] hover:border-[#3B4A6B] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/30'
                  }`}
                />
              </div>
              {emailError && (
                <p
                  id="email-error"
                  role="alert"
                  className="text-xs text-[#EF4444] font-medium pt-0.5 animate-slide-down flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3 inline" />
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-[#F1F5F9]"
                >
                  Senha
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-[#94A3B8] hover:text-[#10B981] transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Esqueci minha senha?
                </button>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#94A3B8]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  ref={passwordInputRef}
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  placeholder="••••••••"
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                  className={`w-full rounded-lg bg-[#1A2537] pl-10 pr-20 py-2.5 text-sm text-[#F1F5F9] placeholder:text-[#94A3B8]/60 border transition-all duration-150 outline-none ${
                    passwordError
                      ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/30'
                      : 'border-[#243352] hover:border-[#3B4A6B] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute inset-y-0 right-0 flex items-center gap-1 px-3 text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] transition-colors focus-visible:outline-none"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>Ocultar</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      <span>Mostrar</span>
                    </>
                  )}
                </button>
              </div>
              {passwordError && (
                <p
                  id="password-error"
                  role="alert"
                  className="text-xs text-[#EF4444] font-medium pt-0.5 animate-slide-down flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3 inline" />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-[#243352] bg-[#1A2537] text-[#10B981] accent-[#10B981] focus:ring-[#10B981]/30 focus:ring-offset-0 transition cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="text-xs sm:text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors cursor-pointer select-none"
              >
                Lembrar de mim
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className={`w-full flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.25)] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]/50 ${
                isSuccess
                  ? 'bg-[#22C55E] hover:bg-[#22C55E]'
                  : 'bg-[#10B981] hover:bg-[#059669] active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    aria-hidden="true"
                  />
                  <span>Entrando…</span>
                </>
              ) : isSuccess ? (
                <>
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Acesso concedido!</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-[#243352]/50 text-center text-xs text-[#94A3B8]">
            <span>Ambiente seguro LeadsPro • Versão 2.4</span>
          </div>
        </div>

        {/* Small mobile copyright */}
        <p className="mt-6 text-center text-xs text-[#94A3B8] lg:hidden">
          © 2024 LeadsPro. Todos os direitos reservados.
        </p>
      </section>
    </div>
  )
}
