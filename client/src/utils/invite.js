// Remembers a group invite across the login/register redirect.
const KEY = 'pendingGroupInvite'

export function setPendingInvite(token) {
  try { localStorage.setItem(KEY, token) } catch { /* storage unavailable */ }
}

export function getPendingInvite() {
  try { return localStorage.getItem(KEY) } catch { return null }
}

export function clearPendingInvite() {
  try { localStorage.removeItem(KEY) } catch { /* storage unavailable */ }
}

export function postLoginPath() {
  const token = getPendingInvite()
  return token ? `/join/${token}` : '/dashboard'
}
