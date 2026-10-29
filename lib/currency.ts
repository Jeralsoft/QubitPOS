/**
 * Utilidades de formato monetario y cálculo tributario para Colombia (COP / DIAN)
 * Qubit POS
 */

export const TAX_RATES = {
  IVA_19: 0.19,
  IVA_5: 0.05,
  EXENTO: 0.00,
  EXCLUIDO: 0.00,
  INC_8: 0.08, // Impuesto Nacional al Consumo (Restaurantes y bares)
} as const

export type TaxRateKey = keyof typeof TAX_RATES

/**
 * Formatea un valor numérico a Pesos Colombianos (COP).
 * Por estándar comercial en Colombia, el mostrador POS no muestra centavos salvo que se especifique.
 */
export function formatCOP(value: number, options?: { showCents?: boolean }): string {
  const showCents = options?.showCents ?? false
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(value)
}

/**
 * Formato corto para paneles y KPIs (ej. $ 13,9 M, $ 450 K)
 */
export function formatShortCOP(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return `$ ${(value / 1_000_000_000).toFixed(1).replace('.', ',')} B`
  }
  if (Math.abs(value) >= 1_000_000) {
    return `$ ${(value / 1_000_000).toFixed(1).replace('.', ',')} M`
  }
  if (Math.abs(value) >= 1_000) {
    return `$ ${(value / 1_000).toFixed(0)} K`
  }
  return formatCOP(value)
}

/**
 * Desglosa base gravable e impuesto a partir de un precio bruto con IVA incluido.
 */
export function extractTaxFromGross(grossPrice: number, taxRate: number): {
  base: number
  tax: number
} {
  const base = Math.round((grossPrice / (1 + taxRate)) * 100) / 100
  const tax = Math.round((grossPrice - base) * 100) / 100
  return { base, tax }
}

/**
 * Calcula impuesto a partir de una base neta.
 */
export function calculateTaxFromNet(netPrice: number, taxRate: number): {
  tax: number
  total: number
} {
  const tax = Math.round(netPrice * taxRate * 100) / 100
  const total = Math.round((netPrice + tax) * 100) / 100
  return { tax, total }
}
