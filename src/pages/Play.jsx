import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Lock, Users, Zap, Swords, Target, Clock } from 'lucide-react'
import { api } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { mapGradient, mapName } from '../lib/format'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { Badge, Button, Card, Empty, PageHeader } from '../components/ui'
import MatchSettingsModal from '../components/match/MatchSettingsModal'

const MODES = [
  { icon: Swords, title: '5v5 Raqobat', text: 'Klassik match, MR12', soon: true },
  { icon: Users, title: '2v2 Wingman', text: 'Kichik xaritalarda tezkor o\'yin', soon: true },
  { icon: Target, title: '1v1 Duel', text: 'Aim va pozitsiya bo\'yicha bellashuv', soon: true },
  { icon: Zap, title: 'Deathmatch', text: 'Isinish uchun FFA', soon: true },
]

export default function Play() {
  const { loggedIn } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  const lobbies = useAsync(() => api.openLobbies(), [])

  const create = async (settings) => {
    const { matchId } = await api.createMatch(settings)
    navigate(`/match/${matchId}`)
  }

  const join = async (lobby) => {
    if (!loggedIn) {
      window.location.href = '/auth/steam'
      return
    }
    const password = lobby.hasPassword ? window.prompt('Lobbi paroli:') : undefined
    if (lobby.hasPassword && password === null) return
    try {
      await api.joinMatch(lobby.id, { password })
      navigate(`/match/${lobby.id}`)
    } catch (e) {
      toast.error(e)
    }
  }

  return (
    <div className="stack-lg">
      <PageHeader
        title="O'ynash"
        subtitle="Custom match yarating yoki ochiq lobbiga qo'shiling"
        action={
          <Button
            variant="secondary"
            icon={Plus}
            onClick={() => (loggedIn ? setCreateOpen(true) : (window.location.href = '/auth/steam'))}
          >
            Custom match yaratish
          </Button>
        }
      />

      <div className="grid-4">
        {MODES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card card-pad mode-card is-soon">
            <div className="mode-top">
              <span className="mode-icon"><Icon size={18} /></span>
              <Badge tone="neutral">Tez kunda</Badge>
            </div>
            <div className="mode-title">{title}</div>
            <div className="mode-text">{text}</div>
            <div className="mode-meta"><Clock size={13} /> Avtomatik matchmaking</div>
          </div>
        ))}
      </div>

      <Card title="Ochiq lobbilar" action={<Badge tone="green">{lobbies.data?.length ?? 0} ta</Badge>}>
        {lobbies.data?.length ? (
          <div className="lobby-list">
            {lobbies.data.map((l) => (
              <div key={l.id} className="lobby-row">
                <div className="lobby-map" style={{ background: mapGradient(l.map) }}>{mapName(l.map)}</div>
                <div className="lobby-info">
                  <div className="lobby-title">
                    {l.teamAName} {l.hasPassword && <Lock size={13} className="muted" />}
                  </div>
                  <div className="muted small">{l.modeLabel} · {l.region}</div>
                </div>
                <div className="lobby-count">{l.players} / {l.maxPlayers}</div>
                <Button size="sm" onClick={() => join(l)}>Qo'shilish</Button>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            icon={Users}
            title="Ochiq lobbi yo'q"
            text="Birinchi bo'lib match yarating — do'stlaringizga taklif havolasini yuboring"
            action={loggedIn && <Button icon={Plus} onClick={() => setCreateOpen(true)}>Match yaratish</Button>}
          />
        )}
      </Card>

      <MatchSettingsModal
        open={createOpen}
        title="Custom match yaratish"
        submitLabel="Yaratish"
        onClose={() => setCreateOpen(false)}
        onSubmit={create}
      />
    </div>
  )
}
