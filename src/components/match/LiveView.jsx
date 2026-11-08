import { Copy, Gamepad2, Loader2 } from 'lucide-react'
import { mapGradient, mapName, num, signed } from '../../lib/format'
import { useToast } from '../../context/ToastContext'
import { Avatar, Badge, Card } from '../ui'

const STATUS = {
  WAITING_SERVER: { label: 'Server kutilmoqda', tone: 'yellow' },
  LIVE: { label: 'Jonli', tone: 'red' },
  FINISHED: { label: 'Yakunlangan', tone: 'neutral' },
  CANCELLED: { label: 'Bekor qilingan', tone: 'neutral' },
}

function Scoreboard({ team, finished, winner }) {
  return (
    <Card title={<>{team.name} {winner && <Badge tone="green">G'ALABA</Badge>}</>}>
      <table className="table">
        <thead>
          <tr>
            <th>O'yinchi</th>
            <th className="num">K</th>
            <th className="num">D</th>
            <th className="num">A</th>
            <th className="num">HS</th>
            {finished && <th className="num">ELO</th>}
          </tr>
        </thead>
        <tbody>
          {team.players.map((p) => (
            <tr key={p.userId}>
              <td>
                <span className="row">
                  <Avatar src={p.avatarUrl} name={p.nickname} size={28} premium={p.premium} />
                  {p.nickname}
                </span>
              </td>
              <td className="num">{p.kills}</td>
              <td className="num">{p.deaths}</td>
              <td className="num">{p.assists}</td>
              <td className="num">{p.headshots}</td>
              {finished && (
                <td className={`num ${p.eloChange > 0 ? 'text-green' : p.eloChange < 0 ? 'text-red' : ''}`}>
                  {p.eloChange == null ? '—' : signed(p.eloChange)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default function LiveView({ match }) {
  const toast = useToast()
  const st = STATUS[match.status]
  const finished = match.status === 'FINISHED'
  const server = match.server

  const copy = async () => {
    await navigator.clipboard?.writeText(server.connectCommand).catch(() => {})
    toast.success('Konsol buyrug\'i nusxalandi')
  }

  return (
    <div className="stack-lg">
      <section className="score-hero" style={{ background: `${mapGradient(match.map)}` }}>
        <div className="score-hero-inner">
          <div className="score-team">{match.teamA.name}</div>
          <div className="score-center">
            <Badge tone={st.tone}>{st.label}</Badge>
            <div className="score-value">
              {match.teamA.score ?? 0} : {match.teamB.score ?? 0}
            </div>
            <div className="score-map">{mapName(match.map)} · Match #{num(match.id)}</div>
          </div>
          <div className="score-team score-team-right">{match.teamB.name}</div>
        </div>
      </section>

      {match.status === 'WAITING_SERVER' && (
        <Card>
          <div className="row center-y">
            <Loader2 className="spin" size={18} /> Bo'sh server kutilmoqda — server bo'shashi bilan avtomatik boshlanadi.
          </div>
        </Card>
      )}

      {server && match.status === 'LIVE' && (
        <Card className="connect-card">
          <div>
            <div className="card-title">Server tayyor: {server.name}</div>
            <div className="muted small">CS2 ochiladi va serverga avtomatik ulanadi. Ulanmasa — konsolga buyruqni kiriting.</div>
          </div>
          <div className="connect-actions">
            <code className="connect-code">{server.connectCommand}</code>
            <button className="btn btn-secondary btn-md" onClick={copy}>
              <Copy size={16} /> Nusxa
            </button>
            <a className="btn btn-primary btn-md" href={server.steamUrl}>
              <Gamepad2 size={16} /> O'YINGA ULANISH
            </a>
          </div>
        </Card>
      )}

      {(match.status === 'LIVE' || finished) && (
        <div className="grid-2">
          <Scoreboard team={match.teamA} finished={finished} winner={match.winner === 'A'} />
          <Scoreboard team={match.teamB} finished={finished} winner={match.winner === 'B'} />
        </div>
      )}
    </div>
  )
}
