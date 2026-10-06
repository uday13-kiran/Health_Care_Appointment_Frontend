import { Bell, CalendarDays, ChevronDown, ClipboardList, Clock3, FileBarChart2, Gauge, HeartPulse, LayoutDashboard, LogOut, Menu, PanelLeftClose, Search, Settings, Stethoscope, Users, UserRoundPlus, UserRoundCog, X, type LucideIcon } from 'lucide-react'
import { useMemo, useState, type ComponentType, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'
import { Avatar } from '../components/Avatar'

interface NavItem { label: string; to: string; icon: typeof Gauge; roles: Role[] }
const ALL: Role[] = ['ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST']
const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: ALL },
  { label: 'Patients', to: '/patients', icon: Users, roles: ['ADMIN', 'RECEPTIONIST'] },
  { label: 'Doctors', to: '/doctors', icon: Stethoscope, roles: ['ADMIN', 'RECEPTIONIST', 'PATIENT'] },
  { label: 'Appointments', to: '/appointments', icon: CalendarDays, roles: ALL },
  { label: 'Queue', to: '/queue', icon: Clock3, roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'] },
  { label: 'Consultation', to: '/consultation', icon: ClipboardList, roles: ['ADMIN', 'DOCTOR'] },
  { label: 'Availability', to: '/availability', icon: Clock3, roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'] },
  { label: 'Doctor Leave', to: '/leave', icon: CalendarDays, roles: ['ADMIN', 'DOCTOR'] },
  { label: 'Reports', to: '/reports', icon: FileBarChart2, roles: ['ADMIN'] },
  { label: 'Users', to: '/users', icon: UserRoundCog, roles: ['ADMIN'] },
  { label: 'Settings', to: '/settings', icon: Settings, roles: ALL },
]

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout, demoMode } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery] = useState('')

  const visibleItems = useMemo(() => navItems.filter(item => user && item.roles.includes(user.role)), [user])
  const displayName = user?.email?.split('@')[0]?.replace(/[._-]/g, ' ') || 'Care Team'

  const go = (to: string) => { navigate(to); setMobileOpen(false) }

  return <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <div className={`mobile-overlay ${mobileOpen ? 'show' : ''}`} onClick={() => setMobileOpen(false)} />
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><HeartPulse size={23} /></div><div className="brand-copy"><strong>HealthCare</strong><span>Better Care. Together.</span></div><button className="mobile-close icon-button" onClick={() => setMobileOpen(false)}><X size={19} /></button></div>
      <div className="sidebar-label">Workspace</div>
      <nav className="nav-list">
        {visibleItems.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} title={label} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}><Icon size={18} /><span>{label}</span></NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="care-card"><div className="care-icon"><HeartPulse size={18} /></div><div><strong>Care is a team sport.</strong><span>Keep every visit moving.</span></div></div>
        <button className="nav-item logout-button" onClick={logout}><LogOut size={18} /><span>Sign out</span></button>
      </div>
      <button className="collapse-button" onClick={() => setCollapsed(v => !v)} title="Collapse sidebar"><PanelLeftClose size={17} /></button>
    </aside>

    <main className="main-shell">
      <header className="topbar">
        <button className="mobile-menu icon-button" onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
        <div className="searchbar"><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search patient, doctor, appointment…" /><kbd>⌘ K</kbd></div>
        <div className="topbar-actions">
          {demoMode && <span className="demo-pill">Demo data</span>}
          <button className="icon-button notification"><Bell size={19} /><i /></button>
          <div className="profile-wrap">
            <button className="profile-button" onClick={() => setProfileOpen(v => !v)}><Avatar name={displayName} role={user?.role || 'PATIENT'} size="sm" /><span><strong>{displayName}</strong><small>{user?.role}</small></span><ChevronDown size={16} /></button>
            {profileOpen && <div className="profile-menu"><button onClick={() => { setProfileOpen(false); go('/settings') }}><Settings size={16} /> Account settings</button><button onClick={() => { setProfileOpen(false); logout() }}><LogOut size={16} /> Sign out</button></div>}
          </div>
        </div>
      </header>
      <div className="content-area">{children}</div>
    </main>
  </div>
}

export function QuickAction({ icon: Icon, title, text, onClick }: { icon: LucideIcon | ComponentType<{ size?: number }>; title: string; text: string; onClick: () => void }) {
  return <button className="quick-action" onClick={onClick}><span className="quick-icon"><Icon size={19} /></span><span><strong>{title}</strong><small>{text}</small></span></button>
}
