import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { api } from '../lib/api'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { Avatar, Badge, Button, Card, Field, PageHeader, Spinner, Tabs, Toggle } from '../components/ui'

const TABS = [
  { value: 'account', label: 'Hisob' },
  { value: 'notifications', label: 'Bildirishnomalar' },
  { value: 'connections', label: 'Ulangan hisoblar' },
]

/** Dizayn: 08 — Sozlamalar */
export default function Settings() {
  const { me, setMe, loggedIn } = useApp()
  const toast = useToast()
  const [tab, setTab] = useState('account')
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (me && !loggedIn) window.location.href = '/auth/steam'
    if (me?.loggedIn) {
      setForm({
        nickname: me.nickname,
        country: me.country ?? '',
        city: me.city ?? '',
        language: me.language ?? 'uz',
        notifyMatchSound: me.notifyMatchSound,
        notifyFriendRequests: me.notifyFriendRequests,
        notifyTournaments: me.notifyTournaments,
        notifyEmail: me.notifyEmail,
      })
    }
  }, [me, loggedIn])

  if (!form) return <Spinner />

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  const save = async () => {
    setSaving(true)
    try {
      setMe(await api.updateSettings(form))
      toast.success("O'zgarishlar saqlandi")
    } catch (e) {
      toast.error(e)
    } finally {
      setSaving(false)
    }
  }

  const syncSteam = async () => {
    try {
      setMe(await api.syncSteam())
      toast.success("Steam'dan yangilandi")
    } catch (e) {
      toast.error(e)
    }
  }

  return (
    <div className="stack-lg">
      <PageHeader title="Sozlamalar" subtitle="Hisob, bildirishnoma va ulangan hisoblar sozlamalari" />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'account' && (
        <Card title="Profil ma'lumotlari">
          <div className="settings-avatar">
            <Avatar src={me.avatarUrl} name={me.nickname} size={72} premium={me.premium} />
            <div>
              <div className="strong">Profil rasmi</div>
              <div className="muted small">Steam profilingiz rasmi ishlatiladi</div>
            </div>
            <Button variant="secondary" icon={RefreshCw} onClick={syncSteam}>Steam'dan yangilash</Button>
          </div>
          <div className="grid-2">
            <Field label="Nikneym" hint="2–32 belgi">
              <input className="input" value={form.nickname} maxLength={32} onChange={(e) => set('nickname')(e.target.value)} />
            </Field>
            <Field label="Interfeys tili">
              <select className="input" value={form.language} onChange={(e) => set('language')(e.target.value)}>
                <option value="uz">O'zbekcha</option>
                <option value="ru">Русский (tez kunda)</option>
                <option value="en">English (tez kunda)</option>
              </select>
            </Field>
            <Field label="Mamlakat">
              <input className="input" value={form.country} maxLength={64} onChange={(e) => set('country')(e.target.value)} />
            </Field>
            <Field label="Shahar">
              <input className="input" value={form.city} maxLength={64} placeholder="Toshkent" onChange={(e) => set('city')(e.target.value)} />
            </Field>
          </div>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card title="Bildirishnomalar">
          <div className="toggle-list">
            <Toggle label="Match topilganda ovozli signal" description="Match tayyor bo'lganda brauzer va ovozli ogohlantirish" checked={form.notifyMatchSound} onChange={set('notifyMatchSound')} />
            <Toggle label="Do'stlik so'rovlari" description="Yangi do'stlik so'rovlari haqida xabar berish" checked={form.notifyFriendRequests} onChange={set('notifyFriendRequests')} />
            <Toggle label="Turnir eslatmalari" description="Turnir boshlanishidan 15 daqiqa oldin" checked={form.notifyTournaments} onChange={set('notifyTournaments')} />
            <Toggle label="Email xabarnomalari" description="Yangiliklar va maxsus takliflar" checked={form.notifyEmail} onChange={set('notifyEmail')} />
          </div>
        </Card>
      )}

      {tab === 'connections' && (
        <Card title="Ulangan hisoblar">
          <div className="connections">
            <div className="connection">
              <span className="connection-icon">ST</span>
              <div>
                <div className="strong">Steam</div>
                <div className="muted small">{me.steamId}</div>
              </div>
              <Badge tone="green">Ulangan</Badge>
            </div>
            {[
              ['DC', 'Discord'],
              ['TG', 'Telegram'],
            ].map(([k, name]) => (
              <div key={k} className="connection">
                <span className="connection-icon">{k}</span>
                <div>
                  <div className="strong">{name}</div>
                  <div className="muted small">Ulanmagan</div>
                </div>
                <Badge tone="neutral">Tez kunda</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab !== 'connections' && (
        <div className="row row-end">
          <Button onClick={save} loading={saving}>O'zgarishlarni saqlash</Button>
        </div>
      )}
    </div>
  )
}
