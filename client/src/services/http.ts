const API_URL = '/api'
const authRedirectStorageKey = 'authRedirect'

const parse = async (res: Response) => {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export const http = {
  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {})
      },
      credentials: 'include',
      ...init
    })
    const data = await parse(res)
    if ((res.status === 401 || res.status === 403) && !path.startsWith('/auth/login') && !path.startsWith('/auth/refresh')) {
      const payload = { message: 'Требуется авторизация. Войдите в систему снова.', from: window.location.pathname + window.location.search }
      sessionStorage.setItem(authRedirectStorageKey, JSON.stringify(payload))
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
      throw new Error(payload.message)
    }
    if (!res.ok) {
      const message = (data as { message?: string })?.message ?? 'Ошибка запроса'
      throw new Error(message)
    }
    if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
      return (data as { data: T }).data
    }
    return data as T
  },
  query(params: Record<string, string | number | boolean | undefined>) {
    const search = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')
    return search ? `?${search}` : ''
  }
}
