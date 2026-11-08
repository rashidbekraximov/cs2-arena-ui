const numberFmt = new Intl.NumberFormat('ru-RU')

/** 12480 → "12 480" */
export const num = (n) => numberFmt.format(n ?? 0).replace(/,/g, ' ')

export const som = (n) => `${num(n)} so'm`

export const signed = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0')

const MAP_NAMES = {
  de_dust2: 'Dust II',
  de_mirage: 'Mirage',
  de_inferno: 'Inferno',
  de_nuke: 'Nuke',
  de_ancient: 'Ancient',
  de_anubis: 'Anubis',
  de_train: 'Train',
  de_vertigo: 'Vertigo',
  de_overpass: 'Overpass',
  VETO: 'Veto orqali',
}

export const mapName = (m) => MAP_NAMES[m] ?? (m ? m.replace('de_', '') : '—')

/** Xarita kartochkalari uchun rang (rasm o'rniga). */
const MAP_GRADIENTS = {
  de_mirage: ['#c98a3c', '#6b3f22'],
  de_inferno: ['#c4573a', '#5a1f1a'],
  de_dust2: ['#d9b56a', '#7a5a2a'],
  de_nuke: ['#5d9bb0', '#24404c'],
  de_ancient: ['#4f8f5a', '#1f3d25'],
  de_anubis: ['#c9a85a', '#3b4f6b'],
  de_train: ['#8c8f9a', '#3a3c46'],
  de_vertigo: ['#6c7fa8', '#2d3550'],
}

export const mapGradient = (m) => {
  const [a, b] = MAP_GRADIENTS[m] ?? ['#4b4b6b', '#26263a']
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`
}

export const MODE_LABELS = { FIVE_V_FIVE: '5v5', WINGMAN: '2v2 Wingman', DUEL: '1v1 Duel' }

export const timeAgo = (iso) => {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'hozir'
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`
  if (diff < 172800) return 'kecha'
  return `${Math.floor(diff / 86400)} kun oldin`
}

export const clock = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek']

/** "8 noy 2026" — brauzer o'zbek oy nomlarini bilmasligi mumkin, shuning uchun qo'lda */
export const date = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export const initials = (name = '?') =>
  name
    .split(/[\s_.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('') || '?'
