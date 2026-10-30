/**
 * Cliente HTTP tipado para comunicación entre Next.js y Laravel API (QubitPOS)
 */

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status?: string
}

export interface ApiValidationError {
  message: string
  errors: Record<string, string[]>
}

export class ApiError extends Error {
  public status: number
  public errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

/**
 * Función base para realizar peticiones autenticadas hacia la API de Laravel
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`

  // Recuperar token JWT / Sanctum del almacenamiento local si existe
  let token: string | null = null
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('qubitpos_auth_token')
  }

  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Manejo de errores HTTP
  if (!response.ok) {
    let errorData: ApiValidationError | null = null
    try {
      errorData = await response.json()
    } catch {
      // Si la respuesta no es JSON válido
    }

    const message =
      errorData?.message || `Error en la solicitud: ${response.status} ${response.statusText}`

    throw new ApiError(message, response.status, errorData?.errors)
  }

  // Si la respuesta no tiene contenido (204 No Content)
  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(endpoint: string, headers?: HeadersInit) =>
    apiFetch<T>(endpoint, { method: 'GET', headers }),

  post: <T>(endpoint: string, data?: unknown, headers?: HeadersInit) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    }),

  put: <T>(endpoint: string, data?: unknown, headers?: HeadersInit) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    }),

  patch: <T>(endpoint: string, data?: unknown, headers?: HeadersInit) =>
    apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    }),

  delete: <T>(endpoint: string, headers?: HeadersInit) =>
    apiFetch<T>(endpoint, { method: 'DELETE', headers }),
}

/* ==========================================================================
 * Interfaces y Endpoints del Módulo POS (Fase 1)
 * ========================================================================== */

export interface POSProduct {
  id: string
  code: string
  barcode: string
  name: string
  category: string
  brand: string
  purchasePrice: number
  salePrice: number
  stock: number
  minStock: number
  taxRate: number
  status: 'activo' | 'inactivo'
  color: string
}

export interface POSShiftSession {
  id: string
  register: string
  branch: string
  user: string
  openingBalance: number
  closingBalanceCounted?: number | null
  difference?: number | null
  status: 'OPEN' | 'CLOSED'
  openedAt: string
  closedAt?: string | null
}

export interface CreateSaleItemPayload {
  product_id: number | string
  quantity: number
  unit_price: number
  discount?: number
  tax_rate?: number
}

export interface CreateSalePayload {
  cash_shift_id: number | string
  customer_name?: string
  customer_tax_id?: string
  customer_phone?: string
  payment_method: 'efectivo' | 'tarjeta' | 'transferencia' | 'otro'
  cash_received?: number
  items: CreateSaleItemPayload[]
}

export interface SaleRecordData {
  id: string
  invoicePrefix: string
  invoiceNumber: string
  customer: {
    name: string
    taxId: string
    phone?: string | null
  }
  paymentMethod: string
  totals: {
    subtotal: number
    discount: number
    taxBase: number
    taxAmount: number
    total: number
    cashReceived?: number | null
    cashChange?: number | null
  }
  cufe: string
  qrData: string
  status: string
  createdAt: string
  items?: Array<{
    id: string
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    discount: number
    taxRate: number
    total: number
  }>
}

export const posApi = {
  getProducts: (query?: string) => {
    const url = query ? `pos/products?q=${encodeURIComponent(query)}` : 'pos/products'
    return api.get<{ data: POSProduct[] }>(url)
  },

  getProduct: (barcode: string) => {
    return api.get<{ data: POSProduct }>(`pos/products/${encodeURIComponent(barcode)}`)
  },

  getCurrentShift: () => {
    return api.get<{ isOpen: boolean; session: POSShiftSession | null }>('pos/shifts/current')
  },

  openShift: (data: { register_name?: string; branch_name?: string; opening_balance: number }) => {
    return api.post<{ data: POSShiftSession }>('pos/shifts/open', data)
  },

  closeShift: (id: number | string, data: { counted_cash: number }) => {
    return api.post<{ message: string; session: POSShiftSession }>(`pos/shifts/${id}/close`, data)
  },

  createSale: (payload: CreateSalePayload) => {
    return api.post<{ data: SaleRecordData }>('pos/sales', payload)
  },

  getSales: () => {
    return api.get<{ data: SaleRecordData[] }>('pos/sales')
  },

  getSale: (id: number | string) => {
    return api.get<{ data: SaleRecordData }>(`pos/sales/${id}`)
  },

  getSaleXmlUrl: (id: number | string) => {
    return `${API_BASE_URL.replace(/\/$/, '')}/pos/sales/${id}/xml`
  },

  getSaleDianStatus: (id: number | string) => {
    return api.get<{
      status: string
      dianStatus: string
      statusCode: string
      statusMessage: string
      cufe: string
      qrData: string
      environment: string
      verifiedAt: string
    }>(`pos/sales/${id}/dian-status`)
  },
}

/* ==========================================================================
 * Interfaces y Endpoints de Compras y Proveedores (Fase 2)
 * ========================================================================== */

export interface SupplierRecord {
  id: number | string
  name: string
  tax_id: string
  phone?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  contact_name?: string | null
  status: 'activo' | 'inactivo' | 'moroso' | 'bloqueado'
  credit_days: number
  credit_limit: number
}

export interface CreatePurchasePayload {
  invoice_number: string
  supplier_id: number | string
  purchase_date?: string
  due_date?: string
  payment_method: 'contado' | 'credito'
  notes?: string
  items: Array<{
    product_id: number | string
    quantity: number
    unit_cost: number
    tax_rate?: number
  }>
}

export interface PurchaseRecord {
  id: number | string
  invoice_number: string
  supplier_id: number
  user_id: number
  purchase_date: string
  due_date?: string | null
  payment_method: 'contado' | 'credito'
  payment_status: 'PAID' | 'PENDING' | 'PARTIAL'
  subtotal: number
  tax_amount: number
  total: number
  notes?: string | null
  supplier?: SupplierRecord
  items?: Array<{
    id: number
    product_id: number
    quantity: number
    unit_cost: number
    tax_rate: number
    total: number
    product?: POSProduct
  }>
}

export const suppliersApi = {
  getSuppliers: (query?: string, status?: string) => {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (status) params.append('status', status)
    const qs = params.toString()
    return api.get<{ data: SupplierRecord[] }>(`suppliers${qs ? `?${qs}` : ''}`)
  },

  createSupplier: (payload: Partial<SupplierRecord>) => {
    return api.post<{ message: string; data: SupplierRecord }>('suppliers', payload)
  },
}

export const purchasesApi = {
  getPurchases: () => {
    return api.get<{ data: PurchaseRecord[] }>('purchases')
  },

  getPurchase: (id: number | string) => {
    return api.get<{ data: PurchaseRecord }>(`purchases/${id}`)
  },

  createPurchase: (payload: CreatePurchasePayload) => {
    return api.post<{ message: string; data: PurchaseRecord }>('purchases', payload)
  },
}

/* ==========================================================================
 * Interfaces y Endpoints de Cartera y Cobros (Fase 2)
 * ========================================================================== */

export interface AccountReceivableRecord {
  id: number | string
  sale_id?: number | null
  customer_name: string
  customer_tax_id: string
  customer_phone?: string | null
  initial_amount: number
  current_balance: number
  due_date: string
  status: 'PENDING' | 'PARTIAL' | 'PAID'
  notes?: string | null
  payments?: Array<{
    id: number
    amount: number
    payment_method: string
    payment_date: string
    reference_code?: string | null
  }>
}

export interface RecordReceivablePaymentPayload {
  account_receivable_id: number | string
  amount: number
  payment_method: 'efectivo' | 'tarjeta' | 'transferencia' | 'otro'
  reference_code?: string
  notes?: string
  cash_shift_id?: number | string
}

export const carteraApi = {
  getRecords: (query?: string, status?: string) => {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (status) params.append('status', status)
    const qs = params.toString()
    return api.get<{ data: AccountReceivableRecord[] }>(`cartera${qs ? `?${qs}` : ''}`)
  },

  getRecord: (id: number | string) => {
    return api.get<{ data: AccountReceivableRecord }>(`cartera/${id}`)
  },

  recordPayment: (payload: RecordReceivablePaymentPayload) => {
    return api.post<{ message: string; data: unknown }>('cartera/payments', payload)
  },
}


/* ==========================================================================
 * Interfaces y Endpoints de Contabilidad NIIF & Partida Doble (Fase 5)
 * ========================================================================== */

export interface AccountingAccountRecord {
  id: number
  code: string
  name: string
  nature: 'D' | 'C'
  type: string
  level: number
  is_movement: boolean
  is_active: boolean
}

export interface AccountingEntryLineRecord {
  id: number
  accounting_entry_id: number
  accounting_account_id: number
  third_party_name?: string | null
  third_party_tax_id?: string | null
  debit: number
  credit: number
  notes?: string | null
  account?: AccountingAccountRecord
}

export interface AccountingEntryRecord {
  id: number
  consecutive: string
  entry_type: string
  reference_type?: string | null
  reference_id?: string | null
  user_id?: number | null
  entry_date: string
  concept: string
  total_debit: number
  total_credit: number
  is_balanced: boolean
  status: string
  lines?: AccountingEntryLineRecord[]
}

export interface TrialBalanceData {
  accounts: Array<{
    code: string
    name: string
    nature: 'D' | 'C'
    type: string
    debitMov: number
    creditMov: number
    debitBal: number
    creditBal: number
  }>
  totals: {
    debitMov: number
    creditMov: number
    debitBal: number
    creditBal: number
    difference: number
    isBalanced: boolean
  }
}

export const contabilidadApi = {
  getEntries: (type?: string, query?: string) => {
    const params = new URLSearchParams()
    if (type) params.append('type', type)
    if (query) params.append('q', query)
    const qs = params.toString()
    return api.get<{ data: AccountingEntryRecord[] }>(`contabilidad/entries${qs ? `?${qs}` : ''}`)
  },

  getEntry: (id: number | string) => {
    return api.get<{ data: AccountingEntryRecord }>(`contabilidad/entries/${id}`)
  },

  getPuc: (query?: string, type?: string) => {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (type) params.append('type', type)
    const qs = params.toString()
    return api.get<{ data: AccountingAccountRecord[] }>(`contabilidad/puc${qs ? `?${qs}` : ''}`)
  },

  getTrialBalance: () => {
    return api.get<{ data: TrialBalanceData }>('contabilidad/balance-prueba')
  },
}

/* ==========================================================================
 * Interfaces y Endpoints de Nómina Electrónica & Liquidación Laboral (Fase 4)
 * ========================================================================== */

export interface EmployeeRecord {
  id: number
  code: string
  first_name: string
  last_name: string
  document_type?: string | null
  document_number: string
  phone?: string | null
  email?: string | null
  role: string
  department: string
  branch?: string | null
  contract_type?: string | null
  start_date: string
  base_salary: number | string
  has_transport_allowance: boolean
  status: 'activo' | 'inactivo' | 'vacaciones' | 'suspendido'
  eps?: string | null
  pension_fund?: string | null
  arl?: string | null
  bank_name?: string | null
  account_number?: string | null
}

export interface PayrollPeriodRecord {
  id: number
  name: string
  start_date: string
  end_date: string
  period_type: 'mensual' | 'quincenal'
  status: 'DRAFT' | 'LIQUIDATED' | 'PAID'
  total_accrued: number
  total_deductions: number
  total_net_paid: number
  total_employer_cost: number
  slips_count?: number
}

export interface PayrollSlipRecord {
  id: number
  payroll_period_id: number
  employee_id: number
  consecutive: string
  cune?: string | null
  qr_code?: string | null
  worked_days: number
  base_salary: number
  accrued_salary: number
  transport_allowance: number
  overtime_accrued: number
  other_accruals: number
  total_accrued: number
  health_deduction: number
  pension_deduction: number
  other_deductions: number
  total_deductions: number
  net_paid: number
  status: 'DRAFT' | 'APPROVED' | 'DIAN_SENT'
  employee?: EmployeeRecord
  period?: PayrollPeriodRecord
}

export interface PayrollNoveltyRecord {
  id: number
  employee_id: number
  payroll_period_id?: number | null
  novelty_type: string
  quantity?: number | null
  amount: number
  notes?: string | null
  status: string
  employee?: EmployeeRecord
}

export const nominaApi = {
  getPeriods: () => api.get<{ data: PayrollPeriodRecord[] }>('nomina/periods'),

  createPeriod: (data: {
    name: string
    start_date: string
    end_date: string
    period_type?: 'mensual' | 'quincenal'
  }) => api.post<{ message: string; data: PayrollPeriodRecord }>('nomina/periods', data),

  liquidatePeriod: (id: number | string) =>
    api.post<{ message: string; data: PayrollPeriodRecord }>(`nomina/periods/${id}/liquidate`),

  getSlips: (periodId: number | string) =>
    api.get<{ data: PayrollSlipRecord[] }>(`nomina/periods/${periodId}/slips`),

  getSlipXmlUrl: (slipId: number | string) =>
    `${API_BASE_URL.replace(/\/$/, '')}/nomina/slips/${slipId}/xml`,

  getEmployees: (query?: string, status?: string) => {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (status) params.append('status', status)
    const qs = params.toString()
    return api.get<{ data: EmployeeRecord[] }>(`nomina/employees${qs ? `?${qs}` : ''}`)
  },

  createEmployee: (data: Partial<EmployeeRecord>) =>
    api.post<{ message: string; data: EmployeeRecord }>('nomina/employees', data),

  getNovelties: () => api.get<{ data: PayrollNoveltyRecord[] }>('nomina/novelties'),

  createNovelty: (data: {
    employee_id: number
    payroll_period_id?: number | null
    novelty_type: string
    quantity?: number
    amount: number
    notes?: string
  }) => api.post<{ message: string; data: PayrollNoveltyRecord }>('nomina/novelties', data),
}

/* ==========================================================================
 * Interfaces y Endpoints de Reportes, Analítica & Auditoría (Fase 6)
 * ========================================================================== */

export interface ReportsSummaryData {
  ventas: {
    total: number
    subtotal: number
    count: number
    growth_label: string
  }
  compras: {
    total: number
    count: number
    growth_label: string
  }
  utilidad: {
    bruta: number
    margen: number
    costo_ventas: number
    growth_label: string
  }
  inventario: {
    valorizacion: number
    total_skus: number
    stock_bajo_count: number
  }
  cartera: {
    total_pendiente: number
    vencida: number
  }
  cxp: {
    total_pendiente: number
    vence_esta_semana: number
  }
}

export interface SalesReportData {
  report_type: string
  rows: Array<Record<string, unknown>>
  totals?: Record<string, number>
}

export interface InventoryReportData {
  report_type: string
  rows?: Array<Record<string, unknown>>
  movements?: Array<Record<string, unknown>>
  totals?: Record<string, number>
}

export interface CashAuditData {
  shifts: Array<Record<string, unknown>>
  totals: {
    total_shifts: number
    total_opened: number
    total_closed: number
    total_differences: number
  }
}

export const reportsApi = {
  getSummary: () => api.get<{ data: ReportsSummaryData }>('reports/summary'),

  getSales: (groupBy?: 'day' | 'product', startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (groupBy) params.append('group_by', groupBy)
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    const qs = params.toString()
    return api.get<{ data: SalesReportData }>(`reports/sales${qs ? `?${qs}` : ''}`)
  },

  getInventory: (type: 'actual' | 'kardex' | 'stock-bajo' | 'valorizacion', productId?: number | string) => {
    const params = new URLSearchParams({ type })
    if (productId) params.append('product_id', String(productId))
    return api.get<{ data: InventoryReportData }>(`reports/inventory?${params.toString()}`)
  },

  getCashAudit: () => api.get<{ data: CashAuditData }>('reports/cash-audit'),
}

/* ==========================================================================
 * Interfaces y Endpoints de Configuración, DIAN & Multiempresa (Fase 7)
 * ========================================================================== */

export interface CompanySettingRecord {
  id?: number
  trade_name: string
  legal_name: string
  nit: string
  dv?: string
  phone: string
  email: string
  address: string
  city: string
  department: string
  website?: string
  currency?: string
  timezone?: string
}

export interface DianSettingRecord {
  id?: number
  environment: 'Pruebas' | 'Producción'
  company_type: string
  fiscal_responsibility: string
  software_id: string
  software_pin?: string
  test_set_id?: string
  technical_key?: string
  is_connected: boolean
  is_auto_send: boolean
  send_email_to_customer?: boolean
  contingency_mode?: boolean
}

export interface BranchRecord {
  id: number
  code: string
  name: string
  address: string
  phone: string
  city?: string
  department?: string
  is_active: boolean
  registers_count?: number
}

export interface CashRegisterRecord {
  id: number
  branch_id: number
  name: string
  terminal_code: string
  is_active: boolean
  branch?: BranchRecord
}

export interface DianResolutionRecord {
  id: number
  resolution_number: string
  prefix: string
  range_from: number
  range_to: number
  current_number: number
  issued_at: string
  expires_at: string
  status: 'Vigente' | 'Por vencer' | 'Vencida'
  is_active: boolean
}

export interface SystemRoleRecord {
  id: number
  name: string
  description?: string
  tone?: string
  permissions?: Array<{ id: number; code: string; name: string; module: string }>
}

export const settingsApi = {
  getCompany: () => api.get<{ data: CompanySettingRecord }>('settings/company'),

  updateCompany: (data: CompanySettingRecord) =>
    api.post<{ message: string; data: CompanySettingRecord }>('settings/company', data),

  getDian: () => api.get<{ data: DianSettingRecord }>('settings/dian'),

  updateDian: (data: Partial<DianSettingRecord>) =>
    api.post<{ message: string; data: DianSettingRecord }>('settings/dian', data),

  getBranches: () => api.get<{ data: BranchRecord[] }>('settings/branches'),

  createBranch: (data: Partial<BranchRecord>) =>
    api.post<{ message: string; data: BranchRecord }>('settings/branches', data),

  getCashRegisters: () => api.get<{ data: CashRegisterRecord[] }>('settings/cash-registers'),

  createCashRegister: (data: Partial<CashRegisterRecord>) =>
    api.post<{ message: string; data: CashRegisterRecord }>('settings/cash-registers', data),

  getResolutions: () => api.get<{ data: DianResolutionRecord[] }>('settings/resolutions'),

  createResolution: (data: Partial<DianResolutionRecord>) =>
    api.post<{ message: string; data: DianResolutionRecord }>('settings/resolutions', data),

  getRoles: () => api.get<{ data: SystemRoleRecord[] }>('settings/roles'),
}

/* ==========================================================================
 * Interfaces y Endpoints de Autenticación & Seguridad Sanctum (Fase 9)
 * ========================================================================== */

export interface AuthUser {
  id: number
  name: string
  email: string
}

export interface LoginResponse {
  message: string
  token: string
  user: AuthUser
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('auth/login', { email, password })
    if (res.token && typeof window !== 'undefined') {
      localStorage.setItem('qubitpos_auth_token', res.token)
    }
    return res
  },

