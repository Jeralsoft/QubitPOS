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

  delete: <T>(endpoint: string, headers?: HeadersInit) =>
    apiFetch<T>(endpoint, { method: 'DELETE', headers }),
}
