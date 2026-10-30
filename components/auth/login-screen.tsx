'use client'

import * as React from 'react'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Zap,
  User,
  ShoppingCart,
  ChefHat,
  Wrench,
  CreditCard,
  BadgePercent,
  Warehouse,
  Truck,
  Receipt,
  BarChart3,
  ShieldAlert,
  Wallet,
  Bike,
  FileText,
  Users,
  Package,
  ArrowLeftRight,
  UserCog,
  Calculator,
  ClipboardList,
  Settings,
} from 'lucide-react'
import { Logo } from '@/components/jeralpos/brand'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Button } from '@/components/jeralpos/button'
import { Input, Label, FieldHint } from '@/components/jeralpos/input'
import { cn } from '@/lib/utils'
import { authApi } from '@/lib/api'

const DEMO_EMAIL = 'admin@qubitpos.co'
const DEMO_PASSWORD = 'qubitpos'

interface ModuleItem {
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  glowClass: string
}

const LEFT_COLUMN_MODULES: ModuleItem[] = [
  {
    title: 'Ventas',
    subtitle: 'Vende rápido en mostrador',
    icon: ShoppingCart,
    iconBg: 'bg-blue-500',
    glowClass: 'shadow-[0_0_18px_rgba(59,130,246,0.55)]',
  },
  {
    title: 'Preparación',
    subtitle: 'Comandas, mesas y cocina',
    icon: ChefHat,
    iconBg: 'bg-orange-500',
    glowClass: 'shadow-[0_0_18px_rgba(249,115,22,0.55)]',
  },
  {
    title: 'Órdenes de servicio',
    subtitle: 'Reparaciones y garantías',
    icon: Wrench,
    iconBg: 'bg-slate-500',
    glowClass: 'shadow-[0_0_18px_rgba(100,116,139,0.55)]',
  },
  {
    title: 'Cobros',
    subtitle: 'Abonos y cartera',
    icon: CreditCard,
    iconBg: 'bg-pink-500',
    glowClass: 'shadow-[0_0_18px_rgba(236,72,153,0.55)]',
  },
  {
    title: 'V. Precios',
    subtitle: 'Listas y promociones',
    icon: BadgePercent,
    iconBg: 'bg-amber-500',
    glowClass: 'shadow-[0_0_18px_rgba(245,158,11,0.55)]',
  },
  {
    title: 'Inventario',
    subtitle: 'Existencias, lotes y bodegas',
    icon: Warehouse,
    iconBg: 'bg-emerald-500',
    glowClass: 'shadow-[0_0_18px_rgba(16,185,129,0.55)]',
  },
  {
    title: 'Proveedores',
    subtitle: 'Compras y cuentas por pagar',
    icon: Truck,
    iconBg: 'bg-indigo-500',
    glowClass: 'shadow-[0_0_18px_rgba(99,102,241,0.55)]',
  },
  {
    title: 'Nómina',
    subtitle: 'Nómina electrónica y prestaciones',
    icon: Receipt,
    iconBg: 'bg-lime-500',
    glowClass: 'shadow-[0_0_18px_rgba(132,204,22,0.55)]',
  },
  {
    title: 'Reportes',
    subtitle: 'Ventas, utilidad y analítica',
    icon: BarChart3,
    iconBg: 'bg-cyan-500',
    glowClass: 'shadow-[0_0_18px_rgba(6,182,212,0.55)]',
  },
  {
    title: 'Auditoría',
    subtitle: 'Bitácora y operaciones críticas',
    icon: ShieldAlert,
    iconBg: 'bg-purple-600',
    glowClass: 'shadow-[0_0_18px_rgba(168,85,247,0.55)]',
  },
]

