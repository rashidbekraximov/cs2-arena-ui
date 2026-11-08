import { useState } from 'react'
import { Link2, Play, Settings, LogOut } from 'lucide-react'
import { api } from '../../lib/api'
import { mapGradient, mapName, timeAgo } from '../../lib/format'
import { useToast } from '../../context/ToastContext'
import { Badge, Button, Card } from '../ui'
import { EmptySlot, PlayerSlot } from './PlayerSlot'
import MatchSettingsModal from './MatchSettingsModal'

/** Dizayn: 10 — Custom match 5v5 (lobby) */
export default function LobbyView({ match, onLeave, joinCode }) {
  const toast = useToast()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const { viewer } = match

  const run = async (fn, okText) => {
    setBusy(true)
    try {
      await fn()
      if (okText) toast.success(okText)
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }

  const takeSlot = (team) =>
    run(() =>
      viewer.inMatch ? api.switchTeam(match.id, team) : api.joinMatch(match.id, { team, inviteCode: joinCode })
    )

  const copyInvite = async () => {
    const url = `${window.location.origin}/invite/${match.inviteCode}`
    await navigator.clipboard?.writeText(url).catch(() => {})
    toast.success('Taklif havolasi nusxalandi')
  }

  const full = match.teamA.players.length === match.teamSize && match.teamB.players.length === match.teamSize

  const team = (t, key) => (
    <div className="lobby-team">
      <div className="lobby-team-head">
        <span>{t.name}</span>
        <span className="muted">{t.players.length} / {match.teamSize}</span>
      </div>
      {t.players.map((p) => (
        <PlayerSlot
          key={p.userId}
          player={p}
          canKick={viewer.host && !p.host}
          onKick={(pl) => run(() => api.kick(match.id, pl.userId), `${pl.nickname} chiqarildi`)}
        />
      ))}
      {Array.from({ length: match.teamSize - t.players.length }).map((_, i) => (
        <EmptySlot key={i} disabled={busy || viewer.team === key} onClick={() => takeSlot(key)} />
      ))}
    </div>
  )

  return (
    <div className="stack-lg">
      <div className="page-header">
        <div>
          <h1>Custom match {match.modeLabel.split(' ')[0]}</h1>
          <p>Do'stlaringizni taklif qiling, jamoalarni tuzing va matchni boshlang</p>
        </div>
        <div className="row">
          {viewer.inMatch && (
            <Button variant="secondary" icon={Link2} onClick={copyInvite}>Taklif havolasi</Button>
          )}
          {viewer.host && (
            <Button
              icon={Play}
              loading={busy}
              disabled={!full}
              title={full ? '' : "Ikkala jamoa to'lishi kerak"}
              onClick={() => run(() => api.startMatch(match.id))}
            >
              MATCHNI BOSHLASH
            </Button>
          )}
        </div>
      </div>

      <Card padded={false} className="lobby-board">
        <div className="lobby-grid">
          {team(match.teamA, 'A')}

          <div className="lobby-center">
            <div className="lobby-map-card" style={{ background: mapGradient(match.map) }}>
              <div className="lobby-map-tags">
                <span>{mapName(match.map)}</span>
                <span>{match.modeLabel.split(' ')[0]}</span>
              </div>
              <div className="lobby-map-score">– : –</div>
              <div className="lobby-map-wait">O'yinchilar kutilmoqda</div>
            </div>
            <dl className="lobby-meta">
              <div><dt>Region</dt><dd>{match.region}</dd></div>
              <div><dt>Yaratildi</dt><dd>{timeAgo(match.createdAt)}</dd></div>
              <div><dt>Xarita</dt><dd>{mapName(match.map)}</dd></div>
            </dl>
          </div>

          {team(match.teamB, 'B')}
        </div>

        <div className="lobby-foot">
          <div className="row">
            {viewer.host && (
              <button className="link-muted" onClick={() => setSettingsOpen(true)}>
                <Settings size={16} /> Match sozlamalari
              </button>
            )}
            {viewer.inMatch && (
              <button className="link-muted" onClick={onLeave}>
                <LogOut size={16} /> Matchdan chiqish
              </button>
            )}
          </div>
          <div className="row">
            <Badge tone="neutral">CUSTOM</Badge>
            {match.antiCheat ? <Badge tone="green">ANTI-CHIT</Badge> : <Badge tone="red">ANTI-CHIT O'CHIQ</Badge>}
          </div>
        </div>
      </Card>

      <MatchSettingsModal
        open={settingsOpen}
        title="Match sozlamalari"
        initial={match}
        onClose={() => setSettingsOpen(false)}
        onSubmit={(s) => api.updateMatchSettings(match.id, s)}
      />
    </div>
  )
}
