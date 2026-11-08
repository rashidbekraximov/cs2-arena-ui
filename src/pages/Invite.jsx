import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LinkIcon } from 'lucide-react'
import { api } from '../lib/api'
import { useApp } from '../context/AppContext'
import { Card, Empty, Spinner } from '../components/ui'

/** /invite/:code — taklif havolasi: lobbiga qo'shib, match sahifasiga o'tkazadi. */
export default function Invite() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { me, loggedIn } = useApp()
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!me) return
    if (!loggedIn) {
      window.location.href = '/auth/steam'
      return
    }
    ;(async () => {
      try {
        const { matchId } = await api.resolveInvite(code)
        await api.joinMatch(matchId, { inviteCode: code }).catch((e) => {
          if (e.code !== 'MATCH_STATE') throw e
        })
        navigate(`/match/${matchId}?code=${code}`, { replace: true })
      } catch (e) {
        setError(e)
      }
    })()
  }, [code, me, loggedIn, navigate])

  if (error) {
    return (
      <Card>
        <Empty icon={LinkIcon} title="Lobbiga qo'shilib bo'lmadi" text={error.message} />
      </Card>
    )
  }
  return <Spinner />
}
