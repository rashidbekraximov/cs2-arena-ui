import { Link } from 'react-router-dom'
import { Crosshair, Trophy, ArrowRight, Radio, Newspaper } from 'lucide-react'
import { api } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { mapName, num, timeAgo } from '../lib/format'
import { useApp } from '../context/AppContext'
import { Card, Empty, StatCard } from '../components/ui'

export default function Home() {
  const { site, loggedIn } = useApp()
  const { data } = useAsync(() => api.home(), [])
  const b = site.banner

  return (
    <div className="stack-lg">
      <section className="hero">
        <div className="hero-main">
          {b?.badge && <span className="hero-badge">{b.badge}</span>}
          <h1 className="hero-title">{b?.title ?? "5v5 o'yinlar — adolatli match va reyting"}</h1>
          <p className="hero-sub">{b?.subtitle}</p>
          <div className="hero-actions">
            <Link to="/play" className="btn btn-white btn-lg">
              <Crosshair size={16} /> O'YIN TOPISH
            </Link>
            <Link to="/tournaments" className="btn btn-dark btn-lg">
              <Trophy size={16} /> Turnirlar
            </Link>
          </div>
        </div>
        {b?.prizeValue && (
          <div className="hero-prize">
            <div className="hero-prize-label">{b.prizeLabel}</div>
            <div className="hero-prize-value">{b.prizeValue}</div>
            <div className="hero-prize-note">{b.prizeNote}</div>
          </div>
        )}
      </section>

      <div className="grid-4">
        <StatCard label="Onlayn o'yinchilar" value={num(data?.onlinePlayers)} hint="Serverlarda hozir" tone="" />
        <StatCard label="Faol matchlar" value={num(data?.activeMatches)} hint="Hozir o'ynalmoqda" />
        <StatCard label="Ochiq lobbilar" value={num(data?.openLobbies)} hint={`${num(data?.registeredPlayers)} ro'yxatdagi o'yinchi`} />
        <StatCard
          label="Sizning ELO"
          value={loggedIn ? num(data?.myElo) : '—'}
          tone="yellow"
          hint={loggedIn ? (data?.myRank ? `Reytingda #${num(data.myRank)}` : 'Birinchi matchingizni o\'ynang') : 'Kirish uchun Steam'}
        />
      </div>

      <div className="grid-main-side">
        <Card
          title={<><i className="dot dot-red" /> Jonli matchlar</>}
          action={<Link to="/play" className="link-accent">Barchasi <ArrowRight size={14} /></Link>}
        >
          {data?.liveMatches?.length ? (
            <div className="live-list">
              {data.liveMatches.map((m) => (
                <div key={m.id} className="live-row">
                  <span className="live-team">{m.teamAName}</span>
                  <span className="live-score">
                    <strong>{m.scoreA ?? 0} : {m.scoreB ?? 0}</strong>
                    <small>{mapName(m.map)}</small>
                  </span>
                  <span className="live-team live-team-right">{m.teamBName}</span>
                </div>
              ))}
            </div>
          ) : (
            <Empty icon={Radio} title="Hozircha jonli match yo'q" text="Custom match yarating va do'stlaringizni taklif qiling" />
          )}
        </Card>

        <div className="stack">
          <div className="section-head">
            <h3 className="card-title">Yangiliklar</h3>
          </div>
          {data?.news?.length ? (
            data.news.map((n) => (
              <article key={n.id} className="card news-card">
                <div className="news-thumb" />
                <div>
                  <div className="news-cat">{n.category}</div>
                  <div className="news-title">{n.title}</div>
                  <div className="news-time">{timeAgo(n.createdAt)}</div>
                </div>
              </article>
            ))
          ) : (
            <Card>
              <Empty icon={Newspaper} title="Yangiliklar yo'q" />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
