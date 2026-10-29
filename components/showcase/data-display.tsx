import { Section } from './section'
import { Badge } from '@/components/jeralpos/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/jeralpos/table'

const rows = [
  { id: '#10482', client: 'María González', total: '$128.40', method: 'Tarjeta', status: 'success', label: 'Pagado' },
  { id: '#10481', client: 'Carlos Ruiz', total: '$54.00', method: 'Efectivo', status: 'success', label: 'Pagado' },
  { id: '#10480', client: 'Ana Martín', total: '$312.75', method: 'Transferencia', status: 'warning', label: 'Pendiente' },
  { id: '#10479', client: 'Luis Herrera', total: '$18.90', method: 'Tarjeta', status: 'danger', label: 'Cancelado' },
  { id: '#10478', client: 'Sofía Díaz', total: '$96.20', method: 'Efectivo', status: 'success', label: 'Pagado' },
] as const

export function DataDisplay() {
  return (
    <Section
      id="tablas"
      eyebrow="Datos"
      title="Tablas"
      description="Tabla estándar para listados de ventas, productos y clientes, con encabezados claros, filas seleccionables y estados por color."
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Orden</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Método</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={r.id} data-selected={i === 0}>
              <TableCell className="font-medium">{r.id}</TableCell>
              <TableCell>{r.client}</TableCell>
              <TableCell className="text-muted-foreground">{r.method}</TableCell>
              <TableCell className="text-right font-medium tabular-nums">{r.total}</TableCell>
              <TableCell>
                <Badge variant={r.status} dot>
                  {r.label}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Section>
  )
}
