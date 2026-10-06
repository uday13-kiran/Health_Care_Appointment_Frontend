import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import type { Role, User } from '../types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  demoMode: boolean
  login: (email: string, password: string, role: Role) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const DEMO_MODE = String(import.meta.env.VITE_DEMO_MODE).toLowerCase() === 'true'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('hc_user') || 'null') } catch { return null }
  })
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('hc_access_token')) && !DEMO_MODE)

  useEffect(() => {
    if (!user && !DEMO_MODE) {
      setLoading(false)
      return
    }
    if (DEMO_MODE) { setLoading(false); return }
    api.me().then(me => {
      const next = { ...me, role: me.role.toUpperCase() as Role }
      setUser(next)
      localStorage.setItem('hc_user', JSON.stringify(next))
      if (next.role === 'PATIENT' && next.profile_id) localStorage.setItem('hc_patient_id', String(next.profile_id))
      if (next.role === 'DOCTOR' && next.profile_id) localStorage.setItem('hc_doctor_id', String(next.profile_id))
    }).catch(() => {
      localStorage.removeItem('hc_access_token')
      localStorage.removeItem('hc_user')
      localStorage.removeItem('hc_patient_id')
      localStorage.removeItem('hc_doctor_id')
      setUser(null)
    }).finally(() => setLoading(false))
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    demoMode: DEMO_MODE,
    login: async (email, password, role) => {
      if (DEMO_MODE) {
        const demoUser = { id: role === 'PATIENT' ? 101 : role === 'DOCTOR' ? 102 : role === 'RECEPTIONIST' ? 103 : 104, email, role }
        setUser(demoUser)
        localStorage.setItem('hc_user', JSON.stringify(demoUser))
        localStorage.setItem('hc_access_token', 'demo-token')
        return
      }
      const token = await api.login({ email, password, role })
      localStorage.setItem('hc_access_token', token.access_token)
      const me = await api.me()
      const next = { ...me, role: me.role.toUpperCase() as Role }
      setUser(next)
      localStorage.setItem('hc_user', JSON.stringify(next))
      if (next.role === 'PATIENT' && next.profile_id) localStorage.setItem('hc_patient_id', String(next.profile_id))
      if (next.role === 'DOCTOR' && next.profile_id) localStorage.setItem('hc_doctor_id', String(next.profile_id))
    },
    logout: () => {
      localStorage.removeItem('hc_access_token')
      localStorage.removeItem('hc_user')
      localStorage.removeItem('hc_patient_id')
      localStorage.removeItem('hc_doctor_id')
      setUser(null)
    },
    refreshMe: async () => {
      if (DEMO_MODE) return
      const me = await api.me()
      const next = { ...me, role: me.role.toUpperCase() as Role }
      setUser(next)
      localStorage.setItem('hc_user', JSON.stringify(next))
      if (next.role === 'PATIENT' && next.profile_id) localStorage.setItem('hc_patient_id', String(next.profile_id))
      if (next.role === 'DOCTOR' && next.profile_id) localStorage.setItem('hc_doctor_id', String(next.profile_id))
    },
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
