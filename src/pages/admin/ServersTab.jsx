import { useState } from 'react'
import { Plus } from 'lucide-react'
import { api } from '../../lib/api'
import { useAsync } from '../../lib/useAsync'
import { useToast } from '../../context/ToastContext'
import { Badge, Button, Card, Field, Modal, Spinner, Toggle } from '../../components/ui'

const EMPTY = { name: '', region: 'Toshkent', ip: '', port: 27015, rconPassword: '', enabled: true }

export default function ServersTab() {
  const toast = useToast()
  const { data, loading, reload } = useAsync(() => api.admin.servers(), [])
  const [editing, setEditing] = useState(null)

  const save = async () => {
    try {
      const body = { ...editing, port: Number(editing.port) }
      if (editing.id) await api.admin.updateServer(editing.id, body)
      else await api.admin.createServer(body)
      toast.success('Server saqlandi')
      setEditing(null)
      reload()
    } catch (e) {
      toast.error(e)
    }
  }

  const set = (k) => (e) => setEditing({ ...editing, [k]: e.target.value })

  return (
    <Card padded={false}>
      <div className="admin-toolbar">
        <span className="card-title">O'yin serverlari</span>
        <Button icon={Plus} onClick={() => setEditing(EMPTY)}>Server qo'shish</Button>
      </div>
      {loading && !data ? (
        <Spinner />
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nomi</th>
              <th>Region</th>
              <th>Manzil</th>
              <th>Holat</th>
              <th className="num" />
            </tr>
          </thead>
          <tbody>
            {data?.map((s) => (
              <tr key={s.id}>
                <td className="strong">{s.name}</td>
                <td>{s.region}</td>
                <td className="muted">{s.ip}:{s.port}</td>
                <td>{s.enabled ? <Badge tone="green">Yoqilgan</Badge> : <Badge>O'chirilgan</Badge>}</td>
                <td className="num">
                  <Button size="sm" variant="secondary" onClick={() => setEditing({ ...s, rconPassword: '' })}>Tahrirlash</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        open={!!editing}
        title={editing?.id ? 'Serverni tahrirlash' : 'Yangi server'}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Bekor qilish</Button>
            <Button onClick={save}>Saqlash</Button>
          </>
        }
      >
        {editing && (
          <>
            <div className="grid-2">
              <Field label="Nomi"><input className="input" value={editing.name} onChange={set('name')} /></Field>
              <Field label="Region"><input className="input" value={editing.region} onChange={set('region')} /></Field>
              <Field label="IP"><input className="input" value={editing.ip} onChange={set('ip')} placeholder="45.130.148.144" /></Field>
              <Field label="Port"><input className="input" type="number" value={editing.port} onChange={set('port')} /></Field>
            </div>
            <Field label="RCON parol" hint={editing.id ? "Bo'sh qoldirilsa — eskisi saqlanadi" : 'server.cfg dagi rcon_password'}>
              <input className="input" type="password" value={editing.rconPassword} onChange={set('rconPassword')} />
            </Field>
            <Toggle label="Yoqilgan" checked={editing.enabled} onChange={(v) => setEditing({ ...editing, enabled: v })} />
          </>
        )}
      </Modal>
    </Card>
  )
}
