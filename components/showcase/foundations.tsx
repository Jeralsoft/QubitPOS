import { Section, Subhead } from './section'
import { Card } from '@/components/jeralpos/card'

function Swatch({
  name,
  value,
  className,
  dark,
}: {
  name: string
  value: string
  className: string
  dark?: boolean
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className={`h-20 ${className}`} />
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{value}</p>
      </div>
    </div>
  )
}

const brandColors = [
  { name: 'Azul oscuro', value: 'Navy · navy', className: 'bg-navy' },
  { name: 'Azul eléctrico', value: 'Primary · primary', className: 'bg-primary' },
  { name: 'Blanco', value: 'Card · card', className: 'bg-card border-b border-border' },
  { name: 'Gris neutro', value: 'Muted · muted-foreground', className: 'bg-muted-foreground' },
]

const statusColors = [
  { name: 'Éxito', value: 'success', className: 'bg-success' },
  { name: 'Advertencia', value: 'warning', className: 'bg-warning' },
  { name: 'Error', value: 'danger', className: 'bg-danger' },
]

const type = [
  { label: 'Display', className: 'text-4xl font-bold tracking-tight', meta: '36 / 700' },
  { label: 'Título', className: 'text-2xl font-bold tracking-tight', meta: '24 / 700' },
  { label: 'Subtítulo', className: 'text-lg font-semibold', meta: '18 / 600' },
  { label: 'Cuerpo', className: 'text-sm', meta: '14 / 400' },
  { label: 'Etiqueta', className: 'text-xs font-medium uppercase tracking-wide', meta: '12 / 500' },
]

const spacing = [
  { name: 'xs', px: '4px', w: 'w-1' },
  { name: 'sm', px: '8px', w: 'w-2' },
  { name: 'md', px: '16px', w: 'w-4' },
  { name: 'lg', px: '24px', w: 'w-6' },
  { name: 'xl', px: '40px', w: 'w-10' },
]

const radii = [
  { name: 'sm', className: 'rounded-sm' },
  { name: 'md', className: 'rounded-md' },
  { name: 'lg', className: 'rounded-lg' },
  { name: 'xl', className: 'rounded-xl' },
  { name: '2xl', className: 'rounded-2xl' },
]

const shadows = [
  { name: 'xs', className: 'shadow-xs' },
  { name: 'sm', className: 'shadow-sm' },
  { name: 'md', className: 'shadow-md' },
  { name: 'lg', className: 'shadow-lg' },
]

export function Foundations() {
  return (
    <Section
      id="fundamentos"
      eyebrow="Fundamentos"
      title="Color, tipografía y espaciado"
      description="La base visual de JERALPOS: una paleta contenida basada en azul oscuro y azul eléctrico, con verde, amarillo y rojo reservados exclusivamente para estados."
    >
      <div className="space-y-8">
        <div>
          <Subhead>Colores de marca</Subhead>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {brandColors.map((c) => (
              <Swatch key={c.name} {...c} />
            ))}
          </div>
        </div>

        <div>
          <Subhead>Colores de estado</Subhead>
          <div className="grid grid-cols-3 gap-3">
            {statusColors.map((c) => (
              <Swatch key={c.name} {...c} />
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <Subhead>Tipografía · Inter</Subhead>
            <div className="space-y-4">
              {type.map((t) => (
                <div key={t.label} className="flex items-baseline justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className={`${t.className} text-foreground`}>{t.label}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{t.meta}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <Subhead>Espaciado</Subhead>
            <div className="space-y-3">
              {spacing.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-medium text-muted-foreground">{s.name}</span>
                  <span className={`${s.w} h-3 rounded-sm bg-primary`} />
                  <span className="text-xs text-muted-foreground">{s.px}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <Subhead>Bordes / radios</Subhead>
            <div className="flex flex-wrap items-end gap-4">
              {radii.map((r) => (
                <div key={r.name} className="text-center">
                  <div className={`size-16 border border-primary/40 bg-info-muted ${r.className}`} />
                  <p className="mt-2 text-xs text-muted-foreground">{r.name}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <Subhead>Sombras / elevación</Subhead>
            <div className="flex flex-wrap items-end gap-5">
              {shadows.map((s) => (
                <div key={s.name} className="text-center">
                  <div className={`size-16 rounded-lg border border-border bg-card ${s.className}`} />
                  <p className="mt-2 text-xs text-muted-foreground">{s.name}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Section>
  )
}
