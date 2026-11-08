import { useState } from 'react'
import { Plus } from 'lucide-react'
import { api } from '../../lib/api'
import { useAsync } from '../../lib/useAsync'
import { date } from '../../lib/format'
import { useToast } from '../../context/ToastContext'
import { Badge, Button, Card, Field, Modal, Spinner, Toggle } from '../../components/ui'

const EMPTY = { category: 'YANGILANISH', title: '', body: '', published: true }

export default function NewsTab() {
  const toast = useToast()
  const { data, loading, reload } = useAsync(() => api.admin.news(), [])
  const [editing, setEditing] = useState(null) // null | {id?, ...}

  const save = async () => {
    try {
      const body = { category: editing.category, title: editing.title, body: editing.body, published: editing.published }
      if (editing.id) await api.admin.updateNews(editing.id, body)
      else await api.admin.createNews(body)
      toast.success('Saqlandi')
      setEditing(null)
      reload()
    } catch (e) {
      toast.error(e)
    }
  }

  const remove = async (n) => {
    if (!window.confirm(`"${n.title}" o'chirilsinmi?`)) return
    try {
      await api.admin.deleteNews(n.id)
      reload()
    } catch (e) {
      toast.error(e)
    }
  }

  return (
    <Card padded={false}>
      <div className="admin-toolbar">
        <span className="card-title">Yangiliklar</span>
        <Button icon={Plus} onClick={() => setEditing(EMPTY)}>Yangilik qo'shish</Button>
      </div>
      {loading && !data ? (
        <Spinner />
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Sarlavha</th>
              <th>Kategoriya</th>
              <th>Holat</th>
              <th>Sana</th>
              <th className="num">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((n) => (
              <tr key={n.id}>
                <td className="strong">{n.title}</td>
                <td><Badge>{n.category}</Badge></td>
                <td>{n.published ? <Badge tone="green">E'lon qilingan</Badge> : <Badge>Qoralama</Badge>}</td>
                <td className="muted">{date(n.createdAt)}</td>
                <td className="num">
                  <span className="row row-end">
                    <Button size="sm" variant="secondary" onClick={() => setEditing(n)}>Tahrirlash</Button>
                    <Button size="sm" variant="danger" onClick={() => remove(n)}>O'chirish</Button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        open={!!editing}
        title={editing?.id ? 'Yangilikni tahrirlash' : 'Yangi yangilik'}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Bekor qilish</Button>
            <Button onClick={save} disabled={!editing?.title?.trim()}>Saqlash</Button>
          </>
        }
      >
        {editing && (
          <>
            <Field label="Kategoriya">
              <select className="input" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                {['YANGILANISH', 'TURNIR', 'PREMIUM', 'E\'LON'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Sarlavha">
              <input className="input" maxLength={160} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </Field>
            <Field label="Matn">
              <textarea className="input" rows={5} value={editing.body ?? ''} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
            </Field>
            <Toggle label="E'lon qilish" checked={editing.published} onChange={(v) => setEditing({ ...editing, published: v })} />
          </>
        )}
      </Modal>
    </Card>
  )
}
