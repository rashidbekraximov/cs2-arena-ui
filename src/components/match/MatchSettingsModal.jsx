import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { mapName, MODE_LABELS } from '../../lib/format'
import { useToast } from '../../context/ToastContext'
import { Button, Field, Modal, Segmented, Toggle } from '../ui'

const DEFAULTS = {
  mode: 'FIVE_V_FIVE',
  map: 'VETO',
  region: 'Toshkent',
  password: '',
  antiCheat: false,
  overtime: true,
  openLobby: false,
  spectators: true,
}

const TEAM_SIZE = { FIVE_V_FIVE: 5, WINGMAN: 2, DUEL: 1 }

/** Match yaratish va sozlamalarni o'zgartirish uchun bitta oyna (dizayn: 11 — Match sozlamalari). */
export default function MatchSettingsModal({ open, title, submitLabel = 'Saqlash', initial, onClose, onSubmit }) {
  const toast = useToast()
  const [options, setOptions] = useState({ maps: [], regions: ['Toshkent'] })
  const [form, setForm] = useState(DEFAULTS)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm({ ...DEFAULTS, ...(initial ?? {}), password: '' })
    api.matchOptions().then(setOptions).catch(() => {})
  }, [open, initial])

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = async () => {
    setSaving(true)
    try {
      await onSubmit(form)
      onClose()
    } catch (e) {
      toast.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Bekor qilish</Button>
          <Button onClick={submit} loading={saving}>{submitLabel}</Button>
        </>
      }
    >
      <Field label="Rejim">
        <Segmented
          value={form.mode}
          onChange={set('mode')}
          options={Object.entries(MODE_LABELS).map(([value, label]) => ({ value, label }))}
        />
      </Field>

      <div className="grid-2">
        <Field label="Xarita">
          <select className="input" value={form.map} onChange={(e) => set('map')(e.target.value)}>
            <option value="VETO">Veto orqali tanlash</option>
            {options.maps.map((m) => (
              <option key={m} value={m}>{mapName(m)}</option>
            ))}
          </select>
        </Field>
        <Field label="Region">
          <select className="input" value={form.region} onChange={(e) => set('region')(e.target.value)}>
            {options.regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label="Jamoa hajmi">
          <input className="input" value={`${TEAM_SIZE[form.mode]} o'yinchi`} disabled />
        </Field>
        <Field label="Parol (ixtiyoriy)" hint={initial ? "Bo'sh qoldirilsa — parol olib tashlanadi" : undefined}>
          <input
            className="input"
            type="password"
            maxLength={64}
            value={form.password}
            onChange={(e) => set('password')(e.target.value)}
            placeholder="••••••"
          />
        </Field>
      </div>

      <div className="toggle-list">
        <Toggle label="Anti-chit" description="O'chiq bo'lsa match CUSTOM deb belgilanadi" checked={form.antiCheat} onChange={set('antiCheat')} />
        <Toggle label="Overtime (MR3)" description="Durang holatida qo'shimcha raundlar" checked={form.overtime} onChange={set('overtime')} />
        <Toggle label="Ochiq lobbi" description="Havolasiz ham har kim qo'shila oladi" checked={form.openLobby} onChange={set('openLobby')} />
        <Toggle label="Tomoshabinlar (GOTV)" description="Matchni tomosha qilishga ruxsat" checked={form.spectators} onChange={set('spectators')} />
      </div>
    </Modal>
  )
}
