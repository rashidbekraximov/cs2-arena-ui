import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Home from './pages/Home'
import Play from './pages/Play'
import MatchRoom from './pages/MatchRoom'
import Invite from './pages/Invite'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Premium from './pages/Premium'
import Settings from './pages/Settings'
import Wallet from './pages/Wallet'
import ComingSoon from './pages/ComingSoon'
import AdminPage from './pages/admin/AdminPage'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="play" element={<Play />} />
        <Route path="match/:id" element={<MatchRoom />} />
        <Route path="invite/:code" element={<Invite />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="profile/:id" element={<Profile />} />
        <Route path="premium" element={<Premium />} />
        <Route path="settings" element={<Settings />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="tournaments" element={<ComingSoon title="Turnirlar" subtitle="Kunlik kuboklar, haftalik ligalar va sovrinli turnirlar" />} />
        <Route path="teams" element={<ComingSoon title="Jamoalar" subtitle="Jamoa tuzing, o'yinchi toping va ligalarda qatnashing" />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
