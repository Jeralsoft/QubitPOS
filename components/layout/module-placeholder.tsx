import { LayoutGrid } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/jeralpos/card'
import { Badge } from '@/components/jeralpos/badge'

const stats = [
  { label: 'Ventas del día', value: '$18,420.00', hint: '+12% vs. ayer', tone: 'success' as const },
  { label: 'Órdenes', value: '142', hint: '38 en preparación', tone: 'primary' as const },
  { label: 'Ticket promedio', value: '$129.70', hint: '+4% este mes', tone: 'primary' as const },
  { label: 'Stock crítico', value: '7', hint: 'productos por reponer', tone: 'warning' as const },
]

export function ModulePlaceholder() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumen general de la operación. Aquí se cargarán los módulos del sistema.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} interactive>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{s.value}</p>
              <Badge variant={s.tone} size="sm" className="mt-3" dot>
                {s.hint}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty module slot */}
      <Card>
        <CardHeader>
          <CardTitle>Área de módulos</CardTitle>
          <CardDescription>
            Este es el contenedor principal donde se renderizarán los diferentes módulos de
            JERALPOS (Ventas, Inventarios, Reportes, etc.).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-border bg-muted/40 text-center">
            <div className="flex flex-col items-center gap-3 p-6">
              <span className="grid size-14 place-items-center rounded-2xl bg-info-muted text-primary">
                <LayoutGrid className="size-7" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Contenido del módulo</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Selecciona una opción del menú lateral para cargar su módulo en esta área.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
