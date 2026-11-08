import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { api } from '../lib/api'
import { useTopic } from '../lib/socket'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { Card, Empty, Spinner } from '../components/ui'
import LobbyView from '../components/match/LobbyView'
import VetoView from '../components/match/VetoView'
import LiveView from '../components/match/LiveView'
import ChatPanel from '../components/match/ChatPanel'

/** Match holatiga qarab: lobbi → veto → jonli/yakun. Barcha o'zgarishlar WebSocket orqali keladi. */
export default function MatchRoom() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const joinCode = params.get('code')
  const navigate = useNavigate()
  const toast = useToast()
  const { loggedIn, me } = useApp()
  const [match, setMatch] = useState(null)
  const [chat, setChat] = useState([])
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const [m, c] = await Promise.all([api.match(id), api.matchChat(id)])
      setMatch(m)
      setChat(c)
      setError(null)
    } catch (e) {
      setError(e)
    }
  }, [id])

  useEffect(() => {
    if (me && !loggedIn) {
      window.location.href = '/auth/steam'
      return
    }
    if (loggedIn) load()
  }, [loggedIn, me, load])

  useTopic(loggedIn ? `/topic/match/${id}` : null, load)
  const appendChat = useCallback((msg) => setChat((c) => (c.some((x) => x.id === msg.id) ? c : [...c, msg])), [])
  useTopic(loggedIn ? `/topic/match/${id}/chat` : null, appendChat)
  useTopic(match?.viewer?.team ? `/topic/match/${id}/chat/${match.viewer.team}` : null, appendChat)

  const leave = async () => {
    if (!window.confirm('Matchdan chiqasizmi?')) return
    try {
      await api.leaveMatch(id)
      navigate('/play')
    } catch (e) {
      toast.error(e)
    }
  }

  if (error) {
    return (
      <Card>
        <Empty icon={SearchX} title="Match topilmadi" text={error.message} />
      </Card>
    )
  }
  if (!match) return <Spinner />

  const body =
    match.status === 'LOBBY' ? (
      <LobbyView match={match} onLeave={leave} joinCode={joinCode} />
    ) : match.status === 'VETO' ? (
      <VetoView match={match} />
    ) : (
      <LiveView match={match} />
    )

  return (
    <div className="stack-lg">
      {body}
      {(match.viewer.inMatch || chat.length > 0) && (
        <ChatPanel matchId={match.id} messages={chat} canWrite={match.viewer.inMatch} />
      )}
    </div>
  )
}
