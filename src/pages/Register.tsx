import type { FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, HeartPulse, Stethoscope, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Role } from '../types'

type RegisterKind = 'patient' | 'doctor'

export function Register() {
  const { kind = 'patient' } = useParams<{ kind: RegisterKind }>()
  const role: RegisterKind = kind === 'doctor' ? 'doctor' : 'patient'
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', confirm: '', first_name: '', last_name: '', date_of_birth: '', gender: '', phone: '', address: '', specialization: '', license_number: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const change = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }))

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setMessage('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setBusy(true)
    try {
      const result = role === 'patient'
        ? await api.registerPatient({ email: form.email, password: form.password, first_name: form.first_name, last_name: form.last_name, date_of_birth: form.date_of_birth || null, gender: form.gender || null, phone: form.phone || null, address: form.address || null })
        : await api.registerDoctor({ email: form.email, password: form.password, first_name: form.first_name, last_name: form.last_name, specialization: form.specialization, license_number: form.license_number || null, phone: form.phone || null })
      setMessage(`${result.message} Your ${role} ID is ${result.profile_code}.`)
      setTimeout(() => navigate('/login', { replace: true, state: { email: form.email, role: role.toUpperCase() as Role, message: `${result.message} Your ID is ${result.profile_code}.` } }), 700)
    } catch (err) { setError(err instanceof Error ? err.message : 'Registration failed') }
    finally { setBusy(false) }
  }

  const isPatient = role === 'patient'
  return <div className="login-page register-page">
    <div className="login-decoration decoration-one" /><div className="login-decoration decoration-two" />
    <div className="login-visual">
      <div className="login-brand"><span className="brand-mark"><HeartPulse size={24} /></span><strong>HealthCare</strong></div>
      <div className="visual-copy"><span className="soft-chip">{isPatient ? <UserRound size={14} /> : <Stethoscope size={14} />} {isPatient ? 'Patient registration' : 'Doctor registration'}</span><h1>Start your<br /><em>care journey.</em></h1><p>{isPatient ? 'Create your patient account first, then sign in to book appointments and follow your queue.' : 'Create your doctor account first, then sign in to manage availability, appointments and consultations.'}</p></div>
      <div className="visual-mini-grid"><div><span>1</span><span>Create account</span></div><div><span>2</span><span>Sign in</span></div><div><span>3</span><span>Use your workspace</span></div></div>
    </div>
    <div className="login-panel"><div className="login-card clay-card">
      <Link className="back-link" to="/login"><ArrowLeft size={15} /> Back to sign in</Link>
      <div className="mobile-login-brand"><div className="brand-mark"><HeartPulse size={22} /></div><strong>HealthCare</strong></div>
      <p className="eyebrow">Create account</p><h2>{isPatient ? 'Register as a patient' : 'Register as a doctor'}</h2><p className="muted">Your account and {isPatient ? 'patient' : 'doctor'} profile will be created together.</p>
      {message && <div className="success-note">{message}</div>}{error && <div className="form-error">{error}</div>}
      <form onSubmit={submit} className="form-stack">
        <div className="form-grid"><label>First name<input required value={form.first_name} onChange={e => change('first_name', e.target.value)} /></label><label>Last name<input required value={form.last_name} onChange={e => change('last_name', e.target.value)} /></label>
        {isPatient ? <><label>Date of birth<input type="date" value={form.date_of_birth} onChange={e => change('date_of_birth', e.target.value)} /></label><label>Gender<select value={form.gender} onChange={e => change('gender', e.target.value)}><option value="">Select</option><option>Female</option><option>Male</option><option>Other</option></select></label></> : <><label>Specialization<input required value={form.specialization} onChange={e => change('specialization', e.target.value)} placeholder="General Physician" /></label><label>License number<input value={form.license_number} onChange={e => change('license_number', e.target.value)} /></label></>}
        <label>Phone<input value={form.phone} onChange={e => change('phone', e.target.value)} /></label><label>Email<input type="email" required value={form.email} onChange={e => change('email', e.target.value)} placeholder="you@example.com" /></label></div>
        {isPatient && <label>Address<textarea rows={2} value={form.address} onChange={e => change('address', e.target.value)} /></label>}
        <label>Password<div className="password-wrap"><input type={showPassword ? 'text' : 'password'} required minLength={8} maxLength={72} value={form.password} onChange={e => change('password', e.target.value)} placeholder="At least 8 characters" /><button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
        <label>Confirm password<input type="password" required minLength={8} maxLength={72} value={form.confirm} onChange={e => change('confirm', e.target.value)} /></label>
        <button className="primary-button full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'} <ArrowRight size={17} /></button>
      </form>
      <p className="login-foot">Emerald Ink + Champagne · Secure account creation</p>
    </div></div>
  </div>
}