  me: () => api.get<{ data: AuthUser }>('auth/me'),

  logout: async () => {
    try {
      await api.post<{ message: string }>('auth/logout')
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('qubitpos_auth_token')
      }
    }
  },
}

/* ==========================================================================
 * Interfaces y Endpoints de Gestión de Clientes (Tríada de Maestros)
 * ========================================================================== */

export interface CustomerRecord {
  id: number
  document_type: string
  document_number: string
  dv?: string | null
  first_name?: string | null
  last_name?: string | null
  trade_name?: string | null
  full_name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  department?: string | null
  customer_type?: string | null
  fiscal_regime?: string | null
  credit_limit: number
  current_balance: number
  credit_days: number
  status: 'activo' | 'inactivo' | 'bloqueado' | 'moroso'
  notes?: string | null
  created_at?: string
  sales?: any[]
  receivables?: any[]
}

export const customersApi = {
  getAll: (params?: { q?: string; status?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.q) searchParams.append('q', params.q)
    if (params?.status && params.status !== 'all') searchParams.append('status', params.status)
    const qs = searchParams.toString()
    return api.get<{ data: CustomerRecord[] }>(`customers${qs ? `?${qs}` : ''}`)
  },

  getOne: (id: number | string) => {
    return api.get<{ data: CustomerRecord }>(`customers/${id}`)
  },

  create: (data: Partial<CustomerRecord>) => {
    return api.post<{ message: string; data: CustomerRecord }>('customers', data)
  },

  update: (id: number | string, data: Partial<CustomerRecord>) => {
    return api.put<{ message: string; data: CustomerRecord }>(`customers/${id}`, data)
  },

  toggleStatus: (id: number | string) => {
    return api.patch<{ message: string; data: CustomerRecord }>(`customers/${id}/toggle-status`)
  },

  delete: (id: number | string) => {
    return api.delete<{ message: string }>(`customers/${id}`)
  },
}

