import type { FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, HeartPulse, ShieldCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

const roles: { value: Role; label: string; desc: string }[] = [
  { value: 'ADMIN', label: 'Admin', desc: 'System and clinic operations' },
  { value: 'RECEPTIONIST', label: 'Receptionist', desc: 'Patients, appointments and queue' },
  { value: 'DOCTOR', label: 'Doctor', desc: 'Visits, queue and availability' },
  { value: 'PATIENT', label: 'Patient', desc: 'Appointments and queue status' },
]

export function Login() {
  const { login, demoMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const registration = location.state as { email?: string; role?: Role; message?: string } | null
  const [email, setEmail] = useState(registration?.email || '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>(registration?.role || 'PATIENT')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setBusy(true)
    try { await login(email, password, role); navigate('/dashboard', { replace: true }) }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in') }
    finally { setBusy(false) }
  }

  return <div className="login-page">
    <div className="login-decoration decoration-one" /><div className="login-decoration decoration-two" />
    <div className="login-visual">
      <div className="login-brand"><span className="brand-mark"><HeartPulse size={24} /></span><strong>HealthCare</strong></div>
      <div className="visual-copy"><span className="soft-chip"><Sparkles size={14} /> Claymorphism care workspace</span><h1>Better care,<br /><em>together.</em></h1><p>A calm command center for patients, doctors, receptionists and administrators.</p></div>
      <div className="visual-mini-grid"><div><ShieldCheck size={18} /><span>Role-based access</span></div><div><HeartPulse size={18} /><span>Queue-aware care</span></div></div>
    </div>
    <div className="login-panel">
      <div className="login-card clay-card">
        <div className="mobile-login-brand"><div className="brand-mark"><HeartPulse size={22} /></div><strong>HealthCare</strong></div>
        <p className="eyebrow">Welcome back</p><h2>Sign in to your workspace</h2><p className="muted">Choose the role attached to your account.</p>
        {registration?.message && <div className="success-note">{registration.message}</div>}
        {demoMode && <div className="demo-note">Demo mode is enabled. Any email/password works.</div>}
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={submit} className="form-stack">
          <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@clinic.com" /></label>
          <label>Password<div className="password-wrap"><input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" /><button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          <div className="form-row"><span className="muted small">Your selected role must match the backend account.</span><button type="button" className="text-button">Forgot password?</button></div>
          <div className="role-grid">{roles.map(item => <button type="button" key={item.value} onClick={() => setRole(item.value)} className={`role-option ${role === item.value ? 'selected' : ''}`}><span>{item.label}</span><small>{item.desc}</small></button>)}</div>
          <button className="primary-button full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={17} /></button>
        </form>
        <div className="registration-links">
          <span>New to the clinic?</span>
          <Link to="/register/patient">Create patient account</Link>
          <span>·</span>
          <Link to="/register/doctor">Register as doctor</Link>
        </div>
        <p className="login-foot">Secure access · Emerald Ink + Champagne UI · v1.1</p>
      </div>
    </div>
  </div>
}
