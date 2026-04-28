const API_BASE_URL = import.meta.env.VITE_API_URL || ''

function getToken() {
  return localStorage.getItem('token')
}

async function apiRequest(path: string, options: RequestInit = {}) {
  const token = getToken()
  const isFormData = options.body instanceof FormData
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {})
  }

  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    headers
  })

  const responseText = await res.text()
  let parsed: any = null

  if (responseText) {
    try {
      parsed = JSON.parse(responseText)
    } catch {
      parsed = null
    }
  }

  if (!res.ok) {
    const fallbackMessage = responseText
      ? responseText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 220)
      : 'Request failed'
    throw new Error(parsed?.error || fallbackMessage || `HTTP ${res.status}`)
  }

  if (parsed === null) {
    const fallbackMessage = responseText
      ? responseText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 220)
      : 'Invalid server response'
    throw new Error(fallbackMessage || 'Invalid server response')
  }

  return parsed
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => apiRequest('/auth/me'),
  updateProfile: (data: any) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data: any) => apiRequest('/auth/password', { method: 'PUT', body: JSON.stringify(data) }),
  listUsers: () => apiRequest('/auth/users'),
  createUser: (data: any) => apiRequest('/auth/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: number, data: any) => apiRequest(`/auth/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: number) => apiRequest(`/auth/${id}`, { method: 'DELETE' }),

  // Properties
  listProperties: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiRequest(`/properties${qs}`)
  },
  getProperty: (id: number) => apiRequest(`/properties/${id}`),
  createProperty: (data: any) => apiRequest('/properties', { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }),
  updateProperty: (id: number, data: any) => apiRequest(`/properties/${id}`, { method: data instanceof FormData ? 'POST' : 'PUT', body: data instanceof FormData ? data : JSON.stringify(data) }),
  deleteProperty: (id: number) => apiRequest(`/properties/${id}`, { method: 'DELETE' }),
  adminListProperties: () => apiRequest('/properties/admin'),
  getCities: () => apiRequest('/properties/cities'),

  // Leads
  listLeads: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiRequest(`/leads${qs}`)
  },
  getLead: (id: number) => apiRequest(`/leads/${id}`),
  createLead: (data: any) => apiRequest('/leads', { method: 'POST', body: JSON.stringify(data) }),
  importLeads: (formData: FormData) => apiRequest('/leads/import', { method: 'POST', body: formData }),
  updateLead: (id: number, data: any) => apiRequest(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLead: (id: number) => apiRequest(`/leads/${id}`, { method: 'DELETE' }),
  getLeadPipelineStats: () => apiRequest('/leads/stats'),
  addLeadActivity: (leadId: number, data: any) =>
    apiRequest(`/leads/${leadId}/activities`, { method: 'POST', body: JSON.stringify(data) }),

  // Analytics
  getDashboardStats: () => apiRequest('/analytics/dashboard'),
  getPropertyStats: (year?: string) => apiRequest(`/analytics/properties${year ? '?year=' + year : ''}`),
  getLeadAnalytics: (year?: string) => apiRequest(`/analytics/leads${year ? '?year=' + year : ''}`)
}