/* ==========================================================================
 * Interfaces y Endpoints de Catálogo de Productos CRUD (Tríada de Maestros)
 * ========================================================================== */

export interface ProductItemRecord {
  id: number
  code: string
  barcode: string
  name: string
  category: string
  brand?: string | null
  purchase_price: number | string
  sale_price: number | string
  stock: number | string
  min_stock: number | string
  tax_rate: number | string
  color?: string | null
  is_active: boolean
}

export const productsApi = {
  getProducts: (params?: { q?: string; category?: string; status?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.q) searchParams.append('q', params.q)
    if (params?.category && params.category !== 'all') searchParams.append('category', params.category)
    if (params?.status && params.status !== 'all') searchParams.append('status', params.status)
    const qs = searchParams.toString()
    return api.get<{ data: ProductItemRecord[] }>(`pos/products${qs ? `?${qs}` : ''}`)
  },

  getProduct: (barcode: string) => {
    return api.get<{ data: ProductItemRecord }>(`pos/products/${encodeURIComponent(barcode)}`)
  },

  create: (data: Partial<ProductItemRecord>) => {
    return api.post<{ message: string; data: ProductItemRecord }>('pos/products', data)
  },

  update: (id: number | string, data: Partial<ProductItemRecord>) => {
    return api.put<{ message: string; data: ProductItemRecord }>(`pos/products/${id}`, data)
  },

  toggleActive: (id: number | string) => {
    return api.patch<{ message: string; data: ProductItemRecord }>(`pos/products/${id}/toggle-active`)
  },

  delete: (id: number | string) => {
    return api.delete<{ message: string }>(`pos/products/${id}`)
  },
}

