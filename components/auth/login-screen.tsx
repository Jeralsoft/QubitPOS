'use client'

import * as React from 'react'
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/jeralpos/brand'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Button } from '@/components/jeralpos/button'
import { Input, Label, FieldHint } from '@/components/jeralpos/input'
import { cn } from '@/lib/utils'

const DEMO_EMAIL = 'admin@qubitpos.co'
const DEMO_PASSWORD = 'qubitpos'

export function LoginScreen({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [remember, setRemember] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Ingresa tu correo y contraseña.')
      return
    }

    setLoading(true)
    window.setTimeout(() => {
      if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        onLogin(email.trim())
      } else {
        setLoading(false)
        setError('Credenciales incorrectas. Usa las de demostración.')
      }
    }, 600)
  }

  function fillDemo() {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setError(null)
  }

  return (
    <main className="grid min-h-dvh grid-cols-1 bg-background lg:grid-cols-[1.1fr_1fr]">
      {/* Brand / marketing panel - Minimalist Dark Luxury */}
      <section className="relative hidden overflow-hidden bg-zinc-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        {/* Subtle mesh background effect */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, oklch(0.48 0.16 260 / 0.5) 0%, transparent 40%), radial-gradient(circle at 85% 75%, oklch(0.6 0.14 152 / 0.3) 0%, transparent 40%)',
          }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <Logo size="lg" className="[&_span.text-foreground]:text-white [&_span.text-primary]:text-white" />
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur-md">
            Edición 2026
          </span>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Cumplimiento DIAN UBL 2.1
          </div>

          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-white">
            Punto de Venta & ERP de nueva generación.
          </h1>

          <p className="text-pretty text-base leading-relaxed text-zinc-400">
            Diseñado para retail, supermercados y droguerías con velocidad de latencia cero,
            arqueo ciego de caja y contabilidad automatizada.
          </p>

          {/* Minimalist Floating Status Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md space-y-2.5">
            {[
              { label: 'Facturación Electrónica DIAN & CUFE SHA-384', status: 'Activo' },
              { label: 'Kárdex Ponderado con bloqueo atómico', status: 'Sincronizado' },
              { label: 'Soporte de Impresoras Térmicas 80mm / 58mm', status: 'Listo' },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  {f.label}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">{f.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500">
          <span>© {new Date().getFullYear()} QubitPOS · Colombia</span>
          <span>Arquitectura Limpia</span>
        </div>
      </section>

      {/* Form panel - Clean & Minimalist */}
      <section className="relative flex items-center justify-center p-6 sm:p-12 lg:p-16">`n        <div className="absolute right-6 top-6">`n          <ThemeToggle />`n        </div>
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden">
            <Logo size="md" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Bienvenido
            </h2>
            <p className="text-xs text-muted-foreground">
              Ingresa tus credenciales para acceder al terminal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email" required className="text-xs font-medium">
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
                <Label htmlFor="password" required className="text-xs font-medium">
                  Contraseña
                </Label>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => setError('Usa las credenciales de demostración abajo.')}
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
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
                  className="size-3.5 rounded border-border text-primary"
                  disabled={loading}
                />
                Recordar equipo
              </label>
            </div>

            <Button
              type="submit"
              className="h-10 w-full rounded-xl text-xs font-semibold tracking-wide justify-center"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión…' : 'Ingresar al sistema'}
            </Button>
          </form>

          {/* 1-click Demo credentials shortcut */}
          <div className="rounded-2xl border border-border/80 bg-muted/30 p-3.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground text-[12px]">Acceso Rápido de Demo</p>
                <p className="text-[11px] text-muted-foreground">admin@qubitpos.co · qubitpos</p>
              </div>
              <button
                type="button"
                onClick={fillDemo}
                className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs hover:bg-accent transition-colors"
              >
                <Zap className="size-3 text-amber-500" />
                Rellenar
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

