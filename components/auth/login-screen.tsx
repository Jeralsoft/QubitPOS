'use client'

import * as React from 'react'
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2 } from 'lucide-react'
import { Logo } from '@/components/jeralpos/brand'
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
    }, 700)
  }

  return (
    <main className="grid min-h-dvh grid-cols-1 bg-background lg:grid-cols-[1.1fr_1fr]">
      {/* Brand / marketing panel */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-navy via-navy to-electric p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)',
            backgroundSize: '48px 48px, 64px 64px',
          }}
        />
        <div className="relative">
          <Logo size="lg" className="[&_span.text-foreground]:text-white [&_span.text-primary]:text-white/70" />
        </div>

        <div className="relative max-w-md space-y-6">
          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight">
            El punto de venta que hace crecer tu negocio.
          </h1>
          <p className="text-pretty text-lg text-white/70">
            Ventas, inventario, cartera, contabilidad y kioscos de autoservicio en una sola
            plataforma pensada para Colombia.
          </p>
          <ul className="space-y-3 text-sm text-white/80">
            {[
              'Facturación electrónica DIAN integrada',
              'Control de inventario en tiempo real',
              'Reportes y analítica de tus sucursales',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="grid size-6 place-items-center rounded-full bg-white/15">
                  <ShieldCheck className="size-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/50">© {new Date().getFullYear()} JERALPOS · Todos los derechos reservados</p>
      </section>

      {/* Form panel */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo size="md" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Iniciar sesión</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Bienvenido de nuevo. Ingresa tus credenciales para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <Label htmlFor="email" required>
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="tucorreo@empresa.com"
                leadingIcon={<Mail />}
                value={email}
                invalid={!!error}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label htmlFor="password" className="mb-0" required>
                  Contraseña
                </Label>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => setError('Contacta a tu administrador para restablecer la contraseña.')}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  leadingIcon={<Lock />}
                  className="pr-10"
                  value={password}
                  invalid={!!error}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && <FieldHint invalid>{error}</FieldHint>}

            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-4 rounded border-border text-primary accent-[var(--color-primary)]"
                disabled={loading}
              />
              Mantener sesión iniciada
            </label>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Ingresando…
                </>
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/40 p-3.5 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Credenciales de demostración</p>
            <p className="mt-1">
              Correo: <span className="font-mono text-foreground">{DEMO_EMAIL}</span>
            </p>
            <p>
              Contraseña: <span className="font-mono text-foreground">{DEMO_PASSWORD}</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
