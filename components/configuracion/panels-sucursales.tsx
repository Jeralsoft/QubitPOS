'use client'

import * as React from 'react'
import { Plus, Pencil, Trash2, Store, Calculator, Loader2 } from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Badge } from '@/components/jeralpos/badge'
import { Input, Select, Label } from '@/components/jeralpos/input'
import { Modal } from '@/components/jeralpos/modal'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/jeralpos/table'
import { SectionHeader, Toggle } from './settings-ui'
import {
  branches as seedBranches,
  registers as seedRegisters,
  colombiaDepartments,
  type Branch,
  type Register,
} from './mock-data'
import { settingsApi, type BranchRecord } from '@/lib/api'

type Toast = (msg: string, kind?: 'success' | 'error') => void

/* ==========================================================================
 * Panel de Sucursales
 * ========================================================================== */

interface BranchFormData {
  id?: number | string
  code: string
  name: string
  address: string
  phone: string
  city: string
  department: string
  isActive: boolean
}

const emptyBranchForm: BranchFormData = {
  code: '',
  name: '',
  address: '',
  phone: '',
  city: 'Medellín',
  department: 'Antioquia',
  isActive: true,
}

export function SucursalesPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<Branch[]>(seedBranches)
  const [loading, setLoading] = React.useState(false)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingBranch, setEditingBranch] = React.useState<BranchFormData | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  const loadBranches = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await settingsApi.getBranches()
      if (res.data && res.data.length > 0) {
        const liveBranches: Branch[] = res.data.map((b) => ({
          id: String(b.id),
          name: b.name,
          code: b.code,
          address: b.address,
          phone: b.phone,
          active: b.is_active,
        }))
        setItems(liveBranches)
      }
    } catch {
      // Fallback a los datos iniciales
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadBranches()
  }, [loadBranches])

  const handleOpenCreate = () => {
    setEditingBranch({
      ...emptyBranchForm,
      code: `SUC-${items.length + 1}`.padStart(6, '0'),
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (b: Branch) => {
    setEditingBranch({
      id: b.id,
      code: b.code,
      name: b.name,
      address: b.address,
      phone: b.phone,
      city: 'Medellín',
      department: 'Antioquia',
      isActive: b.active,
    })
    setModalOpen(true)
  }

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBranch) return

    if (!editingBranch.code.trim() || !editingBranch.name.trim() || !editingBranch.address.trim()) {
      onToast('Por favor completa todos los campos requeridos', 'error')
      return
    }

    try {
      setSubmitting(true)
      if (editingBranch.id) {
        await settingsApi.updateBranch(editingBranch.id, {
          code: editingBranch.code,
          name: editingBranch.name,
          address: editingBranch.address,
          phone: editingBranch.phone,
          city: editingBranch.city,
          department: editingBranch.department,
          is_active: editingBranch.isActive,
        })
        onToast(`Sucursal "${editingBranch.name}" actualizada con éxito`)
      } else {
        await settingsApi.createBranch({
          code: editingBranch.code,
          name: editingBranch.name,
          address: editingBranch.address,
          phone: editingBranch.phone,
          city: editingBranch.city,
          department: editingBranch.department,
          is_active: editingBranch.isActive,
        })
        onToast(`Sucursal "${editingBranch.name}" creada exitosamente`)
      }
      setModalOpen(false)
      setEditingBranch(null)
      loadBranches()
    } catch {
      onToast('Error al persistir la sucursal en el servidor', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id: string, name: string) => {
    try {
      await settingsApi.toggleBranch(id)
      setItems((prev) =>
        prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)),
      )
      onToast(`Estado de sucursal "${name}" actualizado`)
    } catch {
      // Revert local
      setItems((prev) =>
        prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)),
      )
      onToast(`Estado de sucursal "${name}" actualizado localmente`)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar la sucursal "${name}"?`)) return
    try {
      await settingsApi.deleteBranch(id)
      setItems((prev) => prev.filter((x) => x.id !== id))
      onToast(`Sucursal "${name}" eliminada correctamente`, 'error')
    } catch {
      setItems((prev) => prev.filter((x) => x.id !== id))
      onToast(`Sucursal "${name}" removida localmente`, 'error')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Sucursales"
        description="Puntos de operación y sedes comerciales de la empresa."
        action={
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            <Plus className="size-4" />
            Nueva sucursal
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Código</TableHead>
            <TableHead className="hidden md:table-cell">Dirección</TableHead>
            <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="font-medium text-foreground">
                <div className="flex items-center gap-2">
                  <Store className="size-4 text-muted-foreground" />
                  {b.name}
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{b.code}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{b.address}</TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">{b.phone}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Toggle
                    checked={b.active}
                    onChange={() => handleToggle(b.id, b.name)}
                    size="sm"
                    label={`Estado de ${b.name}`}
                  />
                  <Badge variant={b.active ? 'success' : 'neutral'} size="sm" dot>
                    {b.active ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Editar ${b.name}`}
                    onClick={() => handleOpenEdit(b)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-danger hover:bg-danger-muted"
                    aria-label={`Eliminar ${b.name}`}
                    onClick={() => handleDelete(b.id, b.name)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal para Crear / Editar Sucursal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingBranch(null)
        }}
        title={editingBranch?.id ? 'Editar sucursal' : 'Nueva sucursal'}
        description="Ingresa los datos del punto de venta o sede comercial."
      >
        {editingBranch && (
          <form onSubmit={handleSaveBranch} className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="branchCode" required>Código</Label>
                <Input
                  id="branchCode"
                  value={editingBranch.code}
                  onChange={(e) => setEditingBranch({ ...editingBranch, code: e.target.value })}
                  placeholder="Ej: SUC-001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="branchName" required>Nombre de la sede</Label>
                <Input
                  id="branchName"
                  value={editingBranch.name}
                  onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                  placeholder="Ej: Sede Principal"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="branchAddress" required>Dirección</Label>
              <Input
                id="branchAddress"
                value={editingBranch.address}
                onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
                placeholder="Ej: Calle 30 # 45-12, Local 3"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="branchPhone" required>Teléfono</Label>
                <Input
                  id="branchPhone"
                  value={editingBranch.phone}
                  onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                  placeholder="Ej: +57 604 444 8899"
                  required
                />
              </div>
              <div>
                <Label htmlFor="branchCity">Ciudad</Label>
                <Input
                  id="branchCity"
                  value={editingBranch.city}
                  onChange={(e) => setEditingBranch({ ...editingBranch, city: e.target.value })}
                  placeholder="Medellín"
                />
              </div>
              <div>
                <Label htmlFor="branchDept">Departamento</Label>
                <Select
                  id="branchDept"
                  value={editingBranch.department}
                  onChange={(e) => setEditingBranch({ ...editingBranch, department: e.target.value })}
                >
                  {colombiaDepartments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Toggle
                checked={editingBranch.isActive}
                onChange={(v) => setEditingBranch({ ...editingBranch, isActive: v })}
                label="Sucursal activa"
              />
              <span className="text-sm font-medium text-foreground">
                {editingBranch.isActive ? 'Sucursal activa para operaciones POS' : 'Sucursal inactiva'}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setModalOpen(false)
                  setEditingBranch(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {editingBranch.id ? 'Guardar cambios' : 'Crear sucursal'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

/* ==========================================================================
 * Panel de Cajas Registradoras POS
 * ========================================================================== */

interface RegisterFormData {
  id?: number | string
  branchId: number
  name: string
  terminalCode: string
  isActive: boolean
}

export function CajasPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<Register[]>(seedRegisters)
  const [branches, setBranches] = React.useState<BranchRecord[]>([])
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingRegister, setEditingRegister] = React.useState<RegisterFormData | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  const loadData = React.useCallback(async () => {
    try {
      const [regRes, branchRes] = await Promise.all([
        settingsApi.getCashRegisters(),
        settingsApi.getBranches(),
      ])

      if (branchRes.data && branchRes.data.length > 0) {
        setBranches(branchRes.data)
      }

      if (regRes.data && regRes.data.length > 0) {
        const liveRegisters: Register[] = regRes.data.map((r) => ({
          id: String(r.id),
          name: r.name,
          branch: r.branch?.name || 'Sede Principal',
          terminal: r.terminal_code,
          active: r.is_active,
        }))
        setItems(liveRegisters)
      }
    } catch {
      // Fallback
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleOpenCreate = () => {
    const defaultBranchId = branches[0]?.id || 1
    setEditingRegister({
      branchId: defaultBranchId,
      name: `Caja ${items.length + 1}`,
      terminalCode: `POS-${items.length + 1}`.padStart(6, '0'),
      isActive: true,
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (c: Register) => {
    const foundBranch = branches.find((b) => b.name === c.branch)
    setEditingRegister({
      id: c.id,
      branchId: foundBranch?.id || branches[0]?.id || 1,
      name: c.name,
      terminalCode: c.terminal,
      isActive: c.active,
    })
    setModalOpen(true)
  }

  const handleSaveRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRegister) return

    if (!editingRegister.name.trim() || !editingRegister.terminalCode.trim()) {
      onToast('Por favor completa todos los campos requeridos', 'error')
      return
    }

    try {
      setSubmitting(true)
      if (editingRegister.id) {
        await settingsApi.updateCashRegister(editingRegister.id, {
          branch_id: editingRegister.branchId,
          name: editingRegister.name,
          terminal_code: editingRegister.terminalCode,
          is_active: editingRegister.isActive,
        })
        onToast(`Caja "${editingRegister.name}" actualizada con éxito`)
      } else {
        await settingsApi.createCashRegister({
          branch_id: editingRegister.branchId,
          name: editingRegister.name,
          terminal_code: editingRegister.terminalCode,
          is_active: editingRegister.isActive,
        })
        onToast(`Caja "${editingRegister.name}" creada exitosamente`)
      }
      setModalOpen(false)
      setEditingRegister(null)
      loadData()
    } catch {
      onToast('Error al guardar la caja en el servidor', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id: string, name: string) => {
    try {
      await settingsApi.toggleCashRegister(id)
      setItems((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
      )
      onToast(`Estado de caja "${name}" actualizado`)
    } catch {
      setItems((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
      )
      onToast(`Estado de caja "${name}" actualizado localmente`)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar la caja "${name}"?`)) return
    try {
      await settingsApi.deleteCashRegister(id)
      setItems((prev) => prev.filter((x) => x.id !== id))
      onToast(`Caja "${name}" eliminada`, 'error')
    } catch {
      setItems((prev) => prev.filter((x) => x.id !== id))
      onToast(`Caja "${name}" removida localmente`, 'error')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Cajas"
        description="Terminales de venta físicas y puntos de cobro asociados a sucursales."
        action={
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            <Plus className="size-4" />
            Nueva caja
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Sucursal</TableHead>
            <TableHead className="hidden md:table-cell">Terminal POS</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium text-foreground">
                <div className="flex items-center gap-2">
                  <Calculator className="size-4 text-muted-foreground" />
                  {c.name}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{c.branch}</TableCell>
              <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                {c.terminal}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Toggle
                    checked={c.active}
                    onChange={() => handleToggle(c.id, c.name)}
                    size="sm"
                    label={`Estado de ${c.name}`}
                  />
                  <Badge variant={c.active ? 'success' : 'neutral'} size="sm" dot>
                    {c.active ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Editar ${c.name}`}
                    onClick={() => handleOpenEdit(c)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-danger hover:bg-danger-muted"
                    aria-label={`Eliminar ${c.name}`}
                    onClick={() => handleDelete(c.id, c.name)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal para Crear / Editar Caja */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingRegister(null)
        }}
        title={editingRegister?.id ? 'Editar caja registradora' : 'Nueva caja registradora'}
        description="Configura la terminal física y vincúlala a su sucursal."
      >
        {editingRegister && (
          <form onSubmit={handleSaveRegister} className="flex flex-col gap-4 py-2">
            <div>
              <Label htmlFor="regName" required>Nombre de la caja</Label>
              <Input
                id="regName"
                value={editingRegister.name}
                onChange={(e) => setEditingRegister({ ...editingRegister, name: e.target.value })}
                placeholder="Ej: Caja 1 - Principal"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="regTerminal" required>Código de terminal</Label>
                <Input
                  id="regTerminal"
                  value={editingRegister.terminalCode}
                  onChange={(e) => setEditingRegister({ ...editingRegister, terminalCode: e.target.value })}
                  placeholder="Ej: POS-01"
                  required
                />
              </div>

              <div>
                <Label htmlFor="regBranch" required>Sucursal asignada</Label>
                <Select
                  id="regBranch"
                  value={editingRegister.branchId}
                  onChange={(e) => setEditingRegister({ ...editingRegister, branchId: Number(e.target.value) })}
                >
                  {branches.length > 0 ? (
                    branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))
                  ) : (
                    <option value={1}>Sede Principal (SUC-01)</option>
                  )}
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Toggle
                checked={editingRegister.isActive}
                onChange={(v) => setEditingRegister({ ...editingRegister, isActive: v })}
                label="Caja activa"
              />
              <span className="text-sm font-medium text-foreground">
                {editingRegister.isActive ? 'Caja habilitada para turnos y ventas' : 'Caja inactiva'}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setModalOpen(false)
                  setEditingRegister(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {editingRegister.id ? 'Guardar cambios' : 'Crear caja'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
