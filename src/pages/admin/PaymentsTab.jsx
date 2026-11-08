import { api } from '../../lib/api'
import { useAsync } from '../../lib/useAsync'
import { num, timeAgo } from '../../lib/format'
import { Badge, Card, Spinner } from '../../components/ui'

const TONE = { PAID: 'green', PENDING: 'neutral', PROCESSING: 'yellow', CANCELLED: 'red', REFUNDED: 'red' }

export default function PaymentsTab() {
  const { data, loading } = useAsync(() => api.admin.payments(), [])
  if (loading && !data) return <Spinner />
  return (
    <Card padded={false}>
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Foydalanuvchi</th>
            <th>Tizim</th>
            <th className="num">Summa</th>
            <th>Holat</th>
            <th>Tranzaksiya ID</th>
            <th className="num">Vaqt</th>
          </tr>
        </thead>
        <tbody>
          {data?.items.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>#{p.userId}</td>
              <td>{p.provider}</td>
              <td className="num strong">{num(p.amount)}</td>
              <td><Badge tone={TONE[p.status]}>{p.status}</Badge></td>
              <td className="muted small">{p.providerTransId ?? '—'}</td>
              <td className="num muted">{timeAgo(p.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