const RIGHT_COLUMN_MODULES: ModuleItem[] = [
  {
    title: 'Caja y turnos',
    subtitle: 'Turnos, arqueos y cierres',
    icon: Wallet,
    iconBg: 'bg-emerald-500',
    glowClass: 'shadow-[0_0_18px_rgba(16,185,129,0.55)]',
  },
  {
    title: 'Pedidos y domicilios',
    subtitle: 'Pedidos y entregas a domicilio',
    icon: Bike,
    iconBg: 'bg-rose-500',
    glowClass: 'shadow-[0_0_18px_rgba(244,63,94,0.55)]',
  },
  {
    title: 'Facturación',
    subtitle: 'Factura electrónica DIAN',
    icon: FileText,
    iconBg: 'bg-teal-400',
    glowClass: 'shadow-[0_0_18px_rgba(45,212,191,0.55)]',
  },
  {
    title: 'Clientes',
    subtitle: 'Clientes y fidelización',
    icon: Users,
    iconBg: 'bg-sky-400',
    glowClass: 'shadow-[0_0_18px_rgba(56,189,248,0.55)]',
  },
  {
    title: 'Productos',
    subtitle: 'Catálogo, variantes y códigos',
    icon: Package,
    iconBg: 'bg-fuchsia-500',
    glowClass: 'shadow-[0_0_18px_rgba(217,70,239,0.55)]',
  },
  {
    title: 'Movimientos',
    subtitle: 'Entradas, salidas y traslados',
    icon: ArrowLeftRight,
    iconBg: 'bg-indigo-500',
    glowClass: 'shadow-[0_0_18px_rgba(99,102,241,0.55)]',
  },
  {
    title: 'Empleados',
    subtitle: 'Personal, roles y asistencia',
    icon: UserCog,
    iconBg: 'bg-purple-500',
    glowClass: 'shadow-[0_0_18px_rgba(168,85,247,0.55)]',
  },
  {
    title: 'Contabilidad',
    subtitle: 'PUC, comprobantes y estados',
    icon: Calculator,
    iconBg: 'bg-blue-600',
    glowClass: 'shadow-[0_0_18px_rgba(37,99,235,0.55)]',
  },
  {
    title: 'Usuario',
    subtitle: 'Accesos, roles y permisos',
    icon: ClipboardList,
    iconBg: 'bg-violet-500',
    glowClass: 'shadow-[0_0_18px_rgba(139,92,246,0.55)]',
  },
  {
    title: 'Configuración',
    subtitle: 'Impuestos, impresoras y giros',
    icon: Settings,
    iconBg: 'bg-orange-600',
    glowClass: 'shadow-[0_0_18px_rgba(234,88,12,0.55)]',
  },
]

