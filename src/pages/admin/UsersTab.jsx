import { useState } from 'react'
import { Search } from 'lucide-react'
import { api } from '../../lib/api'
import { useAsync } from '../../lib/useAsync'
import { date, num } from '../../lib/format'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { Avatar, Badge, Button, Card, Field, Modal, Spinner } from '../../components/ui'

const ROLE_TONE = { PLAYER: 'neutral', ADMIN: 'blue', SUPER_ADMIN: 'red' }

export default function UsersTab() {
  const { me, isSuperAdmin } = useApp()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [query, setQuery] = useState('')
  const { data, loading, setData } = useAsync(() => api.admin.users(query), [query])
  const [banTarget, setBanTarget] = useState(null)
  const [balanceTarget, setBalanceTarget] = useState(null)

  const replace = (u) => setData((d) => ({ ...d, items: d.items.map((x) => (x.id === u.id ? u : x)) }))

  const act = async (fn, ok) => {
    try {
      const res = await fn()
      if (res?.id) replace(res)
      toast.success(ok)
    } catch (e) {
      toast.error(e)
    }
  }

  return (
    <Card padded={false}>
      <form
        className="admin-toolbar"
        onSubmit={(e) => {
          e.preventDefault()
          setQuery(q)
        }}
      >
        <label className="search search-wide">
          <Search size={16} />
          <input placeholder="Nik yoki SteamID" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <Button variant="secondary" type="submit">Qidirish</Button>
      </form>

      {loading && !data ? (
        <Spinner />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>O'yinchi</th>
                <th>Rol</th>
                <th className="num">ELO</th>
                <th className="num">Balans</th>
                <th>Holat</th>
                <th className="num">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((u) => {
                const isSelf = u.id === me.id
                const protectedUser = u.role === 'SUPER_ADMIN' || (u.role === 'ADMIN' && !isSuperAdmin)
                return (
                  <tr key={u.id}>
                    <td>
                      <span className="row">
                        <Avatar src={u.avatarUrl} name={u.nickname} size={30} premium={u.premium} />
                        <span>
                          <span className="strong">{u.nickname}</span>
                          <span className="muted small block">{u.steamId} · {date(u.createdAt)}</span>
                        </span>
                      </span>
                    </td>
                    <td>
                      {isSuperAdmin && !isSelf ? (
                        <select
                          className="input input-sm"
                          value={u.role}
                          onChange={(e) => act(() => api.admin.setRole(u.id, e.target.value), 'Rol o\'zgartirildi')}
                        >
                          <option value="PLAYER">PLAYER</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                      ) : (
                        <Badge tone={ROLE_TONE[u.role]}>{u.role}</Badge>
                      )}
                    </td>
                    <td className="num">{num(u.elo)}</td>
                    <td className="num">{num(u.balance)}</td>
                    <td>
                      {u.banned ? (
                        <Badge tone="red" title={u.banReason}>BAN{u.bannedUntil ? ` · ${date(u.bannedUntil)} gacha` : ''}</Badge>
                      ) : (
                        <Badge tone="green">Faol</Badge>
                      )}
                    </td>
                    <td className="num">
                      <span className="row row-end">
                        {isSuperAdmin && (
                          <Button size="sm" variant="secondary" onClick={() => setBalanceTarget(u)}>Balans</Button>
                        )}
                        {!isSelf && !protectedUser &&
                          (u.banned ? (
                            <Button size="sm" variant="secondary" onClick={() => act(() => api.admin.unban(u.id), 'Ban olib tashlandi')}>
                              Unban
                            </Button>
                          ) : (
                            <Button size="sm" variant="danger" onClick={() => setBanTarget(u)}>Ban</Button>
                          ))}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <BanModal
        user={banTarget}
        onClose={() => setBanTarget(null)}
        onSubmit={(reason, days) => act(() => api.admin.ban(banTarget.id, reason, days), 'Ban berildi')}
      />
      <BalanceModal
        user={balanceTarget}
        onClose={() => setBalanceTarget(null)}
        onSubmit={async (amount, note) => {
          try {
            const { balance } = await api.admin.adjustBalance(balanceTarget.id, amount, note)
            replace({ ...balanceTarget, balance })
            toast.success('Balans yangilandi')
          } catch (e) {
            toast.error(e)
          }
        }}
      />
    </Card>
  )
}

function BanModal({ user, onClose, onSubmit }) {
  const [reason, setReason] = useState('')
  const [days, setDays] = useState('')
  return (
    <Modal
      open={!!user}
      title={`Ban: ${user?.nickname ?? ''}`}
      onClose={onClose}
      width={440}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Bekor qilish</Button>
          <Button
            variant="danger"
            disabled={!reason.trim()}
            onClick={async () => {
              await onSubmit(reason.trim(), days ? Number(days) : null)
              setReason('')
              setDays('')
              onClose()
            }}
          >
            Ban berish
          </Button>
        </>
      }
    >
      <Field label="Sabab">
        <input className="input" value={reason} maxLength={255} onChange={(e) => setReason(e.target.value)} placeholder="Cheat, haqorat…" />
      </Field>
      <Field label="Muddat (kun)" hint="Bo'sh qoldirilsa — muddatsiz">
        <input className="input" type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} />
      </Field>
    </Modal>
  )
}

function BalanceModal({ user, onClose, onSubmit }) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  return (
    <Modal
      open={!!user}
      title={`Balans: ${user?.nickname ?? ''}`}
      onClose={onClose}
      width={440}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Bekor qilish</Button>
          <Button
            disabled={!Number(amount) || !note.trim()}
            onClick={async () => {
              await onSubmit(Number(amount), note.trim())
              setAmount('')
              setNote('')
              onClose()
            }}
          >
            Saqlash
          </Button>
        </>
      }
    >
      <div className="muted small">Joriy balans: {num(user?.balance)} so'm</div>
      <Field label="Summa (so'm)" hint="Musbat — qo'shish, manfiy — ayirish (masalan −5000)">
        <input className="input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Field label="Izoh">
        <input className="input" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder="Turnir sovrini, kompensatsiya…" />
      </Field>
    </Modal>
  )
}
