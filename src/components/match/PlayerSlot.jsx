import { Link } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { num } from '../../lib/format'
import { Avatar, Badge } from '../ui'

export function PlayerSlot({ player, canKick, onKick }) {
  return (
    <div className="slot slot-filled">
      <Avatar src={player.avatarUrl} name={player.nickname} premium={player.premium} size={38} />
      <div className="slot-info">
        <Link to={`/profile/${player.userId}`} className="slot-name">
          {player.nickname}
        </Link>
        <div className="slot-meta">
          ELO {num(player.elo)}
          {player.host && <Badge tone="neutral" className="badge-xs">HOST</Badge>}
          {player.captain && !player.host && <Badge tone="neutral" className="badge-xs">KAPITAN</Badge>}
        </div>
      </div>
      {canKick && (
        <button className="icon-btn" title="Lobbidan chiqarish" onClick={() => onKick(player)}>
          <X size={16} />
        </button>
      )}
    </div>
  )
}

export function EmptySlot({ onClick, disabled }) {
  return (
    <button className="slot slot-empty" onClick={onClick} disabled={disabled} aria-label="Bo'sh joy">
      <Plus size={18} />
    </button>
  )
}
