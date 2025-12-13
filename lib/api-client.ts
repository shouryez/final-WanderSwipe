import type { ZodSchema } from "zod"

export type APIError = {
  endpoint: string
  expectedKeys: string[]
  actualResponse: unknown
  message: string
}

let lastApiCalls: { endpoint: string; response: unknown; timestamp: Date; error?: APIError }[] = []

export function getLastApiCalls() {
  return lastApiCalls
}

export function clearApiCalls() {
  lastApiCalls = []
}

const API_BASE_URL = "http://localhost:3000/api"

function buildApiUrl(endpoint: string): string {
  // If endpoint is already a full URL, use it as-is
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint
  }
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint
  return `${API_BASE_URL}/${cleanEndpoint}`
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
  schema?: ZodSchema<T>,
): Promise<{ data: T | null; error: APIError | null }> {
  const timestamp = new Date()
  const fullUrl = buildApiUrl(endpoint)

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!res.ok) {
      if (res.status === 401) {
        const error: APIError = {
          endpoint: fullUrl,
          expectedKeys: [],
          actualResponse: { status: 401 },
          message: "Authentication required",
        }
        lastApiCalls.unshift({ endpoint: fullUrl, response: null, timestamp, error })
        return { data: null, error }
      }

      if (res.status === 403) {
        const error: APIError = {
          endpoint: fullUrl,
          expectedKeys: [],
          actualResponse: { status: 403 },
          message: "Access denied",
        }
        lastApiCalls.unshift({ endpoint: fullUrl, response: null, timestamp, error })
        return { data: null, error }
      }

      if (res.status === 404) {
        const error: APIError = {
          endpoint: fullUrl,
          expectedKeys: [],
          actualResponse: { status: 404 },
          message: "Endpoint not found",
        }
        lastApiCalls.unshift({ endpoint: fullUrl, response: null, timestamp, error })
        return { data: null, error }
      }

      let errorText: string
      try {
        errorText = await res.text()
      } catch {
        errorText = `HTTP ${res.status}: ${res.statusText}`
      }
      const error: APIError = {
        endpoint: fullUrl,
        expectedKeys: [],
        actualResponse: errorText,
        message: `HTTP ${res.status}: ${res.statusText}`,
      }
      lastApiCalls.unshift({ endpoint: fullUrl, response: errorText, timestamp, error })
      return { data: null, error }
    }

    const json = await res.json()
    lastApiCalls.unshift({ endpoint: fullUrl, response: json, timestamp })

    // Keep only last 20 calls
    if (lastApiCalls.length > 20) {
      lastApiCalls = lastApiCalls.slice(0, 20)
    }

    if (schema) {
      const result = schema.safeParse(json)
      if (!result.success) {
        const expectedKeys = Object.keys((schema as any)._def?.shape?.() || {})
        const error: APIError = {
          endpoint: fullUrl,
          expectedKeys,
          actualResponse: json,
          message: `Schema validation failed: ${result.error.message}`,
        }
        lastApiCalls[0].error = error
        return { data: null, error }
      }
      return { data: result.data, error: null }
    }

    return { data: json as T, error: null }
  } catch (err) {
    const error: APIError = {
      endpoint: fullUrl,
      expectedKeys: [],
      actualResponse: null,
      message: err instanceof Error ? err.message : "Network error",
    }
    lastApiCalls.unshift({ endpoint: fullUrl, response: null, timestamp, error })
    return { data: null, error }
  }
}
