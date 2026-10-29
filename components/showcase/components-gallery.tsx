import { Search, Plus, Trash2, Check, DollarSign, Package, TrendingUp } from 'lucide-react'
import { Section, Subhead } from './section'
import { Button } from '@/components/jeralpos/button'
import { Badge } from '@/components/jeralpos/badge'
import { Input, Label, Select, Textarea, FieldHint } from '@/components/jeralpos/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/jeralpos/card'

export function ComponentsGallery() {
  return (
    <Section
      id="componentes"
      eyebrow="Componentes"
      title="Botones, formularios y tarjetas"
      description="Componentes reutilizables con estados hover, activo y deshabilitado ya definidos, listos para construir los módulos del POS."
    >
      <div className="space-y-8">
        {/* Buttons */}
        <Card className="p-5">
          <Subhead>Botones</Subhead>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">
              <Plus /> Nueva venta
            </Button>
            <Button variant="navy">Panel</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="outline">Contorno</Button>
            <Button variant="ghost">Fantasma</Button>
            <Button variant="success">
              <Check /> Cobrar
            </Button>
            <Button variant="danger">
              <Trash2 /> Eliminar
            </Button>
            <Button variant="link">Ver detalle</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button size="sm">Pequeño</Button>
            <Button size="md">Mediano</Button>
            <Button size="lg">Grande</Button>
            <Button size="icon" aria-label="Buscar">
              <Search />
            </Button>
            <Button loading>Procesando</Button>
            <Button disabled>Deshabilitado</Button>
          </div>
        </Card>

        {/* Form */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <Subhead>Campos de formulario</Subhead>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sku" required>
                  Código / SKU
                </Label>
                <Input id="sku" placeholder="Ej. PRD-00124" leadingIcon={<Package />} />
              </div>
              <div>
                <Label htmlFor="price">Precio de venta</Label>
                <Input id="price" type="number" placeholder="0.00" leadingIcon={<DollarSign />} />
                <FieldHint>Precio sin impuestos incluidos.</FieldHint>
              </div>
              <div>
                <Label htmlFor="cat">Categoría</Label>
                <Select id="cat" defaultValue="">
                  <option value="" disabled>
                    Selecciona una categoría
                  </option>
                  <option>Bebidas</option>
                  <option>Alimentos</option>
                  <option>Limpieza</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="err" required>
                  Existencias
                </Label>
                <Input id="err" invalid defaultValue="-5" />
                <FieldHint invalid>Las existencias no pueden ser negativas.</FieldHint>
              </div>
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" placeholder="Descripción interna del producto…" />
              </div>
              <div>
                <Label htmlFor="dis">Campo deshabilitado</Label>
                <Input id="dis" disabled defaultValue="No editable" />
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            {/* Badges */}
            <Card className="p-5">
              <Subhead>Badges y estados</Subhead>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success" dot>
                  Pagado
                </Badge>
                <Badge variant="warning" dot>
                  Pendiente
                </Badge>
                <Badge variant="danger" dot>
                  Cancelado
                </Badge>
                <Badge variant="primary">Nuevo</Badge>
                <Badge variant="neutral">Borrador</Badge>
                <Badge variant="solid">PRO</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="success">
                  <Check /> Stock disponible
                </Badge>
                <Badge variant="warning">Stock bajo</Badge>
                <Badge variant="danger">Sin stock</Badge>
              </div>
            </Card>

            {/* Stat / interactive card */}
            <Card interactive className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ventas de hoy</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">$4,280.50</p>
                </div>
                <span className="grid size-11 place-items-center rounded-xl bg-info-muted text-primary">
                  <TrendingUp className="size-5" />
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="success" dot>
                  +12.5%
                </Badge>
                <span className="text-xs text-muted-foreground">vs. ayer</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Composed card */}
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Café Americano</CardTitle>
              <Badge variant="success" dot>
                Activo
              </Badge>
            </div>
            <CardDescription>Bebidas · SKU PRD-00124</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold tracking-tight">$2.50</span>
              <span className="text-sm text-muted-foreground">128 en existencia</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="flex-1">
              Editar
            </Button>
            <Button size="sm" className="flex-1">
              <Plus /> Agregar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Section>
  )
}
