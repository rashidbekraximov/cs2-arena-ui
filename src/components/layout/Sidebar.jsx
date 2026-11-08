import { NavLink } from 'react-router-dom'
import { Home, Crosshair, Trophy, BarChart3, Users, User, Crown, Settings, Shield } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function Sidebar({ open, onNavigate }) {
  const { site, me, isAdmin } = useApp()

  const items = [
    { to: '/', label: 'Bosh sahifa', icon: Home, end: true },
    { to: '/play', label: "O'ynash", icon: Crosshair },
    { to: '/tournaments', label: 'Turnirlar', icon: Trophy, soon: true },
    { to: '/leaderboard', label: 'Reyting', icon: BarChart3 },
    { to: '/teams', label: 'Jamoalar', icon: Users, soon: true },
    { to: me?.loggedIn ? `/profile/${me.id}` : '/auth/steam', label: 'Profil', icon: User, external: !me?.loggedIn },
    { to: '/premium', label: 'Premium', icon: Crown },
    { to: '/settings', label: 'Sozlamalar', icon: Settings },
  ]

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <NavLink to="/" className="brand" onClick={onNavigate}>
        <span className="brand-mark">A</span>
        <span className="brand-name">{site.name}</span>
      </NavLink>

      <nav className="side-nav">
        {items.map(({ to, label, icon: Icon, end, soon, external }) =>
          external ? (
            <a key={label} href={to} className="side-link">
              <Icon size={18} />
              <span>{label}</span>
            </a>
          ) : (
            <NavLink key={label} to={to} end={end} className="side-link" onClick={onNavigate}>
              <Icon size={18} />
              <span>{label}</span>
              {soon && <span className="soon">tez kunda</span>}
            </NavLink>
          )
        )}
        {isAdmin && (
          <NavLink to="/admin" className="side-link side-link-admin" onClick={onNavigate}>
            <Shield size={18} />
            <span>Admin panel</span>
          </NavLink>
        )}
      </nav>

      {!me?.premium && (
        <div className="promo">
          <Crown size={20} className="text-yellow" />
          <div className="promo-title">Premium oling</div>
          <div className="promo-text">Profilda maxsus belgi, eksklyuziv imkoniyatlar va ko'proq</div>
          <NavLink to="/premium" className="btn btn-primary btn-md btn-block" onClick={onNavigate}>
            Batafsil
          </NavLink>
        </div>
      )}
    </aside>
  )
}
