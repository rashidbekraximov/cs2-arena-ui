/** Backend bilan aloqa: barcha so'rovlar shu yerdan o'tadi. */

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function request(method, path, body) {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const fallback = res.status === 401 ? 'Avval Steam orqali kiring' : 'Xatolik yuz berdi'
    throw new ApiError(res.status, data?.error, data?.message || fallback)
  }
  return data
}

const http = {
  get: (p) => request('GET', p),
  post: (p, b = {}) => request('POST', p, b),
  put: (p, b = {}) => request('PUT', p, b),
  patch: (p, b = {}) => request('PATCH', p, b),
  del: (p) => request('DELETE', p),
}

const qs = (params) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))
  return s.toString() ? `?${s}` : ''
}

export const api = {
  // Umumiy
  site: () => http.get('/api/site'),
  me: () => http.get('/api/me'),
  logout: () => http.post('/api/auth/logout'),
  home: () => http.get('/api/home'),
  leaderboard: (page = 0) => http.get(`/api/leaderboard${qs({ page, size: 25 })}`),
  profile: (id) => http.get(`/api/users/${id}/profile`),
  updateSettings: (body) => http.patch('/api/me/settings', body),
  syncSteam: () => http.post('/api/me/sync-steam'),

  // Balans va to'lov
  paymentMethods: () => http.get('/api/payments/methods'),
  topup: (provider, amount) => http.post('/api/payments/topup', { provider, amount }),
  transactions: (page = 0) => http.get(`/api/wallet/transactions${qs({ page })}`),

  // Premium
  premiumPlans: () => http.get('/api/premium/plans'),
  buyPremium: (plan, period) => http.post('/api/premium/buy', { plan, period }),

  // Matchlar
  matchOptions: () => http.get('/api/matches/options'),
  liveMatches: () => http.get('/api/matches/live'),
  openLobbies: () => http.get('/api/matches/open'),
  currentMatch: () => http.get('/api/matches/current'),
  resolveInvite: (code) => http.get(`/api/matches/invite/${encodeURIComponent(code)}`),
  match: (id) => http.get(`/api/matches/${id}`),
  matchChat: (id) => http.get(`/api/matches/${id}/chat`),
  createMatch: (settings) => http.post('/api/matches', settings),
  joinMatch: (id, body) => http.post(`/api/matches/${id}/join`, body),
  switchTeam: (id, team) => http.post(`/api/matches/${id}/team`, { team }),
  leaveMatch: (id) => http.post(`/api/matches/${id}/leave`),
  kick: (id, userId) => http.post(`/api/matches/${id}/kick/${userId}`),
  updateMatchSettings: (id, settings) => http.put(`/api/matches/${id}/settings`, settings),
  startMatch: (id) => http.post(`/api/matches/${id}/start`),
  banMap: (id, map) => http.post(`/api/matches/${id}/veto`, { map }),
  sendChat: (id, channel, text) => http.post(`/api/matches/${id}/chat`, { channel, text }),

  // Admin
  admin: {
    users: (q, page = 0) => http.get(`/api/admin/users${qs({ q, page })}`),
    ban: (id, reason, days) => http.post(`/api/admin/users/${id}/ban`, { reason, days: days || null }),
    unban: (id) => http.post(`/api/admin/users/${id}/unban`),
    news: (page = 0) => http.get(`/api/admin/news${qs({ page })}`),
    createNews: (body) => http.post('/api/admin/news', body),
    updateNews: (id, body) => http.put(`/api/admin/news/${id}`, body),
    deleteNews: (id) => http.del(`/api/admin/news/${id}`),
    matches: (status, page = 0) => http.get(`/api/admin/matches${qs({ status, page })}`),
    cancelMatch: (id, reason) => http.post(`/api/admin/matches/${id}/cancel`, { reason }),
    payments: (page = 0) => http.get(`/api/admin/payments${qs({ page })}`),
    actions: (page = 0) => http.get(`/api/admin/actions${qs({ page })}`),
    // Super admin
    setRole: (id, role) => http.put(`/api/admin/super/users/${id}/role`, { role }),
    adjustBalance: (id, amount, note) => http.post(`/api/admin/super/users/${id}/balance`, { amount, note }),
    servers: () => http.get('/api/admin/super/servers'),
    createServer: (body) => http.post('/api/admin/super/servers', body),
    updateServer: (id, body) => http.put(`/api/admin/super/servers/${id}`, body),
  },
}
