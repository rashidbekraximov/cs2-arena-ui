import { api } from '../../lib/api'
import { useAsync } from '../../lib/useAsync'
import { timeAgo } from '../../lib/format'
import { Badge, Card, Spinner } from '../../components/ui'

export default function ActionsTab() {
  const { data, loading } = useAsync(() => api.admin.actions(), [])
  if (loading && !data) return <Spinner />
  return (
    <Card padded={false}>
      <table className="table">
        <thead>
          <tr>
            <th>Admin</th>
            <th>Amal</th>
            <th>Obyekt</th>
            <th>Tafsilot</th>
            <th className="num">Vaqt</th>
          </tr>
        </thead>
        <tbody>
          {data?.items.map((a) => (
            <tr key={a.id}>
              <td>#{a.adminId}</td>
              <td><Badge>{a.action}</Badge></td>
              <td className="muted">{a.target}</td>
              <td>{a.details}</td>
              <td className="num muted">{timeAgo(a.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
