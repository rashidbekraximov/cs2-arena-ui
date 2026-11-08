import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, Plus, Crosshair, Menu, LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { api } from '../../lib/api'
import { num } from '../../lib/format'
import { Avatar } from '../ui'
import WalletModal from '../WalletModal'

export default function Topbar({ onMenu }) {
  const { me, loggedIn, logout } = useApp()
  const navigate = useNavigate()
  const [online, setOnline] = useState(null)
  const [walletOpen, setWalletOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const load = () => api.home().then((h) => setOnline(h.onlinePlayers)).catch(() => {})
    load()
    const t = setInterval(load, 30_000)
    return () => clearInterval(t)
  }, [])

  const play = async () => {
    if (!loggedIn) {
      window.location.href = '/auth/steam'
      return
    }
    const { matchId } = await api.currentMatch().catch(() => ({}))
    navigate(matchId ? `/match/${matchId}` : '/play')
  }

  return (
    <header className="topbar">
      <button className="icon-btn mobile-only" onClick={onMenu} aria-label="Menyu">
        <Menu size={20} />
      </button>

      <label className="search">
        <Search size={16} />
        <input placeholder="O'yinchi, jamoa yoki turnir qidirish" aria-label="Qidirish" />
      </label>

      <div className="topbar-right">
        <span className="pill">
          <i className="dot dot-green" />
          {online === null ? '—' : num(online)} online
        </span>

        {loggedIn && (
          <button className="pill pill-btn" onClick={() => setWalletOpen(true)} title="Balansni to'ldirish">
            {num(me.balance)} so'm
            <span className="pill-plus">
              <Plus size={12} />
            </span>
          </button>
        )}

        <button className="icon-btn icon-btn-round" aria-label="Bildirishnomalar">
          <Bell size={18} />
        </button>

        {loggedIn ? (
          <div className="user-menu">
            <button className="user-chip" onClick={() => setMenuOpen((v) => !v)}>
              <Avatar src={me.avatarUrl} name={me.nickname} premium={me.premium} />
              <span className="user-chip-text">
                <span className="user-chip-name">{me.nickname}</span>
                <span className="user-chip-elo">ELO {num(me.elo)}</span>
              </span>
            </button>
            {menuOpen && (
              <div className="dropdown" onMouseLeave={() => setMenuOpen(false)}>
                <Link to={`/profile/${me.id}`} onClick={() => setMenuOpen(false)}>Profil</Link>
                <Link to="/wallet" onClick={() => setMenuOpen(false)}>Balans tarixi</Link>
                <Link to="/settings" onClick={() => setMenuOpen(false)}>Sozlamalar</Link>
                <button onClick={logout}>
                  <LogOut size={14} /> Chiqish
                </button>
              </div>
            )}
          </div>
        ) : (
          <a href="/auth/steam" className="btn btn-secondary btn-md">
            Steam orqali kirish
          </a>
        )}

        <button className="btn btn-primary btn-md" onClick={play}>
          <Crosshair size={16} /> <span className="hide-sm">O'YNASH</span>
        </button>
      </div>

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </header>
  )
}
