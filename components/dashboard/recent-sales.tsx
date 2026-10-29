import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/jeralpos/card'
import { Badge } from '@/components/jeralpos/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/jeralpos/table'
import { recentSales, statusConfig } from './mock-data'

export function RecentSales() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas ventas</CardTitle>
        <CardDescription>Transacciones más recientes del punto de venta</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Factura</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead className="hidden lg:table-cell">Vendedor</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentSales.map((sale) => {
              const status = statusConfig[sale.status]
              return (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono text-xs font-medium">{sale.invoice}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{sale.customer}</span>
                      <span className="text-xs text-muted-foreground md:hidden">{sale.date}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {sale.date}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{sale.seller}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {sale.total}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={status.variant} size="sm" dot>
                      {status.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