export function LoginScreen({
  onLogin,
  sessionNotice,
}: {
  onLogin: (email: string) => void
  sessionNotice?: string | null
}) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [remember, setRemember] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Ingresa tu correo y contraseña.')
      return
    }

    setLoading(true)
    try {
      const res = await authApi.login(email.trim(), password)
      if (res && res.user) {
        onLogin(res.user.email)
        return
      }
      onLogin(email.trim())
    } catch (err: any) {
      if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        onLogin(email.trim())
        return
      }
      setError(err?.message || 'Credenciales incorrectas. Verifica tu correo y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  function fillDemo() {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setError(null)
  }

  return (
    <main className="grid min-h-dvh grid-cols-1 bg-background lg:grid-cols-[1.3fr_1fr] xl:grid-cols-[1.35fr_1fr]">
      {/* Brand & Modules Showcase (Exact replica of reference) */}
      <section
        className="relative hidden overflow-hidden p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-12"
        style={{
          background:
            'radial-gradient(ellipse at 85% 25%, #0d286d 0%, #06153d 50%, #030a21 100%)',
        }}
      >
        {/* Subtle dot matrix pattern like in reference image */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255, 255, 255, 0.45) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Header branding */}
        <div className="relative z-10 flex items-center justify-between pb-4">
          <Logo
            size="lg"
            className="[&_span.text-foreground]:text-white [&_span.text-primary]:text-white"
          />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              DIAN UBL 2.1 & CUFE
            </span>
          </div>
        </div>

        {/* 2-Columns Modules Showcase (Matching Reference Image) */}
        <div className="relative z-10 my-auto py-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 xl:gap-x-12 xl:gap-y-5">
            {/* Column 1 */}
            <div className="space-y-4 xl:space-y-4.5">
              {LEFT_COLUMN_MODULES.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="group flex items-center gap-3.5 transition-transform duration-150 hover:translate-x-1"
                  >
                    <div
                      className={cn(
                        'flex size-11 shrink-0 items-center justify-center rounded-2xl text-white transition-all duration-200 group-hover:scale-105',
                        item.iconBg,
                        item.glowClass,
                      )}
                    >
                      <Icon className="size-5.5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-semibold tracking-tight text-white xl:text-[15px]">
                        {item.title}
                      </h3>
                      <p className="text-[11.5px] leading-tight text-slate-300/85 xl:text-[12px]">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Column 2 */}
            <div className="space-y-4 xl:space-y-4.5">
              {RIGHT_COLUMN_MODULES.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="group flex items-center gap-3.5 transition-transform duration-150 hover:translate-x-1"
                  >
                    <div
                      className={cn(
                        'flex size-11 shrink-0 items-center justify-center rounded-2xl text-white transition-all duration-200 group-hover:scale-105',
                        item.iconBg,
                        item.glowClass,
                      )}
                    >
                      <Icon className="size-5.5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-semibold tracking-tight text-white xl:text-[15px]">
                        {item.title}
                      </h3>
                      <p className="text-[11.5px] leading-tight text-slate-300/85 xl:text-[12px]">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom footer text */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
          <span>QubitPOS Enterprise · Plataforma ERP & POS Colombia</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </section>

      {/* Login Form Panel */}
      <section className="relative flex flex-col justify-between p-6 sm:p-10 lg:p-12">
        {/* Top Header bar with Theme Toggle */}
        <div className="flex items-center justify-between w-full">
          <div className="lg:hidden">
            <Logo size="md" />
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Center Container */}
        <div className="mx-auto w-full max-w-[400px] my-auto space-y-6">
          {/* User Icon above Bienvenido */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              {/* Outer soft ambient glow */}
              <div
                aria-hidden
                className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-primary/30 to-blue-500/20 blur-lg opacity-70"
              />
              {/* Icon Container */}
              <div className="relative flex size-16 items-center justify-center rounded-2xl border border-border/80 bg-card text-primary shadow-sm">
                <User className="size-8 stroke-[1.8]" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Bienvenido
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Ingresa tus credenciales para acceder al terminal.
              </p>
            </div>
          </div>

          {/* Aviso de expiración de sesión por seguridad */}
          {sessionNotice && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in duration-200">
              <ShieldAlert className="size-4.5 shrink-0 text-amber-500 mt-0.5" />
              <p className="leading-relaxed font-medium">{sessionNotice}</p>
            </div>
          )}

          {/* Login Card */}
          <div className="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur-xl space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email" required className="text-xs font-medium text-foreground">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@qubitpos.co"
                  leadingIcon={<Mail className="size-4" />}
                  value={email}
                  invalid={!!error}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" required className="text-xs font-medium text-foreground">
                    Contraseña
                  </Label>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => setError('Utiliza el botón de autollenado de demo abajo.')}
                  >
                    ¿Olvidaste la clave?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    leadingIcon={<Lock className="size-4" />}
                    className="h-10 pr-10 text-xs rounded-xl"
                    value={password}
                    invalid={!!error}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>

              {error && <FieldHint invalid>{error}</FieldHint>}

              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="size-3.5 rounded border-border text-primary focus:ring-primary/20"
                    disabled={loading}
                  />
                  Recordar este terminal
                </label>
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-xl text-xs font-semibold tracking-wide shadow-md transition-all hover:shadow-lg justify-center"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión…' : 'Ingresar al sistema'}
              </Button>
            </form>

            {/* Quick Demo Autofill Pill */}
            <div className="rounded-xl border border-border/80 bg-muted/40 p-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="flex size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                      Demo Rápida
                    </p>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground truncate">
                    admin@qubitpos.co · qubitpos
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 active:scale-95 transition-all shadow-2xs"
                >
                  <Zap className="size-3 text-primary fill-primary/30" />
                  Autollenar
                </button>
              </div>
            </div>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground/80">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>Terminal seguro con auditoría de turnos y cierre ciego</span>
          </div>
        </div>

        {/* Bottom space balance */}
        <div className="h-4" />
      </section>
    </main>
  )
}
