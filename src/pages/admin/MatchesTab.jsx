import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAsync } from '../../lib/useAsync'
import { mapName, timeAgo } from '../../lib/format'
import { useToast } from '../../context/ToastContext'
import { Badge, Button, Card, Segmented, Spinner } from '../../components/ui'

const STATUS_TONE = { LOBBY: 'blue', VETO: 'yellow', WAITING_SERVER: 'yellow', LIVE: 'red', FINISHED: 'green', CANCELLED: 'neutral' }

export default function MatchesTab() {
  const toast = useToast()
  const [status, setStatus] = useState('')
  const { data, loading, reload } = useAsync(() => api.admin.matches(status), [status])

  const cancel = async (m) => {
    const reason = window.prompt(`Match #${m.id} bekor qilinsinmi? Sabab:`, '')
    if (reason === null) return
    try {
      await api.admin.cancelMatch(m.id, reason)
      toast.success('Match bekor qilindi')
      reload()
    } catch (e) {
      toast.error(e)
    }
  }

  return (
    <Card padded={false}>
      <div className="admin-toolbar">
        <Segmented
          value={status}
          onChange={setStatus}
          options={[
            { value: '', label: 'Hammasi' },
            { value: 'LOBBY', label: 'Lobbi' },
            { value: 'LIVE', label: 'Jonli' },
            { value: 'FINISHED', label: 'Yakunlangan' },
            { value: 'CANCELLED', label: 'Bekor' },
          ]}
        />
      </div>
      {loading && !data ? (
        <Spinner />
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Jamoalar</th>
              <th>Xarita</th>
              <th>Holat</th>
              <th className="num">O'yinchilar</th>
              <th className="num">Yaratildi</th>
              <th className="num" />
            </tr>
          </thead>
          <tbody>
            {data?.items.map((m) => (
              <tr key={m.id}>
                <td><Link to={`/match/${m.id}`} className="strong">#{m.id}</Link></td>
                <td>
                  {m.teamAName} <span className="muted">vs</span> {m.teamBName}
                  {m.scoreA != null && <span className="muted"> · {m.scoreA}:{m.scoreB}</span>}
                </td>
                <td>{mapName(m.map)}</td>
                <td><Badge tone={STATUS_TONE[m.status]}>{m.status}</Badge></td>
                <td className="num">{m.players} / {m.maxPlayers}</td>
                <td className="num muted">{timeAgo(m.createdAt)}</td>
                <td className="num">
                  {!['FINISHED', 'CANCELLED'].includes(m.status) && (
                    <Button size="sm" variant="danger" onClick={() => cancel(m)}>Bekor qilish</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  )
}
