import { useEffect, useState } from 'react'
import { Ban, Check } from 'lucide-react'
import { api } from '../../lib/api'
import { mapGradient, mapName, num } from '../../lib/format'
import { useToast } from '../../context/ToastContext'
import { Avatar, Badge, Card } from '../ui'

function useCountdown(deadline) {
  const [left, setLeft] = useState(0)
  useEffect(() => {
    if (!deadline) return undefined
    const tick = () => setLeft(Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 1000)))
    tick()
    const t = setInterval(tick, 250)
    return () => clearInterval(t)
  }, [deadline])
  return left
}

function TeamList({ team, side }) {
  return (
    <Card className={`veto-team veto-team-${side}`}>
      <div className="veto-team-head">
        <strong>{team.name}</strong>
        <span className="muted small">O'rt. ELO {num(team.avgElo)}</span>
      </div>
      {team.players.map((p) => (
        <div key={p.userId} className="veto-player">
          <Avatar src={p.avatarUrl} name={p.nickname} size={32} premium={p.premium} />
          <div>
            <div className="veto-player-name">{p.nickname} {p.captain && <Badge className="badge-xs">KAPITAN</Badge>}</div>
            <div className="muted small">ELO {num(p.elo)}</div>
          </div>
        </div>
      ))}
    </Card>
  )
}

/** Dizayn: 09 — Match xonasi (veto) */
export default function VetoView({ match }) {
  const toast = useToast()
  const [busy, setBusy] = useState(null)
  const left = useCountdown(match.veto?.deadline)
  const veto = match.veto
  const turnTeam = veto?.turn === 'A' ? match.teamA : match.teamB
  const banned = veto?.maps.filter((m) => m.state === 'BAN').length ?? 0
  const remaining = veto?.maps.filter((m) => m.state === 'AVAILABLE').length ?? 0
  const playersCount = match.teamA.players.length + match.teamB.players.length

  const ban = async (map) => {
    setBusy(map)
    try {
      await api.banMap(match.id, map)
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="stack-lg">
      <div className="veto-bar card card-pad">
        <div>
          <div className="eyebrow">XARITA TANLOVI</div>
          <div className="veto-bar-title">Match #{num(match.id)}</div>
          <div className="muted small">
            {match.modeLabel} · {match.region} server · MR12 · BO1
          </div>
        </div>
        <div className="veto-timer">
          <div className="veto-clock">0:{String(left).padStart(2, '0')}</div>
          <div className="small">
            Navbat: <strong className="text-accent">{turnTeam?.name}</strong> — ban
          </div>
        </div>
        <Badge tone="green">{playersCount} / {match.teamSize * 2} tayyor</Badge>
      </div>

      <div className="veto-grid">
        <TeamList team={match.teamA} side="a" />

        <Card title="Xaritalar tanlovi" action={<span className="muted small">{banned} ta ban · {remaining} ta qoldi</span>}>
          <div className="map-grid">
            {veto?.maps.map((m) => {
              const isBan = m.state === 'BAN'
              const isPick = m.state === 'PICK'
              const banTeam = m.team === 'A' ? match.teamA.name : match.teamB.name
              return (
                <div
                  key={m.map}
                  className={`map-tile ${isBan ? 'is-banned' : ''} ${isPick ? 'is-picked' : ''}`}
                  style={{ background: mapGradient(m.map) }}
                >
                  <div className="map-tile-name">{mapName(m.map)}</div>
                  {isBan && (
                    <div className="map-tile-state">
                      <Ban size={13} /> BAN · {banTeam}
                    </div>
                  )}
                  {isPick && (
                    <div className="map-tile-state">
                      <Check size={13} /> O'ynaladi
                    </div>
                  )}
                  {!isBan && !isPick && veto.canAct && (
                    <button className="map-tile-btn" disabled={!!busy} onClick={() => ban(m.map)}>
                      {busy === m.map ? '…' : 'Ban qilish'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          {!veto?.canAct && <div className="muted small center mt">Raqib jamoa kapitani tanlamoqda…</div>}
        </Card>

        <TeamList team={match.teamB} side="b" />
      </div>
    </div>
  )
}
