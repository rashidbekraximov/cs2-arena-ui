import { useState } from 'react'
import { Plus, Receipt } from 'lucide-react'
import { api } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { num, som, timeAgo } from '../lib/format'
import { useApp } from '../context/AppContext'
import { Button, Card, Empty, PageHeader, Spinner, StatCard } from '../components/ui'
import WalletModal from '../components/WalletModal'

const TYPE_LABELS = {
  TOPUP: "To'ldirish",
  TOPUP_REFUND: 'Qaytarish',
  PREMIUM: 'Premium',
  ADMIN_ADJUST: 'Admin',
}

export default function Wallet() {
  const { me } = useApp()
  const [open, setOpen] = useState(false)
  const { data, loading } = useAsync(() => api.transactions(0), [])

  return (
    <div className="stack-lg">
      <PageHeader
        title="Balans"
        subtitle="To'lovlar va xarajatlar tarixi"
        action={<Button icon={Plus} onClick={() => setOpen(true)}>To'ldirish</Button>}
      />
      <div className="grid-4">
        <StatCard label="Joriy balans" value={som(me?.balance)} tone="yellow" />
      </div>
      <Card title="Tranzaksiyalar" padded={false}>
        {loading && !data ? (
          <Spinner />
        ) : data?.items?.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Turi</th>
                <th>Izoh</th>
                <th className="num">Summa</th>
                <th className="num">Qoldiq</th>
                <th className="num">Vaqt</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((t) => (
                <tr key={t.id}>
                  <td>{TYPE_LABELS[t.type] ?? t.type}</td>
                  <td className="muted">{t.description}</td>
                  <td className={`num strong ${t.amount > 0 ? 'text-green' : 'text-red'}`}>
                    {t.amount > 0 ? '+' : '−'}{num(Math.abs(t.amount))}
                  </td>
                  <td className="num">{num(t.balanceAfter)}</td>
                  <td className="num muted">{timeAgo(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty icon={Receipt} title="Hali tranzaksiya yo'q" />
        )}
      </Card>
      <WalletModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
