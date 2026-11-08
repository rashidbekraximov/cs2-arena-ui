import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { num, signed } from '../lib/format'
import { useApp } from '../context/AppContext'
import { Avatar, Badge, Card, Empty, PageHeader, Spinner } from '../components/ui'

function Podium({ rows }) {
  const order = [rows[1], rows[0], rows[2]].filter(Boolean)
  return (
    <div className="podium">
      {order.map((r) => (
        <Link key={r.user.id} to={`/profile/${r.user.id}`} className={`card podium-card podium-${r.rank}`}>
          <span className="podium-rank">{r.rank}</span>
          <Avatar src={r.user.avatarUrl} name={r.user.nickname} size={r.rank === 1 ? 72 : 60} premium={r.user.premium} />
          <div className="podium-name">{r.user.nickname}</div>
          <div className="podium-elo">ELO {num(r.user.elo)}</div>
          <div className="muted small">G'alaba {r.stats.winRate}%</div>
        </Link>
      ))}
    </div>
  )
}

/** Dizayn: 04 — Reyting */
export default function Leaderboard() {
  const { me } = useApp()
  const [page, setPage] = useState(0)
  const { data, loading } = useAsync(() => api.leaderboard(page), [page])
  const rows = data?.items ?? []

  return (
    <div className="stack-lg">
      <PageHeader title="Reyting" subtitle="ELO bo'yicha eng kuchli o'yinchilar · har matchdan keyin yangilanadi" />

      {loading && !data ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <Card>
          <Empty icon={BarChart3} title="Reyting hali bo'sh" text="Birinchi matchni o'ynagan o'yinchilar shu yerda paydo bo'ladi" />
        </Card>
      ) : (
        <>
          {page === 0 && <Podium rows={rows.slice(0, 3)} />}
          <Card padded={false}>
            <div className="table-wrap">
              <table className="table table-lg">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>O'yinchi</th>
                    <th className="num">ELO</th>
                    <th className="num">Matchlar</th>
                    <th className="num">G'alaba</th>
                    <th className="num">K/D</th>
                    <th className="num">HS %</th>
                    <th className="num">Hafta</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.user.id} className={r.user.id === me?.id ? 'row-me' : ''}>
                      <td className="muted">{r.rank}</td>
                      <td>
                        <Link to={`/profile/${r.user.id}`} className="row">
                          <Avatar src={r.user.avatarUrl} name={r.user.nickname} size={30} premium={r.user.premium} />
                          <span>
                            <span className="strong">{r.user.nickname}</span>
                            {r.user.id === me?.id && <span className="muted"> (siz)</span>}
                            {r.city && <span className="muted small block">{r.city}</span>}
                          </span>
                          {r.user.premium && <Badge tone="yellow" className="badge-xs">PREMIUM</Badge>}
                        </Link>
                      </td>
                      <td className="num strong text-yellow">{num(r.user.elo)}</td>
                      <td className="num">{num(r.stats.matches)}</td>
                      <td className="num">{r.stats.winRate}%</td>
                      <td className="num">{r.stats.kd.toFixed(2)}</td>
                      <td className="num">{r.stats.hsPercent}%</td>
                      <td className={`num ${r.weekDelta > 0 ? 'text-green' : r.weekDelta < 0 ? 'text-red' : 'muted'}`}>
                        {signed(r.weekDelta)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.totalPages > 1 && (
              <div className="pager">
                <button className="icon-btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label="Oldingi">
                  <ChevronLeft size={18} />
                </button>
                <span className="muted small">{page + 1} / {data.totalPages}</span>
                <button
                  className="icon-btn"
                  disabled={page + 1 >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Keyingi"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
