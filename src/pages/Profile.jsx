import { Link, useParams } from 'react-router-dom'
import { Gamepad2, Pencil, UserX } from 'lucide-react'
import { api } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { mapName, num, signed, timeAgo } from '../lib/format'
import { useApp } from '../context/AppContext'
import { Avatar, Badge, Card, Empty, Spinner, StatCard } from '../components/ui'
import EloChart from '../components/EloChart'

/** Dizayn: 06 — Profil */
export default function Profile() {
  const { id } = useParams()
  const { me } = useApp()
  const { data, error, loading } = useAsync(() => api.profile(id), [id])

  if (loading && !data) return <Spinner />
  if (error) {
    return (
      <Card>
        <Empty icon={UserX} title="Profil topilmadi" text={error.message} />
      </Card>
    )
  }

  const { user, stats } = data
  const isMe = me?.id === user.id

  return (
    <div className="stack-lg">
      <section className="card profile-hero">
        <Avatar src={user.avatarUrl} name={user.nickname} size={96} premium={user.premium} />
        <div className="profile-hero-info">
          <div className="row">
            <h1 className="profile-name">{user.nickname}</h1>
            {user.premium && <Badge tone="yellow">PREMIUM</Badge>}
            {user.role !== 'PLAYER' && <Badge tone="red">{user.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ADMIN'}</Badge>}
          </div>
          <div className="muted">
            {[data.city, data.country].filter(Boolean).join(', ')} · {new Date(data.memberSince).getFullYear()}-yildan beri
            {data.rank > 0 && ` · Reytingda #${num(data.rank)}`}
          </div>
        </div>
        {isMe && (
          <Link to="/settings" className="btn btn-secondary btn-md">
            <Pencil size={16} /> Profilni tahrirlash
          </Link>
        )}
      </section>

      <div className="grid-6">
        <StatCard label="ELO" value={num(user.elo)} tone="yellow" />
        <StatCard label="Matchlar" value={num(stats.matches)} />
        <StatCard label="G'alaba" value={`${stats.winRate}%`} />
        <StatCard label="K/D" value={stats.kd.toFixed(2)} />
        <StatCard label="Headshot" value={`${stats.hsPercent}%`} />
        <StatCard label="ADR" value={stats.adr} />
      </div>

      <div className="grid-main-side">
        <Card title="So'nggi matchlar" padded={false}>
          {data.recentMatches.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Xarita</th>
                    <th>Natija</th>
                    <th className="num">Hisob</th>
                    <th className="num">K / D / A</th>
                    <th className="num">ADR</th>
                    <th className="num">ELO</th>
                    <th className="num">Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentMatches.map((m) => (
                    <tr key={m.matchId}>
                      <td>
                        <Link to={`/match/${m.matchId}`} className="strong">{mapName(m.map)}</Link>
                        <span className="muted small block">{m.modeLabel}</span>
                      </td>
                      <td>{m.won ? <Badge tone="green">G'ALABA</Badge> : <Badge tone="red">MAG'LUB</Badge>}</td>
                      <td className="num">{m.myScore} : {m.enemyScore}</td>
                      <td className="num">{m.kills} / {m.deaths} / {m.assists}</td>
                      <td className="num">{m.adr}</td>
                      <td className={`num ${m.eloChange > 0 ? 'text-green' : 'text-red'}`}>{signed(m.eloChange ?? 0)}</td>
                      <td className="num muted">{timeAgo(m.finishedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty icon={Gamepad2} title="Hali match o'ynalmagan" />
          )}
        </Card>

        <Card
          title="ELO tarixi"
          action={
            <span className={`small strong ${data.eloChange30d >= 0 ? 'text-green' : 'text-red'}`}>
              {signed(data.eloChange30d)} · 30 kun
            </span>
          }
        >
          <EloChart points={data.eloHistory} />
        </Card>
      </div>
    </div>
  )
}
