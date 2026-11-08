import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Card, Empty, PageHeader, Spinner, Tabs } from '../../components/ui'
import UsersTab from './UsersTab'
import NewsTab from './NewsTab'
import MatchesTab from './MatchesTab'
import PaymentsTab from './PaymentsTab'
import ServersTab from './ServersTab'
import ActionsTab from './ActionsTab'

export default function AdminPage() {
  const { me, isAdmin, isSuperAdmin } = useApp()
  const [tab, setTab] = useState('users')

  if (!me) return <Spinner />
  if (!isAdmin) {
    return (
      <Card>
        <Empty icon={ShieldAlert} title="Ruxsat yo'q" text="Bu sahifa faqat adminlar uchun" />
      </Card>
    )
  }

  const tabs = [
    { value: 'users', label: 'Foydalanuvchilar' },
    { value: 'news', label: 'Yangiliklar' },
    { value: 'matches', label: 'Matchlar' },
    { value: 'payments', label: "To'lovlar" },
    ...(isSuperAdmin ? [{ value: 'servers', label: 'Serverlar' }] : []),
    { value: 'actions', label: 'Jurnal' },
  ]

  return (
    <div className="stack-lg">
      <PageHeader
        title="Admin panel"
        subtitle={isSuperAdmin ? 'Siz SUPER ADMIN — rollar, serverlar va balansni boshqarasiz' : 'Siz ADMIN — ban, yangiliklar va matchlar'}
      />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'users' && <UsersTab />}
      {tab === 'news' && <NewsTab />}
      {tab === 'matches' && <MatchesTab />}
      {tab === 'payments' && <PaymentsTab />}
      {tab === 'servers' && isSuperAdmin && <ServersTab />}
      {tab === 'actions' && <ActionsTab />}
    </div>
  )
}