/* ==========================================================================
 * Interfaces y Endpoints de Listas de Precios, Verificador y Promociones (V. Precio)
 * ========================================================================== */

export interface PriceTierRecord {
  id: string
  name: string
  code: string
  discount_pct: number
  description: string
  is_default: boolean
}

export interface PriceCheckResult {
  product: {
    id: number
    code: string
    barcode: string
    name: string
    category: string
    stock: number
    purchase_price: number
    sale_price: number
    tax_rate: number
    tax_pct: string
    margin_amount: number
    margin_pct: number
    price_with_tax: number
  }
  tiers: {
    minorista: { name: string; price: number; tax: number; total: number }
    mayorista: { name: string; price: number; tax: number; total: number }
    distribuidor: { name: string; price: number; tax: number; total: number }
  }
}

export const pricingApi = {
  getLists: () => {
    return api.get<{ data: PriceTierRecord[] }>('pricing/lists')
  },

  check: (code: string) => {
    return api.get<{ data: PriceCheckResult }>(`pricing/check/${encodeURIComponent(code)}`)
  },

  batchUpdate: (payload: {
    category?: string
    adjustment_type: 'percentage' | 'fixed'
    operation: 'increase' | 'decrease'
    value: number
  }) => {
    return api.post<{ message: string; updated_count: number }>('pricing/batch-update', payload)
  },
}
