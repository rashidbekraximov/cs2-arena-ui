import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { num, som } from '../lib/format'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { Button, Field, Modal } from './ui'

const PRESETS = [10000, 30000, 50000, 100000]

export default function WalletModal({ open, onClose }) {
  const { me } = useApp()
  const toast = useToast()
  const [methods, setMethods] = useState(null)
  const [amount, setAmount] = useState(30000)
  const [provider, setProvider] = useState('PAYME')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && !methods) api.paymentMethods().then(setMethods).catch(() => {})
  }, [open, methods])

  const submit = async () => {
    setLoading(true)
    try {
      const { checkoutUrl } = await api.topup(provider, Number(amount))
      window.location.href = checkoutUrl
    } catch (e) {
      toast.error(e)
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Balansni to'ldirish"
      width={460}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Bekor qilish</Button>
          <Button onClick={submit} loading={loading} disabled={!amount}>
            {som(Number(amount) || 0)} to'lash
          </Button>
        </>
      }
    >
      <div className="wallet-balance">
        <span className="muted">Joriy balans</span>
        <strong>{som(me?.balance)}</strong>
      </div>

      <Field label="To'lov usuli">
        <div className="pay-methods">
          {[
            { id: 'PAYME', name: 'Payme', on: methods?.payme !== false },
            { id: 'CLICK', name: 'Click', on: methods?.click !== false },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              disabled={!m.on}
              className={`pay-method ${provider === m.id ? 'active' : ''}`}
              onClick={() => setProvider(m.id)}
            >
              {m.name}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Summa (so'm)" hint={methods ? `Min ${num(methods.min)} — maks ${num(methods.max)} so'm` : undefined}>
        <input
          className="input"
          type="number"
          min={methods?.min ?? 1000}
          step={1000}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>
      <div className="chips">
        {PRESETS.map((p) => (
          <button key={p} type="button" className={`chip ${Number(amount) === p ? 'active' : ''}`} onClick={() => setAmount(p)}>
            {num(p)}
          </button>
        ))}
      </div>
    </Modal>
  )
}
