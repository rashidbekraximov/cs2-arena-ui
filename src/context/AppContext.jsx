import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const AppContext = createContext(null)

const DEFAULT_SITE = { name: 'CS2 ARENA', banner: null }

export function AppProvider({ children }) {
  const [site, setSite] = useState(DEFAULT_SITE)
  const [me, setMe] = useState(null) // null — yuklanmoqda

  const refreshMe = useCallback(() => api.me().then(setMe).catch(() => setMe({ loggedIn: false })), [])

  useEffect(() => {
    api.site().then((s) => {
      setSite(s)
      document.title = s.name
    }).catch(() => {})
    refreshMe()
  }, [refreshMe])

  const logout = useCallback(async () => {
    await api.logout().catch(() => {})
    window.location.href = '/'
  }, [])

  const value = useMemo(() => {
    const role = me?.role
    return {
      site,
      me,
      setMe,
      refreshMe,
      logout,
      loggedIn: !!me?.loggedIn,
      isAdmin: role === 'ADMIN' || role === 'SUPER_ADMIN',
      isSuperAdmin: role === 'SUPER_ADMIN',
    }
  }, [site, me, refreshMe, logout])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
