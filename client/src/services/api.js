import { supabase } from '../lib/supabase'

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  return { Authorization: `Bearer ${session?.access_token}` }
}

async function request(method, path, body, isFormData = false) {
  const headers = await getAuthHeader()
  if (!isFormData) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data.data
}
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
  postForm: (path, formData) => request('POST', path, formData, true),
  // Fetches a file with the auth header and saves it through the browser
  download: async (path, fallbackName) => {
    const res = await fetch(`${API_URL}/api${path}`, { headers: await getAuthHeader() })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || 'Download failed')
    }
    const name = res.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] || fallbackName
    const url = URL.createObjectURL(await res.blob())
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },
}
