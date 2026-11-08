import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { api } from '../../lib/api'
import { clock } from '../../lib/format'
import { useToast } from '../../context/ToastContext'
import { Card, Tabs } from '../ui'

export default function ChatPanel({ matchId, messages, canWrite }) {
  const toast = useToast()
  const [channel, setChannel] = useState('ALL')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)

  const visible = messages.filter((m) =>
    channel === 'ALL' ? m.channel === 'ALL' || m.channel === 'SYSTEM' : m.channel === 'TEAM'
  )

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [visible.length, channel])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      await api.sendChat(matchId, channel, text.trim())
      setText('')
    } catch (err) {
      toast.error(err)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card padded={false} className="chat">
      <div className="chat-tabs">
        <Tabs
          value={channel}
          onChange={setChannel}
          tabs={[
            { value: 'ALL', label: 'Umumiy chat' },
            { value: 'TEAM', label: 'Jamoa' },
          ]}
        />
      </div>
      <div className="chat-list" ref={listRef}>
        {visible.length === 0 && <div className="muted center small">Xabarlar yo'q</div>}
        {visible.map((m) =>
          m.channel === 'SYSTEM' ? (
            <div key={m.id} className="chat-system">
              {m.text} · {clock(m.createdAt)}
            </div>
          ) : (
            <div key={m.id} className="chat-msg">
              <span className="chat-author">{m.nickname}</span>
              <span className="chat-time">{clock(m.createdAt)}</span>
              <div className="chat-text">{m.text}</div>
            </div>
          )
        )}
      </div>
      {canWrite && (
        <form className="chat-input" onSubmit={send}>
          <input
            className="input"
            placeholder="Xabar yozing..."
            maxLength={500}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="icon-btn" disabled={sending} aria-label="Yuborish">
            <Send size={18} />
          </button>
        </form>
      )}
    </Card>
  )
}
