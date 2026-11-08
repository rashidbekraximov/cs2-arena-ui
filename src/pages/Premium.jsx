import { useState } from 'react'
import { Check, Crown, X } from 'lucide-react'
import { api } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { date, num } from '../lib/format'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { Badge, Button, Segmented } from '../components/ui'
import WalletModal from '../components/WalletModal'

const FEATURES = [
  { text: 'Custom matchlar va reyting', free: true, premium: true, plus: true },
  { text: 'Asosiy statistika', free: true, premium: true, plus: true },
  { text: 'Profilda PREMIUM belgisi', free: false, premium: true, plus: true },
  { text: 'Batafsil statistika', free: false, premium: true, plus: true },
  { text: 'Eksklyuziv turnirlar (tez kunda)', free: false, premium: true, plus: true },
  { text: 'AI demo tahlil (tez kunda)', free: false, premium: false, plus: true },
  { text: 'Profil bezaklari va ramkalar', free: false, premium: false, plus: true },
]

/** Dizayn: 07 — Premium */
export default function Premium() {
  const { me, loggedIn, setMe } = useApp()
  const toast = useToast()
  const [period, setPeriod] = useState('MONTHLY')
  const [buying, setBuying] = useState(null)
  const [walletOpen, setWalletOpen] = useState(false)
  const { data } = useAsync(() => api.premiumPlans(), [])

  const buy = async (plan) => {
    if (!loggedIn) {
      window.location.href = '/auth/steam'
      return
    }
    const price = period === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice
    if (me.balance < price) {
      toast.error("Balansda mablag' yetarli emas — avval to'ldiring")
      setWalletOpen(true)
      return
    }
    if (!window.confirm(`${plan.name} (${period === 'YEARLY' ? '1 yil' : '1 oy'}) — ${num(price)} so'm balansdan yechiladi. Davom etasizmi?`)) return
    setBuying(plan.code)
    try {
      setMe(await api.buyPremium(plan.code, period))
      toast.success(`${plan.name} faollashtirildi!`)
    } catch (e) {
      toast.error(e)
    } finally {
      setBuying(null)
    }
  }

  const tiers = [
    { code: 'FREE', name: 'Bepul', price: 0, note: 'Boshlash uchun hamma narsa', key: 'free' },
    ...(data?.plans ?? []).map((p, i) => ({
      ...p,
      price: period === 'YEARLY' ? p.yearlyPrice : p.monthlyPrice,
      note: i === 0 ? "Muntazam o'ynaydiganlar uchun" : 'Professional darajaga intilganlar uchun',
      key: i === 0 ? 'premium' : 'plus',
      popular: i === 0,
    })),
  ]

  return (
    <div className="stack-lg">
      <section className="premium-hero">
        <Badge tone="yellow"><Crown size={12} /> PREMIUM</Badge>
        <h1>O'yiningizni yangi bosqichga olib chiqing</h1>
        <p className="muted">Chuqur statistika, profil bezaklari va faqat Premium a'zolar uchun imkoniyatlar</p>
        <Segmented
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'MONTHLY', label: 'Oylik' },
            { value: 'YEARLY', label: `Yillik · −${data?.yearlyDiscountPercent ?? 20}%` },
          ]}
        />
        {me?.premium && (
          <div className="muted small">
            Sizda faol: <strong className="text-yellow">{me.premiumPlan}</strong> — {date(me.premiumUntil)} gacha
          </div>
        )}
      </section>

      <div className="grid-3">
        {tiers.map((t) => {
          const current = t.code === 'FREE' ? !me?.premium : me?.premiumPlan === t.code
          return (
            <div key={t.code} className={`card card-pad plan ${t.popular ? 'plan-popular' : ''}`}>
              {t.popular && <span className="plan-ribbon">Eng mashhur</span>}
              <div className="plan-name">{t.name}</div>
              <div className="plan-price">
                {num(t.price)} <span>so'm / {period === 'YEARLY' && t.code !== 'FREE' ? 'yil' : 'oy'}</span>
              </div>
              <div className="muted small">{t.note}</div>
              <ul className="plan-features">
                {FEATURES.map((f) => (
                  <li key={f.text} className={f[t.key] ? '' : 'off'}>
                    {f[t.key] ? <Check size={16} /> : <X size={16} />} {f.text}
                  </li>
                ))}
              </ul>
              {t.code === 'FREE' ? (
                <Button variant="secondary" disabled>{current ? 'Joriy tarif' : 'Bepul'}</Button>
              ) : (
                <Button variant={t.popular ? 'primary' : 'secondary'} loading={buying === t.code} onClick={() => buy(t)}>
                  {current ? 'Muddatini uzaytirish' : `${t.name} olish`}
                </Button>
              )}
            </div>
          )
        })}
      </div>

      <div className="pay-strip">
        <span className="muted">To'lov usullari:</span>
        {['Payme', 'Click', 'Uzcard', 'Humo'].map((m) => (
          <span key={m} className="pay-chip">{m}</span>
        ))}
      </div>

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </div>
  )
}
